import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Button,
  TextField,
} from "@mui/material";

type QcItem = {
  id: string;
  checkpointName: string;
  status: "pending" | "pass" | "fail" | "skipped";
  failureNote?: string | null;
  photoUrl?: string | null;
};

const ScopeQcPage = () => {
  const router = useRouter();
  const { projectId, scopeId } = router.query as {
    projectId?: string;
    scopeId?: string;
  };
  const { data: session } = useSession();
  const [items, setItems] = useState<QcItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkedBy, setCheckedBy] = useState("");
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!scopeId) return;
    const fetchQc = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
        const token =
          (session as any)?.token ||
          (session as any)?.user?.token ||
          (session as any)?.accessToken;
        const res = await fetch(
          `${baseUrl}buildlive/scopes/${scopeId}/qc`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load QC checklist");
        const body = (await res.json()) as QcItem[];
        setItems(body);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQc();
  }, [scopeId, session]);

  const markDirty = (id: string) => {
    setDirtyIds((prev) => new Set([...Array.from(prev), id]));
  };

  const passCount = useMemo(
    () => items.filter((i) => i.status === "pass").length,
    [items]
  );

  const total = items.length || 1;
  const passRate = (passCount / total) * 100;

  const updateStatus = (id: string, status: QcItem["status"]) => {
    setItems((rows) =>
      rows.map((r) => (r.id === id ? { ...r, status } : r))
    );
    markDirty(id);
  };

  const updateFailureNote = (id: string, note: string) => {
    setItems((rows) =>
      rows.map((r) =>
        r.id === id ? { ...r, failureNote: note } : r
      )
    );
    markDirty(id);
  };

  const handleSave = async () => {
    if (!checkedBy.trim()) {
      alert('Please enter "Checked by" name.');
      return;
    }
    try {
      setSaving(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
      const token =
        (session as any)?.token ||
        (session as any)?.user?.token ||
        (session as any)?.accessToken;

      const dirtyItems = items.filter((i) => dirtyIds.has(i.id));
      for (const item of dirtyItems) {
        const body = {
          status: item.status,
          checkedBy,
          failureNote: item.failureNote || undefined,
          photoUrl: item.photoUrl || undefined,
        };
        const res = await fetch(
          `${baseUrl}buildlive/qc/${item.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) throw new Error("Failed to update QC item");
      }
      alert("QC checklist saved.");
      setDirtyIds(new Set());
    } catch (e) {
      console.error(e);
      alert("Failed to save QC changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        color: "#f1f5f9",
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: "900px", mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          QC Checklist
        </Typography>
        <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
          Project: {projectId} — Scope: {scopeId}
        </Typography>

        <Paper
          sx={{
            bgcolor: "#1e293b",
            p: 3,
            borderRadius: 3,
            boxShadow: "0 15px 40px rgba(15,23,42,0.7)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: "#9ca3af", mb: 1 }}
            >
              {passCount} of {total} checks passed
            </Typography>
            <LinearProgress
              variant="determinate"
              value={passRate}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "#020617",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: "#10b981",
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Checked by"
              value={checkedBy}
              onChange={(e) => setCheckedBy(e.target.value)}
              sx={{
                "& .MuiInputBase-root": { color: "#e5e7eb" },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #334155",
                  p: 2,
                  bgcolor: "#020617",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#e5e7eb" }}
                >
                  {item.checkpointName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: item.status === "fail" ? 1 : 0,
                  }}
                >
                  <Button
                    size="small"
                    variant={item.status === "pass" ? "contained" : "outlined"}
                    onClick={() => updateStatus(item.id, "pass")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor:
                        item.status === "pass" ? "#22c55e" : "transparent",
                      borderColor:
                        item.status === "pass"
                          ? "#22c55e"
                          : "#4b5563",
                      "&:hover": {
                        bgcolor:
                          item.status === "pass"
                            ? "#16a34a"
                            : "rgba(34,197,94,0.12)",
                      },
                    }}
                  >
                    Pass
                  </Button>
                  <Button
                    size="small"
                    variant={item.status === "fail" ? "contained" : "outlined"}
                    onClick={() => updateStatus(item.id, "fail")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor:
                        item.status === "fail" ? "#ef4444" : "transparent",
                      borderColor:
                        item.status === "fail"
                          ? "#ef4444"
                          : "#4b5563",
                      "&:hover": {
                        bgcolor:
                          item.status === "fail"
                            ? "#b91c1c"
                            : "rgba(239,68,68,0.12)",
                      },
                    }}
                  >
                    Fail
                  </Button>
                  <Button
                    size="small"
                    variant={
                      item.status === "skipped" ? "contained" : "outlined"
                    }
                    onClick={() => updateStatus(item.id, "skipped")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor:
                        item.status === "skipped"
                          ? "#6b7280"
                          : "transparent",
                      borderColor:
                        item.status === "skipped"
                          ? "#6b7280"
                          : "#4b5563",
                      "&:hover": {
                        bgcolor:
                          item.status === "skipped"
                            ? "#4b5563"
                            : "rgba(107,114,128,0.2)",
                      },
                    }}
                  >
                    Skip
                  </Button>
                </Box>

                {item.status === "fail" && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Failure note"
                    value={item.failureNote || ""}
                    onChange={(e) =>
                      updateFailureNote(item.id, e.target.value)
                    }
                    sx={{
                      mt: 1,
                      "& .MuiInputBase-root": { color: "#e5e7eb" },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Button
              onClick={() => router.back()}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                borderColor: "#4b5563",
                color: "#e5e7eb",
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default withAdminLayout(ScopeQcPage);

