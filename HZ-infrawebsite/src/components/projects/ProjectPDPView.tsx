'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Download,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react';
import type { InfraProject } from '@/types/infra.types';
import { SectionDivider } from '@/components/projects/SectionDivider';
import {
  projectLocation,
  projectStartingPrice,
  projectStatusClass,
  projectStatusLabel,
  projectTypeBg,
  projectTypeColor,
  projectTypeIcon,
  projectTypeKey,
  projectTypeLabel,
} from '@/lib/projects/utils';

const WA = process.env.NEXT_PUBLIC_INFRA_WHATSAPP_E164?.replace(/\D/g, '') || '919759750770';

function BankBadge({ name }: { name: string }) {
  return (
    <span className="infra-proj-badge b-teal gap-1">
      <Shield size={10} strokeWidth={1.8} />
      {name}
    </span>
  );
}

function KeyStats({ cells }: { cells: { label: string; value: string; accent?: boolean }[] }) {
  return (
    <div className="pdp-key-stats mt-4">
      {cells.map((c, i) => (
        <div key={i}>
          <div className="proj-stat-label">{c.label}</div>
          <div className={`proj-stat-val ${c.accent ? 'text-hz-amber' : ''}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function StickyPanel({
  project,
  downloadLabel,
  extra,
}: {
  project: InfraProject;
  downloadLabel: string;
  extra?: React.ReactNode;
}) {
  const typeKey = projectTypeKey(project);
  return (
    <div className="pdp-sticky-panel">
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
        <div className="mb-1 font-montserrat text-[10.5px] font-bold uppercase tracking-wide text-muted">
          Starting from
        </div>
        <div className="font-montserrat text-[28px] font-extrabold text-charcoal">
          {projectStartingPrice(project)}
        </div>
        <div className="mb-3.5 font-inter text-xs text-muted">
          {project.pricePerUnitLabel || ''}
          {project.configLabel ? ` · ${project.configLabel}` : ''}
        </div>
        {project.possessionDate ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#fef3c7] bg-[#fffbeb] px-3 py-2.5 font-inter text-[12.5px] text-muted">
            Possession: {project.possessionDate}
            {project.availableUnits ? ` · ${project.availableUnits} units remaining` : ''}
          </div>
        ) : null}
        <button type="button" className="proj-enquire mb-2">
          <MessageCircle size={14} strokeWidth={1.8} />
          Enquire &amp; book site visit
        </button>
        <button type="button" className="infra-btn infra-btn-ghost w-full justify-center py-2.5 text-xs">
          <Download size={14} strokeWidth={1.8} />
          {downloadLabel}
        </button>
      </div>

      {extra}

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
        <div className="mb-2.5 font-montserrat text-xs font-bold text-charcoal">Trust &amp; verifications</div>
        <div className="flex flex-col gap-2 text-[12.5px]">
          {project.reraVerified && project.reraNumber ? (
            <div className="flex items-center gap-2">
              <span className="text-hz-teal">✓</span>
              <span className="font-semibold">RERA registered</span>
              <span className="ml-auto text-[11px] text-muted">{project.reraNumber}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-hz-teal">✓</span>
            <span className="font-semibold">Zero brokerage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-hz-teal">✓</span>
            <span className="font-semibold">Title checked</span>
          </div>
          {(project.bankCount ?? 0) > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-hz-teal">✓</span>
              <span className="font-semibold">{project.bankCount} banks approved</span>
            </div>
          ) : null}
        </div>
      </div>

      {typeKey === 'villaplot' ? (
        <div className="rounded-lg border border-[#bfdbfe] bg-[#f0f7ff] p-3 font-inter text-[12px] text-[#0c4a6e]">
          Option to construct villa available with empanelled builders.
        </div>
      ) : null}

      <a
        href={`https://wa.me/${WA}`}
        target="_blank"
        rel="noreferrer"
        className="infra-btn infra-btn-wa w-full justify-center py-3 text-sm"
      >
        Chat on WhatsApp
      </a>
    </div>
  );
}

export function ProjectPDPView({ project }: { project: InfraProject }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const typeKey = projectTypeKey(project);
  const typeLabel = projectTypeLabel(project);
  const typeIcon = projectTypeIcon(project);
  const typeColor = projectTypeColor(project);
  const bg = projectTypeBg(project);
  const loc = projectLocation(project);
  const statusCls = projectStatusClass(project.status);
  const statusLabel = projectStatusLabel(project.status);
  const banks = project.approvedBanks ?? [];
  const configs = project.configurations ?? [];
  const amenities = project.amenities ?? [];
  const infra = project.infrastructure ?? [];
  const milestones = project.milestones ?? [];
  const faqs = project.faqs ?? [];
  const landmarks = project.landmarks ?? [];
  const dev = project.developerInfo;
  const progress = project.constructionProgress ?? 0;

  const breadcrumbType =
    typeKey === 'apartment'
      ? 'Apartments'
      : typeKey === 'villa'
        ? 'Villas'
        : typeKey === 'venture'
          ? 'Ventures'
          : 'Villa Plots';

  const keyStats =
    typeKey === 'apartment'
      ? [
          { label: 'Configs', value: project.configLabel || '—' },
          { label: 'Total units', value: project.unitsLabel || String(project.totalUnits || '—') },
          { label: 'Possession', value: project.possessionDate || '—', accent: true },
          {
            label: 'Towers / Floors',
            value: [project.towers ? `${project.towers} towers` : null, project.maxFloors ? `G+${project.maxFloors}` : null]
              .filter(Boolean)
              .join(' · ') || '—',
          },
        ]
      : typeKey === 'villa'
        ? [
            { label: 'Villa type', value: project.configLabel || '—' },
            { label: 'Total villas', value: project.unitsLabel || '—' },
            { label: 'Plot area', value: project.legal?.plotArea || '—' },
            { label: 'Possession', value: project.possessionDate || 'Ready now', accent: true },
          ]
        : [
            { label: 'Plot sizes', value: project.configLabel || '—' },
            { label: 'Total plots', value: project.unitsLabel || String(project.totalUnits || '—') },
            { label: 'Available', value: String(project.availableUnits || '—'), accent: true },
            { label: 'Authority', value: project.legal?.authority || 'HMDA' },
          ];

  const configTitle =
    typeKey === 'apartment'
      ? 'Configurations & pricing'
      : typeKey === 'villa'
        ? 'Villa configurations'
        : 'Plot sizes & pricing';

  const downloadLabel =
    typeKey === 'venture' || typeKey === 'villaplot' ? 'Download master plan' : 'Download brochure';

  return (
    <div className="bg-offwhite pb-16">
      <div className="mx-auto max-w-infra px-4 py-6 md:px-7 md:py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 font-inter text-xs text-muted">
          <Link href="/" className="text-hz-blue">
            Home
          </Link>
          <span>›</span>
          <Link href="/projects" className="text-hz-blue">
            Projects
          </Link>
          <span>›</span>
          <span>{breadcrumbType}</span>
          <span>›</span>
          <span className="text-charcoal">{project.name}</span>
        </nav>

        <div className="pdp-grid">
          <div className="min-w-0">
            {/* Gallery */}
            <div className="mb-3.5 overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
              <div className="pdp-gallery-main flex items-center justify-center" style={{ background: bg }}>
                <span className="text-6xl opacity-30">{typeIcon}</span>
                <span
                  className="absolute left-3.5 top-3.5 rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ background: `${typeColor}d9` }}
                >
                  {typeIcon} {typeLabel} Project
                </span>
                <div className="absolute bottom-3.5 left-3.5 flex flex-wrap gap-1.5">
                  <span className={`infra-proj-badge ${statusCls}`}>{statusLabel}</span>
                  {project.reraVerified ? <span className="infra-proj-badge b-teal">RERA Verified</span> : null}
                  <span className="infra-proj-badge b-navy bg-[#e0e7ef] text-navy">Zero Brokerage</span>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    <span className={`infra-proj-badge type-${typeKey === 'villaplot' ? 'plot' : typeKey}`}>
                      {typeLabel} Project
                    </span>
                    <span className={`infra-proj-badge ${statusCls}`}>{statusLabel}</span>
                    {project.reraVerified ? <span className="infra-proj-badge b-teal">RERA ✓</span> : null}
                  </div>
                  <h1 className="font-montserrat text-2xl font-extrabold leading-tight text-charcoal">{project.name}</h1>
                  <div className="mt-1.5 flex items-center gap-1 font-inter text-[13px] text-muted">
                    <MapPin size={12} strokeWidth={1.8} />
                    {loc}
                  </div>
                  <p className="mt-1 font-inter text-xs text-muted">
                    By <strong className="text-charcoal">{project.developerName || dev?.name || 'Developer'}</strong>
                    {project.reraNumber ? ` · RERA: ${project.reraNumber}` : ''}
                    {project.refCode ? ` · Ref: ${project.refCode}` : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-montserrat text-[10.5px] font-bold uppercase tracking-wide text-muted">
                    Starting from
                  </div>
                  <div className="font-montserrat text-[28px] font-extrabold text-charcoal">
                    {projectStartingPrice(project)}
                  </div>
                  {project.pricePerUnitLabel ? (
                    <div className="font-inter text-xs text-muted">{project.pricePerUnitLabel}</div>
                  ) : null}
                </div>
              </div>
              <KeyStats cells={keyStats} />
            </div>

            {/* About */}
            {project.description ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider
                  title="About this project"
                  icon={<span className="text-hz-blue">i</span>}
                  iconBg="var(--blue-light)"
                />
                <p className="font-inter text-[13.5px] leading-relaxed text-muted">{project.description}</p>
              </div>
            ) : null}

            {/* Config table */}
            {configs.length > 0 ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title={configTitle} icon={<span>⌂</span>} iconBg="var(--blue-light)" />
                <div className="pdp-config-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        {typeKey === 'villa' ? (
                          <>
                            <th>Plot area</th>
                            <th>Built-up</th>
                            <th>Floors</th>
                            <th>Price</th>
                          </>
                        ) : typeKey === 'venture' || typeKey === 'villaplot' ? (
                          <>
                            <th>Area</th>
                            <th>Rate</th>
                            <th>Total price</th>
                            <th>Facing</th>
                          </>
                        ) : (
                          <>
                            <th>Carpet area</th>
                            <th>Base price</th>
                            <th>All-inclusive</th>
                            <th>Availability</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {configs.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <span className="infra-proj-chip">{row.type}</span>
                          </td>
                          {typeKey === 'villa' ? (
                            <>
                              <td>{row.plotArea || row.area}</td>
                              <td>{row.builtUp}</td>
                              <td>{row.floors}</td>
                              <td className="font-semibold text-hz-blue">{row.price || row.basePrice}</td>
                            </>
                          ) : typeKey === 'venture' || typeKey === 'villaplot' ? (
                            <>
                              <td>{row.area}</td>
                              <td>{row.basePrice}</td>
                              <td className="font-semibold text-hz-blue">{row.allInclusive || row.price}</td>
                              <td>{row.facing}</td>
                            </>
                          ) : (
                            <>
                              <td>{row.area}</td>
                              <td>{row.basePrice}</td>
                              <td className="font-semibold text-hz-teal">{row.allInclusive}</td>
                              <td>{row.availability}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Construction progress — apartments only */}
            {typeKey === 'apartment' && milestones.length > 0 ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider
                  title="Construction progress"
                  icon={<span>📅</span>}
                  iconBg="#fef3c7"
                  trailing={
                    progress > 0 ? (
                      <span className="infra-proj-badge st-uc">{progress}% complete</span>
                    ) : null
                  }
                />
                {progress > 0 ? (
                  <div className="mb-3.5">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>Overall completion</span>
                      <span className="font-bold text-hz-amber">{progress}%</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill bg-hz-amber" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : null}
                {milestones.map((m) => (
                  <div key={m.milestoneId} className="ms-row">
                    <div
                      className="ms-dot"
                      style={{
                        background: m.isCompleted ? '#16a34a' : m.isCurrent ? 'var(--am)' : '#e2e8f0',
                      }}
                    />
                    <div className="ms-label">{m.label}</div>
                    {m.date ? <div className="ms-date">{m.date}</div> : null}
                    <span
                      className={`infra-proj-badge text-[10px] ${
                        m.isCompleted ? 'st-ready' : m.isCurrent ? 'st-uc' : 'st-sold'
                      }`}
                    >
                      {m.isCompleted ? 'Done' : m.isCurrent ? 'In progress' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Infrastructure — venture/villaplot */}
            {(typeKey === 'venture' || typeKey === 'villaplot') && infra.length > 0 ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider
                  title="Infrastructure status"
                  icon={<span>🛣</span>}
                  iconBg="#fef3c7"
                  trailing={
                    progress > 0 ? (
                      <span className="infra-proj-badge b-teal">{progress}% complete</span>
                    ) : null
                  }
                />
                {progress > 0 ? (
                  <div className="mb-3.5">
                    <div className="prog-track">
                      <div className="prog-fill bg-hz-teal" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : null}
                {infra.map((item, i) => (
                  <div key={i} className="infra-row">
                    <span className="text-[12.5px] font-semibold text-charcoal">{item.label}</span>
                    <span
                      className={`infra-proj-badge text-[10px] ${
                        item.status === 'done' ? 'b-teal' : item.status === 'in_progress' ? 'st-uc' : 'st-sold'
                      }`}
                    >
                      {item.status === 'done' ? 'Done' : item.status === 'in_progress' ? 'In progress' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Amenities */}
            {amenities.length > 0 && (typeKey === 'apartment' || typeKey === 'villa') ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title="Amenities" icon={<span>✓</span>} iconBg="#f0fdf4" />
                <div className="amenity-chip-grid">
                  {amenities.map((a) => (
                    <span key={a} className="am-chip sel">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Banks */}
            {banks.length > 0 ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title="Bank & NBFC approvals" icon={<Shield size={14} strokeWidth={1.8} />} iconBg="#f0fdf4" />
                <p className="mb-2 font-inter text-[11.5px] text-muted">
                  Bank approvals confirm the project is legally sound. You can avail home loans from any of these
                  lenders.
                </p>
                <div className="bank-badge-row">
                  {banks.map((b) => (
                    <BankBadge key={b} name={b} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Location */}
            {landmarks.length > 0 ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title="Location & connectivity" icon={<MapPin size={14} strokeWidth={1.8} />} iconBg="#fdf4ff" />
                <div className="mb-3 flex h-40 items-center justify-center rounded-lg border border-[#bae6fd] bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe]">
                  <div className="text-center text-sm text-[#0369a1]">Map view — {loc}</div>
                </div>
                <div className="landmarks-grid">
                  {landmarks.map((l) => (
                    <div key={l.name} className="ms-row mb-0">
                      <span className="text-xs font-semibold text-charcoal">{l.name}</span>
                      <span className="text-[11.5px] text-muted">{l.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Developer */}
            {dev ? (
              <div className="mb-3.5 rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title="Developer" icon={<span>🏢</span>} iconBg="var(--blue-light)" />
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-hz-blue to-[#1a6dd6] font-montserrat text-lg font-extrabold text-white">
                    {(dev.name || project.developerName || 'D').charAt(0)}
                  </div>
                  <div>
                    <div className="font-montserrat text-[15px] font-bold text-charcoal">
                      {dev.name || project.developerName}
                    </div>
                    <div className="mt-0.5 font-inter text-xs text-muted">
                      {dev.founded ? `Founded ${dev.founded}` : ''}
                      {dev.location ? ` · ${dev.location}` : ''}
                    </div>
                    {dev.highlights?.length ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {dev.highlights.map((h) => (
                          <span key={h} className="infra-proj-chip">
                            {h}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* FAQ */}
            {faqs.length > 0 ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 md:p-[18px]">
                <SectionDivider title="Frequently asked questions" icon={<span>?</span>} iconBg="#f3e8ff" />
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full border-b border-[#f1f5f9] py-3 text-left last:border-0"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="flex items-center justify-between gap-2 font-inter text-[13px] font-semibold text-charcoal">
                      {faq.q}
                      <ChevronDown
                        size={13}
                        strokeWidth={1.8}
                        className={`shrink-0 text-muted transition ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </div>
                    {openFaq === i ? (
                      <p className="mt-2 font-inter text-[12.5px] leading-relaxed text-muted">{faq.a}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <StickyPanel
            project={project}
            downloadLabel={downloadLabel}
            extra={
              (typeKey === 'venture' || typeKey === 'villaplot') && project.roadWidths?.length ? (
                <>
                  <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
                    <div className="mb-2.5 font-montserrat text-xs font-bold text-charcoal">Road widths</div>
                    {project.roadWidths.map((r) => (
                      <div key={r.label} className="flex justify-between py-1 font-inter text-xs">
                        <span className="text-muted">{r.label}</span>
                        <span className="font-semibold">{r.width}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-[#e2e8f0] bg-white p-3.5">
                    <div className="mb-2.5 font-montserrat text-xs font-bold text-charcoal">Verifications</div>
                    <div className="flex flex-col gap-1.5 font-inter text-xs font-semibold">
                      {project.legal?.authority ? <span>✓ {project.legal.authority} approved</span> : null}
                      <span>✓ EC clear — title clean</span>
                      {project.legal?.patta ? <span>✓ Patta available</span> : null}
                    </div>
                  </div>
                </>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
