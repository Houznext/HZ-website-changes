import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import { X } from "lucide-react";
import apiClient from "@/utils/apiClient";
import { useSession } from "next-auth/react";
interface PhaseProgress {
  id: number;
  name: string;
  plannedDays: number;
  actualDays?: number;
}

interface ProgressItem {
  id: number;
  currentDay: number;
  estimatedDays: number;
  firstName: string;
  email: string;
  total_area: { size: number; unit: string };
  propertyName: string;
  phases?: PhaseProgress[];
}

const ConstructionProgress = () => {
  const { status, data } = useSession();
  const userId = data?.user && (data.user as any)?.id;

  const [progressData, setProgressData] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    let cancelled = false;
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `${apiClient.URLS.customBuilder}/user/minimal/${userId}`, {}, true
        );
        if (!cancelled) setProgressData(res?.body ?? []);
      } catch (err) {
        console.error("ConstructionProgress fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProgressData();
    return () => {
      cancelled = true;
    };
  }, [status, userId]);


  if (!visible || loading || progressData.length === 0) return null;

  return (
    <div className="fixed inset-x-0 md:bottom-0 bottom-[72px] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t shadow-[0_-8px_24px_-12px_rgba(2,6,23,0.15)] z-[40]">
      <div className="relative max-w-[1600px] w-full mx-auto px-4 pb-2 pt-2">
        <Button
          onClick={() => setVisible(false)}
          className="absolute -top-2 right-2 p-[2px] hover:bg-gray-100 bg-gray-200 rounded"
          aria-label="Close"
        >
          <X size={18} className="text-gray-600" />
        </Button>

        {progressData.map((item, idx) => {
          const totalEstimatedDays =
            item.phases?.reduce(
              (sum, phase) => sum + (phase.plannedDays || 0),
              0
            ) || progressData[0].estimatedDays;

          const progress = Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((item.currentDay - 1) / (totalEstimatedDays || 1)) * 100
              )
            )
          );

          return (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between gap-2 ">
                <div className="flex flex-row md:flex-row md:items-center gap-1">
                  <h2 className="text-[10px] md:text-[14px] font-medium text-[#3586FF]">
                    Day {item.currentDay - 1}/{totalEstimatedDays}
                  </h2>
                  <p className="md:text-[12px] text-[10px] font-medium text-gray-700">
                    Hey{" "}
                    <span className="text-[#3586FF] font-bold">
                      {item.firstName?.charAt(0).toUpperCase() +
                        item.firstName?.slice(1).toLowerCase()}
                    </span>
                    , progress on{" "}
                    <Button
                      onClick={() => router.push("/user/custom-builder")}
                      className="text-[#3586FF] font-bold underline-offset-2 hover:underline"
                    >
                      {item.propertyName}
                    </Button>
                  </p>
                  <span className="md:text-[12px] text-[10px] text-nowrap text-yellow-500 font-medium">
                    {progress}% completed
                  </span>
                </div>

                <Button
                  onClick={() => router.push("/user/custom-builder")}
                  className="bg-[#3586FF] hover:bg-blue-600 text-nowrap text-white font-medium md:text-[14px] text-[12px] px-4 py-1 rounded-lg shadow transition-all"
                >
                  Track Progress
                </Button>
              </div>

              <div className="relative w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#3586FF] rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConstructionProgress;
