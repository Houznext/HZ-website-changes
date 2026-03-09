
import { Clock, Rocket, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  serviceName: string;
  subtitle?: string;
}

export default function LaunchedSoon({
  serviceName,
  subtitle = "We’re crafting something great for you.",
}: ComingSoonProps) {
  return (
    <div className="relative min-h-[70vh] grid place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative w-full md:max-w-[40%] max-w-[80%]  md:rounded-[10px] rounded-[4px] border border-slate-200/70 bg-white/90 shadow-custom backdrop-blur-md md:px-10 md:py-10 px-5 py-6">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-200/40 rounded-full blur-3xl" />

        <div className="mx-auto md:mb-4 mb-2 flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 md:px-3 px-2 md:py-1 py-0.5 text-[#3586FF]">
          <Sparkles className="md:h-4 h-2 md:w-4 w-2" />
          <span className="font-medium text-[12px] md:text-[14px]">
            In progress
          </span>
        </div>

        <div className="text-center">
          <div className="mx-auto md:mb-3 mb-1 grid h-8 w-8 place-items-center rounded-full bg-[#3586FF]text-white md:h-14 md:w-14">
            <Rocket className="h-4 w-4 md:h-7 md:w-7" />
          </div>

          <h1 className="font-bold text-[16px] md:text-[20px] leading-snug text-slate-900">
            {serviceName} <span className="text-[#3586FF]">Launching soon</span>
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-[10px] md:text-[14px] font-medium text-slate-600">
            {subtitle} Meanwhile, explore our other{" "}
            <span className="font-medium text-[#3586FF]">services</span>.
          </p>
        </div>

        <div className="mx-auto md:mt-6 mt-3 h-1.5 md:w-48 w-24 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full w-1/2 animate-indeterminate rounded-full bg-gradient-to-r from-[#3586FF] to-yellow-200" />
        </div>

        <div className="mt-4 flex  items-center justify-center gap-2 md:mt-8  md:gap-4">
          <Link
            href="/interiors"
            className="group inline-flex items-center justify-center gap-2 md:rounded-[10px] rounded-[4px] bg-gradient-to-r from-blue-600 to-blue-700 md:px-4 px-2 md:py-2.5 py-1 text-[12px] md:text-[14px] font-medium text-nowrap text-white shadow-custom shadow-blue-600/10 transition hover:shadow-xl"
            aria-label="Explore Interiors"
          >
            Explore Interiors
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1 md:h-5 md:w-5" />
          </Link>

          <Link
            href="/properties"
            className="group inline-flex items-center justify-center gap-2 md:rounded-[10px] rounded-[4px] bg-gradient-to-r from-yellow-200 to-yellow-400 md:px-4 px-2 md:py-2.5 py-1 text-[12px] md:text-[14px] font-medium text-nowrap text-white shadow-lg shadow-emerald-600/10 transition hover:shadow-xl"
            aria-label="Explore Properties"
          >
            Explore Properties
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1 md:h-5 md:w-5" />
          </Link>
        </div>

        <div className="md:mt-6 mt-3 flex items-center justify-center text-[10px] font-regular md:text-[12px] text-slate-500">
          <Clock className="mr-2 h-2 w-2 text-[#3586FF] md:h-4 md:w-4" />
          Stay tuned — exciting things are on the way!
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 md:h-40 h-20 md:w-40 w-20 rounded-full bg-[#3586FF]/10 blur-2xl"
        />
      </div>
    </div>
  );
}
