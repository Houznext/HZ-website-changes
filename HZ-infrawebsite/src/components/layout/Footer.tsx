import Link from 'next/link';

export function Footer() {
  return (
    <footer className="overflow-x-hidden bg-navy py-9 text-white/60 md:py-12">
      <div className="mx-auto grid max-w-infra grid-cols-2 gap-x-4 gap-y-8 px-4 md:grid-cols-4 md:gap-10 md:px-7">
        <div className="col-span-2 md:col-span-1">
          <div className="font-montserrat text-lg font-extrabold text-white">
            Houznext<span className="text-hz-accent">Infra</span>
          </div>
          <p className="mt-3 font-inter text-[13px] leading-relaxed md:text-sm">
            Verified land, villas, apartments & plots — title & EC checks, RERA transparency, and end-to-end support.
          </p>
        </div>
        <div>
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-white/30">
            Properties
          </div>
          <ul className="flex flex-col gap-2 font-inter text-[13px] md:text-sm">
            <Link href="/buy" className="hover:text-white">
              Buy
            </Link>
            <Link href="/sell" className="hover:text-white">
              Sell
            </Link>
            <Link href="/projects" className="hover:text-white">
              Projects
            </Link>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-white/30">
            Tools
          </div>
          <ul className="flex flex-col gap-2 font-inter text-[13px] md:text-sm">
            <Link href="/emi-calculator" className="hover:text-white">
              EMI Calculator
            </Link>
            <Link href="/property-insights" className="hover:text-white">
              Property Insights
            </Link>
            <Link href="/value-calculator" className="hover:text-white">
              Value Calculator
            </Link>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-white/30">
            Company
          </div>
          <ul className="flex flex-col gap-2 font-inter text-[13px] md:text-sm">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/news" className="hover:text-white">
              News & Guides
            </Link>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-infra flex-col items-start gap-2 border-t border-white/10 px-4 pt-6 text-left font-inter text-[12.5px] text-white/40 md:mt-10 md:px-7 md:text-center">
        © {new Date().getFullYear()} Houznext Infra · infra.houznext.com
      </div>
    </footer>
  );
}
