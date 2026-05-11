import withAdminLayout from "@/src/common/AdminLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";

type PageSeoRow = {
  id: string;
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  updatedAt?: string;
};

function StrokeIcon({
  path,
  stroke = "#64748b",
  size = 16,
}: {
  path: string;
  stroke?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function seoCoverageStatus(row: PageSeoRow): {
  label: string;
  tone: "green" | "orange" | "red";
  pct: number;
} {
  const t = (row.metaTitle || "").trim();
  const d = (row.metaDescription || "").trim();
  if (!t || !d) return { label: "Not set", tone: "red", pct: 22 };
  if (!row.ogImageUrl?.trim()) return { label: "Missing OG", tone: "orange", pct: 72 };
  if (!row.hasStructuredData) return { label: "No schema", tone: "orange", pct: 88 };
  return { label: "Complete", tone: "green", pct: 100 };
}

const TITLE_IDEAL = 60;
const DESC_IDEAL = 160;

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  border: "1.5px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(15,42,68,0.06)",
  padding: "20px 22px",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 8,
};

const SeoSettingsPage = () => {
  const { status } = useSession();
  const [rows, setRows] = useState<PageSeoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; message: string } | null>(null);

  const [selectedPath, setSelectedPath] = useState("/");
  const [label, setLabel] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [hasStructuredData, setHasStructuredData] = useState(false);

  const [newOpen, setNewOpen] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const publicSiteHost =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, "")) ||
    "houznext.com";

  const showToast = (message: string, type: "ok" | "err" = "ok") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.page_seo, {}, true);
      const body = res?.body;
      const list: PageSeoRow[] = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      setRows(list);
    } catch (e) {
      console.error(e);
      showToast("Could not load SEO settings (sign in / API URL).", "err");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    void loadRows();
  }, [status, loadRows]);

  useEffect(() => {
    if (!rows.length) return;
    if (!rows.some((r) => r.path === selectedPath)) {
      setSelectedPath(rows[0].path);
    }
  }, [rows, selectedPath]);

  const selectedRow = useMemo(
    () => rows.find((r) => r.path === selectedPath) ?? null,
    [rows, selectedPath],
  );

  useEffect(() => {
    if (!selectedRow) return;
    setLabel(selectedRow.label);
    setMetaTitle(selectedRow.metaTitle);
    setMetaDescription(selectedRow.metaDescription);
    setOgImageUrl(selectedRow.ogImageUrl ?? "");
    setHasStructuredData(!!selectedRow.hasStructuredData);
  }, [selectedRow]);

  const titleLenColor =
    metaTitle.length > TITLE_IDEAL ? "#f2994a" : metaTitle.length > 0 ? "#16a34a" : "#94a3b8";
  const descLenColor =
    metaDescription.length > DESC_IDEAL
      ? "#f2994a"
      : metaDescription.length > 0
        ? "#16a34a"
        : "#94a3b8";

  const save = async () => {
    if (!metaTitle.trim() || !metaDescription.trim()) {
      showToast("Meta title and description are required", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.put(
        apiClient.URLS.page_seo,
        {
          path: selectedPath,
          label: label.trim() || selectedPath,
          metaTitle: metaTitle.trim(),
          metaDescription: metaDescription.trim(),
          ogImageUrl: ogImageUrl.trim() || null,
          hasStructuredData,
        },
        true,
      );
      const saved = res?.body as PageSeoRow | undefined;
      if (saved?.path) {
        setRows((prev) => {
          const i = prev.findIndex((r) => r.path === saved.path);
          const next = [...prev];
          if (i >= 0) next[i] = { ...next[i], ...saved };
          else next.push(saved as PageSeoRow);
          return next.sort((a, b) => a.path.localeCompare(b.path));
        });
      }
      showToast("SEO settings saved");
      await loadRows();
    } catch (e) {
      console.error(e);
      showToast("Save failed — check network or permissions", "err");
    } finally {
      setSaving(false);
    }
  };

  const onDropFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please drop an image file", "err");
      return;
    }
    setUploadPct(0);
    const url = await uploadFile(file, "page-seo-og", undefined, undefined, (p) =>
      setUploadPct(p),
    );
    setUploadPct(null);
    if (url) setOgImageUrl(url);
  };

  const previewUrl = `https://${publicSiteHost}${selectedPath === "/" ? "" : selectedPath}`;

  const coverageList = useMemo(() => {
    return [...rows].sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const confirmNewPage = () => {
    const p = newPath.trim().startsWith("/") ? newPath.trim() : `/${newPath.trim()}`;
    const lbl = newLabel.trim() || p;
    if (!p || p === "/") {
      showToast("Enter a path (e.g. /new-page)", "err");
      return;
    }
    if (rows.some((r) => r.path === p)) {
      showToast("That path already exists", "err");
      return;
    }
    const draft: PageSeoRow = {
      id: `draft-${p}`,
      path: p,
      label: lbl,
      metaTitle: `${lbl} | Houznext`,
      metaDescription: "Describe this page for search results.",
      ogImageUrl: null,
      hasStructuredData: false,
    };
    setRows((prev) => [...prev, draft].sort((a, b) => a.path.localeCompare(b.path)));
    setNewOpen(false);
    setSelectedPath(p);
    setLabel(draft.label);
    setMetaTitle(draft.metaTitle);
    setMetaDescription(draft.metaDescription);
    setOgImageUrl("");
    setHasStructuredData(false);
    setNewPath("");
    setNewLabel("");
    showToast("New draft page — edit SEO and click Save to persist");
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif", color: "#64748b" }}>
        {status === "unauthenticated" ? "Sign in to manage SEO." : "Loading…"}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`@keyframes pulse-dot{0%{opacity:.35}50%{opacity:1}100%{opacity:.35}}`}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 50,
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            background: toast.type === "ok" ? "#dcfce7" : "#fee2e2",
            color: toast.type === "ok" ? "#166534" : "#991b1b",
            border: `1px solid ${toast.type === "ok" ? "#86efac" : "#fecaca"}`,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: "#0f2a44",
          borderRadius: 12,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StrokeIcon
            path="M12 2a10 10 0 100 20 10 10 0 000-20M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
            stroke="#fff"
            size={18}
          />
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>SEO Settings</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(22,163,74,.15)",
              color: "#16a34a",
              border: "1px solid rgba(22,163,74,.35)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#16a34a",
                animation: "pulse-dot 1.1s infinite",
              }}
            />
            Website live
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            title="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1.5px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StrokeIcon path="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#e2e8f0" size={16} />
          </button>
          <button
            type="button"
            onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1.5px solid rgba(255,255,255,.25)",
              background: "rgba(255,255,255,.1)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <StrokeIcon path="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="#fff" size={14} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#2f80ed",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <StrokeIcon path="M12 5v14M5 12h14" stroke="#fff" size={14} />
            New
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(280px,360px)",
          gap: 20,
          marginTop: 20,
          alignItems: "start",
        }}
        className="seo-settings-grid"
      >
        <style>{`
          @media (max-width: 1024px) {
            .seo-settings-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Editor */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f2a44", marginBottom: 18 }}>
            Page SEO editor
          </div>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: 14 }}>Loading pages…</p>
          ) : (
            <>
              <div style={labelStyle}>Select page</div>
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 14,
                  marginBottom: 18,
                  background: "#fff",
                  color: "#0f2a44",
                }}
              >
                {rows.map((r) => (
                  <option key={r.path} value={r.path}>
                    {r.label} ({r.path})
                  </option>
                ))}
              </select>

              <div style={labelStyle}>
                Meta title{" "}
                <span style={{ color: titleLenColor, fontWeight: 800 }}>
                  ({metaTitle.length}/{TITLE_IDEAL})
                </span>
              </div>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={200}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 14,
                  marginBottom: 18,
                  boxSizing: "border-box",
                }}
              />

              <div style={labelStyle}>
                Meta description{" "}
                <span style={{ color: descLenColor, fontWeight: 800 }}>
                  ({metaDescription.length}/{DESC_IDEAL})
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 14,
                  marginBottom: 18,
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />

              <div style={labelStyle}>OG image</div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void onDropFiles(e.dataTransfer.files);
                }}
                style={{
                  border: `2px dashed ${dragOver ? "#2f80ed" : "#cbd5e1"}`,
                  borderRadius: 12,
                  padding: "22px 16px",
                  textAlign: "center",
                  background: dragOver ? "rgba(47,128,237,0.06)" : "#f8fafc",
                  marginBottom: 10,
                }}
              >
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#475569" }}>
                  Drag and drop an image here, or choose a file
                </p>
                <input
                  type="file"
                  accept="image/*"
                  style={{ fontSize: 12 }}
                  onChange={(e) => void onDropFiles(e.target.files)}
                />
                {uploadPct != null && (
                  <p style={{ marginTop: 10, fontSize: 12, color: "#2f80ed", fontWeight: 700 }}>
                    Uploading… {uploadPct}%
                  </p>
                )}
              </div>
              <input
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="Image URL (filled after upload)"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 13,
                  marginBottom: 14,
                  boxSizing: "border-box",
                }}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "#334155",
                  marginBottom: 18,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={hasStructuredData}
                  onChange={(e) => setHasStructuredData(e.target.checked)}
                />
                Page has JSON-LD structured data (for coverage “Complete”)
              </label>

              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: saving ? "#94a3b8" : "#2f80ed",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save SEO settings"}
              </button>
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2a44", marginBottom: 14 }}>
              Google preview
            </div>
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: 10,
                padding: "14px 16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: 13, color: "#15803d", marginBottom: 4 }}>{publicSiteHost}</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a73e8",
                  marginBottom: 6,
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                }}
              >
                {metaTitle.trim() || "Page title"}
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.45, wordBreak: "break-word" }}>
                {metaDescription.trim() || "Meta description will appear here."}
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2a44", marginBottom: 14 }}>
              SEO coverage
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {coverageList.map((row) => {
                const st = seoCoverageStatus(row);
                const barColor =
                  st.tone === "green" ? "#16a34a" : st.tone === "orange" ? "#f2994a" : "#ef4444";
                const textColor = barColor;
                return (
                  <div key={row.path}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2a44" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>{st.label}</span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 6,
                        background: "#e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${st.pct}%`,
                          height: "100%",
                          background: barColor,
                          borderRadius: 6,
                          transition: "width 0.25s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {!coverageList.length && !loading && (
                <p style={{ fontSize: 13, color: "#64748b" }}>No SEO rows yet. Start the backend to seed defaults.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {newOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,42,68,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: 16,
          }}
          onClick={() => setNewOpen(false)}
        >
          <div
            style={{ ...card, maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, color: "#0f2a44", marginBottom: 14 }}>New page SEO</div>
            <div style={labelStyle}>Path</div>
            <input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="/your-path"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #e2e8f0",
                marginBottom: 12,
                boxSizing: "border-box",
              }}
            />
            <div style={labelStyle}>Label</div>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Display name"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #e2e8f0",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setNewOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmNewPage()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2f80ed",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdminLayout(SeoSettingsPage);
