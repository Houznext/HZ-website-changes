import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhyHouznextInfra } from '@/components/home/WhyHouznextInfra';
import { Testimonials } from '@/components/home/Testimonials';

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-9 md:px-7 md:py-12">
        <h1 className="font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-3xl">About Houznext Infra</h1>
        <p className="mt-4 max-w-3xl font-inter text-[13px] leading-relaxed text-charcoal/90 md:text-sm">
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
