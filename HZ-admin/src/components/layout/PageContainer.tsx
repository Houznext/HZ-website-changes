import React from "react";

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 px-6 py-6 bg-[#f5f7fa] overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">{children}</div>
    </main>
  );
}

