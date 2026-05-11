import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

export type HomeReviewRow = {
  name: string;
  location: string;
  rating: number;
  text: string;
  package: string;
};

const CMS_KEY = "home_reviews";

const DEFAULT_REVIEWS: HomeReviewRow[] = [
  {
    name: "Priya Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "Absolutely loved the experience. Our 3BHK looked stunning and was delivered in exactly 44 days. LiveBuild kept us in the loop every single day.",
    package: "Premium Package",
  },
  {
    name: "Suresh Naidu",
    location: "Warangal",
    rating: 5,
    text: "The fixed pricing was the main reason we chose Houznext. No hidden charges, no last-minute surprises. Exactly what we paid at the start.",
    package: "Essential Package",
  },
  {
    name: "Kavitha Sharma",
    location: "Karimnagar",
    rating: 5,
    text: "The 3D designs were photorealistic — I could visualise the space before work started. The kitchen came out even better than I imagined.",
    package: "Luxury Package",
  },
];

function normalizeLoaded(raw: unknown): HomeReviewRow[] {
  const list =
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as { reviews?: unknown }).reviews)
      ? (raw as { reviews: unknown[] }).reviews
      : [];
  const out: HomeReviewRow[] = [];
  for (let i = 0; i < 3; i++) {
    const d = DEFAULT_REVIEWS[i];
    const src = list[i] && typeof list[i] === "object" ? (list[i] as Record<string, unknown>) : {};
    const ratingNum = Number(src.rating);
    out.push({
      name: typeof src.name === "string" && src.name.trim() ? src.name.trim() : d.name,
      location: typeof src.location === "string" && src.location.trim() ? src.location.trim() : d.location,
      rating: Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? Math.round(ratingNum) : d.rating,
      text: typeof src.text === "string" && src.text.trim() ? src.text.trim() : d.text,
      package: typeof src.package === "string" && src.package.trim() ? src.package.trim() : d.package,
    });
  }
  return out;
}

function StrokeIcon({ path, stroke = "#fff", size = 16 }: { path: string; stroke?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function HomepageReviewsCms() {
  const router = useRouter();
  const { status } = useSession();
  const [reviews, setReviews] = useState<HomeReviewRow[]>(DEFAULT_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || "http://localhost:4000").replace(
    /\/$/,
    "",
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/site-cms/${CMS_KEY}`);
      const json = (await res.json()) as { data?: unknown };
      setReviews(normalizeLoaded(json?.data));
    } catch {
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (index: number, field: keyof HomeReviewRow, value: string | number) => {
    setReviews((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.post(
        `${apiBase}/site-cms/upsert`,
        { key: CMS_KEY, data: JSON.stringify({ reviews }) },
        true,
      );
      setDirty(false);
      toast.success("Published! Homepage reviews update within ~60s (ISR).");
    } catch {
      toast.error("Save failed. Check you are logged in and API is reachable.");
    }
    setSaving(false);
  };

  const siteBase = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "")) || "";
  const previewPath = siteBase ? `${siteBase}/` : "/";

  if (status === "loading")
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress size={28} sx={{ color: "#2f80ed" }} />
      </div>
    );
  if (status === "unauthenticated") {
    if (typeof window !== "undefined") void router.replace("/login");
    return null;
  }

  return (
    <Box sx={{ p: 2, fontFamily: "Inter, system-ui, sans-serif", background: "#f8fafc", minHeight: "100%" }}>
      <Box
        sx={{
          background: "#0f2a44",
          borderRadius: "12px",
          p: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <StrokeIcon path="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>Homepage reviews</Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              px: 1.2,
              py: 0.4,
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(47,128,237,.2)",
              color: "#93c5fd",
              border: "1px solid rgba(147,197,253,.35)",
            }}
          >
            3 cards · homepage
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            component="a"
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.1)",
              borderRadius: "8px",
              px: 2,
            }}
          >
            Preview site
          </Button>
          <Button
            onClick={() => void save()}
            disabled={saving || !dirty}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              borderRadius: "8px",
              px: 2,
              background: "#2f80ed",
              "&:hover": { background: "#1a6dd6" },
              "&.Mui-disabled": { color: "rgba(255,255,255,.5)", background: "rgba(255,255,255,.12)" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Publish"}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mt: 2.5 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              p: 2.5,
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              background: "#fff",
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: ".08em", mb: 1.5 }}>
              REVIEW {i + 1}
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Customer name"
              value={reviews[i].name}
              onChange={(e) => update(i, "name", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Location"
              value={reviews[i].location}
              onChange={(e) => update(i, "location", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Star rating"
              value={String(reviews[i].rating)}
              onChange={(e) => update(i, "rating", Number(e.target.value))}
              sx={{ mb: 1.5 }}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <MenuItem key={n} value={String(n)}>
                  {n} stars
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              label="Package badge"
              value={reviews[i].package}
              onChange={(e) => update(i, "package", e.target.value)}
              placeholder="e.g. Premium Package"
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              multiline
              minRows={5}
              label="Quote / review text"
              value={reviews[i].text}
              onChange={(e) => update(i, "text", e.target.value)}
              helperText="Shown in quotation marks on the homepage."
            />
          </Box>
        ))}
      </Box>

      <Typography sx={{ mt: 2, fontSize: 12, color: "#64748b", maxWidth: 720 }}>
        Uses the same <strong>site-cms</strong> store as About us CMS (key <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4 }}>{CMS_KEY}</code>
        ). After publish, the marketing site refreshes on its next ISR window (default 30s).
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} sx={{ color: "#2f80ed" }} />
        </Box>
      )}
    </Box>
  );
}

export default withAdminLayout(HomepageReviewsCms);
