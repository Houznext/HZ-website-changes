import { GetServerSideProps } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProjectPDPView } from '@/components/projects/ProjectPDPView';
import type { InfraProject } from '@/types/infra.types';

type Props = { project: InfraProject | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  try {
    const base = process.env.INFRA_BACKEND_URL || process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://127.0.0.1:4001';
    const res = await fetch(`${base}/projects/${encodeURIComponent(slug)}`);
    if (!res.ok) return { notFound: true };
    const project = (await res.json()) as InfraProject;
    if (project.published === false) return { notFound: true };
    return { props: { project } };
  } catch {
    return { notFound: true };
  }
};

export default function ProjectDetailPage({ project }: Props) {
  if (!project) return null;
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <ProjectPDPView project={project} />
      <Footer />
    </div>
  );
}
