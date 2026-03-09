import { filtersdata } from "@/components/CustomBuilder/ServicesSelectedView/helper";

type FilterType = (typeof filtersdata)[number]["id"];
export function getDateRange(
  filter: FilterType,
  customRange?: { startDate: string; endDate: string }
) {
  if (filter === "all") {
    return {
      startDate: "",
      endDate: "",
    };
  }
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.setHours(23, 59, 59, 999));
  switch (filter) {
    case "today":
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      startDate = todayStart;
      endDate = todayEnd;
      break;
    case "yesterday":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last7Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "last14Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      if (!customRange)
        throw new Error("Custom range requires start and end dates");
      startDate = new Date(customRange.startDate);
      endDate = new Date(customRange.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid custom date range");
      }
      break;
    default:
      throw new Error("Invalid filter type");
  }
  return {
    startDate: toLocalDateString(startDate),
    endDate: toLocalDateString(endDate),
  };
}
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
