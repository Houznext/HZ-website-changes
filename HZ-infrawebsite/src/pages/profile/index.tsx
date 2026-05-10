import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyCard } from '@/components/property/PropertyCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { status } = useSession();
  const { items } = useSavedProperties();

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-offwhite">
        <Navbar />
        <div className="mx-auto max-w-infra px-4 py-16 text-center">
          <p className="font-inter text-muted">Please sign in to view saved properties.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="primary">Go to login</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Profile</h1>
        <h2 className="mt-8 font-montserrat text-lg font-bold text-charcoal">Saved properties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.propertyId} property={p} />
          ))}
        </div>
        <h2 className="mt-10 font-montserrat text-lg font-bold text-charcoal">My enquiries</h2>
        <p className="mt-2 font-inter text-sm text-muted">Track enquiry responses via your assigned rep (CRM).</p>
      </div>
      <Footer />
    </div>
  );
}
