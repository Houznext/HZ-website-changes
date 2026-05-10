import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-12 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Services</h1>
        <p className="mt-3 max-w-2xl font-inter text-sm text-muted">
          Home loans, legal diligence bundles, and post-possession property management — coordinated through Houznext Infra.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/emi-calculator">
            <Button variant="primary">EMI calculator</Button>
          </Link>
          <Link href="/property-insights">
            <Button variant="ghost">Property insights</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
