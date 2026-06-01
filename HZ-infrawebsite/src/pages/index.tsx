import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyTypeCards } from '@/components/home/PropertyTypeCards';
import { CuratedSection } from '@/components/home/CuratedSection';
import { CityGrid } from '@/components/home/CityGrid';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';
import { Testimonials } from '@/components/home/Testimonials';
import { ListPropertyCTA } from '@/components/home/ListPropertyCTA';
import { WhyHouznextInfra } from '@/components/home/WhyHouznextInfra';
import type { PublicProperty } from '@/types/property.types';

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
}> = async () => {
  const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
  const [lands, villas, apartments, plots] = await Promise.all([
    fetchFeatured(base, 'Land', 3),
    fetchFeatured(base, 'Villa', 3),
    fetchFeatured(base, 'Apartment', 3),
    fetchFeatured(base, 'Plot', 5),
  ]);
  return {
    props: { lands, villas, apartments, plots },
    revalidate: 60,
  };
};

export default function HomePage({ lands, villas, apartments, plots }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <HeroSection />
      <PropertyTypeCards />
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
