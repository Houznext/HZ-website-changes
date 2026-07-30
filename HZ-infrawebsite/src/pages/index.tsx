import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyTypeCards } from '@/components/home/PropertyTypeCards';
import { CuratedSection } from '@/components/home/CuratedSection';
import { CityGrid } from '@/components/home/CityGrid';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';
import { RecentListings, fetchRecentListings } from '@/components/home/RecentListings';
import { Testimonials } from '@/components/home/Testimonials';
import { ListPropertyCTA } from '@/components/home/ListPropertyCTA';
import { WhyHouznextInfra } from '@/components/home/WhyHouznextInfra';
import type { PublicProperty } from '@/types/property.types';
import { fetchPageSeo } from '@/lib/fetchPageSeo';
import { fetchSeoGeo } from '@/lib/fetchSeoGeo';

async function fetchFeatured(
  base: string,
  type: string,
  limit: number,
): Promise<PublicProperty[]> {
  try {
    const url = `${base}/properties?isFeatured=true&propertyType=${encodeURIComponent(type)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const j = (await res.json()) as { data?: PublicProperty[]; items?: PublicProperty[] };
    return j.data ?? j.items ?? [];
  } catch {
    return [];
  }
}

export const getStaticProps: GetStaticProps<{
  lands: PublicProperty[];
  villas: PublicProperty[];
  apartments: PublicProperty[];
  plots: PublicProperty[];
  recentListings: PublicProperty[];
  initialPageSeo: Awaited<ReturnType<typeof fetchPageSeo>>;
  initialSeoGeo: Awaited<ReturnType<typeof fetchSeoGeo>>;
}> = async () => {
  const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
  const [lands, villas, apartments, plots, recentListings, initialPageSeo, initialSeoGeo] = await Promise.all([
    fetchFeatured(base, 'Land', 12),
    fetchFeatured(base, 'Villa', 12),
    fetchFeatured(base, 'Apartment', 12),
    fetchFeatured(base, 'Plot', 12),
    fetchRecentListings(base),
    fetchPageSeo('/'),
    fetchSeoGeo(),
  ]);
  return {
    props: { lands, villas, apartments, plots, recentListings, initialPageSeo, initialSeoGeo },
    revalidate: 60,
  };
};

export default function HomePage({
  lands,
  villas,
  apartments,
  plots,
  recentListings,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <HeroSection />
      <PropertyTypeCards />
      <RecentListings initialItems={recentListings} />
      <FeaturedProjects />
      <CuratedSection fallback={{ Land: lands, Villa: villas, Apartment: apartments, Plot: plots }} />
      <CityGrid />
      <Testimonials />
      <ListPropertyCTA />
      <WhyHouznextInfra />
      <Footer />
    </div>
  );
}
