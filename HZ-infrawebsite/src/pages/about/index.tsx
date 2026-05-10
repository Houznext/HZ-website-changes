import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhyHouznextInfra } from '@/components/home/WhyHouznextInfra';
import { Testimonials } from '@/components/home/Testimonials';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-12 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">About Houznext Infra</h1>
        <p className="mt-4 max-w-3xl font-inter text-sm leading-relaxed text-charcoal/90">
          Houznext Infra is the dedicated infrastructure for verified property discovery — separate from houznext.com, with its own
          auth, analytics, and APIs, while sharing diligence standards and data discipline with the Houznext ecosystem.
        </p>
      </div>
      <WhyHouznextInfra />
      <Testimonials />
      <Footer />
    </div>
  );
}
