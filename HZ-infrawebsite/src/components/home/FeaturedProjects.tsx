import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';
import { ProjectCard } from '@/components/property/ProjectCard';

export function FeaturedProjects() {
  const [items, setItems] = useState<InfraProject[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get('/projects', { params: { featured: true, limit: 6 } });
        setItems(res.data ?? []);
      } catch {
        setItems([]);
      }
    })();
  }, []);
  return (
    <section className="overflow-x-hidden bg-hzwhite py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-hz-teal">
              Houznext verified projects
            </div>
            <h2 className="mt-2 font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-3xl">
              New launches & featured projects
            </h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.projectId} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
