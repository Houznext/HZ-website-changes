import React, { useMemo } from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  Phone,
  UserPlus,
  CalendarDays,
  Building2,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Ban,
  Voicemail,
  PhoneOff,
} from "lucide-react";

type Step = { status: string; at?: string; changedBy?: string };
type Props = {
  steps: Step[];
  currentStatus: string;
  showTimes?: boolean;
  className?: string;
};

const normalize = (s: string) => s?.toLowerCase().trim() || "";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  "follow-up": "Follow-up",
  interested: "Interested",
  "site visit": "Site Visit",
  "visit scheduled": "Visit Scheduled",
  "visit done": "Visit Done",
  closed: "Closed",
  rejected: "Rejected",
  "not interested": "Not Interested",
  "not lifted": "Not Lifted",
  "switched off": "Switched Off",
  "wrong number": "Wrong Number",
  dnd: "DND",
  "not answered": "Not Answered",
  "site visited": "Site Visited",
  completed: "Completed",
  "not completed": "Not Completed",
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  new: <UserPlus className="md:h-4 h-2 md:w-4 w-2" />,
  contacted: <Phone className="md:h-4 h-2 md:w-4 w-2" />,
  "follow-up": <Phone className="md:h-4 h-2 md:w-4 w-2" />,
  interested: <ThumbsUp className="md:h-4 h-2 md:w-4 w-2" />,
  "site visit": <Building2 className="md:h-4 h-2 md:w-4 w-2" />,
  "visit scheduled": <CalendarDays className="md:h-4 h-2 md:w-4 w-2" />,
  "visit done": <Building2 className="md:h-4 h-2 md:w-4 w-2" />,
  closed: <CheckCircle2 className="md:h-4 h-2 md:w-4 w-2" />,
  rejected: <ThumbsDown className="md:h-4 h-2 md:w-4 w-2" />,
  "not interested": <XCircle className="md:h-4 h-2 md:w-4 w-2" />,
  "not lifted": <Voicemail className="md:h-4 h-2 md:w-4 w-2" />,
  "switched off": <PhoneOff className="md:h-4 h-2 md:w-4 w-2" />,
  "wrong number": <Ban className="md:h-4 h-2 md:w-4 w-2" />,
  dnd: <Ban className="md:h-4 h-2 md:w-4 w-2" />,
  "not answered": <PhoneOff className="md:h-4 h-2 md:w-4 w-2" />,
  "site visited": <Building2 className="md:h-4 h-2 md:w-4 w-2" />,
  completed: <CheckCircle2 className="md:h-4 h-2 md:w-4 w-2" />,
  "not completed": <XCircle className="md:h-4 h-2 md:w-4 w-2" />,
};

function prettyLabel(status: string) {
  return STATUS_LABELS[normalize(status)] ?? status;
}
function statusIcon(status: string) {
  return STATUS_ICONS[normalize(status)] ?? <Clock className="h-4 w-4" />;
}

export default function LeadTimelineStepper({
  steps,
  currentStatus,
  showTimes = true,
  className = "",
}: Props) {
  const displaySteps: Step[] = useMemo(() => {
    const list = Array.isArray(steps) ? [...steps] : [];
    const last = list[list.length - 1];
    if (!last || normalize(last.status) !== normalize(currentStatus)) {
      list.push({ status: currentStatus });
    }
    return list;
  }, [steps, currentStatus]);

  const lastIndex = displaySteps.length - 1;

  return (
    <div
      className={`w-full md:max-w-[72%] max-w-full overflow-x-auto mx-auto ${className}`}
    >
      <div className="relative bg-white md:rounded-[10px] rounded-[4px] md:p-3 p-1 shadow-custom">
        <div className="absolute left-6 right-6 top-3 md:top-6 h-[2px] bg-gray-300 rounded" />

        <ol className="relative flex justify-between" role="list">
          {displaySteps.map((step, idx) => {
            const isDone = idx < lastIndex;
            const isActive = idx === lastIndex;

            return (
              <li key={idx} className="relative flex flex-col items-center">
                <div
                  className={[
                    "relative z-10 flex items-center justify-center md:h-8 h-5 md:w-8 w-5 rounded-full border-2 transition-all duration-300 shadow-sm",
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white scale-110"
                      : isDone
                        ? "bg-green-50 border-green-500 text-green-600"
                        : "bg-white border-gray-300 text-gray-400",
                  ].join(" ")}
                >
                  {statusIcon(step.status)}
                </div>

                <div className="flex flex-col items-center md:mt-2 mt-1">
                  <span
                    className={`text-[8px] md:text-[12px] font-medium ${isActive
                        ? "text-[#3586FF] "
                        : isDone
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                  >
                    {prettyLabel(step.status)}
                  </span>
                  {showTimes && step.at && (
                    <span className="md:text-[10px] text-[8px] text-gray-600 font-medium">
                      {new Date(step.at).toLocaleDateString("en-In", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {step.changedBy && (
                    <span className="md:text-[9px] text-[7px] text-gray-500 mt-0.5">
                      by {step.changedBy}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
