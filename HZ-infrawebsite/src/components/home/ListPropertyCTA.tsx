import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function ListPropertyCTA() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="mx-auto flex max-w-infra flex-col items-start gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-7">
        <div>
          <h2 className="font-montserrat text-2xl font-extrabold md:text-3xl">List your property with Houznext Infra</h2>
          <p className="mt-2 max-w-xl font-inter text-sm text-white/65">
            Reach verified buyers, track enquiries in CRM, and get title / EC / RERA checks on priority lanes.
          </p>
        </div>
        <Link href="/sell">
          <Button variant="accent">Start 3-step listing</Button>
        </Link>
      </div>
    </section>
  );
}
