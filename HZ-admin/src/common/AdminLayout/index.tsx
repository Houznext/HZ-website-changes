import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import AdminShell from "@/src/components/layout/AdminShell";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

function AdminLayout({ page }: { page: ReactElement }) {
  return <AdminShell>{page}</AdminShell>;
}

export default function withAdminLayout(PageComponent: any) {
  const PageWithLayout = (props: any) => {
    const page = <PageComponent {...props} />;
    return <AdminLayout page={page} />;
  };

  return PageWithLayout;
}

