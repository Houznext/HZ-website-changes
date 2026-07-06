import { SessionProvider } from "next-auth/react";
import "@/src/styles/tailwind.css";
import "../styles/globals.css";
import "@/src/styles/livebuild-admin.css";
import "@/src/styles/branches-admin.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { Session } from "next-auth";
import type { AppProps, AppType } from "next/app";
import "dotenv/config";
import "@/src/styles/text-editor-style.css";
import { Toaster } from "react-hot-toast";
import { useCallback, useMemo, useState } from "react";
import SocketInitializer from "../components/chat/SocketInitializer";
import SessionSync from "@/src/components/SessionSync";
import Head from "next/head";

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
  const [showAll, setShowAll] = useState(false);

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
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </Head>

      <SessionProvider
        session={session as Session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        <SessionSync />
        <SocketInitializer />
        <div>{getLayout(<Component {...pageProps} />)}</div>
        <Toaster position="top-right" reverseOrder={false} containerClassName="text-[12px]" />
      </SessionProvider>
    </>
  );
};

export default MyApp;
