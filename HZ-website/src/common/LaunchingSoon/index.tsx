import React, { useMemo, useState } from "react";
import { Lock, Bell, CheckCircle2, MapPin, Clock3, Sparkles } from "lucide-react";
import CustomInput from "@/common/FormElements/CustomInput";
import Link from "next/link";

interface ServiceItem {
    id: string;
    title: string;
    emoji?: string;
    img?: string;
    phase: 1 | 2 | 3;
    status: "live" | "coming";
    blurb?: string;
}

interface PhasedServicesGridProps {
    city?: string; // e.g., "Hyderabad"
    currentPhase?: 1 | 2 | 3; // helps the headline
    services?: ServiceItem[];
    onJoinWaitlist?: (payload: { serviceId: string; email?: string; phone?: string; city?: string }) => Promise<void> | void;
}

const demoServices: ServiceItem[] = [
    { id: "residential", title: " Construction", emoji: "🏗️", phase: 1, status: "live", blurb: "End‑to‑end homes with transparent milestones." },
    { id: "business", title: "Construction for Business", emoji: "🏢", phase: 1, status: "live", blurb: "From retail fit‑outs to office shells—on time, on budget." },
    { id: "interiors", title: "Interiors", emoji: "🛋️", phase: 1, status: "live", blurb: "Modular kitchens, wardrobes & full home makeovers." },
    { id: "structural", title: "Civil Engg. Structural Design", emoji: "🧱", phase: 1, status: "live", blurb: "RCC & steel design, drawings, and peer reviews." },
    { id: "solar", title: "Solar", emoji: "🔆", phase: 1, status: "live", blurb: "On‑grid/off‑grid systems with ROI tracking." },
    { id: "plumbing", title: "Plumbing", emoji: "🛠️", phase: 1, status: "live", blurb: "Repairs, fitments, bathrooms & pipelines." },

    { id: "electronics", title: "Electronics", emoji: "📺", phase: 3, status: "coming", blurb: "Appliances, smart home & after‑sales support." },
    { id: "furniture", title: "Furniture", emoji: "🪑", phase: 3, status: "coming", blurb: "Custom & ready‑to‑ship furniture for every room." },
    { id: "homedecor", title: "Home Decor", emoji: "🪴", phase: 2, status: "coming", blurb: "Lights, accents & wall art to finish your space." },
    { id: "vastu", title: "Vastu Consultation", emoji: "🧭", phase: 2, status: "coming", blurb: "Space planning rooted in traditional science." },
    { id: "loan", title: "Home Loan", emoji: "🏠", phase: 2, status: "coming", blurb: "Multiple banks, best rates, assisted paperwork." },
];

// --------------------------- Components ---------------------------
function Ribbon({ children }: { children: React.ReactNode }) {
    return (
        <div className="absolute -right-2 top-3 z-20 rotate-45 select-none">
            <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-white text-[10px] md:text-xs font-semibold tracking-wide px-4 py-1 shadow-lg rounded-sm">
                {children}
            </div>
        </div>
    );
}

function GradientRing() {
    return (
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute -inset-[1.5px] rounded-2xl bg-[conic-gradient(var(--tw-gradient-stops))] from-indigo-500 via-blue-500 to-fuchsia-500 opacity-20 blur-[2px]" />
        </div>
    );
}

function CardShell({ children, locked }: { children: React.ReactNode; locked?: boolean }) {
    return (
        <div
            className={`relative group rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm hover:shadow-xl transition-shadow overflow-hidden ${locked ? "opacity-90" : ""
                }`}
        >
            <GradientRing />
            <div className="relative p-4 md:p-5">
                {children}
            </div>
            {locked && (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 to-slate-900/30" />
            )}
        </div>
    );
}

