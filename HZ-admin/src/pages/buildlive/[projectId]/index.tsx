import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type ScopeSummary = {
  id: string;
  name: string;
  vendor?: string | null;
  overallProgress: number;
  status: string;
  openSnags?: number;
  qcPassRate?: number;
};

type DashboardResponse = {
  overallProgress: number;
  scopeSummary: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    notStarted: number;
  };
  todayUpdatesCount: number;
  openSnags: number;
  scopes: ScopeSummary[];
  trendData: {
    dates: string[];
    perScope: Record<string, number[]>;
  };
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const CircularProgressRing = ({ value }: { value: number }) => {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const clamped = Math.max(0, Math.min(100, value));
  const strokeDashoffset =
    circumference - (clamped / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#1f2937"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#3b82f6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{
          strokeDashoffset,
          transition: "stroke-dashoffset 0.6s ease",
        }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        style={{ fill: "#e5e7eb", fontSize: "20px", fontWeight: 600 }}
      >
        {clamped.toFixed(0)}%
      </text>
    </svg>
  );
};

const ProjectBuildlivePage = () => {
  const router = useRouter();
  const { projectId } = router.query as { projectId?: string };
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const fetchDashboard = async () => {
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
          `${baseUrl}buildlive/projects/${projectId}/dashboard`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load dashboard");
        const body = (await res.json()) as DashboardResponse;
        setData(body);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [projectId, session]);

  const chartData = useMemo(() => {
    if (!data) {
      return { labels: [], datasets: [] };
    }
    const labels = data.trendData.dates;
    const datasets = data.scopes.map((scope, index) => ({
      label: scope.name,
      data: data.trendData.perScope[scope.id] || [],
      borderColor: COLORS[index % COLORS.length],
      backgroundColor: COLORS[index % COLORS.length],
      tension: 0.3,
    }));
    return { labels, datasets };
  }, [data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#e5e7eb",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af" },
        grid: { color: "#1f2937" },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: "#9ca3af" },
        grid: { color: "#1f2937" },
      },
    },
  } as const;

  const handleGenerateReport = async () => {
    if (!projectId) return;
    try {
      setReportLoading(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;
      const token =
        (session as any)?.token ||
        (session as any)?.user?.token ||
        (session as any)?.accessToken;

      const res = await fetch(
        `${baseUrl}buildlive/projects/${projectId}/dpr/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to generate report");
      alert("Report generated!");
    } catch (e) {
      console.error(e);
      alert("Failed to generate report.");
    } finally {
      setReportLoading(false);
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
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#e5e7eb" }}>
            Project BuildLive Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af" }}>
            Project ID: {projectId}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={reportLoading}
          sx={{
            textTransform: "none",
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
            borderRadius: 999,
          }}
        >
          {reportLoading ? "Generating..." : "Generate Report"}
        </Button>
      </Box>

      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                bgcolor: "#1e293b",
                p: 3,
                borderRadius: 3,
                textAlign: "center",
                boxShadow: "0 15px 40px rgba(15,23,42,0.7)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#9ca3af", mb: 1, fontWeight: 500 }}
              >
                Overall Progress
              </Typography>
              <CircularProgressRing
                value={data?.overallProgress ?? 0}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    bgcolor: "#1e293b",
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 0.5 }}
                  >
                    Total Scopes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {data?.scopeSummary.total ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    bgcolor: "#1e293b",
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 0.5 }}
                  >
                    Today&apos;s Updates
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {data?.todayUpdatesCount ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    bgcolor: "#1e293b",
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#9ca3af", mb: 0.5 }}
                  >
                    Open Snags
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {data?.openSnags ?? 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Paper
          sx={{
            mt: 4,
            p: 2,
            bgcolor: "#111827",
            borderRadius: 3,
            boxShadow: "0 15px 40px rgba(15,23,42,0.7)",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ mb: 1.5, color: "#e5e7eb", fontWeight: 600 }}
          >
            Progress Trend
          </Typography>
          <Line data={chartData} options={chartOptions} />
        </Paper>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          {(data?.scopes || []).map((scope, index) => {
            const progress = scope.overallProgress ?? 0;
            let barColor = "#f59e0b";
            if (progress > 75) barColor = "#22c55e";
            else if (progress >= 40) barColor = "#3b82f6";

            return (
              <Grid item xs={12} md={6} key={scope.id}>
                <Paper
                  sx={{
                    bgcolor: "#1e293b",
                    p: 2,
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#e5e7eb", fontWeight: 600 }}
                      >
                        {scope.name}
                      </Typography>
                      {scope.vendor && (
                        <Typography
                          variant="body2"
                          sx={{ color: "#9ca3af", mt: 0.5 }}
                        >
                          Vendor: {scope.vendor}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#9ca3af", fontWeight: 500 }}
                    >
                      {progress.toFixed(0)}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: "#020617",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${progress}%`,
                          height: "100%",
                          bgcolor: barColor,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                      color: "#9ca3af",
                      fontSize: 12,
                    }}
                  >
                    <span>
                      QC Pass Rate:{" "}
                      <strong>{scope.qcPassRate ?? 0}%</strong>
                    </span>
                    <span>
                      Open Snags:{" "}
                      <strong>{scope.openSnags ?? 0}</strong>
                    </span>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        router.push(
                          `/buildlive/${projectId}/scope/${scope.id}/qc`
                        )
                      }
                      sx={{
                        textTransform: "none",
                        borderColor: "#4b5563",
                        color: "#e5e7eb",
                        "&:hover": {
                          borderColor: "#6b7280",
                          bgcolor: "rgba(55,65,81,0.4)",
                        },
                        fontSize: 12,
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        router.push(
                          `/buildlive/${projectId}/scope/${scope.id}/update`
                        )
                      }
                      sx={{
                        textTransform: "none",
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" },
                        fontSize: 12,
                      }}
                    >
                      Add Update
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default withAdminLayout(ProjectBuildlivePage);

