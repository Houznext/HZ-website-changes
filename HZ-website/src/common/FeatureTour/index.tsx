import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Star, Home, Zap, CheckCircle } from "lucide-react";
import Button from "../Button";

export type Placement = "top" | "bottom" | "left" | "right" | "center";
export type TourStep = {
    id: string;
    selector: string;
    title?: string;
    content: React.ReactNode;
    placement?: Placement;
    padding?: number;
    badge?: string;
};

interface TourContextValue {
    isOpen: boolean;
    steps: TourStep[];
    index: number;
    open: (steps: TourStep[], startIndex?: number) => void;
    close: () => void;
    next: () => void;
    prev: () => void;
    goTo: (i: number) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export const useTour = () => {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error("useTour must be used within <TourProvider>");
    return ctx;
};

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [index, setIndex] = useState<number>(-1);

    const isOpen = index >= 0 && index < steps.length;

    const open = useCallback((s: TourStep[], startIndex: number = 0) => {
        setSteps(s);
        setIndex(s.length ? startIndex : -1);
    }, []);

    const close = useCallback(() => {
        setIndex(-1);
        setSteps([]);
    }, []);

    const next = useCallback(() => setIndex((i) => (i + 1 < steps.length ? i + 1 : i)), [steps.length]);
    const prev = useCallback(() => setIndex((i) => (i - 1 >= 0 ? i - 1 : i)), []);
    const goTo = useCallback((i: number) => setIndex(i), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close, next, prev]);

    const value = useMemo(() => ({ isOpen, steps, index, open, close, next, prev, goTo }), [isOpen, steps, index, open, close, next, prev, goTo]);

    return (
        <TourContext.Provider value={value}>
            {children}
            {isOpen && <TourOverlay step={steps[index]} index={index} total={steps.length} onClose={close} onPrev={prev} onNext={next} goTo={goTo} />}
        </TourContext.Provider>
    );
}

// ---------- Enhanced Overlay + Popover ----------
function TourOverlay({ step, index, total, onClose, onPrev, onNext, goTo }: { step: TourStep; index: number; total: number; onClose: () => void; onPrev: () => void; onNext: () => void; goTo: (i: number) => void; }) {
    const target = document.querySelector(step.selector) as HTMLElement | null;
    const [rect, setRect] = useState<DOMRect | null>(null);
    const padding = step.padding ?? 12;
    const popRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!target) return;
        const update = () => setRect(target.getBoundingClientRect());
        update();
        const ro = new ResizeObserver(update);
        ro.observe(target);
        const onScroll = () => update();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", update);
        target.scrollIntoView({ block: "center", behavior: "smooth" });
        return () => {
            ro.disconnect();
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", update);
        };
    }, [target]);

    const popStyle: React.CSSProperties = useMemo(() => {
        if (!rect) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
        const gap = 16;
        const w = 360;
        const h = 200;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const place: Placement = step.placement ?? "bottom";
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        let top = 0, left = 0, transform = "";

        switch (place) {
            case "top":
                top = rect.top + scrollY - padding - gap - h;
                left = centerX + scrollX - w / 2;
                break;
            case "bottom":
                top = rect.bottom + scrollY + padding + gap;
                left = centerX + scrollX - w / 2;
                break;
            case "left":
                top = centerY + scrollY - h / 2;
                left = rect.left + scrollX - padding - gap - w;
                break;
            case "right":
                top = centerY + scrollY - h / 2;
                left = rect.right + scrollX + padding + gap;
                break;
            case "center":
            default:
                top = centerY + scrollY;
                left = centerX + scrollX;
                transform = "translate(-50%, -50%)";
        }

        // Ensure popover stays within viewport
        const viewportPadding = 20;
        const maxLeft = window.innerWidth - w - viewportPadding;
        const maxTop = window.innerHeight - h - viewportPadding;

        left = Math.max(viewportPadding, Math.min(left, maxLeft));
        top = Math.max(viewportPadding, Math.min(top, maxTop));

        return { position: "absolute", top, left, width: w, transform };
    }, [rect, step.placement, step.padding]);

    // Spotlight rect with gradient border
    const spot = useMemo(() => {
        if (!rect) return null;
        return {
            left: rect.left - padding + window.scrollX,
            top: rect.top - padding + window.scrollY,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            radius: 12,
        };
    }, [rect, padding]);

    const getProgressIcon = (stepIndex: number) => {
        if (stepIndex < index) return <CheckCircle className="w-3 h-3 text-green-500" />;
        if (stepIndex === index) return <Zap className="w-3 h-3 text-yellow-500" />;
        return <div className="w-3 h-3 rounded-full bg-neutral-300" />;
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-auto font-Gordita">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-900/10 to-pink-900/15 backdrop-blur-[1px]" />
            {spot && (
                <div
                    aria-hidden
                    className="absolute border-[3px] border-transparent bg-gradient-to-r from-blue-500 via-blue-500 to-pink-500 rounded-xl shadow-2xl animate-pulse"
                    style={{
                        left: spot.left,
                        top: spot.top,
                        width: spot.width,
                        height: spot.height,
                        borderRadius: spot.radius,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor'
                    }}
                />
            )}

            <div
                ref={popRef}
                className="absolute bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 p-6 max-w-[460px] md:min-w-[420px] md:min-h-[300px] backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95"
                style={popStyle}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {step.badge && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                {step.badge}
                            </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-[#3586FF] dark:text-blue-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-medium">Step {index + 1}</span>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        className="inline-flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {step.title && (
                    <h3 className="md:text-lg text-[14px] font-medium text-neutral-900 dark:text-white mb-2 leading-tight">
                        {step.title}
                    </h3>
                )}
                <div className="label-text leading-relaxed text-neutral-600 dark:text-neutral-300 mb-4">
                    {step.content}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: total }).map((_, i) => (
                            <Button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`p-1 rounded-lg transition-all ${i === index
                                    ? "bg-blue-100 dark:bg-blue-900/30"
                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    }`}
                            >
                                {getProgressIcon(i)}
                            </Button>
                        ))}
                    </div>
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {index + 1} of {total}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="inline-flex items-center text-nowrap text-[10px] md:text-[13px] font-medium px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Skip Tour
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onPrev}
                            disabled={index === 0}
                            variant="outline"
                            className="inline-flex items-center gap-1 label-text font-medium rounded-lg px-3 md:py-2 py-1 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>

                        <Button
                            onClick={index + 1 === total ? onClose : onNext}
                            className="inline-flex items-center gap-2 label-text font-medium rounded-lg px-3 md:py-2 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            {index + 1 === total ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Complete
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}