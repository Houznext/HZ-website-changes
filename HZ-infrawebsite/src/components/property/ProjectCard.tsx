import Image from 'next/image';
import Link from 'next/link';
import type { InfraProject } from '@/types/infra.types';
import { formatPrice } from '@/lib/format';
import { StatusBadge } from '@/components/ui/StatusBadge';

const GRADIENTS = [
  'linear-gradient(145deg,#0f2a44,#1a4060)',
  'linear-gradient(145deg,#1a4230,#14532d)',
  'linear-gradient(145deg,#1e1b4b,#312e81)',
  'linear-gradient(145deg,#1a2e44,#0f3460)',
  'linear-gradient(145deg,#1a2e1a,#143528)',
  'linear-gradient(145deg,#2a1515,#4a2020)',
];

function gradientFor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return GRADIENTS[n % GRADIENTS.length]!;
}

function configLine(project: InfraProject): string {
  const parts: string[] = [];
  if (project.towers) parts.push(`${project.towers} tower${project.towers > 1 ? 's' : ''}`);
  if (project.totalUnits) parts.push(`${project.totalUnits} units`);
  if (project.maxFloors) parts.push(`${project.maxFloors} floors`);
  return parts.length ? parts.join(' · ') : project.status;
}

export function ProjectCard({ project }: { project: InfraProject }) {
  const slug = project.slug || project.projectId;
  const img = project.heroImageUrl;
  const bg = gradientFor(project.projectId);
  const loc = [project.locality, project.city].filter(Boolean).join(', ');
  const price =
    project.minPrice && project.maxPrice
      ? `${formatPrice(project.minPrice)} – ${formatPrice(project.maxPrice)}`
      : formatPrice(project.minPrice || project.maxPrice);

  return (
    <Link
      href={`/projects/${slug}`}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#dde8f5] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_16px_48px_rgba(15,42,68,0.10)]"
    >
      <div
        className="relative flex h-[160px] items-end p-3.5 sm:p-4"
        style={!img ? { background: bg } : undefined}
      >
        {img ? (
          <>
            <Image src={img} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a44]/85 via-[#0f2a44]/35 to-transparent" />
          </>
        ) : null}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
          <span className="rounded-md bg-[#ccfbf1] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
            RERA
          </span>
          <StatusBadge status={project.status} />
        </div>
        <div className="relative z-[1] min-w-0">
          <div className="font-montserrat text-[17px] font-bold leading-snug text-white">{project.name}</div>
          {loc ? <div className="mt-0.5 font-inter text-[11px] text-white/60">{loc}</div> : null}
        </div>
      </div>
      <div className="p-4">
        <div className="font-montserrat text-base font-bold text-charcoal">{price}</div>
        <div className="mt-0.5 font-inter text-[11.5px] text-muted">{configLine(project)}</div>
      </div>
    </Link>
  );
}
