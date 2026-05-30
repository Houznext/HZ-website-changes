import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function ValueCalculatorPage() {
  const [area, setArea] = useState(1200);
  const [rate, setRate] = useState(6500);
  const value = area * rate;
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-9 md:px-7 md:py-10">
        <h1 className="font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-3xl">Value calculator</h1>
        <p className="mt-2 font-inter text-[13px] leading-relaxed text-muted md:text-sm">Quick carpet-area × micro-market PSF estimate.</p>
        <div className="mt-6 max-w-md space-y-4 rounded-2xl border border-border bg-hzwhite p-4 md:mt-8 md:p-6">
          <label className="block font-montserrat text-[10px] font-bold uppercase text-muted">Area (sqft)</label>
          <input
            type="number"
            className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          />
          <label className="block font-montserrat text-[10px] font-bold uppercase text-muted">Indicative ₹ / sqft</label>
          <input
            type="number"
            className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <div className="font-montserrat text-2xl font-extrabold text-hz-blue">₹{value.toLocaleString('en-IN')}</div>
          <Button variant="primary" type="button" onClick={() => {}}>
            Save estimate
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
