import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Slider,
  Grid,
  IconButton,
  Button,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

type LabourRow = {
  tradeType: string;
  count: number;
  hoursWorked: number;
  wagePerDay?: number | null;
};

type MaterialRow = {
  materialName: string;
  quantity: number;
  unit: string;
  unitCost?: number | null;
};

const ScopeUpdatePage = () => {
  const router = useRouter();
  const { projectId, scopeId } = router.query as {
    projectId?: string;
    scopeId?: string;
  };
  const { data: session } = useSession();

  const [currentProgress, setCurrentProgress] = useState(0);
  const [delta, setDelta] = useState(0);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [supervisorName, setSupervisorName] = useState("");
  const [labour, setLabour] = useState<LabourRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [blockerNote, setBlockerNote] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");

  // TODO: fetch real current scope progress if endpoint exists

  const maxDelta = 100 - currentProgress;
  const newTotal = Math.min(100, currentProgress + delta);

  const addLabourRow = () =>
    setLabour((rows) => [
      ...rows,
      { tradeType: "", count: 1, hoursWorked: 8 },
    ]);

  const updateLabourRow = (
    index: number,
    field: keyof LabourRow,
    value: any
  ) => {
    setLabour((rows) => {
      const copy = [...rows];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const removeLabourRow = (index: number) =>
    setLabour((rows) => rows.filter((_, i) => i !== index));

  const addMaterialRow = () =>
    setMaterials((rows) => [
      ...rows,
      { materialName: "", quantity: 0, unit: "", unitCost: null },
    ]);

  const updateMaterialRow = (
    index: number,
    field: keyof MaterialRow,
    value: any
  ) => {
    setMaterials((rows) => {
      const copy = [...rows];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const removeMaterialRow = (index: number) =>
    setMaterials((rows) => rows.filter((_, i) => i !== index));

  const totalMaterialCost = materials.reduce((sum, m) => {
    const qty = Number(m.quantity) || 0;
    const cost = m.unitCost != null ? Number(m.unitCost) : 0;
    return sum + qty * cost;
  }, 0);

  const handleSubmit = async () => {
    if (!scopeId) return;
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
      const token =
        (session as any)?.token ||
        (session as any)?.user?.token ||
        (session as any)?.accessToken;

      const body = {
        updateDate: date,
        progressDelta: delta,
        supervisorName,
        workDoneToday: undefined,
        tomorrowPlan: tomorrowPlan || undefined,
        blockerNote: blockerNote || undefined,
        labourEntries: labour,
        materialUsages: materials,
      };

      const res = await fetch(
        `${baseUrl}buildlive/scopes/${scopeId}/updates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error("Failed to submit update");
      alert(
        `Update submitted! New total progress: ${newTotal.toFixed(0)}%`
      );
      router.back();
    } catch (e) {
      console.error(e);
      alert("Failed to submit update.");
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
          BuildLive Daily Update
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{
                  "& .MuiInputBase-root": { color: "#e5e7eb" },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="body2"
                sx={{ color: "#9ca3af", mb: 1 }}
              >
                Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#e5e7eb", mb: 1 }}
              >
                Currently at <strong>{currentProgress}%</strong> — Adding{" "}
                <strong>{delta}%</strong> — New total:{" "}
                <strong>{newTotal.toFixed(0)}%</strong>
              </Typography>
              <Slider
                value={delta}
                onChange={(_, v) => setDelta(v as number)}
                min={0}
                max={maxDelta}
                sx={{
                  color: "#3b82f6",
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Supervisor Name"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              sx={{
                "& .MuiInputBase-root": { color: "#e5e7eb" },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
              }}
            />
          </Box>

          {/* Labour Table */}
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">
                Labour Entries
              </Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={addLabourRow}
                sx={{
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  borderRadius: 999,
                }}
              >
                Add Row
              </Button>
            </Box>
            {labour.map((row, index) => (
              <Grid
                container
                spacing={1}
                key={index}
                sx={{ mb: 1, alignItems: "center" }}
              >
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Trade Type"
                    value={row.tradeType}
                    onChange={(e) =>
                      updateLabourRow(index, "tradeType", e.target.value)
                    }
                    sx={{
                      "& .MuiInputBase-root": { color: "#e5e7eb" },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    fullWidth
                    label="Count"
                    type="number"
                    value={row.count}
                    onChange={(e) =>
                      updateLabourRow(
                        index,
                        "count",
                        Number(e.target.value || 0)
                      )
                    }
                    sx={{
                      "& .MuiInputBase-root": { color: "#e5e7eb" },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    fullWidth
                    label="Hours"
                    type="number"
                    value={row.hoursWorked}
                    onChange={(e) =>
                      updateLabourRow(
                        index,
                        "hoursWorked",
                        Number(e.target.value || 0)
                      )
                    }
                    sx={{
                      "& .MuiInputBase-root": { color: "#e5e7eb" },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <TextField
                    fullWidth
                    label="Wage / day"
                    type="number"
                    value={row.wagePerDay ?? ""}
                    onChange={(e) =>
                      updateLabourRow(
                        index,
                        "wagePerDay",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value)
                      )
                    }
                    sx={{
                      "& .MuiInputBase-root": { color: "#e5e7eb" },
                      "& .MuiInputLabel-root": { color: "#9ca3af" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    onClick={() => removeLabourRow(index)}
                    sx={{ color: "#f97373" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>

          {/* Materials Table */}
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">
                Materials Used
              </Typography>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={addMaterialRow}
                sx={{
                  textTransform: "none",
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  borderRadius: 999,
                }}
              >
                Add Row
              </Button>
            </Box>
            {materials.map((row, index) => {
              const qty = Number(row.quantity) || 0;
              const cost = row.unitCost != null ? Number(row.unitCost) : 0;
              const total = qty * cost;
              return (
                <Grid
                  container
                  spacing={1}
                  key={index}
                  sx={{ mb: 1, alignItems: "center" }}
                >
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Material Name"
                      value={row.materialName}
                      onChange={(e) =>
                        updateMaterialRow(
                          index,
                          "materialName",
                          e.target.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": { color: "#e5e7eb" },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="Qty"
                      type="number"
                      value={row.quantity}
                      onChange={(e) =>
                        updateMaterialRow(
                          index,
                          "quantity",
                          Number(e.target.value || 0)
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": { color: "#e5e7eb" },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={row.unit}
                      onChange={(e) =>
                        updateMaterialRow(index, "unit", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-root": { color: "#e5e7eb" },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="Cost / unit"
                      type="number"
                      value={row.unitCost ?? ""}
                      onChange={(e) =>
                        updateMaterialRow(
                          index,
                          "unitCost",
                          e.target.value === ""
                            ? null
                            : Number(e.target.value)
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": { color: "#e5e7eb" },
                        "& .MuiInputLabel-root": { color: "#9ca3af" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#e5e7eb", textAlign: "right" }}
                    >
                      Total: ₹{total.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => removeMaterialRow(index)}
                      sx={{ color: "#f97373" }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              );
            })}
            <Box sx={{ mt: 1, textAlign: "right", color: "#e5e7eb" }}>
              Running total: <strong>₹{totalMaterialCost.toFixed(2)}</strong>
            </Box>
          </Box>

          {/* Notes */}
          <Box sx={{ mt: 4 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Any blockers or issues today?"
              value={blockerNote}
              onChange={(e) => setBlockerNote(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": { color: "#e5e7eb" },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
              }}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Tomorrow's plan"
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              sx={{
                "& .MuiInputBase-root": { color: "#e5e7eb" },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
              }}
            />
          </Box>

          <Box
            sx={{
              mt: 4,
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
              onClick={handleSubmit}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                bgcolor: "#22c55e",
                "&:hover": { bgcolor: "#16a34a" },
              }}
            >
              Submit Update
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default withAdminLayout(ScopeUpdatePage);

