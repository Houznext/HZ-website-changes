import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EMIWidget } from '@/components/property/EMIWidget';

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">EMI calculator</h1>
        <p className="mt-2 font-inter text-sm text-muted">Interactive ranges using rc-slider — indicative only.</p>
        <div className="mt-8 max-w-md">
          <EMIWidget principal={7500000} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
