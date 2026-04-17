import withAdminLayout from "@/src/common/AdminLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import apiClient from "@/src/utils/apiClient";
import {
  Box,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

type CalculatorLeadRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  emailAddress?: string;
  tellUsMore?: string;
  createdAt?: string;
};

function parseMeta(tellUsMore?: string): Record<string, unknown> {
  if (!tellUsMore) return {};
  try {
    return JSON.parse(tellUsMore) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function timelineLabel(v: unknown): string {
  const s = typeof v === "string" ? v : "";
  switch (s) {
    case "1m":
      return "< 1 month";
    case "3m":
      return "1–3 months";
    case "6m":
      return "3–6 months";
    case "exp":
      return "Exploring";
    default:
      return "—";
  }
}

function formatSubmittedAt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const y = d.getFullYear();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${y} ${h}:${m}`;
}

function CalculatorEmptyIcon() {
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#94a3b8"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}

function CalculatorLeadsPage() {
  const { hasPermission, isLoading, initialized } = usePermissionStore(
    (state) => state
  );
  const [rows, setRows] = useState<CalculatorLeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CalculatorLeadRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    let rowCount = 0;
    try {
      const res = await apiClient.get(
        apiClient.URLS.calculator_leads,
        { page: p, limit },
        true
      );
      if (res.status === 200 && res.body) {
        const b = res.body as {
          data?: CalculatorLeadRow[];
          total?: number;
          totalPages?: number;
        };
        const data = Array.isArray(b.data) ? b.data : [];
        rowCount = data.length;
        setRows(data);
        setTotal(typeof b.total === "number" ? b.total : 0);
        setTotalPages(
          typeof b.totalPages === "number" && b.totalPages > 0
            ? b.totalPages
            : 1
        );
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error("Failed to load calculator leads.");
      setRows([]);
    } finally {
      setLoading(false);
    }
    return { rowCount };
  }, [limit]);

  useEffect(() => {
    void fetchPage(page);
  }, [page, fetchPage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
      const phone = (r.contactNumber || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [rows, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const thisMonth = filtered.filter((r) => {
      if (!r.createdAt) return false;
      const d = new Date(r.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
    const withEmail = filtered.filter(
      (r) => (r.emailAddress || "").trim().length > 0
    ).length;
    const soon = filtered.filter((r) => {
      const meta = parseMeta(r.tellUsMore);
      return meta.timeline === "1m";
    }).length;
    return { thisMonth, withEmail, soon };
  }, [filtered]);

  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("referral", "view");
  const canDelete = hasPermission("referral", "delete");
  if (!hasAccess) {
    return <AccessDenied resource="Calculator Leads" />;
  }

  const openDetail = (row: CalculatorLeadRow) => {
    setSelected(row);
    setDrawerOpen(true);
  };

  const handleDeleteLead = async (row: CalculatorLeadRow) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete leads.");
      return;
    }
    const label = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
    const ok = window.confirm(
      `Delete this calculator lead${label ? ` for ${label}` : ""}? This cannot be undone.`
    );
    if (!ok) return;
    setDeletingId(row.id);
    try {
      await apiClient.delete(
        `${apiClient.URLS.contact_us}/${row.id}`,
        {},
        true
      );
      toast.success("Lead deleted.");
      if (selected?.id === row.id) {
        setDrawerOpen(false);
        setSelected(null);
      }
      const { rowCount } = await fetchPage(page);
      if (rowCount === 0 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error("Failed to delete lead.");
    } finally {
      setDeletingId(null);
    }
  };

  const selMeta = selected ? parseMeta(selected.tellUsMore) : {};

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#0f2a44", mb: 0.5 }}
          >
            Calculator Leads
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Interior cost calculator submissions
          </Typography>
        </Box>
        <Chip
          label={`Total: ${total}`}
          sx={{
            bgcolor: "#2f80ed",
            color: "#fff",
            fontWeight: 700,
            height: 32,
          }}
        />
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 400 }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "Total leads", value: String(total) },
          { label: "This month", value: String(stats.thisMonth) },
          { label: "With email", value: String(stats.withEmail) },
          { label: "Starting soon", value: String(stats.soon) },
        ].map((c) => (
          <Paper
            key={c.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {c.label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#0f2a44", mt: 0.5 }}
            >
              {c.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {!loading && filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            textAlign: "center",
            border: "1px dashed #e2e8f0",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CalculatorEmptyIcon />
          </Box>
          <Typography variant="h6" sx={{ color: "#0f2a44", fontWeight: 700 }}>
            No calculator leads yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
            Submissions from the website calculator will appear here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow>
                {[
                  "Name",
                  "Phone",
                  "Property",
                  "Rooms",
                  "Style",
                  "Package",
                  "Budget",
                  "Furniture",
                  "Timeline",
                  "Estimate",
                  "Date",
                  "Email",
                  "Actions",
                ].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [0, 1, 2].map((i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 13 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width="80%" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((row) => {
                    const meta = parseMeta(row.tellUsMore);
                    const prop =
                      meta.propertyType != null && meta.sqft != null
                        ? `${String(meta.propertyType)} · ${String(meta.sqft)} sqft`
                        : "—";
                    const rooms =
                      meta.rooms != null && String(meta.rooms).length
                        ? String(meta.rooms)
                        : "—";
                    const style =
                      meta.style != null ? String(meta.style) : "—";
                    const pkg =
                      meta.package != null ? String(meta.package) : "—";
                    const budget =
                      meta.budget != null ? String(meta.budget) : "—";
                    const furn =
                      meta.furniture != null ? String(meta.furniture) : "—";
                    const est =
                      meta.estimateLow != null && meta.estimateHigh != null
                        ? `${String(meta.estimateLow)} – ${String(meta.estimateHigh)}`
                        : "—";
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.firstName || "—"}</TableCell>
                        <TableCell>{row.contactNumber || "—"}</TableCell>
                        <TableCell>{prop}</TableCell>
                        <TableCell>{rooms}</TableCell>
                        <TableCell>{style}</TableCell>
                        <TableCell>{pkg}</TableCell>
                        <TableCell>{budget}</TableCell>
                        <TableCell>{furn}</TableCell>
                        <TableCell>
                          {timelineLabel(meta.timeline)}
                        </TableCell>
                        <TableCell>{est}</TableCell>
                        <TableCell>
                          {formatSubmittedAt(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          {(row.emailAddress || "").trim() || "—"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              aria-label="View lead"
                              onClick={() => openDetail(row)}
                            >
                              <svg
                                width={18}
                                height={18}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Delete lead"
                              disabled={!canDelete || deletingId === row.id}
                              onClick={() => void handleDeleteLead(row)}
                              sx={{
                                color: "#b91c1c",
                                "&:hover": { bgcolor: "rgba(185,28,28,0.08)" },
                              }}
                            >
                              {deletingId === row.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <svg
                                  width={18}
                                  height={18}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" />
                                </svg>
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && filtered.length > 0 && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 0 } }}
      >
        {selected && (
          <Box sx={{ p: 2.5, height: "100%", overflow: "auto" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f2a44" }}>
                {(selected.firstName || "Lead") + " — Calculator Lead"}
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {[
                ["Full name", selected.firstName || "—"],
                ["Phone", selected.contactNumber || "—"],
                ["Email", (selected.emailAddress || "").trim() || "—"],
                ["Property type", String(selMeta.propertyType ?? "—")],
                ["Sqft", String(selMeta.sqft ?? "—")],
                ["Rooms", String(selMeta.rooms ?? "—")],
                ["Style", String(selMeta.style ?? "—")],
                ["Package", String(selMeta.package ?? "—")],
                ["Budget", String(selMeta.budget ?? "—")],
                ["Furniture", String(selMeta.furniture ?? "—")],
                [
                  "Timeline",
                  timelineLabel(selMeta.timeline),
                ],
                [
                  "Estimate",
                  selMeta.estimateLow != null && selMeta.estimateHigh != null
                    ? `${String(selMeta.estimateLow)} – ${String(selMeta.estimateHigh)}`
                    : "—",
                ],
                ["Submitted at", formatSubmittedAt(selected.createdAt)],
              ].map(([k, v]) => (
                <Box key={String(k)}>
                  <Typography variant="caption" color="text.secondary">
                    {k}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {v}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
              Raw JSON
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 1,
                fontSize: 11,
                overflow: "auto",
                maxHeight: 240,
                border: "1px solid #e2e8f0",
              }}
            >
              {JSON.stringify(selMeta, null, 2)}
            </Box>
            {canDelete && selected && (
              <Box sx={{ mt: 2.5 }}>
                <button
                  type="button"
                  disabled={deletingId === selected.id}
                  onClick={() => void handleDeleteLead(selected)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #fecaca",
                    background: deletingId === selected.id ? "#f1f5f9" : "#fef2f2",
                    color: "#b91c1c",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor:
                      deletingId === selected.id ? "not-allowed" : "pointer",
                  }}
                >
                  {deletingId === selected.id ? "Deleting…" : "Delete this lead"}
                </button>
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}

export default withAdminLayout(CalculatorLeadsPage);
