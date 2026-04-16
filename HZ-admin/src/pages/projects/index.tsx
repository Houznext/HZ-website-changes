import withAdminLayout from "@/src/common/AdminLayout";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

interface InteriorProject {
  id: number; title: string; location: string;
  propertyType: string; sqft: number; package: string;
  costInLakhs: number; deliveryDays: number;
  style: string; rating: number; description: string;
  rooms: string[]; images: string[];
  status: string; featured: boolean; sortOrder: number;
  createdAt: string; updatedAt: string;
}

interface ProjectForm {
  title: string; location: string; propertyType: string;
  sqft: string; package: string; costInLakhs: string;
  deliveryDays: string; style: string; rating: string;
  description: string; rooms: string[];
  images: string[]; status: string; featured: boolean;
  sortOrder: string;
}

const INITIAL_FORM: ProjectForm = {
  title: "", location: "", propertyType: "2BHK",
  sqft: "", package: "Premium", costInLakhs: "",
  deliveryDays: "", style: "Modern", rating: "4.8",
  description: "", rooms: [], images: [],
  status: "Draft", featured: false, sortOrder: "",
};

const ROOMS_LIST = [
  "Living room", "Master bedroom", "Kitchen",
  "Bedroom 2", "Bedroom 3", "Bathrooms",
  "Pooja room", "Home office",
];

const STYLE_OPTIONS = [
  "Modern", "Warm / Scandi", "Classic",
  "Bohemian", "Industrial", "Luxury",
];

