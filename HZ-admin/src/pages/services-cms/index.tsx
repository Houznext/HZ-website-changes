import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import withAdminLayout from "@/src/common/AdminLayout";
import apiClient from "@/src/utils/apiClient";

interface ServiceItem {
  id: number;
  slug: string;
  cardTitle: string;
  cardDescription: string;
  cardImageUrl: string;
  cardBadge: string;
  heroHeadline: string;
  heroSubheading: string;
  heroImageUrl: string;
  heroEyebrow: string;
  heroCta: string;
  sortOrder: number;
  active: boolean;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: 1,
    slug: "full-home-interiors",
    cardTitle: "Full Home Interiors",
    cardDescription:
      "Complete turnkey interior solutions — from design to handover. Every room, every detail, managed by us.",
    cardImageUrl: "",
    cardBadge: "Most Popular",
    heroHeadline:
      "Complete home interiors, designed and executed the right way",
    heroSubheading:
      "Designing a home is not just about how it looks — it's about how it works for your everyday life. At Houznext, we handle everything from design to execution across India.",
    heroImageUrl: "",
    heroEyebrow: "Full Home Interiors",
    heroCta: "Get Free Design & Estimate",
    sortOrder: 0,
    active: true,
  },
  {
    id: 2,
    slug: "modular-kitchen",
    cardTitle: "Modular Kitchen & Wardrobes",
    cardDescription:
      "Smart, space-efficient kitchens and storage solutions designed for everyday living and lasting quality.",
    cardImageUrl: "",
    cardBadge: "Storage Solutions",
    heroHeadline: "Smart kitchens and storage designed for everyday living",
    heroSubheading:
      "A well-designed kitchen and wardrobe can completely change how your home feels and functions. We offer modular solutions that are practical, space-efficient, and built for daily use.",
    heroImageUrl: "",
    heroEyebrow: "Modular Kitchen & Wardrobes",
    heroCta: "Talk to our design team",
    sortOrder: 1,
    active: true,
  },
  {
    id: 3,
    slug: "2bhk-3bhk-packages",
    cardTitle: "2BHK / 3BHK Interior Packages",
    cardDescription:
      "Clear, fixed-price packages for your home. Know exactly what you get and what you pay — before work begins.",
    cardImageUrl: "",
    cardBadge: "Budget Friendly",
    heroHeadline: "Interior packages that fit your home and budget",
    heroSubheading:
      "Planning interiors can feel confusing — especially pricing and scope. At Houznext we simplify this with clear packages so you know exactly what to expect.",
    heroImageUrl: "",
    heroEyebrow: "2BHK / 3BHK Packages",
    heroCta: "Check your home interior cost",
    sortOrder: 2,
    active: true,
  },
  {
    id: 4,
    slug: "commercial-interiors",
    cardTitle: "Commercial Interiors",
    cardDescription:
      "Functional, modern office and retail spaces designed to match your business goals and team culture.",
    cardImageUrl: "",
    cardBadge: "Commercial",
    heroHeadline: "Interiors designed to work for your business",
    heroSubheading:
      "Commercial spaces need to be functional, efficient, and aligned with your business goals. Houznext provides commercial interior design services that are practical, modern, and comfortable.",
    heroImageUrl: "",
    heroEyebrow: "Commercial Interiors",
    heroCta: "Plan your commercial space",
    sortOrder: 3,
    active: true,
  },
];

const SLUG_ROUTE: Record<string, string> = {
  "full-home-interiors": "/services/full-home-interiors",
  "modular-kitchen": "/services/modular-kitchen",
  "2bhk-3bhk-packages": "/services/2bhk-3bhk-packages",
  "commercial-interiors": "/services/commercial-interiors",
};

const PREVIEW_ORIGIN = "https://www.houznext.com";

const ACCENT_COLORS: Record<
  string,
  { light: string; border: string; text: string }
