
import React, { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Navbar from '../GeneralLayout/Navbar';
import GeneralFooter from '../GeneralLayout/Footer';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

const Layout = (page: ReactElement) => {
    return (
        <div className='flex flex-col h-full min-h-screen justify-between  mx-auto'>
            <Navbar isVisibleItems={true} />
            <div className='flex-grow flex-1 h-full min-h-full'>{page}</div>
        </div>
    );
};
function LoginLayout(c: any) {
    c.getLayout = Layout;
    return c;
}
export default LoginLayout;
