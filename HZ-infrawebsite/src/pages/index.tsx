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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <HeroSection />
      <PropertyTypeCards />
      <CuratedSection />
      <CityGrid />
      <FeaturedProjects />
      <Testimonials />
      <ListPropertyCTA />
      <WhyHouznextInfra />
      <Footer />
    </div>
  );
}
