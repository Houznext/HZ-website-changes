import { SessionProvider } from "next-auth/react";
import "../styles/tailwind.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { type Session } from "next-auth";
import type { AppProps, AppType } from "next/app";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import dynamic from "next/dynamic";
import AuthProvider, { AuthGate } from "@/common/auth/AuthProvider";
import { TourProvider } from "@/common/FeatureTour";
import SocketInitializer from "../common/InitializeSocket";
import SessionSync from "@/components/SessionSync";

const NEXT_PUBLIC_GA4_ID = "G-MJ64LCY1PL";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement, props?: any) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const router = useRouter();

  const [showAll, setShowAll] = useState(false);


  const setShowAllMemo = useCallback((val: boolean) => setShowAll(val), []);
  const layoutProps = useMemo(
    () => ({
      showAll,
      setShowAll: setShowAllMemo,
    }),
    [showAll, setShowAllMemo]
  );


  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("config", NEXT_PUBLIC_GA4_ID, { page_path: url });
      } else {
        console.error("gtag is not a function");
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const Chatbot = dynamic(() => import("@/common/Chatbot/index"), {
    ssr: false,
  });
  const Toaster = dynamic(
    () => import("react-hot-toast").then((mod) => mod.Toaster),
    { ssr: false }
  );
  const Analytics = dynamic(
    () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
    { ssr: false }
  );

  const getLayout = Component.getLayout
    ? (page: ReactElement) =>
      Component.getLayout!(page, {
        layoutProps
      })
    : (page: ReactElement) => page;

  return (
    <>
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GA4_ID}`}
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${NEXT_PUBLIC_GA4_ID}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
        <Script
          id="adsense-script"
          strategy="lazyOnload"
          async
          src={process.env.NEXT_PUBLIC_GOOGLE_AD_SRC}
          crossOrigin="anonymous"
        />
      </>
      <SessionProvider
        session={session as Session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        <SessionSync />
        <SocketInitializer />
        <AuthProvider>
          <TourProvider>
            <AuthGate />
            <div>{getLayout(<Component {...pageProps} />)}</div>
            <Analytics />
            <Toaster position="top-right" reverseOrder={false} containerClassName="text-[12px]" />
          </TourProvider>
        </AuthProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
