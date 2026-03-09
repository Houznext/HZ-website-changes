import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthModal from "../AuthModal";
import { useRouter } from "next/router";

type OpenOpts = { callbackUrl?: string; defaultMethod?: "email" | "phone" };

type AuthCtx = {
    openAuth: (opts?: OpenOpts) => void;
    closeAuth: () => void;
};

const Ctx = createContext<AuthCtx>({ openAuth: () => { }, closeAuth: () => { } });
export const useAuthModal = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [opts, setOpts] = useState<OpenOpts>({});

    const openAuth = useCallback((o?: OpenOpts) => {
        setOpts(o || {});
        setOpen(true);
    }, []);

    const closeAuth = useCallback(() => setOpen(false), []);

    const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

    return (
        <Ctx.Provider value={value}>
            {children}
            <AuthModal
                isOpen={open}
                closeModal={closeAuth}
                callbackUrl={opts?.callbackUrl}
            />
        </Ctx.Provider>
    );
}


function AuthGate() {
    const router = useRouter();
    const { openAuth } = useAuthModal();

    useEffect(() => {
        const auth = router.query.auth;
        const callbackUrl =
            typeof router.query.callbackUrl === "string"
                ? router.query.callbackUrl
                : undefined;

        if (auth === "1") {
            openAuth({ callbackUrl });
            const nextQuery = { ...router.query };
            delete (nextQuery as any).auth;
            delete (nextQuery as any).callbackUrl;

            router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
                shallow: true,
            });
        }
    }, [router.query.auth, router.query.callbackUrl, openAuth]);

    return null;
}

export { AuthGate };

