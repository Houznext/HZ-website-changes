"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import type { Lead, FilterState } from "../../NewCrmView/types";
import {
  getOverdueFollowUps,
  getTodayFollowUps,
  getUpcomingFollowUps,
} from "../../NewCrmView/types";

export type TableSegment = "all" | "active" | "followup" | "future" | "won" | "lost";

const WON = new Set(["Won", "completed"]);
const LOST = new Set([
  "Not Interested",
  "Rejected",
  "Lost",
  "Closed",
  "Wrong Number",
  "DND",
]);

function isEmpty(filters?: Record<string, boolean> | null) {
  return (
    !filters ||
    Object.keys(filters).length === 0 ||
    Object.values(filters).every((v) => !v)
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function useCRMLeads() {
  const session = useSession();
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    categoryData: {},
    leaddata: {},
    propertytypedata: {},
    stateData: {},
  });
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [barStatus, setBarStatus] = useState("");
  const [barPlatform, setBarPlatform] = useState("all");
  const [barPropertyType, setBarPropertyType] = useState("all");
  const [barCity, setBarCity] = useState("all");
  const [barAgent, setBarAgent] = useState("all");
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "last7" | "last30" | "custom"
  >("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [tableSegment, setTableSegment] = useState<TableSegment>("all");
  const [branchUsers, setBranchUsers] = useState<{ id: string; name: string }[]>(
    [],
  );

  const membership = session.data?.user?.branchMemberships?.[0];
  const sessionBranchId = membership?.branchId;
  const userId = session.data?.user?.id;

  const canShowBranchFilter =
    !!membership?.branchRoles?.some((r: { roleName?: string }) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";

  const branchIdToFetch =
    session.status === "authenticated" && sessionBranchId && userId
      ? canShowBranchFilter
        ? String(selectedBranch ?? sessionBranchId)
        : String(sessionBranchId)
      : null;

  const fetchLeads = useCallback(async () => {
    if (!userId || !branchIdToFetch) return;
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user`,
        { userId, branchId: branchIdToFetch },
        true,
      );
      if (res.status === 200 && res.body) {
        setAllLeads(Array.isArray(res.body) ? res.body : []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [userId, branchIdToFetch]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!branchIdToFetch) return;
    void apiClient
      .get(
        `${apiClient.URLS.user}/by-branch/${branchIdToFetch}/admin-users`,
        {},
        true,
      )
      .then((res: { body?: unknown }) => {
        const raw = Array.isArray(res.body) ? res.body : [];
        setBranchUsers(
          raw.map((item: { user?: { id?: number; firstName?: string; lastName?: string; email?: string } }) => ({
            id: String(item.user?.id ?? ""),
            name:
              [item.user?.firstName, item.user?.lastName].filter(Boolean).join(" ") ||
              item.user?.email ||
              "User",
          })),
        );
      })
      .catch(() => setBranchUsers([]));
  }, [branchIdToFetch]);

  const barFilteredLeads = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();
    return (allLeads || []).filter((lead) => {
      const matchedSearch =
        (lead?.Fullname || "").toLowerCase().includes(q) ||
        String(lead?.Phonenumber || "").includes(searchQuery || "") ||
        (lead?.city || "").toLowerCase().includes(q);

      const matchesPropertyType =
        isEmpty(selectedFilters?.propertytypedata) ||
        !!selectedFilters.propertytypedata[String(lead?.propertytype || "")];

      const matchesCategory =
        isEmpty(selectedFilters?.categoryData) ||
        !!selectedFilters.categoryData[String(lead?.serviceType || "")];

      const matchesLeadStatus =
        isEmpty(selectedFilters?.leaddata) ||
        !!selectedFilters.leaddata[String(lead?.leadstatus || "")];

      const leadStateKey = String(lead?.state || "").trim().toLowerCase();
      const matchesState =
        isEmpty(selectedFilters?.stateData) || !!selectedFilters.stateData[leadStateKey];

      const matchesBranch =
        !selectedBranch || String(lead?.branchId) === String(selectedBranch);

      if (
        !matchedSearch ||
        !matchesPropertyType ||
        !matchesCategory ||
        !matchesLeadStatus ||
        !matchesState ||
        !matchesBranch
      ) {
        return false;
      }

      if (barStatus && String(lead.leadstatus) !== barStatus) return false;

      if (barPlatform !== "all") {
        const p = String(lead.platform || "").toLowerCase();
        if (p !== barPlatform.toLowerCase()) return false;
      }
      if (barPropertyType !== "all" && String(lead.propertytype) !== barPropertyType)
        return false;
      if (barCity !== "all" && String(lead.city || "").toLowerCase() !== barCity.toLowerCase())
        return false;
      if (barAgent !== "all" && String(lead.assignedTo || "") !== barAgent) return false;

      if (datePreset !== "all" && lead.createdAt) {
        const d = new Date(lead.createdAt);
        if (Number.isNaN(d.getTime())) return false;
        const now = new Date();
        if (datePreset === "today") {
          const a = startOfDay(now);
          const b = endOfDay(now);
          if (d < a || d > b) return false;
        } else if (datePreset === "yesterday") {
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          const a = startOfDay(y);
          const b = endOfDay(y);
          if (d < a || d > b) return false;
        } else if (datePreset === "last7") {
          const start = startOfDay(now);
          start.setDate(start.getDate() - 7);
          if (d < start) return false;
        } else if (datePreset === "last30") {
          const start = startOfDay(now);
          start.setDate(start.getDate() - 30);
          if (d < start) return false;
        } else if (datePreset === "custom" && customDateRange.start && customDateRange.end) {
          const a = startOfDay(new Date(customDateRange.start));
          const b = endOfDay(new Date(customDateRange.end));
          if (d < a || d > b) return false;
        }
      }

      return true;
    });
  }, [
    allLeads,
    searchQuery,
    selectedFilters,
    selectedBranch,
    barStatus,
    barPlatform,
    barPropertyType,
    barCity,
    barAgent,
    datePreset,
    customDateRange,
  ]);

  const filteredLeads = useMemo(() => {
    let rows = barFilteredLeads;
    if (tableSegment === "active") {
      rows = rows.filter((l) => {
        const s = String(l.leadstatus || "");
        if (WON.has(s) || LOST.has(s)) return false;
        return true;
      });
    } else if (tableSegment === "followup") {
      rows = rows.filter((l) => String(l.leadstatus) === "Follow-up");
    } else if (tableSegment === "future") {
      rows = rows.filter((l) => l.isFuturePotential === true);
    } else if (tableSegment === "won") {
      rows = rows.filter((l) => WON.has(String(l.leadstatus)));
    } else if (tableSegment === "lost") {
      rows = rows.filter((l) => LOST.has(String(l.leadstatus)));
    }
    return rows;
  }, [barFilteredLeads, tableSegment]);

  const todayFollowUps = useMemo(() => getTodayFollowUps(allLeads), [allLeads]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(allLeads), [allLeads]);
  const upcomingFollowUps = useMemo(() => getUpcomingFollowUps(allLeads, 7), [allLeads]);

  const updateLead = useCallback(async (leadId: string, patch: Partial<Lead>) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead?.branchId) return;
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}`,
        { ...patch, actorBranchId: lead.branchId },
        true,
      );
      if (res.status === 200 && res.body) {
        const updated = { ...lead, ...(res.body as Partial<Lead>) };
        setAllLeads((prev) => prev.map((l) => (l.id === leadId ? (updated as Lead) : l)));
      } else {
        toast.error("Failed to update lead");
      }
    } catch {
      toast.error("Failed to update lead");
    }
  }, [allLeads]);

  const deleteLead = useCallback(async (leadId: string): Promise<boolean> => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return false;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/${leadId}?branchId=${lead.branchId}`,
        {},
        true,
      );
      if (res.status === 200 || res.status === 204) {
        setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
        toast.success("Lead deleted");
        return true;
      }
      toast.error("Failed to delete lead");
      return false;
    } catch {
      toast.error("Failed to delete lead");
      return false;
    }
  }, [allLeads]);

  const deleteLeadsBulk = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/bulk?ids=${ids.join(",")}`,
        true,
      );
      if (res.status === 200) {
        setAllLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
        toast.success("Leads deleted successfully");
      } else {
        toast.error("Failed to delete leads");
      }
    } catch {
      toast.error("Error deleting leads");
    }
  }, []);

  const createLead = useCallback(async (payload: Record<string, unknown>) => {
    const res = await apiClient.post(apiClient.URLS.crmlead, payload, true);
    if (res.status === 201 || res.status === 200) {
      const body = res.body as Lead;
      setAllLeads((prev) => [body, ...prev]);
      return body;
    }
    throw new Error("Create failed");
  }, []);

  const assignLead = useCallback(
    async (leadId: string, assignUserId: string) => {
      const response = await apiClient.post(
        `${apiClient.URLS.crmlead}/assign/${leadId}/${assignUserId}/3`,
        true,
      );
      if (response.status === 201) {
        toast.success("Lead assigned successfully");
        await fetchLeads();
      }
    },
    [fetchLeads],
  );

  return {
    allLeads,
    setAllLeads,
    barFilteredLeads,
    filteredLeads,
    loading,
    refetch: fetchLeads,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    setSelectedFilters,
    selectedBranch,
    setSelectedBranch,
    barStatus,
    setBarStatus,
    barPlatform,
    setBarPlatform,
    barPropertyType,
    setBarPropertyType,
    barCity,
    setBarCity,
    barAgent,
    setBarAgent,
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    tableSegment,
    setTableSegment,
    todayFollowUps,
    overdueFollowUps,
    upcomingFollowUps,
    branchUsers,
    updateLead,
    deleteLead,
    deleteLeadsBulk,
    createLead,
    assignLead,
    canShowBranchFilter,
    sessionUserId: userId,
    branchIdToFetch,
  };
}
