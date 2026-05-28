import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import AdminShell from '@/src/components/layout/AdminShell';

/** LiveBuild mockup styling inside the standard Houznext admin shell (full sidebar kept). */
function LivebuildAdminLayout({ page }: { page: ReactElement }) {
  return (
    <AdminShell variant="livebuild">
      <div className="lb-admin-root lb-admin-embedded">{page}</div>
    </AdminShell>
  );
}

export type NextPageWithLivebuildLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function withLivebuildLayout(PageComponent: NextPage) {
  const PageWithLayout = (props: Record<string, unknown>) => {
    const page = <PageComponent {...props} />;
    return <LivebuildAdminLayout page={page} />;
  };
  return PageWithLayout;
}