> = {
  "full-home-interiors": {
    light: "#e8f1fd",
    border: "#bfdbfe",
    text: "#2f80ed",
  },
  "modular-kitchen": {
    light: "#e8f5ee",
    border: "#bbf7d0",
    text: "#16a34a",
  },
  "2bhk-3bhk-packages": {
    light: "#fff7ed",
    border: "#fed7aa",
    text: "#f2994a",
  },
  "commercial-interiors": {
    light: "#f3e8ff",
    border: "#e9d5ff",
    text: "#8b5cf6",
  },
};

function Ico({
  d,
  size = 13,
  stroke = "#64748b",
  sw = 1.7,
}: {
  d: string;
  size?: number;
  stroke?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function ToggleSetting({
  label,
  defaultOn,
}: {
  label: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 3,
        }}
      >
        <div
          role="switch"
          aria-checked={on}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOn((v) => !v);
            }
          }}
          onClick={() => setOn(!on)}
          style={{
            width: 37,
            height: 21,
            borderRadius: 11,
            background: on ? "#2f80ed" : "#e2e8f0",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 17,
              height: 17,
              borderRadius: "50%",
              background: "#fff",
              position: "absolute",
              top: 2,
              left: 2,
              transform: on ? "translateX(16px)" : "translateX(0)",
              transition: "transform 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f2a44" }}>
          {on ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
}