function StrokeIcon({ path, stroke = "#64748b", size = 16 }: { path: string; stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const Projects = () => {
  const { status } = useSession();
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  const [rows, setRows] = useState<InteriorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pkgFilter, setPkgFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [stats, setStats] = useState({ total: 0, live: 0, draft: 0, featured: 0 });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectForm>(INITIAL_FORM);
  const [toast, setToast] = useState({ open: false, message: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOverImages, setIsDragOverImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasAccess = hasPermission("project", "view");
  const avgCost = useMemo(() => {
    const values = rows.map((r) => Number(r.costInLakhs || 0)).filter(Boolean);
    if (!values.length) return "0.0";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  }, [rows]);
  const avgDays = useMemo(() => {
    const values = rows.map((r) => Number(r.deliveryDays || 0)).filter(Boolean);
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [rows]);

  const showToast = (message: string) => setToast({ open: true, message });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10, sort };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (pkgFilter) params.package = pkgFilter;
      if (typeFilter) params.propertyType = typeFilter;
      const res = await apiClient.get(apiClient.URLS.interior_projects, params, true);
      const body = res.body || {};
      setRows(Array.isArray(body.data) ? body.data : []);
      setTotal(Number(body.total || 0));
      setTotalPages(Number(body.totalPages || 1));
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, statusFilter, pkgFilter, typeFilter]);

  const fetchStats = useCallback(async () => {
    const res = await apiClient.get(apiClient.URLS.interior_projects_stats, {}, true);
    setStats(res.body || { total: 0, live: 0, draft: 0, featured: 0 });
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const openForm = (row?: InteriorProject) => {
    if (!row) {
      setEditingId(null);
      setForm(INITIAL_FORM);
    } else {
      setEditingId(row.id);
      setForm({
        title: row.title || "",
        location: row.location || "",
        propertyType: row.propertyType || "2BHK",
        sqft: row.sqft ? String(row.sqft) : "",
        package: row.package || "Premium",
        costInLakhs: row.costInLakhs ? String(row.costInLakhs) : "",
        deliveryDays: row.deliveryDays ? String(row.deliveryDays) : "",
        style: row.style || "Modern",
        rating: row.rating ? String(row.rating) : "4.8",
        description: row.description || "",
        rooms: row.rooms || [],
        images: (row.images || []).slice(0, 10),
        status: row.status || "Draft",
        featured: !!row.featured,
        sortOrder: row.sortOrder ? String(row.sortOrder) : "",
      });
    }
    setOpen(true);
  };

  const mapFormToPayload = (f: ProjectForm, forceStatus?: string) => ({
    title: f.title,
    location: f.location,
    propertyType: f.propertyType,
    sqft: f.sqft ? Number(f.sqft) : undefined,
    package: f.package,
    costInLakhs: f.costInLakhs ? Number(f.costInLakhs) : undefined,
    deliveryDays: f.deliveryDays ? Number(f.deliveryDays) : undefined,
    style: f.style,
    rating: f.rating ? Number(f.rating) : undefined,
    description: f.description,
    rooms: f.rooms,
    images: f.images.filter((u) => u.trim()),
    status: forceStatus || f.status,
    featured: f.featured,
    sortOrder: f.sortOrder ? Number(f.sortOrder) : undefined,
  });

  const handleImageUpload = async (files: File[]) => {
    if (!files.length) return;
    const existing = form.images.filter((u) => u.trim());
    const remainingSlots = 10 - existing.length;
    if (remainingSlots <= 0) {
      showToast("Maximum 10 images allowed");
      return;
    }

    const validFiles = files
      .slice(0, remainingSlots)
      .filter((file) => file.type.startsWith("image/"));
    if (!validFiles.length) {
      showToast("Please upload image files only");
      return;
    }

    setIsUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const url = await uploadFile(
          file,
          "projects",
          undefined,
          undefined,
          (progress) => setUploadProgress(progress),
        );
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images.filter((u) => u.trim()), ...uploadedUrls].slice(0, 10),
        }));
        showToast(`${uploadedUrls.length} image(s) uploaded`);
      }
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const removeImageAt = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const setAsMainImage = (idx: number) => {
    setForm((prev) => {
      const list = [...prev.images];
      const [picked] = list.splice(idx, 1);
      return { ...prev, images: [picked, ...list] };
    });
  };

  const submit = async (publish = false) => {
    if (!form.title.trim() || !form.location.trim()) return;
    setSaving(true);
    try {
      const payload = mapFormToPayload(form, publish ? "Live" : undefined);
      if (editingId) {
        await apiClient.patch(`${apiClient.URLS.interior_projects}/${editingId}`, payload, true);
        showToast("Project updated successfully");
      } else {
        await apiClient.post(apiClient.URLS.interior_projects, payload, true);
        showToast(publish ? "Project published live" : "Project saved");
      }
      setOpen(false);
      await fetchProjects();
      await fetchStats();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (row: InteriorProject) => {
    const newStatus = row.status === "Live" ? "Draft" : "Live";
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    await apiClient.patch(`${apiClient.URLS.interior_projects}/${row.id}`, { status: newStatus }, true);
    showToast(`Project moved to ${newStatus}`);
    await fetchStats();
  };

  const deleteProject = async () => {
    if (!deleteId) return;
    await apiClient.delete(`${apiClient.URLS.interior_projects}/${deleteId}`, {}, true);
    setRows((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    showToast("Project deleted");
    await fetchStats();
  };

  const exportCSV = async () => {
    const res = await apiClient.get(apiClient.URLS.interior_projects, { page: 1, limit: 1000, sort: "newest" }, true);
    const all: InteriorProject[] = res.body?.data || [];
    const header = ["id", "title", "location", "propertyType", "sqft", "package", "costInLakhs", "deliveryDays", "style", "rating", "status", "featured"];
    const lines = [header.join(",")];
    all.forEach((p) => {
      lines.push([p.id, p.title, p.location, p.propertyType, p.sqft, p.package, p.costInLakhs, p.deliveryDays, p.style, p.rating, p.status, p.featured ? "yes" : "no"].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interior-projects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if ((isLoading && !initialized) || status === "loading") return null;
  if (!hasAccess) return <AccessDenied resource={"Projects"} />;

  return (
    <Box sx={{ p: 2, fontFamily: "Inter, system-ui, sans-serif", background: "#f8fafc" }}>
      <style>{`@keyframes pulse-dot{0%{opacity:.35}50%{opacity:1}100%{opacity:.35}}`}</style>
      <Box sx={{ background: "#0f2a44", borderRadius: "12px", p: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#fff" />
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>Projects CMS</Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: .7, px: 1.2, py: .4, borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(22,163,74,.15)", color: "#16a34a", border: "1px solid rgba(22,163,74,.3)" }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse-dot 1.1s infinite" }} />
            Live sync
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={exportCSV} sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: "#fff", border: "1.5px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", borderRadius: "8px", px: 2 }}>
            <StrokeIcon path="M12 3v12M7 10l5 5 5-5M4 21h16" stroke="#fff" size={14} />&nbsp;Export
          </Button>
          <Button onClick={() => openForm()} sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, color: "#fff", borderRadius: "8px", px: 2, background: "#2f80ed", "&:hover": { background: "#1a6dd6" } }}>
            <StrokeIcon path="M12 5v14M5 12h14" stroke="#fff" size={14} />&nbsp;Add project
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 1.5, mt: 2.5, mb: 2.5 }}>
        {[
          ["Total projects", stats.total, "+ synced"],
          ["Live on website", stats.live, "+ live"],
          ["Avg. delivery", `${avgDays}d`, "+ avg"],
          ["Avg. cost", `₹${avgCost}L`, "+ avg"],
        ].map(([label, value, delta]) => (
          <Box key={label} sx={{ p: "14px 16px", border: "1.5px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#0f2a44" }}>{value}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{label}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>{delta}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mb: 2 }}>
        <TextField size="small" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, location, style..." sx={{ minWidth: 220, flex: 1 }} />
        <Select size="small" value={pkgFilter} onChange={(e) => { setPkgFilter(String(e.target.value)); setPage(1); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All packages</MenuItem>
          <MenuItem value="Essential">Essential</MenuItem>
          <MenuItem value="Premium">Premium</MenuItem>
          <MenuItem value="Luxury">Luxury</MenuItem>
        </Select>
        <Select size="small" value={typeFilter} onChange={(e) => { setTypeFilter(String(e.target.value)); setPage(1); }} sx={{ minWidth: 130 }}>
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="2BHK">2BHK</MenuItem>
          <MenuItem value="3BHK">3BHK</MenuItem>
          <MenuItem value="Villa">Villa</MenuItem>
        </Select>
        <Select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(String(e.target.value)); setPage(1); }} sx={{ minWidth: 130 }}>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="Live">Live</MenuItem>
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Hidden">Hidden</MenuItem>
        </Select>
        <Select size="small" value={sort} onChange={(e) => setSort(String(e.target.value))} sx={{ minWidth: 170 }}>
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
          <MenuItem value="cost-high">Cost high→low</MenuItem>
          <MenuItem value="cost-low">Cost low→high</MenuItem>
          <MenuItem value="days">Fastest delivery</MenuItem>
        </Select>
      </Box>

      <TableContainer component={Box} sx={{ border: "1.5px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#0f2a44" }}>
              {["Title", "Location", "Type", "Package", "Cost", "Days", "Status", "Featured", "Actions"].map((h) => (
                <TableCell key={h} sx={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "none" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>{Array.from({ length: 9 }).map((__, j) => <TableCell key={j}><Skeleton height={24} /></TableCell>)}</TableRow>
            )) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#64748b" size={40} />
                  <Typography sx={{ mt: 1.5, fontWeight: 700, color: "#0f2a44" }}>No projects yet</Typography>
                  <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1.5 }}>Add your first project</Typography>
                  <Button onClick={() => openForm()} sx={{ textTransform: "none", background: "#2f80ed", color: "#fff" }}>Add project</Button>
                </TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13, fontWeight: 700, color: "#0f2a44" }}>{r.title}</TableCell>
                <TableCell sx={{ fontSize: 12, color: "#64748b" }}>{r.location}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>{r.propertyType}<br /><span style={{ color: "#64748b", fontSize: 11 }}>{r.sqft} sqft</span></TableCell>
                <TableCell><Chip label={r.package} size="small" sx={{ fontWeight: 700, ...(r.package === "Luxury" ? { bgcolor: "#fef3c7", color: "#92400e" } : r.package === "Premium" ? { bgcolor: "#dbeafe", color: "#1e40af" } : { bgcolor: "#f8fafc", color: "#0f2a44" }) }} /></TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 800, color: "#2f80ed" }}>₹{r.costInLakhs}L</TableCell>
                <TableCell sx={{ fontSize: 12, color: "#64748b" }}>{r.deliveryDays}d</TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" sx={{ fontWeight: 700, ...(r.status === "Live" ? { bgcolor: "#dcfce7", color: "#166534" } : r.status === "Draft" ? { bgcolor: "#fef3c7", color: "#92400e" } : { bgcolor: "#fee2e2", color: "#991b1b" }) }} />
                </TableCell>
                <TableCell>{r.featured ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b"><path d="M12 2l2.9 6.3 6.9.9-5 4.8 1.2 6.8L12 17.9 6 20.8l1.2-6.8-5-4.8 6.9-.9z"/></svg> : "—"}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: .7 }}>
                    <button title="Edit" onClick={() => openForm(r)} style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><StrokeIcon path="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4" stroke="#2f80ed" size={14} /></button>
                    <button title="Toggle live" onClick={() => void toggleStatus(r)} style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><StrokeIcon path="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zM12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#2f80ed" size={14} /></button>
                    <button title="Preview" onClick={() => window.open(`/projects/${r.id}`, "_blank")} style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><StrokeIcon path="M15 3h6v6M10 14L21 3" stroke="#16a34a" size={14} /></button>
                    <button title="Delete" onClick={() => setDeleteId(r.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><StrokeIcon path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#dc2626" size={14} /></button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination page={page} count={Math.max(totalPages, 1)} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <Box sx={{ background: "#0f2a44", p: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "Edit project" : "Add new project"}</Typography>
          <button onClick={() => setOpen(false)} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid rgba(255,255,255,.5)", background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer" }}>
            <StrokeIcon path="M6 6l12 12M18 6L6 18" stroke="#fff" />
          </button>
        </Box>
        <DialogContent sx={{ p: 2.2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.2 }}>
            <TextField label="Title *" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
            <TextField label="Location *" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} fullWidth />
            <Select value={form.propertyType} onChange={(e) => setForm((p) => ({ ...p, propertyType: String(e.target.value) }))} fullWidth>
              <MenuItem value="2BHK">2BHK</MenuItem><MenuItem value="3BHK">3BHK</MenuItem><MenuItem value="Villa">Villa</MenuItem>
            </Select>
            <TextField label="Area sqft" value={form.sqft} onChange={(e) => setForm((p) => ({ ...p, sqft: e.target.value }))} fullWidth />
            <Select value={form.package} onChange={(e) => setForm((p) => ({ ...p, package: String(e.target.value) }))} fullWidth>
              <MenuItem value="Essential">Essential</MenuItem><MenuItem value="Premium">Premium</MenuItem><MenuItem value="Luxury">Luxury</MenuItem>
            </Select>
            <TextField label="Final cost ₹L" value={form.costInLakhs} onChange={(e) => setForm((p) => ({ ...p, costInLakhs: e.target.value }))} fullWidth />
            <TextField label="Delivery days" value={form.deliveryDays} onChange={(e) => setForm((p) => ({ ...p, deliveryDays: e.target.value }))} fullWidth />
            <Select value={form.style} onChange={(e) => setForm((p) => ({ ...p, style: String(e.target.value) }))} fullWidth>
              {STYLE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <TextField label="Customer rating" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} fullWidth />
            <TextField label="Sort order" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} fullWidth />
          </Box>
          <TextField label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} fullWidth multiline minRows={3} sx={{ mt: 1.2 }} />

          <Typography sx={{ mt: 2, mb: 1, fontSize: 12, fontWeight: 700, color: "#0f2a44", textTransform: "uppercase", letterSpacing: ".06em" }}>Rooms included</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 1 }}>
            {ROOMS_LIST.map((room) => {
              const checked = form.rooms.includes(room);
              return (
                <button key={room} onClick={() => setForm((p) => ({ ...p, rooms: checked ? p.rooms.filter((r) => r !== room) : [...p.rooms, room] }))} style={{ border: checked ? "1.5px solid #2f80ed" : "1.5px solid #e2e8f0", borderRadius: 8, background: checked ? "#f0f7ff" : "#fff", padding: "8px 10px", textAlign: "left", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#0f2a44" }}>
                  {room}
                </button>
              );
            })}
          </Box>

          <Typography sx={{ mt: 2, mb: 1, fontSize: 12, fontWeight: 700, color: "#0f2a44", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Project images (max 10)
          </Typography>
          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverImages(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOverImages(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverImages(false);
              void handleImageUpload(Array.from(e.dataTransfer.files || []));
            }}
            sx={{
              border: isDragOverImages ? "2px dashed #2f80ed" : "2px dashed #cbd5e1",
              borderRadius: "10px",
              background: isDragOverImages ? "#f0f7ff" : "#f8fafc",
              p: 2,
              transition: "all .2s ease",
            }}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                void handleImageUpload(files);
                e.target.value = "";
              }}
            />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f2a44", mb: 0.5 }}>
              Drag & drop images here
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b", mb: 1.2 }}>
              No image URLs needed. Upload files directly. First image will be used as main image.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Button
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImages}
                sx={{ textTransform: "none", background: "#2f80ed", color: "#fff", "&:hover": { background: "#1a6dd6" } }}
              >
                <StrokeIcon path="M12 3v12M7 10l5 5 5-5M4 21h16" stroke="#fff" size={14} />
                &nbsp;Upload images
              </Button>
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                {form.images.filter((u) => u.trim()).length}/10 uploaded
              </Typography>
            </Box>
            {isUploadingImages && (
              <Box sx={{ mt: 1.4 }}>
                <Typography sx={{ fontSize: 11, color: "#64748b", mb: 0.5 }}>Uploading... {uploadProgress}%</Typography>
                <Box sx={{ height: 8, background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <Box sx={{ height: "100%", width: `${uploadProgress}%`, background: "#2f80ed", transition: "width .2s ease" }} />
                </Box>
              </Box>
            )}
          </Box>

          {!!form.images.filter((u) => u.trim()).length && (
            <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(5,1fr)" }, gap: 1 }}>
              {form.images.filter((u) => u.trim()).map((url, idx) => (
                <Box key={`${url}-${idx}`} sx={{ border: "1.5px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                  <img src={url} alt={`Project ${idx + 1}`} style={{ width: "100%", height: 78, objectFit: "cover" }} />
                  <Box sx={{ p: 0.7 }}>
                    <Typography sx={{ fontSize: 10, color: idx === 0 ? "#16a34a" : "#64748b", fontWeight: idx === 0 ? 700 : 500 }}>
                      {idx === 0 ? "Main image" : `Image ${idx + 1}`}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.6 }}>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(idx)}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "2px 6px", fontSize: 10, color: "#0f2a44", background: "#fff", cursor: "pointer" }}
                        >
                          Set main
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        style={{ border: "1px solid #fecaca", borderRadius: 6, padding: "2px 6px", fontSize: 10, color: "#dc2626", background: "#fff", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.2 }}>
            <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: String(e.target.value) }))} fullWidth>
              <MenuItem value="Draft">Draft</MenuItem><MenuItem value="Live">Live</MenuItem><MenuItem value="Hidden">Hidden</MenuItem>
            </Select>
            <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />} label="Mark as featured" />
          </Box>
        </DialogContent>
        <Box sx={{ p: "16px 20px", borderTop: "1.5px solid #e2e8f0", display: "flex", gap: 1, justifyContent: "flex-end", background: "#f8fafc" }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", border: "1.5px solid #e2e8f0", color: "#64748b", background: "#fff" }}>Cancel</Button>
          <Button onClick={() => void submit(false)} disabled={saving} sx={{ textTransform: "none", background: "#2f80ed", color: "#fff" }}>
            {saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <><StrokeIcon path="M19 21H5a2 2 0 01-2-2V7h18v12a2 2 0 01-2 2zM16 3v4M8 3v4" stroke="#fff" size={14} />&nbsp;Save draft</>}
          </Button>
          <Button onClick={() => void submit(true)} disabled={saving} sx={{ textTransform: "none", background: "#16a34a", color: "#fff" }}>
            <StrokeIcon path="M20 6L9 17l-5-5" stroke="#fff" size={14} />&nbsp;Publish live
          </Button>
        </Box>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogContent sx={{ p: 2.2 }}>
          <Typography sx={{ fontWeight: 700, color: "#0f2a44", mb: 1 }}>Delete this project?</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748b", mb: 2 }}>This action cannot be undone.</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button onClick={() => void deleteProject()} sx={{ textTransform: "none", background: "#dc2626", color: "#fff" }}>Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={2800} onClose={() => setToast({ open: false, message: "" })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success" sx={{ bgcolor: "#dcfce7", color: "#166534", borderLeft: "4px solid #16a34a", borderRadius: "10px", fontWeight: 700 }}>
          {toast.message}
        </Alert>
      </Snackbar>
      <Typography sx={{ mt: 1, fontSize: 11, color: "#64748b" }}>{total} total records</Typography>
    </Box>
  );
};

export default withAdminLayout(Projects);
