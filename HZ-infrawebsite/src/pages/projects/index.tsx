import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';
import { ProjectCard } from '@/components/property/ProjectCard';

export default function ProjectsPage() {
  const [items, setItems] = useState<InfraProject[]>([]);
  useEffect(() => {
    void (async () => {
      const res = await api.get('/projects');
      setItems(res.data ?? []);
    })();
  }, []);
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Projects</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.projectId} project={p} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
