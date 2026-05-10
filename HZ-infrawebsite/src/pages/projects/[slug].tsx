import { GetServerSideProps } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatusTimeline } from '@/components/property/StatusTimeline';
import type { InfraProject } from '@/types/infra.types';

type Props = { project: InfraProject | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  try {
    const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
    const res = await fetch(`${base}/projects/${encodeURIComponent(slug)}`);
    if (!res.ok) return { notFound: true };
    return { props: { project: await res.json() } };
  } catch {
    return { notFound: true };
  }
};

export default function ProjectDetailPage({ project }: Props) {
  if (!project) return null;
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">{project.name}</h1>
        <p className="mt-2 font-inter text-sm text-muted">
          {project.locality || project.city} · {project.status}
        </p>
        {project.description && <p className="mt-6 max-w-3xl font-inter text-sm leading-relaxed">{project.description}</p>}
        <div className="mt-10 max-w-xl">
          <h2 className="font-montserrat text-lg font-bold text-charcoal">Construction timeline</h2>
          <div className="mt-4">
            <StatusTimeline milestones={project.milestones ?? []} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
