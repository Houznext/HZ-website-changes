import Button from "@/src/common/Button";
import { LayoutGrid, Rows } from "lucide-react";

type ViewType = "cards" | "compact";

export function ViewToggleIcons({
  view,
  onChange,
  className = "",
}: {
  view: ViewType;
  onChange: (v: ViewType) => void;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center md:h-8 md:w-8 w-6 h-6 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-blue-200";
  const active = "bg-blue-600 text-white border-blue-600";
  const idle =
    "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        title="Cards view"
        aria-label="Cards view"
        aria-pressed={view === "cards"}
        onClick={() => onChange("cards")}
        className={`${base} ${view === "cards" ? active : idle}`}
      >
        <LayoutGrid className="w-3 h-3" />
        <span className="sr-only">Cards</span>
      </Button>

      <Button
        title="Compact view"
        aria-label="Compact view"
        aria-pressed={view === "compact"}
        onClick={() => onChange("compact")}
        className={`${base} ${view === "compact" ? active : idle}`}
      >
        <Rows className="w-3 h-3" />
        <span className="sr-only">Compact</span>
      </Button>
    </div>
  );
}
