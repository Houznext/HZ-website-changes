export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Follow-up",
  "Interested",
  "Site Visit",
  "Visit Scheduled",
  "Visit Done",
  "Won",
  "completed",
  "Not Interested",
  "Rejected",
  "Lost",
  "Closed",
  "Not Lifted",
  "Not Answered",
  "Switched Off",
  "Wrong Number",
  "DND",
  "Site visited",
  "Not completed",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const PIPELINE_STAGES = [
  { id: "new", label: "New", color: "#2563eb", bg: "#eff6ff" },
  { id: "contacted", label: "Contacted", color: "#6d28d9", bg: "#ede9fe" },
  { id: "qualified", label: "Qualified", color: "#0891b2", bg: "#e0f2fe" },
  { id: "proposal", label: "Proposal Sent", color: "#c2410c", bg: "#fff7ed" },
  { id: "negotiation", label: "Negotiation", color: "#ca8a04", bg: "#fffbeb" },
  { id: "sitevisit", label: "Site Visit", color: "#a21caf", bg: "#fdf4ff" },
  { id: "won", label: "Won", color: "#16a34a", bg: "#f0fdf4" },
] as const;

export const STAGE_MAP: Record<string, string> = {
  New: "new",
  Contacted: "contacted",
  "Follow-up": "contacted",
  Interested: "contacted",
  Qualified: "qualified",
  "Proposal Sent": "proposal",
  Negotiation: "negotiation",
  "Site Visit": "sitevisit",
  "Visit Scheduled": "sitevisit",
  "Visit Done": "sitevisit",
  "Site visited": "sitevisit",
  Won: "won",
  completed: "won",
};

export const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  New: { bg: "#eff6ff", text: "#2563eb" },
  Contacted: { bg: "#ede9fe", text: "#6d28d9" },
  Qualified: { bg: "#e0f2fe", text: "#0369a1" },
  "Proposal Sent": { bg: "#fff7ed", text: "#c2410c" },
  Negotiation: { bg: "#fffbeb", text: "#92400e" },
  "Follow-up": { bg: "#e0f2fe", text: "#0369a1" },
  Interested: { bg: "#f0fdf4", text: "#15803d" },
  "Site Visit": { bg: "#fdf4ff", text: "#86198f" },
  "Visit Scheduled": { bg: "#fdf4ff", text: "#86198f" },
  "Visit Done": { bg: "#fdf4ff", text: "#86198f" },
  Won: { bg: "#dcfce7", text: "#15803d" },
  completed: { bg: "#dcfce7", text: "#15803d" },
  "Not Interested": { bg: "#f1f5f9", text: "#475569" },
  Rejected: { bg: "#fee2e2", text: "#dc2626" },
  Lost: { bg: "#fee2e2", text: "#dc2626" },
  Closed: { bg: "#f1f5f9", text: "#475569" },
  "Not Lifted": { bg: "#f1f5f9", text: "#64748b" },
  "Not Answered": { bg: "#f1f5f9", text: "#64748b" },
  "Switched Off": { bg: "#f1f5f9", text: "#64748b" },
  "Wrong Number": { bg: "#fee2e2", text: "#dc2626" },
  DND: { bg: "#fee2e2", text: "#dc2626" },
};

export const SERVICE_CATEGORIES = ["Interiors"] as const;

export const PROPERTY_TYPES = [
  "Flat",
  "Villa",
  "Independent House",
  "Independent Floor",
] as const;

export const WHEN_TO_START_OPTIONS = [
  "Immediately",
  "Within 1 month",
  "1-3 months",
  "3+ months",
] as const;

export const PLATFORMS = [
  "Magic Bricks",
  "99 Acres",
  "Housing.com",
  "Sulekha",
  "Walk-in",
  "Owner Reference",
  "Hihiker",
  "BNI",
  "Facebook",
  "Instagram",
  "Square Yards",
  "No Broker",
  "Builder Lead",
  "Common Floor",
  "Real Estate India",
] as const;

export const CRM_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "leads", label: "All Leads" },
  { id: "pipeline", label: "Pipeline" },
  { id: "followups", label: "Follow-ups" },
  { id: "analytics", label: "Analytics" },
  { id: "assign", label: "Team & Assign" },
  { id: "settings", label: "CRM Settings" },
] as const;

export type CRMTabId = (typeof CRM_TABS)[number]["id"];
