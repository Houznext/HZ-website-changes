// components/Layout.tsx
import React, { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import GeneralFooter from "./Footer";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";
import Chatbot from "@/common/Chatbot";


const BottomNav = dynamic(() => import("@/common/BottomNav"), { ssr: false });

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};


const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex flex-col h-full min-h-screen justify-between max-w-[full] mx-auto'>
      <Navbar isVisibleItems={true} />
      {/* BottomNav before content so fixed UI inside content (SORT|FILTER bar, filter Drawer) can sit above it via z-[100]/z-[200] */}
      <BottomNav />
      <div className="flex-grow flex-1 h-full min-h-full min-w-0">
        {children}
      </div>
      <GeneralFooter />
      <Toaster />
    </div>
  );
};


export function withGeneralLayout(Page: any) {
  const PageWithLayout = (props: any) => (
    <Layout>
      <Chatbot />
      <Page {...props} />
    </Layout>
  );
  return PageWithLayout;
}

export default withGeneralLayout;

