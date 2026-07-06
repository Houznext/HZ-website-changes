'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import { LineChart, TrendingUp } from 'lucide-react';
import type { PropertyInsights as PropertyInsightsData } from '@/types/property-insights.types';
import type { PropertyType } from '@/types/property.types';
import {
  buildIndicatorRows,
  buildKpiCards,
  buildProjectionChartData,
  compsTitleSuffix,
  computeYoYBands,
  formatCompPrice,
  formatCompPricePerUnit,
  formatPriceUnitValue,
  generateCagrTrendData,
  generateDemandData,
  generateYieldData,
  hasAnyProjection,
  insightsDescription,
  mapPropertyInsightsSegment,
  segmentDisplayLabel,
  shouldShowInsights,
} from '@/lib/property-insights-utils';

Chart.register(...registerables);

type Props = {
  insights: PropertyInsightsData | null | undefined;
  propertyType: PropertyType;
  locality: string;
  city: string;
  propertyId: string;
};

function demandBarColor(v: number) {
  if (v >= 85) return 'rgba(13,148,136,0.8)';
  if (v >= 70) return 'rgba(47,128,237,0.7)';
  return 'rgba(107,114,128,0.5)';
}

export function PropertyInsights({ insights, propertyType, locality, city, propertyId }: Props) {
  if (!shouldShowInsights(insights)) return null;

  return (
    <PropertyInsightsBody
      insights={insights}
      propertyType={propertyType}
      locality={locality}
      city={city}
      propertyId={propertyId}
    />
  );
}

