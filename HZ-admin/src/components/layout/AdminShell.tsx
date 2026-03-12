import React from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import PageContainer from "./PageContainer";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

