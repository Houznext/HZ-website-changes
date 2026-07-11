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
    <div className="min-h-screen flex bg-[#f5f7fa] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 font-sans">
        <TopNavbar />
        <PageContainer fullWidth={isLivebuild} noPadding={isLivebuild}>
          <div className="font-sans [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_h4]:font-heading [&_h5]:font-heading [&_h6]:font-heading">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

