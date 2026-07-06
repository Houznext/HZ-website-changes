import { SessionProvider } from "next-auth/react";
import "../styles/tailwind.css";
import "../styles/livebuild.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { type Session } from "next-auth";
import type { AppProps, AppType } from "next/app";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AuthProvider, { AuthGate } from "@/common/auth/AuthProvider";
import { TourProvider } from "@/common/FeatureTour";
import SocketInitializer from "../common/InitializeSocket";
import SessionSync from "@/components/SessionSync";
import { QuoteModalProvider } from "@/components/QuoteModal";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

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
  const [showAll, setShowAll] = useState(false);

  const setShowAllMemo = useCallback((val: boolean) => setShowAll(val), []);
  const layoutProps = useMemo(
    () => ({
      showAll,
      setShowAll: setShowAllMemo,
    }),
    [showAll, setShowAllMemo]
  );

  const Chatbot = dynamic(() => import("@/common/Chatbot/index"), {
    ssr: false,
  });
  const Toaster = dynamic(
    () => import("react-hot-toast").then((mod) => mod.Toaster),
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
      <SessionProvider
        session={session as Session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        <SessionSync />
        <SocketInitializer />
        <AuthProvider>
          <TourProvider>
            <QuoteModalProvider>
              <CustomerAuthProvider>
                <AuthGate />
                <div>{getLayout(<Component {...pageProps} />)}</div>
                <Toaster position="top-right" reverseOrder={false} containerClassName="text-[12px]" />
              </CustomerAuthProvider>
            </QuoteModalProvider>
          </TourProvider>
        </AuthProvider>
      </SessionProvider>
    </>
  );
};

export default MyApp;
