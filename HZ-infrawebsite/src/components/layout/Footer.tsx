import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-navy py-12 text-white/60">
      <div className="mx-auto grid max-w-infra gap-10 px-4 md:grid-cols-4 md:px-7">
        <div>
          <div className="font-montserrat text-lg font-extrabold text-white">
            Houznext<span className="text-hz-accent">Infra</span>
          </div>
          <p className="mt-3 font-inter text-sm leading-relaxed">
            Verified land, villas, apartments & plots — title & EC checks, RERA transparency, and end-to-end support.
          </p>
        </div>
        <div>
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-white/30">
            Properties
          </div>
          <ul className="flex flex-col gap-2 font-inter text-sm">
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
          <ul className="flex flex-col gap-2 font-inter text-sm">
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
          <ul className="flex flex-col gap-2 font-inter text-sm">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/news" className="hover:text-white">
              News & Guides
            </Link>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-infra border-t border-white/10 px-4 pt-6 text-center font-inter text-xs text-white/40 md:px-7">
        © {new Date().getFullYear()} Houznext Infra · infra.houznext.com
      </div>
    </footer>
  );
}
