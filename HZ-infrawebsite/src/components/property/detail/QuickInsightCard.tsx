import { LineChart } from 'lucide-react';
import type { PropertyInsights } from '@/types/property-insights.types';
import {
  formatPct,
  formatPriceUnitValue,
  pctChange,
  shouldShowInsights,
} from '@/lib/property-insights-utils';

type Props = {
  insights: PropertyInsights | null | undefined;
  locality: string;
};

export function QuickInsightCard({ insights, locality }: Props) {
  if (!shouldShowInsights(insights)) return null;

  const app10 = pctChange(insights.price_current, insights.price_10y_ago);
  const unit = insights.price_unit;

  return (
    <div
      className="rounded-[13px] p-4"
      style={{ background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)' }}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <LineChart size={16} strokeWidth={1.8} color="#7c3aed" fill="none" />
        <span className="font-montserrat text-[12.5px] font-bold text-[#4c1d95]">Quick Insight</span>
      </div>
      {app10 != null ? (
        <>
          <div className="font-montserrat text-[22px] font-extrabold text-[#4c1d95]">{formatPct(app10)}</div>
          <div className="mb-2.5 font-inter text-xs text-[#6b21a8]">appreciation in 10 years</div>
        </>
      ) : null}
      {insights.proj_2029 != null ? (
        <>
          <div className="font-montserrat text-[13px] font-bold text-[#4c1d95]">
            {formatPriceUnitValue(insights.proj_2029, unit)}
          </div>
          <div className="mb-3 font-inter text-[11.5px] text-[#6b21a8]">projected by 2029</div>
        </>
      ) : null}
      <div className="mb-2.5 h-px bg-[rgba(109,28,169,0.15)]" />
      {insights.locality_rank ? (
        <p className="font-inter text-[11.5px] font-medium text-[#6b21a8]">
          {locality} ranks <strong className="text-[#4c1d95]">{insights.locality_rank}</strong> for capital
          appreciation
        </p>
      ) : null}
    </div>
  );
}
