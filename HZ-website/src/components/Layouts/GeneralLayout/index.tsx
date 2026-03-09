// components/Layout.tsx
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import GeneralFooter from "./Footer";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import AuthModal from "@/common/auth/AuthModal";
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
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (router.query.auth === "1") {
      setAuthOpen(true);
    }
  }, [router.query.auth]);

  const callbackUrl =
    typeof router.query.callbackurl === "string"
      ? router.query.callbackurl
      : "/";

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
      <AuthModal
        isOpen={authOpen}
        closeModal={() => {
          setAuthOpen(false);
          const url = { pathname: router.pathname, query: { ...router.query } };
          delete (url.query as any).auth;
          router.replace(url, undefined, { shallow: true });
        }}
        callbackUrl={callbackUrl}
      />
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

