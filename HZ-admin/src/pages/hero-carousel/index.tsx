import withAdminLayout from "@/src/common/AdminLayout";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";

interface HeroSlide {
  id: number;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

interface CarouselSettings {
  intervalMs: number;
  transition: string;
  showArrows: boolean;
  showDots: boolean;
  pauseOnHover: boolean;
  kenBurns: boolean;
}

type ToastState = { type: "success" | "error"; message: string } | null;

const defaultSettings: CarouselSettings = {
  intervalMs: 3000,
  transition: "crossfade",
  showArrows: true,
  showDots: true,
  pauseOnHover: true,
  kenBurns: true,
};

const HeroCarouselPage = () => {
  const { data: session, status } = useSession();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<CarouselSettings>(defaultSettings);
  const [toast, setToast] = useState<ToastState>(null);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const token = (session as any)?.token || (session as any)?.user?.token || "";

  const activeCount = useMemo(
    () => slides.filter((slide) => slide.active).length,
    [slides]
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const fetchSlides = async () => {
    const res = await apiClient.get(apiClient.URLS.hero_carousel, {}, true);
    const data = Array.isArray(res?.body) ? res.body : [];
    setSlides(data);
  };

  const fetchSettings = async () => {
    const res = await apiClient.get(apiClient.URLS.hero_carousel_settings, {}, true);
    if (res?.body) {
      setSettings({
        intervalMs: res.body.intervalMs ?? 3000,
        transition: res.body.transition ?? "crossfade",
        showArrows: res.body.showArrows ?? true,
        showDots: res.body.showDots ?? true,
        pauseOnHover: res.body.pauseOnHover ?? true,
        kenBurns: res.body.kenBurns ?? true,
      });
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    void fetchSlides();
    void fetchSettings();
  }, [status]);

  const saveOrder = async (orderedSlides: HeroSlide[] = slides) => {
    await apiClient.patch(
      apiClient.URLS.hero_carousel_reorder,
      { orderedIds: orderedSlides.map((s) => s.id) },
      true
    );
  };

  const patchSlide = async (id: number, payload: Partial<HeroSlide>) => {
    await apiClient.patch(`${apiClient.URLS.hero_carousel}/${id}`, payload, true);
  };

  const handleUpload = async (slideId: number, file?: File | null) => {
    if (!file) return;
    if (!token) {
      showToast("Session token missing", "error");
      return;
    }

    setUploading((prev) => ({ ...prev, [slideId]: true }));
    setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await new Promise<{ url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiClient.URLS.hero_carousel_upload);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [slideId]: pct }));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid upload response"));
            }
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === slideId ? { ...slide, imageUrl: response.url } : slide
        )
      );
      await patchSlide(slideId, { imageUrl: response.url });
      showToast("Image uploaded");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [slideId]: false }));
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [slideId]: 0 }));
      }, 400);
    }
  };

  const handleUrlChange = async (id: number, imageUrl: string) => {
    setSlides((prev) =>
      prev.map((slide) => (slide.id === id ? { ...slide, imageUrl } : slide))
    );
    try {
      await patchSlide(id, { imageUrl });
    } catch {
      showToast("Image URL update failed", "error");
    }
  };

  const toggleActive = async (id: number) => {
    const target = slides.find((slide) => slide.id === id);
    if (!target) return;
    if (target.active && activeCount <= 1) {
      showToast("At least one image must be active", "error");
      return;
    }

    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, active: !slide.active } : slide
      )
    );
    try {
      await patchSlide(id, { active: !target.active });
    } catch {
      setSlides((prev) =>
        prev.map((slide) =>
          slide.id === id ? { ...slide, active: target.active } : slide
        )
      );
      showToast("Failed to update image state", "error");
    }
  };

  const reorderLocalSlides = (nextSlides: HeroSlide[]) => {
    setSlides(nextSlides);
    void saveOrder(nextSlides);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...slides];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    reorderLocalSlides(next);
  };

  const moveDown = (index: number) => {
    if (index >= slides.length - 1) return;
    const next = [...slides];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    reorderLocalSlides(next);
  };

  const deleteSlide = async (id: number) => {
    const slide = slides.find((item) => item.id === id);
    if (!slide) return;
    if (slide.active && activeCount <= 1) {
      showToast("At least one image must be active", "error");
      return;
    }
    if (!window.confirm("Delete this image slide?")) return;

    try {
      await apiClient.delete(`${apiClient.URLS.hero_carousel}/${id}`, {}, true);
      setSlides((prev) => prev.filter((slideItem) => slideItem.id !== id));
      showToast("Image deleted");
    } catch {
      showToast("Failed to delete image", "error");
    }
  };

  const addSlide = async () => {
    if (slides.length >= 6) {
      showToast("Maximum 6 images allowed", "error");
      return;
    }
    try {
      const res = await apiClient.post(
        apiClient.URLS.hero_carousel,
        { imageUrl: "" },
        true
      );
      const created = res?.body as HeroSlide;
      setSlides((prev) => [...prev, created]);
      setTimeout(() => {
        rowRefs.current[created.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 80);
    } catch {
      showToast("Failed to add image", "error");
    }
  };

  const updateSettings = async (partial: Partial<CarouselSettings>) => {
    const previous = settings;
    const next = { ...settings, ...partial };
    setSettings(next);
    try {
      await apiClient.patch(apiClient.URLS.hero_carousel_settings, partial, true);
      showToast("Settings updated");
    } catch {
      setSettings(previous);
      showToast("Failed to update settings", "error");
    }
  };

  const saveDraft = async () => {
    try {
      await saveOrder();
      showToast("Saved as draft");
    } catch {
      showToast("Failed to save draft", "error");
    }
  };

  const publishLive = async () => {
    try {
      await saveOrder();
      showToast("Published! Website updated live");
    } catch {
      showToast("Failed to publish", "error");
    }
  };

  const onDragStart = (id: number) => setDraggedId(id);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDrop = (targetId: number) => {
    if (draggedId == null || draggedId === targetId) {
      setDragOverId(null);
      return;
    }
    const next = [...slides];
    const from = next.findIndex((slide) => slide.id === draggedId);
    const to = next.findIndex((slide) => slide.id === targetId);
    if (from === -1 || to === -1) {
      setDragOverId(null);
      return;
    }
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDraggedId(null);
    setDragOverId(null);
    reorderLocalSlides(next);
  };

  if (status === "loading") return null;

  return (
    <>
      <style>{`
        @keyframes hero-carousel-toast-in {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#f8fafc", position: "relative" }}>
        {toast && (
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 50,
              background: "#0f2a44",
              color: "#fff",
              padding: "9px 14px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              gap: 7,
              alignItems: "center",
              borderLeft: `4px solid ${toast.type === "success" ? "#16a34a" : "#dc2626"}`,
              animation: "hero-carousel-toast-in .3s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={toast.type === "success" ? "M20 6L9 17l-5-5" : "M12 9v4M12 17h.01M10.29 3.86l-7.5 13A2 2 0 004.5 20h15a2 2 0 001.71-3l-7.5-13a2 2 0 00-3.42 0z"} />
            </svg>
            {toast.message}
          </div>
        )}

        <div
          style={{
            background: "#0f2a44",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Hero Carousel CMS</div>
            <div
              style={{
                display: "flex",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(22,163,74,.15)",
                color: "#16a34a",
                border: "1px solid rgba(22,163,74,.3)",
                fontSize: 11,
                fontWeight: 700,
                alignItems: "center",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
              Live sync
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => window.open("https://www.houznext.com", "_blank")}
              style={{
                background: "rgba(255,255,255,.1)",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,.2)",
                padding: "8px 12px",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12.5,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 11,
            padding: "13px 16px",
            margin: 20,
            display: "flex",
            gap: 9,
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.55,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8h.01M11 12h1v4h1" />
          </svg>
          <span>
            Only background images animate — headline, form, and buttons stay completely still. Upload images (JPG/WebP, 1440×520px or wider recommended). Drag rows to reorder. Publish live updates the website immediately.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 20px 11px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2a44" }}>Background images</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{slides.length} images · {activeCount} active</div>
        </div>

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 11 }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              ref={(node) => {
                rowRefs.current[slide.id] = node;
              }}
              draggable
              onDragStart={() => onDragStart(slide.id)}
              onDragOver={(e) => onDragOver(e, slide.id)}
              onDrop={() => onDrop(slide.id)}
              onDragLeave={() => setDragOverId((prev) => (prev === slide.id ? null : prev))}
              style={{
                background: dragOverId === slide.id ? "#fffbf0" : "#fff",
                border: `1.5px solid ${dragOverId === slide.id ? "#f2994a" : "#e2e8f0"}`,
                borderRadius: 13,
                padding: "13px 15px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all .2s",
                cursor: "grab",
                boxShadow: dragOverId === slide.id ? "0 4px 14px rgba(242,153,74,.14)" : "none",
                transform: dragOverId === slide.id ? "scale(1.01)" : "scale(1)",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 3,
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                {Array.from({ length: 6 }).map((_, dotIdx) => (
                  <span key={dotIdx} style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                ))}
              </div>

              <div
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: "50%",
                  background: slide.active ? "#f2994a" : "#0f2a44",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>

              <div
                style={{
                  width: 76,
                  height: 52,
                  borderRadius: 7,
                  overflow: "hidden",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${index + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <path d="M7 10l3-3 3 3 5-5 3 3" />
                    <path d="M12 3v9" />
                  </svg>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>
                      BACKGROUND IMAGE URL OR UPLOAD
                    </div>
                    <input
                      value={slide.imageUrl}
                      placeholder="Paste URL or click Upload"
                      onChange={(e) => void handleUrlChange(slide.id, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 7,
                        fontSize: 12.5,
                        color: "#0f2a44",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => inputRefs.current[slide.id]?.click()}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 7,
                      background: "#f0f7ff",
                      color: "#2f80ed",
                      border: "1.5px solid #bfdbfe",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Upload
                  </button>

                  <input
                    ref={(node) => {
                      inputRefs.current[slide.id] = node;
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      void handleUpload(slide.id, file);
                      e.currentTarget.value = "";
                    }}
                  />
                </div>

                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                  JPG / PNG / WebP · Recommended 1440×520px or wider
                </div>

                {uploading[slide.id] && (
                  <div style={{ width: "100%", background: "#e2e8f0", borderRadius: 3, height: 3, marginTop: 8 }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: "#2f80ed",
                        width: `${uploadProgress[slide.id] || 0}%`,
                        transition: "width .15s linear",
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <button
                  type="button"
                  title={slide.active ? "Deactivate" : "Activate"}
                  onClick={() => void toggleActive(slide.id)}
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 7,
                    border: `1.5px solid ${slide.active ? "#16a34a" : "#e2e8f0"}`,
                    background: slide.active ? "#dcfce7" : "#fff",
                    cursor: "pointer",
                    transition: "all .15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: slide.active ? "#16a34a" : "#94a3b8" }} />
                </button>

                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 7,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                    opacity: index === 0 ? 0.35 : 1,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={index === slides.length - 1}
                  onClick={() => moveDown(index)}
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 7,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    cursor: index === slides.length - 1 ? "not-allowed" : "pointer",
                    opacity: index === slides.length - 1 ? 0.35 : 1,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => void deleteSlide(slide.id)}
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 7,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={slides.length >= 6}
          title={slides.length >= 6 ? "Maximum 6 images allowed" : ""}
          onClick={() => void addSlide()}
          style={{
            width: "calc(100% - 40px)",
            margin: "16px 20px 0",
            border: "2px dashed #e2e8f0",
            background: "#fff",
            color: "#64748b",
            padding: 12,
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            cursor: slides.length >= 6 ? "not-allowed" : "pointer",
            opacity: slides.length >= 6 ? 0.6 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add new image
        </button>

        <div
          style={{
            margin: "16px 20px 0",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            padding: "15px 17px",
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: "#0f2a44", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 11 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10M18 20V4M6 20v-6" />
            </svg>
            Carousel settings
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Auto-advance every</div>
              <select value={settings.intervalMs} onChange={(e) => void updateSettings({ intervalMs: Number(e.target.value) })} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#0f2a44", background: "#fff", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={4000}>4s</option>
                <option value={5000}>5s</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Transition style</div>
              <select value={settings.transition} onChange={(e) => void updateSettings({ transition: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#0f2a44", background: "#fff", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                <option value="crossfade">Cross-fade</option>
                <option value="slide-left">Slide left</option>
              </select>
            </div>

            {[
              { key: "kenBurns", label: "Ken Burns zoom" },
              { key: "showArrows", label: "Show arrows" },
              { key: "showDots", label: "Show dots" },
              { key: "pauseOnHover", label: "Pause on hover" },
            ].map((item) => {
              const enabled = settings[item.key as keyof CarouselSettings] as boolean;
              return (
                <div key={item.key}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>{item.label}</div>
                  <button
                    type="button"
                    onClick={() => void updateSettings({ [item.key]: !enabled } as Partial<CarouselSettings>)}
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <span
                      style={{
                        width: 37,
                        height: 21,
                        borderRadius: 11,
                        background: enabled ? "#2f80ed" : "#e2e8f0",
                        position: "relative",
                        transition: "background .2s",
                        display: "inline-block",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: 2,
                          width: 17,
                          height: 17,
                          borderRadius: "50%",
                          background: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          transform: enabled ? "translateX(16px)" : "translateX(0)",
                          transition: "transform .2s",
                        }}
                      />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f2a44" }}>{enabled ? "Enabled" : "Disabled"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#fff",
            borderTop: "1.5px solid #e2e8f0",
            padding: "13px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <div style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 12, color: "#64748b" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
            Unsaved changes won&apos;t appear on the website
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => void saveDraft()}
              style={{
                background: "#2f80ed",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
              </svg>
              Save draft
            </button>

            <button
              type="button"
              onClick={() => void publishLive()}
              style={{
                background: "#16a34a",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Publish live
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAdminLayout(HeroCarouselPage);
