import React from "react";

type Props = {
  children: React.ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
};

export default function PageContainer({
  children,
  fullWidth = false,
  noPadding = false,
}: Props) {
  return (
    <main
      className={`flex-1 overflow-y-auto bg-[#f5f7fa] ${
        noPadding ? "p-0" : "px-6 py-6"
      }`}
    >
      <div
        className={
          fullWidth ? "w-full min-w-0" : "max-w-7xl mx-auto space-y-6"
        }
      >
        {children}
      </div>
    </main>
  );
}

