import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
} from "@mui/material";
import { useRouter } from "next/router";

type ProjectRow = {
  id: string;
  name: string;
  address: string;
  overallProgress: number;
  status: "not_started" | "in_progress" | "blocked" | "completed";
};

const statusColor = (status: ProjectRow["status"]) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "primary";
    case "blocked":
      return "error";
    case "not_started":
    default:
      return "default";
  }
};

const BuildliveProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TODO: replace with real projects API when available
    setProjects([
      {
        id: "PJT-001",
        name: "Houznext Interiors - Madhapur",
        address: "Madhapur, Hyderabad",
        overallProgress: 72,
        status: "in_progress",
      },
      {
        id: "PJT-002",
        name: "Premium Villa - Gachibowli",
        address: "Gachibowli, Hyderabad",
        overallProgress: 38,
        status: "in_progress",
      },
      {
        id: "PJT-003",
        name: "Smart Apartment - Hitech City",
        address: "Hitech City, Hyderabad",
        overallProgress: 96,
        status: "completed",
      },
    ]);
  }, []);

  const handleView = (projectId: string) => {
    router.push(`/buildlive/${projectId}`);
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#e5e7eb" }}>
            BuildLive Projects
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.5 }}>
            Track live construction progress across all Houznext projects.
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          bgcolor: "#1e293b",
          color: "#f1f5f9",
          borderRadius: 2,
          p: 2,
          boxShadow: "0 10px 40px rgba(15,23,42,0.7)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#9ca3af", borderBottomColor: "#334155" }}>
                Project Name
              </TableCell>
              <TableCell sx={{ color: "#9ca3af", borderBottomColor: "#334155" }}>
                Address
              </TableCell>
              <TableCell sx={{ color: "#9ca3af", borderBottomColor: "#334155" }}>
                Overall Progress
              </TableCell>
              <TableCell sx={{ color: "#9ca3af", borderBottomColor: "#334155" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "#9ca3af", borderBottomColor: "#334155" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const progress = project.overallProgress ?? 0;
              let barColor = "#f59e0b"; // amber <40
              if (progress > 75) barColor = "#22c55e"; // green
              else if (progress >= 40) barColor = "#3b82f6"; // blue

              return (
                <TableRow key={project.id} hover>
                  <TableCell
                    sx={{ borderBottomColor: "#334155", color: "#e5e7eb" }}
                  >
                    {project.name}
                  </TableCell>
                  <TableCell
                    sx={{ borderBottomColor: "#334155", color: "#9ca3af" }}
                  >
                    {project.address}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottomColor: "#334155",
                      minWidth: 200,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: "#0f172a",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              bgcolor: barColor,
                              transition: "width 0.4s ease",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#e5e7eb", fontWeight: 500, minWidth: 48 }}
                      >
                        {progress.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottomColor: "#334155" }}>
                    <Chip
                      label={
                        project.status === "not_started"
                          ? "Not Started"
                          : project.status === "in_progress"
                          ? "In Progress"
                          : project.status === "blocked"
                          ? "Blocked"
                          : "Completed"
                      }
                      color={statusColor(project.status)}
                      size="small"
                      sx={{
                        bgcolor:
                          project.status === "completed"
                            ? "rgba(34,197,94,0.15)"
                            : project.status === "blocked"
                            ? "rgba(239,68,68,0.15)"
                            : project.status === "in_progress"
                            ? "rgba(59,130,246,0.15)"
                            : "rgba(148,163,184,0.15)",
                        color: "#e5e7eb",
                        "& .MuiChip-label": { fontWeight: 500 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottomColor: "#334155" }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleView(project.id)}
                      sx={{
                        textTransform: "none",
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" },
                        fontSize: 12,
                        borderRadius: 999,
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default withAdminLayout(BuildliveProjectsPage);

