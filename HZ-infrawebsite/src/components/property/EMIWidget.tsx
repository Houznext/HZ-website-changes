import { useMemo, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export function EMIWidget({ principal = 5000000 }: { principal?: number }) {
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);
  const emi = useMemo(() => {
    const n = years * 12;
    const r = rate / 100 / 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [principal, years, rate]);
  return (
    <div className="rounded-xl border border-border bg-hzwhite p-4">
      <div className="font-montserrat text-sm font-bold text-charcoal">EMI estimator</div>
      <div className="mt-3 font-montserrat text-2xl font-extrabold text-hz-blue">₹{Math.round(emi).toLocaleString('en-IN')}</div>
      <p className="mt-1 font-inter text-xs text-muted">Indicative — {years} yrs @ {rate}% p.a.</p>
      <div className="mt-4 space-y-4">
        <div>
          <div className="font-inter text-xs text-muted">Tenure (years)</div>
          <Slider min={5} max={30} value={years} onChange={(v) => setYears(v as number)} />
        </div>
        <div>
          <div className="font-inter text-xs text-muted">Rate (%)</div>
          <Slider min={7} step={0.1} max={12} value={rate} onChange={(v) => setRate(v as number)} />
        </div>
      </div>
    </div>
  );
}