function PropertyInsightsBody({
  insights,
  propertyType,
  locality,
  city,
  propertyId,
}: Props & { insights: PropertyInsightsData }) {
  const segment = mapPropertyInsightsSegment(propertyType);
  const unit = insights.price_unit;
  const kpis = buildKpiCards(segment, insights);
  const rows = buildIndicatorRows(segment, insights);
  const projBands = computeYoYBands(insights).filter(Boolean);
  const comps = insights.comps || [];

  const showPrice = insights.show_price_chart !== false;
  const showDemand = insights.show_demand_chart !== false;
  const showYield = insights.show_yield_chart !== false;
  const showProj = insights.show_projections !== false && hasAnyProjection(insights);
  const showComps = insights.show_comps !== false && comps.length > 0;

  const priceRef = useRef<HTMLCanvasElement>(null);
  const demandRef = useRef<HTMLCanvasElement>(null);
  const yieldRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const charts: Chart[] = [];

    if (showPrice && priceRef.current) {
      const { allLabels, actualDataset, projDataset } = buildProjectionChartData(insights);
      const cfg: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Actual',
              data: actualDataset,
              borderColor: '#2f80ed',
              backgroundColor: 'rgba(47,128,237,0.07)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#2f80ed',
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2.5,
              spanGaps: false,
            },
            {
              label: 'Projected',
              data: projDataset,
              borderColor: '#f2994a',
              backgroundColor: 'rgba(242,153,74,0.05)',
              fill: true,
              tension: 0.35,
              borderDash: [6, 4],
              pointBackgroundColor: '#f2994a',
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
              pointStyle: 'triangle',
              spanGaps: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (ctx) => {
                  if (ctx.raw == null) return '';
                  const val = Number(ctx.raw);
                  const label =
                    unit === 'acre'
                      ? `₹${val}L/acre`
                      : `₹${val.toLocaleString('en-IN')}/${unit}`;
                  return ` ${ctx.dataset.label}: ${label}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { color: '#5a6a7e', font: { size: 10, family: 'Inter' } },
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                color: '#5a6a7e',
                font: { size: 10, family: 'Inter' },
                callback: (v) => {
                  const n = Number(v);
                  if (unit === 'acre') return `₹${n}L`;
                  return `₹${n.toLocaleString('en-IN')}`;
                },
              },
            },
          },
        },
      };
      charts.push(new Chart(priceRef.current, cfg));
    }

    if (showDemand && demandRef.current) {
      const demand = generateDemandData(insights.demand_score);
      charts.push(
        new Chart(demandRef.current, {
          type: 'bar',
          data: {
            labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
            datasets: [
              {
                label: 'Demand',
                data: demand,
                backgroundColor: demand.map(demandBarColor),
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: (ctx) => ` Score: ${ctx.raw}/100` },
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#5a6a7e', font: { size: 10, family: 'Inter' } } },
              y: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { color: '#5a6a7e', font: { size: 10, family: 'Inter' } },
                min: 0,
                max: 100,
              },
            },
          },
        }),
      );
    }

    if (showDemand && showYield && yieldRef.current && segment !== 'land') {
      const isPlotCagr = segment === 'plot' && insights.cagr != null;
      const yieldLabels = ['2019', '2020', '2021', '2022', '2023', '2024'];
      const yieldData = isPlotCagr
        ? generateCagrTrendData(insights.cagr!)
        : insights.rental_yield != null
          ? generateYieldData(insights.rental_yield)
          : insights.cagr != null
            ? generateCagrTrendData(insights.cagr)
            : [];

      if (yieldData.length) {
        charts.push(
          new Chart(yieldRef.current, {
            type: 'line',
            data: {
              labels: yieldLabels,
              datasets: [
                {
                  label: isPlotCagr ? 'CAGR' : 'Yield',
                  data: yieldData,
                  borderColor: '#0d9488',
                  backgroundColor: 'rgba(13,148,136,0.08)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#0d9488',
                  pointRadius: 4,
                  borderWidth: 2.5,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      ` ${isPlotCagr ? 'CAGR' : 'Yield'}: ${ctx.raw}%`,
                  },
                },
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#5a6a7e', font: { size: 10, family: 'Inter' } } },
                y: {
                  grid: { color: 'rgba(0,0,0,0.04)' },
                  ticks: {
                    color: '#5a6a7e',
                    font: { size: 10, family: 'Inter' },
                    callback: (v) => `${v}%`,
                  },
                  min: 0,
                },
              },
            },
          }),
        );
      }
    }

    return () => {
      charts.forEach((c) => c.destroy());
    };
  }, [insights, propertyId, segment, showDemand, showPrice, showYield, unit]);

  const yieldTitle =
    segment === 'plot'
      ? 'Annual Capital Gain %'
      : segment === 'commercial' || segment === 'apartment' || segment === 'villa'
        ? 'Rental Yield'
        : 'Rental Yield';

  const yieldSub =
    segment === 'plot'
      ? `CAGR · ${locality} plots`
      : segment === 'commercial'
        ? `Annual yield % · ${locality}`
        : segment === 'villa'
          ? `Annual yield % · ${locality} villas`
          : `Annual yield % · ${locality} apartments`;

  const priceChartTitle =
    unit === 'acre'
      ? 'Price per acre — 10 Year History (₹ Lakh)'
      : `Price per ${unit} — 10 Year History`;

  return (
    <section className="insights-section" aria-label="Property insights">
      <div className="insights-section-hd">
        <div className="insights-sdiv">
          <div className="insights-sdiv-ic">
            <LineChart size={15} strokeWidth={1.8} color="#7c3aed" fill="none" />
          </div>
          <div className="insights-sdiv-t">Property Insights</div>
          <div className="insights-sdiv-line" />
          <span className="bdg b-purple">
            {segmentDisplayLabel(segment)} · {locality}
          </span>
        </div>
        <p className="insights-desc">{insightsDescription(segment)}</p>
      </div>

      <div className="insights-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="insights-metric">
            <div className="insights-metric-label">{k.label}</div>
            <div className="insights-kpi-val" style={{ color: k.color }}>
              {k.value}
            </div>
            {k.sub ? <div className="insights-metric-sub">{k.sub}</div> : null}
          </div>
        ))}
      </div>

      {showPrice ? (
        <div className="insights-chart-pad">
          <div className="insights-chart-card">
            <div className="insights-chart-hd">
              <div>
                <div className="insights-chart-title">{priceChartTitle}</div>
                <div className="insights-chart-sub">
                  {locality}, {city} · {segmentDisplayLabel(segment)} segment
                </div>
              </div>
              <div className="insights-legend">
                <span className="insights-legend-item">
                  <span className="insights-legend-line" style={{ background: '#2f80ed' }} />
                  Actual
                </span>
                <span className="insights-legend-item">
                  <span
                    className="insights-legend-line"
                    style={{
                      background: 'repeating-linear-gradient(90deg,#f2994a 0,#f2994a 6px,transparent 6px,transparent 10px)',
                    }}
                  />
                  Projected
                </span>
              </div>
            </div>
            <div className="insights-chart-wrap">
              <canvas
                id={`price-chart-${propertyId}`}
                ref={priceRef}
                role="img"
                aria-label={`Price per ${unit} history and projection for ${locality}`}
              />
            </div>
          </div>
        </div>
      ) : null}

      {showDemand ? (
        <div className="insights-two-charts">
          <div className="insights-chart-card">
            <div className="insights-chart-title">Demand Index</div>
            <div className="insights-chart-sub">Buyer enquiry score · Last 12 months</div>
            <div className="insights-chart-wrap insights-chart-wrap-sm" style={{ marginTop: 10 }}>
              <canvas
                id={`demand-chart-${propertyId}`}
                ref={demandRef}
                role="img"
                aria-label="Monthly demand index bar chart"
              />
            </div>
          </div>

          {showYield && segment === 'land' && insights.cagr != null ? (
            <div className="insights-chart-card" style={{ padding: 14 }}>
              <div className="insights-chart-title">Capital Gain CAGR</div>
              <div className="insights-chart-sub">Long-term appreciation · {locality}</div>
              <div className="insights-cagr-gauge" style={{ marginTop: 10 }}>
                <div className="insights-cagr-val">+{insights.cagr}%</div>
                <div className="insights-cagr-label">CAGR</div>
              </div>
            </div>
          ) : showYield ? (
            <div className="insights-chart-card">
              <div className="insights-chart-title">{yieldTitle}</div>
              <div className="insights-chart-sub">{yieldSub}</div>
              <div className="insights-chart-wrap insights-chart-wrap-sm" style={{ marginTop: 10 }}>
                <canvas
                  id={`yield-chart-${propertyId}`}
                  ref={yieldRef}
                  role="img"
                  aria-label="Yield or CAGR trend chart"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="insights-rows-wrap">
          <div className="insights-rows-title">Key Indicators</div>
          {rows.map((r) => (
            <div key={r.label} className="ins-row">
              <span className="ins-row-label">{r.label}</span>
              <span className="ins-row-val" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {showProj && projBands.length > 0 ? (
        <div className="insights-proj-card">
          <div className="insights-proj-hd">
            <TrendingUp size={16} strokeWidth={1.8} color="#f2994a" fill="none" />
            <span className="insights-proj-title">
              5-Year Price Projection · {segmentDisplayLabel(segment)}
            </span>
            <span className="insights-proj-badge">AI Powered</span>
          </div>
          <div className="insights-proj-bands">
            {projBands.map((b) =>
              b ? (
                <div
                  key={b.year}
                  className="insights-proj-band"
                  style={{ background: `rgba(255,255,255,${b.opacity})` }}
                >
                  <div className="insights-proj-year">{b.year}</div>
                  <div className="insights-proj-val">{formatPriceUnitValue(b.value, unit)}</div>
                  <div className="insights-proj-yoy">{b.yoy}</div>
                </div>
              ) : null,
            )}
          </div>
          <p className="insights-proj-foot">
            Based on SRO registration data, Houznext transaction history, and infrastructure pipeline. Not
            financial advice.
          </p>
        </div>
      ) : null}

      {showComps ? (
        <div className="insights-comps-wrap">
          <div className="insights-comps-title">
            Recent Comparable Sales {compsTitleSuffix(segment)}
          </div>
          {comps.map((c) => (
            <div key={`${c.name}-${c.date}`} className="ins-comp-row">
              <div>
                <div className="ins-comp-name">{c.name}</div>
                <div className="ins-comp-meta">
                  {c.area} · {c.date}
                </div>
              </div>
              <div>
                <div className="ins-comp-price">{formatCompPrice(c.price, unit)}</div>
                <div className="ins-comp-psf">{formatCompPricePerUnit(c.price_per_unit, unit)}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button
              type="button"
              className="rounded-lg border border-[#dde8f5] bg-white px-4 py-2 font-montserrat text-xs font-bold text-[#1f2933] transition hover:bg-[#f5f7fa]"
              onClick={() => toast('Showing all comparable sales for this locality…')}
            >
              View all comparable sales →
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
