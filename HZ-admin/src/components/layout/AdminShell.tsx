import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import PageContainer from "./PageContainer";

type Props = {
  children: React.ReactNode;
  /** Full-width LiveBuild mockup content; keeps main admin sidebar + top bar. */
  variant?: "default" | "livebuild";
};

export default function AdminShell({ children, variant = "default" }: Props) {
  const isLivebuild = variant === "livebuild";

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopNavbar />
        <PageContainer fullWidth={isLivebuild} noPadding={isLivebuild}>
          {children}
        </PageContainer>
      </div>
    </div>
  );
}

