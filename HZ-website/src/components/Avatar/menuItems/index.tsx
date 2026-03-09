import React, { useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import {
    ChevronDown,
    Home,
    Hammer,
    Ruler,
    SunMedium,
    Paintbrush,
    Sofa,
    Droplets,
    Scale,
    Gavel,
    Truck,
    Gift,
    ShieldCheck,
    Package,
    MoveRight,
} from "lucide-react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import { MdMenu, MdPhone } from "react-icons/md";

type ServiceNavItem = {
    label: string;
    href?: string;
    icon: React.ComponentType<any>;
    description?: string;
    launchingSoon?: boolean;
};

type ServiceGroup = {
    title: string;
    items: ServiceNavItem[];
};

const SERVICE_GROUPS: ServiceGroup[] = [
    {
        title: "Explore OneCasa",
        items: [
            {
                label: "Properties",
                href: "/properties",
                icon: Home,
                description: "Buy, rent, plots & more in one place",
            },
            {
                label: "Refer & Earn",
                href: "/referandearn",
                icon: Gift,
                description: "Invite friends & earn rewards",
            },
            {
                label: "Packages",
                href: "/packages",
                icon: Package,
                description: "Broker & builder plans (coming soon)",
                launchingSoon: true,
            },
            {
                label: "Policies",
                href: "/policies",
                icon: ShieldCheck,
                description: "Terms, privacy & usage policies",
            },
        ],
    },
    {
        title: "In-House Services",
        items: [
            {
                label: "Construction",
                href: "/services/custom-builder",
                icon: Hammer,
                description: "End-to-end home construction & tracking",
            },
            {
                label: "Interiors",
                href: "/interiors",
                icon: Sofa,
                description: "Complete interior design & execution",
            },
            {
                label: "Civil Engineering Structural Design",
                href: "/services/civil-engineering",
                icon: Ruler,
                description: "Structural design, drawings & vetting",
            },
            {
                label: "Solar",
                href: "/solar",
                icon: SunMedium,
                description: "Rooftop solar solutions & ROI planning",
            },
            {
                label: "Painting",
                href: "/painting",
                icon: Paintbrush,
                description: "Interior & exterior painting with warranty",
            },
            {
                label: "Furniture",
                href: "/services/furnitures",
                icon: Sofa,
                description: "Custom furniture for every room",
            },
            {
                label: "Plumbing",
                href: "/services/plumbing",
                icon: Droplets,
                description: "Bathroom, kitchen & pipeline solutions",
                launchingSoon: true,
            },
        ],
    },
    {
        title: "Launching Soon",
        items: [
            {
                label: "Vastu Consultation",
                href: "/services/vaastu-consultation",
                icon: Scale,
                description: "Plan your spaces as per Vastu",
                launchingSoon: true,
            },
            {
                label: "Earth Movers",
                href: "/services/earth-movers",
                icon: Truck,
                description: "Excavation & site development support",
                launchingSoon: true,
            },
            {
                label: "Home Loan",
                href: "/services/loans",
                icon: Home,
                description: "Loan assistance & bank tie-ups",
                launchingSoon: true,
            },
            {
                label: "Legal services",
                href: "/legal-services",
                icon: Gavel,
                description: "Property legal verification & drafting",
                launchingSoon: true,
            },
            {
                label: "Home Decor",
                href: "/services/homedecor",
                icon: Paintbrush,
                description: "Décor, styling & accessories",
                launchingSoon: true,
            },
            {
                label: "Electronics",
                href: "/services/electronics",
                icon: SunMedium,
                description: "Home appliances & installation",
                launchingSoon: true,
            },
            {
                label: "Packers And Movers",
                href: "/services/packers-and-movers",
                icon: Truck,
                description: "Shifting, packing & relocation",
                launchingSoon: true,
            },
        ],
    },
];

const ServicesMenu = () => {
    const router = useRouter();

    const [notifyOpen, setNotifyOpen] = useState(false);
    const [activeService, setActiveService] = useState<ServiceNavItem | null>(
        null
    );
    const [email, setEmail] = useState("");

    const closeModal = () => {
        setNotifyOpen(false);
        setActiveService(null);
        setEmail("");
    };

    const handleItemClick = (item: ServiceNavItem) => {
        if (item.launchingSoon) {
            setActiveService(item);
            setNotifyOpen(true);
            return;
        }
        if (item.href) router.push(item.href);
    };

    return (
        <>
            <Popover className="relative hidden lg:block">
                {({ open }) => (
                    <>
                        <Popover.Button
                            className={clsx(
                                "flex items-center gap-1 shadow-lg  rounded-[6px] border border-white/25 px-3.5 py-1",
                                "text-[13px] font-medium text-white/90",
                                "hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                                open && "bg-white/15"
                            )}
                        >
                            <span className="label-text text-white">Menu</span>
                            <MdMenu className="h-4 w-4 font-medium" />
                        </Popover.Button>

                        <Transition
                            enter="transition ease-out duration-150"
                            enterFrom="opacity-0 translate-y-1 scale-95"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 translate-y-1 scale-95"
                        >
                            <Popover.Panel className="absolute right-0 mt-3 w-[380px] rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm z-[50]">
                                <div className="border-b border-slate-100 px-4 pt-4 pb-3">
                                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#3586FF]/10 via-white to-[#3586FF]/5 px-3 py-2">
                                        <div>
                                            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#3586FF]/10">
                                                <Home className="h-5 w-5 text-[#3586FF]" />
                                            </div>

                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-medium text-nowrap text-slate-900">
                                                Everything you need under one roof
                                            </p>
                                            <p className="text-[11px] text-slate-500 ">
                                                Construction, interiors, legal, finance and more with
                                                OneCasa.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => router.push("/contact-us")}
                                            className="inline-flex items-center gap-1 rounded-[6px] bg-[#3586FF] px-3 py-1 text-[11px] font-medium text-white hover:bg-[#2563eb]"
                                        >
                                            Help
                                            <MdPhone className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto px-4 py-3 custom-scrollbar">
                                    <div className="space-y-4 pb-2">
                                        {SERVICE_GROUPS.map((group) => (
                                            <div key={group.title} className="space-y-2">
                                                <p className="px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                                                    {group.title}
                                                </p>
                                                <div className="space-y-1.5  border-b-[2px] py-1 border-slate-200">
                                                    {group.items.map((item) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <Button
                                                                key={item.label}
                                                                onClick={() => handleItemClick(item)}
                                                                className="flex w-full items-start gap-3 rounded-lg px-2.5 py-[6px] text-left transition-colors hover:bg-slate-200"
                                                            >
                                                                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                                                    <Icon className="h-4 w-4 text-[#3586FF]" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-[13px] font-medium text-slate-900">
                                                                            {item.label}
                                                                        </p>
                                                                        {item.launchingSoon && (
                                                                            <span className="rounded-[6px] bg-[#3586FF]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#3586FF]">
                                                                                Launching Soon
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.description && (
                                                                        <p className="text-[11px] text-slate-500">
                                                                            {item.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>

            {notifyOpen && activeService && (
                <div className="fixed inset-0 z-[60] grid place-items-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
                    <div className="relative w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <h3 className="text-lg font-bold">
                            Get notified when{" "}
                            <span className="text-[#3586FF]">{activeService.label}</span>{" "}
                            launches
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 label-text">
                            We’ll only message you about this service.
                        </p>
                        <div className="mt-4 grid gap-3">
                            <CustomInput
                                label="Email"
                                required
                                type="email"
                                placeholder="you@domain.com"
                                value={email}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                                ) => setEmail(e.target.value)}
                                className="py-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            />
                            <Button
                                className="h-10 rounded-lg bg-[#3586FF] text-white font-bold text-sm"
                                onClick={() => {
                                    setNotifyOpen(false);
                                    setEmail("");
                                }}
                            >
                                Notify me
                            </Button>
                        </div>

                        <Button
                            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-[6px] bg-slate-100 text-slate-600 hover:bg-slate-200"
                            onClick={closeModal}
                            aria-label="Close"
                        >
                            ✕
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServicesMenu;