function NotifyModal({
    open,
    onClose,
    service,
    defaultCity,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    service?: ServiceItem | null;
    defaultCity?: string;
    onSubmit: (payload: { serviceId: string; email?: string; phone?: string; city?: string }) => Promise<void> | void;
}) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState(defaultCity || "");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!service) return;
        setLoading(true);
        try {
            await onSubmit({ serviceId: service.id, email, phone, city });
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${open ? "fixed" : "hidden"} inset-0 z-[60] grid place-items-center`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold">Notify me when {service?.title} launches</h3>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                    Be the first to know. We’ll only message you about this service.
                </p>

                {sent ? (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                        You’re on the list! 🎉 We’ll ping you as soon as we go live.
                    </div>
                ) : (
                    <div className="mt-4 grid gap-3">
                        <CustomInput
                            type="email"
                            label="Email"
                            labelCls="text-xs font-medium text-slate-700"
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            rootCls="gap-1"
                        />
                        <CustomInput
                            type="text"
                            label="Phone (optional)"
                            labelCls="text-xs font-medium text-slate-700"
                            placeholder="98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            rootCls="gap-1"
                        />
                        <CustomInput
                            type="text"
                            label="City"
                            labelCls="text-xs font-medium text-slate-700"
                            placeholder="Hyderabad"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            leftIcon={<MapPin className="h-4 w-4 text-slate-400" />}
                            rootCls="gap-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="mt-1 inline-flex  items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60"
                        >
                            {loading ? "Adding…" : "Notify me"}
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

function ServiceCard({ item, city, onNotify }: { item: ServiceItem; city?: string; onNotify: (s: ServiceItem) => void }) {
    const locked = item.status === "coming";

    return (
        <CardShell locked={locked}>
            {locked && <Ribbon>Launching Soon  </Ribbon>}

            <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-50 to-fuchsia-50 text-2xl">
                    <span aria-hidden>{item.emoji ?? "✨"}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="truncate text-base font-semibold text-slate-900">{item.title}</h4>
                        {item.status === "live" ? (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">LIVE</span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                <Clock3 className="h-3 w-3" /> In queue
                            </span>
                        )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.blurb}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                {item.status === "live" ? (
                    <Link
                        href={`#/services/${item.id}`}
                        className="inline-flex  items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Explore
                    </Link>
                ) : (
                    <button
                        onClick={() => onNotify(item)}
                        className="inline-flex  items-center gap-2 rounded-xl border  bg-white px-4 text-sm font-semibold text-slate-800 hover:border-slate-400"
                    >
                        <Bell className="h-4 w-4" /> Notify me
                    </button>
                )}

                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {city ?? "All cities"}
                </div>
            </div>

            {locked && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/80" />
            )}
        </CardShell>
    );
}

export default function PhasedServicesGrid({
    city = "Hyderabad",
    currentPhase = 1,
    services = demoServices,
    onJoinWaitlist,
}: PhasedServicesGridProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<ServiceItem | null>(null);

    const live = useMemo(() => services.filter((s) => s.status === "live"), [services]);
    const coming = useMemo(() => services.filter((s) => s.status === "coming"), [services]);

    const openNotify = (s: ServiceItem) => {
        setSelected(s);
        setModalOpen(true);
    };

    const closeNotify = () => {
        setModalOpen(false);
        setTimeout(() => setSelected(null), 200);
    };

    const handleSubmit = async (payload: { serviceId: string; email?: string; phone?: string; city?: string }) => {
        onJoinWaitlist?.(payload);
    };

    return (
        <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <header className="mb-6 md:mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Phase {currentPhase} live now
                </div>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                    Everything you need, one roof.
                </h2>
                <p className="mt-1 text-slate-600 max-w-2xl">
                    Explore the services live today. The rest are lined up and opening soon—join the waitlist to get early access in {city}.
                </p>
            </header>

            {/* Live Services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {live.map((s) => (
                    <ServiceCard key={s.id} item={s} city={city} onNotify={openNotify} />
                ))}
            </div>

            {/* Coming Soon Divider */}
            <div className="relative my-8 md:my-10">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-slate-500">
                    Launching Soon
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-100">
                {coming.map((s) => (
                    <div key={s.id} className="relative">
                        <ServiceCard item={s} city={city} onNotify={openNotify} />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-slate-200/70" />
                        <div className="absolute right-4 top-4 z-30 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 shadow-sm">
                            <Lock className="h-3.5 w-3.5" /> Locked until Phase {s.phase}
                        </div>
                    </div>
                ))}
            </div>

            <NotifyModal
                open={modalOpen}
                onClose={closeNotify}
                service={selected}
                defaultCity={city}
                onSubmit={handleSubmit}
            />
        </section>
    );
}
