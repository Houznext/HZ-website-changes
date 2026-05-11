import { useMemo } from "react";
import type { Lead } from "../../NewCrmView/types";
import {
  getOverdueFollowUps,
  getTodayFollowUps,
  getUpcomingFollowUps,
} from "../../NewCrmView/types";

export function useFollowUps(allLeads: Lead[]) {
  return useMemo(
    () => ({
      overdue: getOverdueFollowUps(allLeads),
      today: getTodayFollowUps(allLeads),
      upcoming: getUpcomingFollowUps(allLeads, 7),
    }),
    [allLeads],
  );
}
