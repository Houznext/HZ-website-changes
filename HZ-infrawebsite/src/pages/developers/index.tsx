import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-12 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Developer portal</h1>
        <p className="mt-3 max-w-2xl font-inter text-sm text-muted">
          Manage your Infra listings, enquiries, and pipeline stats. Authenticate with developer credentials from your
          Houznext team.
        </p>
        <div className="mt-8">
          <Link
            href={`${(process.env.NEXT_PUBLIC_INFRA_ADMIN_URL || 'http://localhost:3003').replace(/\/$/, '')}/login`}
          >
            <Button variant="primary">Admin / ops login</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
