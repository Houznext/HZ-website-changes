import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function ListPropertyCTA() {
  return (
    <section className="overflow-x-hidden bg-navy py-10 text-white md:py-16">
      <div className="mx-auto flex max-w-infra flex-col items-start gap-5 px-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-7">
        <div className="min-w-0">
          <h2 className="font-montserrat text-[22px] font-extrabold leading-tight md:text-3xl">List your property with Houznext Infra</h2>
          <p className="mt-2 max-w-xl font-inter text-[13px] leading-relaxed text-white/65 md:text-sm">
            Reach verified buyers, track enquiries in CRM, and get title / EC / RERA checks on priority lanes.
          </p>
        </div>
        <Link href="/sell" className="w-full md:w-auto">
          <Button variant="accent" className="min-h-[44px] w-full justify-center md:w-auto">
            Start 3-step listing
          </Button>
        </Link>
      </div>
    </section>
  );
}
