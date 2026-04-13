import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Milestone,
  CalendarDays,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import Loader from "@/components/Loader";
import RouterBack from "../RouterBack";
import { useCustomBuilderStore, Phase } from "@/store/useCustomBuilderStore ";

const fmt = (n: number | null | undefined) =>
  n != null ? `₹ ${Number(n).toLocaleString("en-IN")}` : "—";

const ProgressBar = ({
  value,
  color = "bg-[#3586FF]",
}: {
  value: number;
  color?: string;
}) => (
  <div className="w-full h-2 rounded-full bg-gray-200/70 overflow-hidden">
    <div
      className={`h-full rounded-full transition-[width] duration-500 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const StatPill = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
    {icon}
    <span className="text-gray-500 text-[10px] md:text-[12px] font-medium">{label}</span>
    <span className="font-bold text-gray-900 text-[11px] md:text-[13px]">{value}</span>
  </div>
);

export default function PhasesView() {
  const router = useRouter();
  const customBuilderId = router?.query?.id as string;

  const { data: customBuilder, fetchData, isLoading } = useCustomBuilderStore();

  useEffect(() => {
    if (customBuilderId) {
      fetchData(customBuilderId);
    }
  }, [customBuilderId]); // eslint-disable-line

  const phases: Phase[] = useMemo(
    () =>
      [...(customBuilder?.phases || [])].sort(
        (a, b) => a.order - b.order
      ),
    [customBuilder?.phases]
  );

  const totals = useMemo(() => {
    return phases.reduce(
      (acc, p) => ({
        plannedDays: acc.plannedDays + (p.plannedDays || 0),
        actualDays: acc.actualDays + (p.actualDays || 0),
        plannedCost: acc.plannedCost + Number(p.plannedCost || 0),
        actualCost: acc.actualCost + Number(p.actualCost || 0),
      }),
      { plannedDays: 0, actualDays: 0, plannedCost: 0, actualCost: 0 }
    );
  }, [phases]);

  const overallProgress =
    totals.plannedDays > 0
      ? Math.round((totals.actualDays / totals.plannedDays) * 100)
      : 0;

  if (isLoading && !customBuilder) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full md:p-5 p-3">
      <div className="px-2 py-4">
        <RouterBack />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Milestone className="text-[#3586FF] md:w-6 w-4 md:h-6 h-4" />
        <h1 className="font-bold md:text-[24px] text-[16px]">
          Project Phases
        </h1>
      </div>

      {/* Overall Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-gray-500 text-[12px] font-medium">Overall Progress</p>
            <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill
              icon={<CalendarDays className="w-3.5 h-3.5 text-[#3586FF]" />}
              label="Planned"
              value={`${totals.plannedDays}d`}
            />
            <StatPill
              icon={<Clock className="w-3.5 h-3.5 text-amber-500" />}
              label="Actual"
              value={`${totals.actualDays}d`}
            />
            <StatPill
              icon={<DollarSign className="w-3.5 h-3.5 text-green-500" />}
              label="Budget"
              value={fmt(totals.plannedCost)}
            />
            <StatPill
              icon={<TrendingUp className="w-3.5 h-3.5 text-purple-500" />}
              label="Spent"
              value={fmt(totals.actualCost)}
            />
          </div>
        </div>
        <ProgressBar value={overallProgress} />
      </div>

      {/* Phases Timeline */}
      {phases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12 text-center">
          <Milestone className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-semibold md:text-lg">
            No phases defined
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Phases will appear here once the project plan is set up.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {phases.map((phase, index) => {
            const daysPct =
              phase.plannedDays > 0
                ? Math.round((phase.actualDays / phase.plannedDays) * 100)
                : 0;
            const isOverDays = phase.actualDays > phase.plannedDays;
            const costPct =
              Number(phase.plannedCost || 0) > 0
                ? Math.round(
                    (Number(phase.actualCost) / Number(phase.plannedCost)) * 100
                  )
                : 0;
            const isOverBudget = Number(phase.actualCost) > Number(phase.plannedCost || 0);
            const isComplete = daysPct >= 100;

            return (
              <div
                key={phase.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Phase header */}
                <div className="flex items-center gap-3 p-4 md:p-5 pb-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-[#3586FF]/10 text-[#3586FF]"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      phase.order
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 md:text-[15px] text-[13px] truncate">
                      {phase.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] md:text-[12px]">
                      Phase {phase.order} of {phases.length}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] md:text-[12px] font-bold ${
                      isComplete
                        ? "text-green-600"
                        : isOverDays
                        ? "text-red-500"
                        : "text-[#3586FF]"
                    }`}
                  >
                    {daysPct}%
                  </span>
                </div>

                <div className="p-4 md:p-5 pt-3 space-y-3">
                  {/* Days progress */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] md:text-[12px] mb-1">
                      <span className="text-gray-500 font-medium flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" /> Days
                      </span>
                      <span className="font-semibold text-gray-700">
                        {phase.actualDays} / {phase.plannedDays}d
                        {isOverDays && (
                          <span className="text-red-500 ml-1 inline-flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            +{phase.actualDays - phase.plannedDays}d over
                          </span>
                        )}
                      </span>
                    </div>
                    <ProgressBar
                      value={daysPct}
                      color={
                        isComplete
                          ? "bg-green-500"
                          : isOverDays
                          ? "bg-red-500"
                          : "bg-[#3586FF]"
                      }
                    />
                  </div>

                  {/* Cost progress */}
                  {Number(phase.plannedCost || 0) > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] md:text-[12px] mb-1">
                        <span className="text-gray-500 font-medium flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> Cost
                        </span>
                        <span className="font-semibold text-gray-700">
                          {fmt(phase.actualCost)} / {fmt(phase.plannedCost)}
                          {isOverBudget && (
                            <span className="text-red-500 ml-1 inline-flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> over budget
                            </span>
                          )}
                        </span>
                      </div>
                      <ProgressBar
                        value={costPct}
                        color={isOverBudget ? "bg-red-500" : "bg-amber-500"}
                      />
                    </div>
                  )}

                  {/* Date range */}
                  {(phase.plannedStart || phase.plannedEnd) && (
                    <div className="flex items-center gap-3 text-[10px] md:text-[12px] text-gray-400">
                      {phase.plannedStart && (
                        <span>Start: {new Date(phase.plannedStart).toLocaleDateString()}</span>
                      )}
                      {phase.plannedEnd && (
                        <span>End: {new Date(phase.plannedEnd).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