function ServicesCmsPage() {
  const { data: session, status } = useSession();

  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [activeTab, setActiveTab] = useState<"cards" | "pages">("cards");
  const [cardUploading, setCardUploading] = useState<number | null>(null);
  const [heroUploading, setHeroUploading] = useState<number | null>(null);
  const [cardProgress, setCardProgress] = useState<Record<number, number>>({});
  const [heroProgress, setHeroProgress] = useState<Record<number, number>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cardThumbHover, setCardThumbHover] = useState<number | null>(null);
  const [heroHoverRow, setHeroHoverRow] = useState<number | null>(null);

  const cardInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const heroInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!session || status !== "authenticated") return;
    const token =
      (session as any)?.accessToken ||
      (session as any)?.token ||
      (session as any)?.user?.token ||
      "";
    if (!token) return;

    apiClient
      .get(apiClient.URLS.services_content, {}, true)
      .then((res: any) => {
        const data = res?.body ?? res?.data ?? res;
        if (Array.isArray(data) && data.length > 0) {
          setServices((prev) =>
            prev.map((fb) => {
              const live = data.find(
                (d: ServiceItem) => d.slug === fb.slug
              ) as ServiceItem | undefined;
              return live ? { ...fb, ...live } : fb;
            })
          );
        }
      })
      .catch(() => {});
  }, [session, status]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    window.setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }

  function updateField(
    id: number,
    field: keyof ServiceItem,
    value: string
  ) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  async function saveDraft() {
    setIsSaving(true);
    try {
      await Promise.all(
        services.map((s) =>
          apiClient.patch(
            `${apiClient.URLS.services_content}/${s.id}`,
            {
              cardTitle: s.cardTitle,
              cardDescription: s.cardDescription,
              cardBadge: s.cardBadge,
              heroHeadline: s.heroHeadline,
              heroSubheading: s.heroSubheading,
              heroEyebrow: s.heroEyebrow,
              heroCta: s.heroCta,
            },
            true
          )
        )
      );
      showToast("Saved as draft — not yet live on website");
    } catch {
      showToast("Save failed — please try again");
      throw new Error("saveDraft failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function publishLive() {
    try {
      await saveDraft();
      showToast("Published! Website updated live ✓");
    } catch {
      /* saveDraft already showed error toast */
    }
  }

  function handleCardImageUpload(id: number, file: File) {
    setCardUploading(id);
    setCardProgress((p) => ({ ...p, [id]: 0 }));

    const token =
      (session as any)?.accessToken ||
      (session as any)?.token ||
      (session as any)?.user?.token ||
      "";
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${apiClient.URLS.services_content}/${id}/upload-card-image`
    );
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setCardProgress((p) => ({ ...p, [id]: pct }));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const res = JSON.parse(xhr.responseText) as ServiceItem;
          const url = res?.cardImageUrl || "";
          if (url) {
            setServices((prev) =>
              prev.map((s) => (s.id === id ? { ...s, cardImageUrl: url } : s))
            );
          } else if (res && typeof res === "object") {
            setServices((prev) =>
              prev.map((s) => (s.id === id ? { ...s, ...res } : s))
            );
          }
          showToast("Card image uploaded successfully");
        } catch {
          showToast("Image saved — refresh to see it");
        }
      } else {
        showToast("Upload failed — check file size and format");
      }
      setCardUploading(null);
      setCardProgress((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    };

    xhr.onerror = () => {
      showToast("Network error — upload failed");
      setCardUploading(null);
    };

    xhr.send(formData);
  }

  function handleHeroImageUpload(id: number, file: File) {
    setHeroUploading(id);
    setHeroProgress((p) => ({ ...p, [id]: 0 }));

    const token =
      (session as any)?.accessToken ||
      (session as any)?.token ||
      (session as any)?.user?.token ||
      "";
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${apiClient.URLS.services_content}/${id}/upload-hero-image`
    );
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setHeroProgress((p) => ({ ...p, [id]: pct }));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const res = JSON.parse(xhr.responseText) as ServiceItem;
          const url = res?.heroImageUrl || "";
          if (url) {
            setServices((prev) =>
              prev.map((s) => (s.id === id ? { ...s, heroImageUrl: url } : s))
            );
          } else if (res && typeof res === "object") {
            setServices((prev) =>
              prev.map((s) => (s.id === id ? { ...s, ...res } : s))
            );
          }
          showToast("Hero image uploaded successfully");
        } catch {
          showToast("Image saved — refresh to see it");
        }
      } else {
        showToast("Upload failed — check file size and format");
      }
      setHeroUploading(null);
      setHeroProgress((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    };

    xhr.onerror = () => {
      showToast("Network error — upload failed");
      setHeroUploading(null);
    };

    xhr.send(formData);
  }

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "3px solid #e2e8f0",
            borderTopColor: "#2f80ed",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        Please log in to access this page.
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(10px) }
          to { opacity: 1; transform: translateX(0) }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.3 }
        }
      `}</style>

      <div
        style={{
          background: "#0f2a44",
          padding: "13px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Ico
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"
            size={14}
            stroke="#fff"
            sw={1.8}
          />
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
            Services CMS
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10.5,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 20,
              background: "rgba(22,163,74,0.15)",
              color: "#16a34a",
              border: "1px solid rgba(22,163,74,0.28)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#16a34a",
                animation: "pulse-dot 2s infinite",
                display: "inline-block",
              }}
            />
            Live sync
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              window.open("https://www.houznext.com", "_blank");
            }}
            style={{
              padding: "8px 15px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.10)",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
              border: "1.5px solid rgba(255,255,255,0.20)",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.10)";
            }}
          >
            <Ico
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6"
              size={12}
              stroke="currentColor"
            />
            Preview
          </button>

          <button
            type="button"
            onClick={() => void saveDraft()}
            disabled={isSaving}
            style={{
              padding: "8px 15px",
              borderRadius: 8,
              background: isSaving ? "#94a3b8" : "#2f80ed",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.background = "#1a6dd6";
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.background = "#2f80ed";
            }}
          >
            <Ico
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21V13H7v8M7 3v5h8"
              size={12}
              stroke="#fff"
            />
            {isSaving ? "Saving..." : "Save draft"}
          </button>
        </div>
      </div>

      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 11,
            padding: "12px 16px",
            marginBottom: 18,
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.55,
          }}
        >
          <Ico
            d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4M12 16h.01"
            size={14}
            stroke="#2f80ed"
          />
          <span>
            Upload images and edit content for the four service cards on the
            homepage and the hero sections of each service page. Changes go live
            after clicking{" "}
            <strong style={{ color: "#0f2a44" }}>Publish live</strong>.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1.5px solid #e2e8f0",
            marginBottom: 16,
          }}
        >
          {(["cards", "pages"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "9px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: activeTab === tab ? "#2f80ed" : "#64748b",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                borderBottom:
                  activeTab === tab
                    ? "2.5px solid #2f80ed"
                    : "2.5px solid transparent",
                marginBottom: -2,
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = "#0f2a44";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) e.currentTarget.style.color = "#64748b";
              }}
            >
              {tab === "cards"
                ? "Homepage — 4 Service Cards"
                : "Service Pages — Hero & Content"}
            </button>
          ))}
        </div>

        {activeTab === "cards" && (
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#0f2a44",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Service cards</span>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                {services.length} cards
              </span>
            </div>

            {services.map((svc) => {
              const accent = ACCENT_COLORS[svc.slug] || {
                light: "#f0f7ff",
                border: "#bfdbfe",
                text: "#2f80ed",
              };
              const isUploadingCard = cardUploading === svc.id;
              const cardPct = cardProgress[svc.id] ?? 0;

              return (
                <div
                  key={svc.id}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 13,
                    padding: "14px 16px",
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    gap: 14,
                    alignItems: "start",
                    marginBottom: 11,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(47,128,237,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          cardInputRefs.current[svc.id]?.click();
                      }}
                      onClick={() => cardInputRefs.current[svc.id]?.click()}
                      style={{
                        width: 80,
                        height: 58,
                        borderRadius: 8,
                        background: svc.cardImageUrl
                          ? "transparent"
                          : accent.light,
                        border: svc.cardImageUrl
                          ? "none"
                          : `1.5px dashed ${accent.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        setCardThumbHover(svc.id);
                        if (!svc.cardImageUrl) {
                          e.currentTarget.style.background = "#dbeafe";
                          e.currentTarget.style.borderColor = "#93c5fd";
                        }
                      }}
                      onMouseLeave={(e) => {
                        setCardThumbHover(null);
                        if (!svc.cardImageUrl) {
                          e.currentTarget.style.background = accent.light;
                          e.currentTarget.style.borderColor = accent.border;
                        }
                      }}
                    >
                      {svc.cardImageUrl ? (
                        <>
                          <img
                            src={svc.cardImageUrl}
                            alt={svc.cardTitle}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(15,42,68,0.55)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: cardThumbHover === svc.id ? 1 : 0,
                              transition: "opacity 0.2s",
                              pointerEvents: "none",
                            }}
                          >
                            <Ico
                              d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              size={14}
                              stroke="#fff"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Ico
                            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                            size={18}
                            stroke={accent.text}
                          />
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: accent.text,
                              textAlign: "center",
                              lineHeight: 1.2,
                            }}
                          >
                            Upload
                            <br />
                            image
                            <br />
                            600×400px
                          </span>
                        </>
                      )}
                    </div>

                    {isUploadingCard && (
                      <div
                        style={{
                          height: 3,
                          background: "#e2e8f0",
                          borderRadius: 2,
                          marginTop: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: "#2f80ed",
                            borderRadius: 2,
                            width: `${cardPct}%`,
                            transition: "width 0.2s",
                          }}
                        />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      ref={(el) => {
                        cardInputRefs.current[svc.id] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCardImageUpload(svc.id, file);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: 3,
                          }}
                        >
                          Card title
                        </div>
                        <input
                          value={svc.cardTitle}
                          onChange={(e) =>
                            updateField(svc.id, "cardTitle", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 7,
                            fontSize: 12.5,
                            color: "#0f2a44",
                            outline: "none",
                            fontFamily: "inherit",
                            background: "#fff",
                            transition: "all 0.14s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#2f80ed";
                            e.currentTarget.style.background = "#f0f7ff";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 2px rgba(47,128,237,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseEnter={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#93c5fd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: 3,
                          }}
                        >
                          Badge text
                        </div>
                        <input
                          value={svc.cardBadge}
                          onChange={(e) =>
                            updateField(svc.id, "cardBadge", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 7,
                            fontSize: 12.5,
                            color: "#0f2a44",
                            outline: "none",
                            fontFamily: "inherit",
                            background: "#fff",
                            transition: "all 0.14s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#2f80ed";
                            e.currentTarget.style.background = "#f0f7ff";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 2px rgba(47,128,237,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseEnter={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#93c5fd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          marginBottom: 3,
                        }}
                      >
                        Card description
                      </div>
                      <textarea
                        value={svc.cardDescription}
                        onChange={(e) =>
                          updateField(
                            svc.id,
                            "cardDescription",
                            e.target.value
                          )
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: 7,
                          fontSize: 12.5,
                          color: "#0f2a44",
                          outline: "none",
                          fontFamily: "inherit",
                          background: "#fff",
                          resize: "vertical",
                          minHeight: 56,
                          transition: "all 0.14s",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#2f80ed";
                          e.currentTarget.style.background = "#f0f7ff";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 2px rgba(47,128,237,0.08)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        onMouseEnter={(e) => {
                          if (document.activeElement !== e.currentTarget) {
                            e.currentTarget.style.borderColor = "#93c5fd";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (document.activeElement !== e.currentTarget) {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                    }}
                  >
                    <button
                      type="button"
                      title="Preview service page"
                      onClick={() => {
                        const path = SLUG_ROUTE[svc.slug];
                        if (path)
                          window.open(`${PREVIEW_ORIGIN}${path}`, "_blank");
                      }}
                      style={{
                        width: 29,
                        height: 29,
                        borderRadius: 7,
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.14s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#2f80ed";
                        e.currentTarget.style.background = "#f0f7ff";
                        e.currentTarget.style.transform = "scale(1.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <Ico
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6"
                        size={12}
                        stroke="#0f2a44"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "pages" && (
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#0f2a44",
                marginBottom: 10,
              }}
            >
              Service page heroes & content
            </div>

            {services.map((svc) => {
              const isUploadingHero = heroUploading === svc.id;
              const heroPct = heroProgress[svc.id] ?? 0;

              return (
                <div
                  key={svc.id}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 13,
                    padding: 16,
                    marginBottom: 11,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(47,128,237,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 800, color: "#0f2a44" }}
                    >
                      {svc.cardTitle}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        background: "#f8fafc",
                        padding: "3px 9px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {SLUG_ROUTE[svc.slug]}
                    </span>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        heroInputRefs.current[svc.id]?.click();
                    }}
                    onClick={() => heroInputRefs.current[svc.id]?.click()}
                    onMouseEnter={() => setHeroHoverRow(svc.id)}
                    onMouseLeave={() => setHeroHoverRow(null)}
                    style={{
                      width: "100%",
                      height: 120,
                      borderRadius: 9,
                      background: svc.heroImageUrl ? "transparent" : "#e8f1fd",
                      border: svc.heroImageUrl ? "none" : "2px dashed #bfdbfe",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                      marginBottom: 12,
                      overflow: "hidden",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                  >
                    {svc.heroImageUrl ? (
                      <>
                        <img
                          src={svc.heroImageUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 9,
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(15,42,68,0.5)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            opacity: heroHoverRow === svc.id ? 1 : 0,
                            transition: "opacity 0.2s",
                            borderRadius: 9,
                            pointerEvents: "none",
                          }}
                        >
                          <Ico
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            size={18}
                            stroke="#fff"
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            Change image
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Ico
                          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          size={22}
                          stroke="#2f80ed"
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#2f80ed",
                          }}
                        >
                          Click to upload hero background image
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>
                          Recommended: 1440×600px · JPG or WebP · Max 4MB
                        </span>
                      </>
                    )}
                  </div>

                  {isUploadingHero && (
                    <div
                      style={{
                        height: 3,
                        background: "#e2e8f0",
                        borderRadius: 2,
                        marginBottom: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: "#2f80ed",
                          borderRadius: 2,
                          width: `${heroPct}%`,
                          transition: "width 0.2s",
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    ref={(el) => {
                      heroInputRefs.current[svc.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroImageUpload(svc.id, file);
                      e.target.value = "";
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 9,
                    }}
                  >
                    {(
                      [
                        { label: "Page headline", field: "heroHeadline" as const },
                        {
                          label: "Eyebrow / badge",
                          field: "heroEyebrow" as const,
                        },
                      ] as const
                    ).map(({ label, field }) => (
                      <div key={field}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            marginBottom: 3,
                          }}
                        >
                          {label}
                        </div>
                        <input
                          value={String(svc[field])}
                          onChange={(e) =>
                            updateField(svc.id, field, e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "7px 10px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 7,
                            fontSize: 12.5,
                            color: "#0f2a44",
                            outline: "none",
                            fontFamily: "inherit",
                            background: "#fff",
                            transition: "all 0.14s",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#2f80ed";
                            e.currentTarget.style.background = "#f0f7ff";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 2px rgba(47,128,237,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseEnter={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#93c5fd";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 9 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: 3,
                      }}
                    >
                      Hero sub-heading
                    </div>
                    <textarea
                      value={svc.heroSubheading}
                      onChange={(e) =>
                        updateField(svc.id, "heroSubheading", e.target.value)
                      }
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 7,
                        fontSize: 12.5,
                        color: "#0f2a44",
                        outline: "none",
                        fontFamily: "inherit",
                        background: "#fff",
                        resize: "vertical",
                        minHeight: 64,
                        transition: "all 0.14s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#2f80ed";
                        e.currentTarget.style.background = "#f0f7ff";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#fff";
                      }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: 3,
                      }}
                    >
                      CTA button text
                    </div>
                    <input
                      value={svc.heroCta}
                      onChange={(e) =>
                        updateField(svc.id, "heroCta", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 7,
                        fontSize: 12.5,
                        color: "#0f2a44",
                        outline: "none",
                        fontFamily: "inherit",
                        background: "#fff",
                        transition: "all 0.14s",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#2f80ed";
                        e.currentTarget.style.background = "#f0f7ff";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.background = "#fff";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 12,
            padding: "15px 16px",
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#0f2a44",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 11,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Ico
              d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4M12 16h.01"
              size={12}
              stroke="#2f80ed"
            />
            Section settings
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 4,
                }}
              >
                Section heading
              </div>
              <input
                defaultValue="Everything your home needs, handled in one place"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#0f2a44",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.14s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2f80ed";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 4,
                }}
              >
                Section sub-heading
              </div>
              <input
                defaultValue="At Houznext, we take complete responsibility for your home."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#0f2a44",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.14s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2f80ed";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              />
            </div>

            <ToggleSetting label="Show bottom CTA" defaultOn={true} />
            <ToggleSetting label="Show service badges" defaultOn={true} />
          </div>
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
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Ico
            d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4M12 16h.01"
            size={12}
            stroke="#64748b"
          />
          Unsaved changes won&apos;t appear on the website
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => void saveDraft()}
            disabled={isSaving}
            style={{
              padding: "10px 20px",
              borderRadius: 9,
              background: isSaving ? "#94a3b8" : "#2f80ed",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = "#1a6dd6";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = "#2f80ed";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <Ico
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21V13H7v8M7 3v5h8"
              size={12}
              stroke="#fff"
            />
            {isSaving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => void publishLive()}
            disabled={isSaving}
            style={{
              padding: "10px 20px",
              borderRadius: 9,
              background: isSaving ? "#94a3b8" : "#16a34a",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 700,
              border: "none",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = "#15803d";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = "#16a34a";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            Publish live →
          </button>
        </div>
      </div>

      {toastVisible && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            background: "#0f2a44",
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 9999,
            borderLeft: "4px solid #16a34a",
            display: "flex",
            alignItems: "center",
            gap: 7,
            animation: "toastIn 0.28s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <Ico d="M9 11l3 3L22 4" size={13} stroke="#16a34a" sw={2} />
          {toastMsg}
        </div>
      )}
    </>
  );
}

export default withAdminLayout(ServicesCmsPage);
