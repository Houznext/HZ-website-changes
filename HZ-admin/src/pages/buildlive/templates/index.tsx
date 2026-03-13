import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

type QcCheckpointTemplate = {
  id: string;
  checkpointName: string;
  isMandatory: boolean;
  sequence: number;
};

type ScopeTemplate = {
  id: string;
  name: string;
  slug: string;
  iconName?: string | null;
  unit?: string | null;
  defaultWeightage: number;
  isCustom: boolean;
  isActive: boolean;
  checkpointTemplates: QcCheckpointTemplate[];
};

const TemplatesPage = () => {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<ScopeTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("");
  const [unit, setUnit] = useState("");
  const [defaultWeightage, setDefaultWeightage] = useState(10);
  const [checkpoints, setCheckpoints] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  const systemTemplates = templates.filter((t) => !t.isCustom);
  const customTemplates = templates.filter((t) => t.isCustom);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
      const token =
        (session as any)?.token ||
        (session as any)?.user?.token ||
        (session as any)?.accessToken;
      const res = await fetch(`${baseUrl}buildlive/templates`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch templates");
      const body = (await res.json()) as ScopeTemplate[];
      setTemplates(body);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [session]);

  const updateCheckpoint = (index: number, value: string) => {
    setCheckpoints((rows) => {
      const copy = [...rows];
      copy[index] = value;
      return copy;
    });
  };

  const addCheckpointRow = () =>
    setCheckpoints((rows) => [...rows, ""]);

  const removeCheckpointRow = (index: number) =>
    setCheckpoints((rows) => rows.filter((_, i) => i !== index));

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }
    const nonEmptyCheckpoints = checkpoints
      .map((c) => c.trim())
      .filter(Boolean);
    if (!nonEmptyCheckpoints.length) {
      alert("Add at least one QC checkpoint.");
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
      const body = {
        name: name.trim(),
        iconName: iconName.trim() || undefined,
        unit: unit.trim() || undefined,
        description: undefined,
        defaultWeightage,
        checkpoints: nonEmptyCheckpoints,
      };
      const res = await fetch(`${baseUrl}buildlive/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create template");
      setName("");
      setIconName("");
      setUnit("");
      setDefaultWeightage(10);
      setCheckpoints([""]);
      await fetchTemplates();
    } catch (e) {
      console.error(e);
      alert("Failed to create custom scope.");
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
      <Box sx={{ maxWidth: "1100px", mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          BuildLive Scope Templates
        </Typography>
        <Typography variant="body2" sx={{ color: "#9ca3af", mb: 3 }}>
          Manage system and custom scope definitions for project tracking.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: "#1e293b",
                p: 3,
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: "#e5e7eb", fontWeight: 600 }}
              >
                System Templates
              </Typography>
              {systemTemplates.map((tpl) => (
                <Box
                  key={tpl.id}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #334155",
                    p: 2,
                    mb: 1.5,
                    bgcolor: "#020617",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#e5e7eb" }}
                  >
                    {tpl.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 1 }}
                  >
                    Unit: {tpl.unit || "-"} · Weightage:{" "}
                    {tpl.defaultWeightage}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {tpl.checkpointTemplates.map((c) => (
                      <Chip
                        key={c.id}
                        label={c.checkpointName}
                        size="small"
                        sx={{
                          bgcolor: "#111827",
                          color: "#e5e7eb",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
              {!systemTemplates.length && (
                <Typography
                  variant="body2"
                  sx={{ color: "#9ca3af" }}
                >
                  No system templates found.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: "#1e293b",
                p: 3,
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: "#e5e7eb", fontWeight: 600 }}
              >
                Custom Templates
              </Typography>
              {customTemplates.map((tpl) => (
                <Box
                  key={tpl.id}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #334155",
                    p: 2,
                    mb: 1.5,
                    bgcolor: "#020617",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#e5e7eb" }}
                  >
                    {tpl.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 1 }}
                  >
                    Unit: {tpl.unit || "-"} · Weightage:{" "}
                    {tpl.defaultWeightage}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {tpl.checkpointTemplates.map((c) => (
                      <Chip
                        key={c.id}
                        label={c.checkpointName}
                        size="small"
                        sx={{
                          bgcolor: "#111827",
                          color: "#e5e7eb",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
              {!customTemplates.length && (
                <Typography
                  variant="body2"
                  sx={{ color: "#9ca3af" }}
                >
                  No custom templates yet.
                </Typography>
              )}
            </Paper>

            <Paper
              sx={{
                bgcolor: "#1e293b",
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: "#e5e7eb", fontWeight: 600 }}
              >
                Create Custom Scope
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { color: "#e5e7eb" },
                    "& .MuiInputLabel-root": { color: "#9ca3af" },
                  }}
                />
                <TextField
                  label="Icon name"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { color: "#e5e7eb" },
                    "& .MuiInputLabel-root": { color: "#9ca3af" },
                  }}
                />
                <TextField
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { color: "#e5e7eb" },
                    "& .MuiInputLabel-root": { color: "#9ca3af" },
                  }}
                />
                <TextField
                  label="Default weightage"
                  type="number"
                  value={defaultWeightage}
                  onChange={(e) =>
                    setDefaultWeightage(
                      Number(e.target.value || 0) || 0
                    )
                  }
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": { color: "#e5e7eb" },
                    "& .MuiInputLabel-root": { color: "#9ca3af" },
                  }}
                />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 1 }}
                  >
                    QC Checkpoints
                  </Typography>
                  {checkpoints.map((cp, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <TextField
                        fullWidth
                        value={cp}
                        onChange={(e) =>
                          updateCheckpoint(index, e.target.value)
                        }
                        placeholder={`Checkpoint ${index + 1}`}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: "#e5e7eb",
                          },
                          "& .MuiInputLabel-root": {
                            color: "#9ca3af",
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => removeCheckpointRow(index)}
                        sx={{ color: "#f97373" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={addCheckpointRow}
                    sx={{
                      textTransform: "none",
                      mt: 1,
                      borderRadius: 999,
                      borderColor: "#4b5563",
                      color: "#e5e7eb",
                    }}
                    variant="outlined"
                  >
                    Add Checkpoint
                  </Button>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={saving}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      bgcolor: "#22c55e",
                      "&:hover": { bgcolor: "#16a34a" },
                    }}
                  >
                    {saving ? "Saving..." : "Create Custom Scope"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default withAdminLayout(TemplatesPage);

