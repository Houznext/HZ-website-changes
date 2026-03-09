import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionSkeleton from "@/common/Skeleton";
import Button from "@/common/Button";
import { useHomepageStore } from "@/store/useHomepageStore";
import CustomInput from "@/common/FormElements/CustomInput";
import { MdAirplaneTicket } from "react-icons/md";

/** ---------- Types ---------- **/
type ItemStatus = "live" | "coming";

export interface IOnePlaceInHouseServicesprops {
  heading: string;
  subheading: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
    href: string;
    status?: ItemStatus;
    phase?: 1 | 2 | 3;
  }>;
}

const ComingSoonRibbon: React.FC<{ phase?: 1 | 2 | 3 }> = ({ phase }) => (
  <div className="absolute top-0 left-0 right-0 z-10 select-none">
    <span className="block w-full bg-gradient-to-r rounded-sm from-[#3586FF] to-blue-600 text-center text-white text-[8px] md:text-[12px] font-bold px-2 md:py-[1px] py-0 shadow">
      Launching Soon{" "}
      <span className="md:inline hidden">
        <MdAirplaneTicket className="inline ml-1" />
      </span>
    </span>
  </div>
);


export default function OnePlaceInHouseServices({
  heading,
  subheading,
  listItems,
}: IOnePlaceInHouseServicesprops) {
  const loading = useHomepageStore((s) => s.loading);

  const [open, setOpen] = useState(false);
  const [activeService, setActiveService] = useState<{ id: number; title: string } | null>(null);
  const [email, setEmail] = useState("");

  const openComingModal = (id: number, title: string) => {
    setActiveService({ id, title });
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  return (
    <>
      <div className="flex flex-col relative items-center  gap-5 mx-auto">
        <div className="flex flex-col items-center gap-y-[16px]">
          <div className="max-w-[653px]">
            <h1 className="text-[#000000] text-center md:text-[24px] text-[20px] font-bold md:leading-[34.2px] leading-[28.5px]">
              {heading}
            </h1>
          </div>
          <div className="max-w-[381px] px-2">
            <h2 className="text-[#7B7C83] text-center font-medium md:text-[20px] text-[16px] md:leading-[28.5px] leading-[22.8px]">
              {subheading}
            </h2>
          </div>
        </div>

        {loading ? (
          <SectionSkeleton type={"inHouseServices"} />
        ) : (
          <div className="min-h-[300px]  flex flex-wrap items-center justify-center md:gap-x-[30px] gap-x-3 gap-y-[30px]">
            {listItems.map((item) => {
              const locked = (item.status ?? "live") === "coming";

              const CardContent = (
                <>
                  {locked && <ComingSoonRibbon phase={item.phase} />}

                  <div className="mx-auto md:h-[45px] md:w-[45px] w-[30px] h-[30px] transition-transform duration-200 group-hover:scale-105 relative flex items-center justify-center mt-[10px]">
                    <Image
                      src={item.image}
                      fill
                      className="object-cover rounded-sm"
                      alt={`Illustration for ${item.title}`}
                      sizes="(max-width: 768px) 50px, (max-width: 1200px) 80px, 100px"
                    />
                  </div>

                  <div className="max-w-[125px] min-h-[32px] xl:mt-[20px] mt-[10px]">
                    <h1 className="text-center text-[#3687FF] group-hover:text-white font-medium md:text-[13px] text-[10px] leading-[18.52px]">
                      {item.title}
                    </h1>
                  </div>
                </>
              );

              return (
                <div
                  key={item.id}
                  className="relative group md:max-w-[160px]  md:h-[136px] md:p-[6px] p-[3px] rounded-[6px] bg-[#FFFFFF] hover:bg-[#c5d5f0] cursor-pointer shadow-custom flex flex-col items-center w-[100px] sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/7 gap-y-[16px]"
                >
                  {locked ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openComingModal(item.id, item.title)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openComingModal(item.id, item.title)}
                      className="flex flex-col items-center w-full h-full"
                      aria-label={`${item.title} coming soon — open waitlist`}
                    >
                      {CardContent}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex flex-col items-center w-full h-full" aria-label={`Open ${item.title}`}>
                      {CardContent}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && activeService && (
        <div className="fixed inset-0 z-[60] grid place-items-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-bold label-text">
              Get notified when <span className="text-[#3586FF]">{activeService.title}</span> launches
            </h3>
            <p className="mt-1 text-sm text-slate-600 sublabel-text">We’ll only message you about this service.</p>
            <div className="mt-4 grid gap-3">
              <CustomInput
                label="Email"
                required
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-[2px] rounded-lg  px-2 text-sm label-text" />
              <Button
                className="h-10 rounded-lg bg-[#3586FF] text-white font-bold text-sm"
                onClick={() => {
                  setOpen(false);
                  setEmail("");
                }}
              >
                Notify me
              </Button>
            </div>

            <Button
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
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
}
