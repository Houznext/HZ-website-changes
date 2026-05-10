import Image from 'next/image';
import Link from 'next/link';
import type { InfraProject } from '@/types/infra.types';
import { formatPrice } from '@/lib/format';

export function ProjectCard({ project }: { project: InfraProject }) {
  const img =
    project.heroImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80';
  const slug = project.slug || project.projectId;
  return (
    <Link
      href={`/projects/${slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-hzwhite transition hover:-translate-y-1 hover:border-hz-blue/40 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] bg-hz-blue-light">
        <Image src={img} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
      </div>
      <div className="p-4">
        <div className="font-montserrat text-lg font-extrabold text-charcoal">{project.name}</div>
        <div className="mt-1 font-inter text-xs text-muted">
          {project.locality || project.city} · {project.status}
        </div>
        <div className="mt-3 font-montserrat text-sm font-bold text-charcoal">
          {formatPrice(project.minPrice)} – {formatPrice(project.maxPrice)}
        </div>
      </div>
    </Link>
  );
}
