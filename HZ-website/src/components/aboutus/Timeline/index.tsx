import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type Milestone = {
    year: string;
    text: string;
    cta?: string;
    href?: string;
};

const TIMELINE: Milestone[] = [
    { year: "2022", text: "Founded with a simple idea: make home decisions confident and fast." },
    { year: "2023", text: "Expanded to multi-city ops, added curated builder & project network." },
    { year: "2024", text: "Launched interiors + custom builder flows with transparent estimates." },
    { year: "2025", text: "Unified listings, legal desk, and e-commerce pilots under OneCasa.", cta: "See what’s new", href: "/" },
];

export default function OurJourney() {
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const [seen, setSeen] = useState<Set<number>>(new Set());
    const progress = (seen.size / TIMELINE.length) * 100;

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        const idx = Number((e.target as HTMLElement).dataset.index || -1);
                        setSeen((prev) => {
                            const next = new Set(prev);
                            if (idx >= 0) next.add(idx);
                            return next;
                        });
                        e.target.classList.add("reveal-in");
                        e.target.classList.add("dot-pulse");
                        io.unobserve(e.target);
                    }
                });
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
        );

        cardsRef.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <section className="py-12 md:py-16 bg-[#F7FAFF] dark:bg-[#0b1220]">
            <div className="max-w-6xl mx-auto px-5">
                <div className="text-center mb-10">
                    <p className="font-bold text-2xl md:text-[28px] text-[#0b1220] dark:text-white">
                        Our Journey
                    </p>
                    <p className="mt-2 text-sm md:text-base text-[#5E6470] dark:text-[#B9C1D0] font-medium">
                        Milestones that brought OneCasa to today.
                    </p>
                </div>

                {/* Desktop: horizontal timeline */}
                <div className="hidden md:block relative">
                    {/* Track */}
                    <div className="absolute left-0 right-0 top-8 h-[2px] rounded-full bg-[#E5ECF8] dark:bg-white/10" />
                    {/* Progress (scroll-aware) */}
                    <div
                        className="absolute left-0 top-8 h-[2px] rounded-full bg-gradient-to-r from-[#3586FF] to-[#6BA3FF] shadow-[0_0_10px_rgba(53,134,255,0.35)] transition-[width] duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                        aria-hidden
                    />

                    <div role="list" className="grid grid-cols-4 gap-6">
                        {TIMELINE.map((m, i) => (
                            <div key={m.year} className="relative group" role="listitem">
                                <div
                                    className="absolute -top-[7px] left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white dark:bg-[#0b1220] border-2 border-[#3586FF] ring-4 ring-[#EAF2FF] dark:ring-white/10 transition-all duration-300 group-hover:scale-105"
                                />
                                <p className="mt-8 text-center font-bold text-[15px] text-[#0b1220] dark:text-white">
                                    {m.year}
                                </p>
                                <div
                                    ref={(el) => {
                                        if (el) cardsRef.current[i] = el;
                                    }}
                                    data-index={i}
                                    className="mt-3 mx-auto w-[90%] rounded-xl bg-white/90 dark:bg-white/[0.04] backdrop-blur border border-[#EFF3FB] dark:border-white/10
                             shadow-[0_6px_18px_rgba(9,36,75,0.06)] px-4 py-4
                             opacity-0 translate-y-4 transition-all duration-700
                             group-hover:-translate-y-1 group-hover:shadow-[0_10px_28px_rgba(9,36,75,0.10)]"
                                >
                                    <p className="text-[13.5px] leading-5 text-[#3B3F48] dark:text-[#D5DBE7]">
                                        {m.text}
                                    </p>

                                    {m.href && m.cta && (
                                        <Link
                                            href={m.href}
                                            className="inline-flex items-center gap-2 text-[13px] mt-3 font-medium text-[#2B6BE7] hover:underline"
                                        >
                                            {m.cta}
                                            <span aria-hidden>→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:hidden">
                    <ol className="relative border-l border-dashed border-[#E5ECF8] dark:border-white/10">
                        {TIMELINE.map((m, i) => (
                            <li key={m.year} className="mb-8 ml-5">
                                <span className="absolute -left-1.5 mt-1 h-3.5 w-3.5 rounded-full bg-white dark:bg-[#0b1220] border-2 border-[#3586FF] ring-4 ring-[#EAF2FF] dark:ring-white/10" />
                                <p className="font-bold text-base text-[#0b1220] dark:text-white">{m.year}</p>
                                <div
                                    ref={(el) => {
                                        if (el) cardsRef.current[TIMELINE.length + i] = el;
                                    }}
                                    data-index={TIMELINE.length + i}
                                    className="mt-2 rounded-xl bg-white/90 dark:bg-white/[0.04] backdrop-blur border border-[#EFF3FB] dark:border-white/10
                             shadow-[0_6px_18px_rgba(9,36,75,0.06)] px-4 py-4
                             opacity-0 translate-y-3 transition-all duration-700"
                                >
                                    <p className="text-[13.5px] leading-2 text-[#3B3F48] dark:text-[#D5DBE7]">{m.text}</p>
                                    {m.href && m.cta && (
                                        <Link
                                            href={m.href}
                                            className="inline-flex items-center gap-2 text-[13px] mt-3 font-medium text-[#2B6BE7] hover:underline"
                                        >
                                            {m.cta} <span aria-hidden>→</span>
                                        </Link>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <style jsx>{`
        .reveal-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        /* dot pulse on reveal (1.2s, one-shot) */
        .dot-pulse ~ .absolute,
        .dot-pulse:before {
          animation: none;
        }
        @media (prefers-reduced-motion: no-preference) {
          .dot-pulse + .mt-8::before {
            content: "";
            display: none;
          }
        }
        /* Respect reduced motion for progress transitions */
        @media (prefers-reduced-motion: reduce) {
          .transition-[width],
          .transition-all {
            transition: none !important;
          }
        }
      `}</style>
        </section>
    );
}
