import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function ValueCalculatorPage() {
  const [area, setArea] = useState(1200);
  const [rate, setRate] = useState(6500);
  const value = area * rate;
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Value calculator</h1>
        <p className="mt-2 font-inter text-sm text-muted">Quick carpet-area × micro-market PSF estimate.</p>
        <div className="mt-8 max-w-md space-y-4 rounded-2xl border border-border bg-hzwhite p-6">
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
