import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PriceBreakdown } from '@/components/property/PriceBreakdown';
import { EMIWidget } from '@/components/property/EMIWidget';
import { EnquiryPanel } from '@/components/property/EnquiryPanel';
import { formatPrice } from '@/lib/format';
import type { InfraProperty } from '@/types/infra.types';

type Props = { property: InfraProperty | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  try {
    const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
    const res = await fetch(`${base}/properties/${encodeURIComponent(slug)}`);
    if (!res.ok) return { notFound: true };
    const property = (await res.json()) as InfraProperty;
    return { props: { property } };
  } catch {
    return { notFound: true };
  }
};

export default function PropertyPage({ property }: Props) {
  if (!property) return null;
  const img = property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80';
  const principal = property.basePrice ? Number(property.basePrice) : 5_000_000;

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-8 md:px-7">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-hz-blue-light">
              <Image src={img} alt="" fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 66vw" />
            </div>
            <h1 className="mt-6 font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">{property.title}</h1>
            <p className="mt-2 font-inter text-sm text-muted">
              {property.propertyType} · {property.locality || property.city}
            </p>
            <div className="mt-4 font-montserrat text-3xl font-extrabold text-charcoal">{formatPrice(property.basePrice)}</div>
            {property.description && (
              <p className="mt-6 whitespace-pre-wrap font-inter text-sm leading-relaxed text-charcoal/90">{property.description}</p>
            )}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <PriceBreakdown base={property.basePrice} perUnit={property.pricePerUnit} />
              <EMIWidget principal={principal} />
            </div>
          </div>
          <EnquiryPanel propertyId={property.propertyId} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
