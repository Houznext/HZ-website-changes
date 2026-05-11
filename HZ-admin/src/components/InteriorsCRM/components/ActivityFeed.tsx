import { formatDateTime } from "../../NewCrmView/types";

export interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  at: string;
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <p className="text-[12.5px] text-slate-500 py-6 text-center">No recent activity</p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex gap-3 text-[12.5px] text-slate-700 border-b border-[#f1f5f9] pb-3 last:border-0"
        >
          <span className="text-lg flex-shrink-0" aria-hidden>
            {it.icon}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-[#1e293b]">{it.text}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(it.at)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
