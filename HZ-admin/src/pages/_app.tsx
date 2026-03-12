import { SessionProvider, signOut, useSession } from "next-auth/react";
import "@/src/styles/tailwind.css";
import "../styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { Session } from "next-auth";
import type { AppProps, AppType } from "next/app";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "dotenv/config";
import "@/src/styles/text-editor-style.css";
import { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { TourGuideProvider } from "../features/CustomBuilder/TourGuide/TourGuideProvider";
import SocketInitializer from "../components/chat/SocketInitializer";
import SessionSync from "@/src/components/SessionSync";
import Head from "next/head";

const GA4_ID = "G-MJ64LCY1PL";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, props?: any) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: {
    session: Session | null;
    [key: string]: any;
  };
};


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("config", GA4_ID, { page_path: url });
      } else {
        console.error("gtag is not a function");
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);


  const setShowAllMemo = useCallback((val: boolean) => setShowAll(val), []);
  const layoutProps = useMemo(
    () => ({
      showAll,
      setShowAll: setShowAllMemo,
    }),
    [showAll, setShowAllMemo]
  );


  const getLayout = Component.getLayout
    ? (page: ReactElement) =>
      Component.getLayout!(page, {
        layoutProps,
      })
    : (page: ReactElement) => page;

  return (
    <>
      <Head>
        <link rel="icon" href="/images/houznext-icon.png" />
      </Head>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <SessionProvider
        session={session as Session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        <SessionSync />
        <SocketInitializer />
        <TourGuideProvider>
          <div>{getLayout(<Component {...pageProps} />)}</div>
          <SpeedInsights />
          <Toaster position="top-right" reverseOrder={false} containerClassName="text-[12px]" />
        </TourGuideProvider>

      </SessionProvider>
    </>
  );
};

export default MyApp;
