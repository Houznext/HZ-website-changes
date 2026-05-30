import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EMIWidget } from '@/components/property/EMIWidget';

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-9 md:px-7 md:py-10">
        <h1 className="font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-3xl">EMI calculator</h1>
        <p className="mt-2 font-inter text-[13px] leading-relaxed text-muted md:text-sm">Interactive ranges using rc-slider — indicative only.</p>
        <div className="mt-8 max-w-md">
          <EMIWidget principal={7500000} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
