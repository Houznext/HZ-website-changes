import type { ComponentType } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RecordPropertyView } from '@/components/property/RecordPropertyView';
import { SavePropertyButton } from '@/components/property/SavePropertyButton';
import { PhotoGallery, type GalleryBadge } from '@/components/property/PhotoGallery';
import { PropertyYoutubeEmbed } from '@/components/property/PropertyYoutubeEmbed';
import { EnquiryPanel } from '@/components/property/EnquiryPanel';
import { ApartmentDetail } from '@/components/property/detail/ApartmentDetail';
import { VillaDetail } from '@/components/property/detail/VillaDetail';
import { LandDetail } from '@/components/property/detail/LandDetail';
import { PlotDetail } from '@/components/property/detail/PlotDetail';
import { GenericDetail } from '@/components/property/detail/GenericDetail';
import type { PublicProperty } from '@/types/property.types';
import { propertyImageUrls } from '@/lib/property-utils';
import { ChevronRight } from 'lucide-react';

const DETAIL_MAP: Record<string, ComponentType<{ property: PublicProperty }>> = {
  Apartment: ApartmentDetail,
  Studio: ApartmentDetail,
  Villa: VillaDetail,
  'Row House': VillaDetail,
  Farmhouse: VillaDetail,
  Land: LandDetail,
  Plot: PlotDetail,
  Commercial: GenericDetail,
};

type Props = { property: PublicProperty; pageSlug: string };

export default function PropertyPage({ property, pageSlug }: Props) {
  const Detail = DETAIL_MAP[property.propertyType] || GenericDetail;
  const listSlug = property.slug || pageSlug;
  const photos = propertyImageUrls(property);

  const badges: GalleryBadge[] = [];
  if (property.isReraVerified) badges.push({ label: 'RERA ✓', variant: 'teal' });
  if (property.isTitleClear) badges.push({ label: 'Title ✓', variant: 'amber' });
  if (property.isHouznextVerified) badges.push({ label: 'Houznext ✓', variant: 'blue' });
  if (property.isZeroBrokerage) badges.push({ label: 'Zero brokerage', variant: 'navy' });

  const sub =
    property.bhkType && property.carpetArea
      ? `${property.bhkType} · ${Number(property.carpetArea).toLocaleString('en-IN')} sqft`
      : `${property.propertyType}${property.carpetArea ? ` · ${Number(property.carpetArea).toLocaleString('en-IN')} sqft` : ''}`;

  return (
    <>
      <Head>
        <title>{property.title} — {property.city} | Houznext Infra</title>
        {property.description ? (
          <meta name="description" content={property.description.slice(0, 160)} />
        ) : null}
      </Head>
      <div className="min-h-screen overflow-x-hidden bg-[#f5f7fa]">
        <Navbar />
        <RecordPropertyView
          slug={listSlug}
          title={property.title}
          city={property.city}
          locality={property.locality}
          propertyId={property.propertyId}
        />
        <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 md:px-7 md:pb-16">
          <nav className="mb-5 flex flex-wrap items-center gap-1 font-inter text-xs text-muted">
            <Link href="/" className="text-[#2f80ed] hover:underline">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            <Link href="/buy" className="text-[#2f80ed] hover:underline">
              Buy
            </Link>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            {property.city ? (
              <>
                <Link href={`/buy?city=${encodeURIComponent(property.city)}`} className="text-[#2f80ed] hover:underline">
                  {property.city}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </>
            ) : null}
            <span className="line-clamp-1 text-charcoal">{property.title}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[1fr_370px] lg:items-start">
            <div className="min-w-0">
              <PhotoGallery
                photos={photos}
                propertyType={property.propertyType}
                title={property.title}
                constructionStatus={property.constructionStatus}
                badges={badges}
                floorPlanUrl={property.floorPlanUrl}
              />

              <PropertyYoutubeEmbed youtubeVideoUrl={property.youtubeVideoUrl} />

              <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white px-5 py-4">
                <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">{sub}</div>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h1 className="font-montserrat text-2xl font-extrabold leading-tight text-charcoal md:text-3xl">
                    {property.title}
                  </h1>
                  <SavePropertyButton
                    slug={listSlug}
                    title={property.title}
                    city={property.city}
                    locality={property.locality}
                    propertyId={property.propertyId}
                  />
                </div>
                <p className="mt-2 font-inter text-sm text-muted">
                  {property.propertyType} · {property.locality || property.city}
                </p>
                {property.propertyCode ? (
                  <p className="mt-2 font-montserrat text-[11px] font-semibold text-muted">
                    Ref: {property.propertyCode}
                  </p>
                ) : null}
              </div>

              <Detail property={property} />
            </div>

            <EnquiryPanel property={property} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const pageSlug = ctx.params?.slug as string;
  try {
    const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
    const res = await fetch(`${base}/properties/${encodeURIComponent(pageSlug)}`);
    if (!res.ok) return { notFound: true };
    const property = (await res.json()) as PublicProperty;
    if (property.isApproved === false || property.isActive === false) return { notFound: true };
    return { props: { property, pageSlug } };
  } catch {
    return { notFound: true };
  }
};
