import React, { useCallback, useState } from "react";

export function Ico({
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

export const CMS_ANIM = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(10px) }
    to { opacity: 1; transform: translateX(0) }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1 }
    50% { opacity: 0.3 }
  }
`;

export const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 3,
};

export const inputStyle: React.CSSProperties = {
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
  boxSizing: "border-box",
};

export function bindFieldFocus(el: HTMLInputElement | HTMLTextAreaElement) {
  el.style.borderColor = "#2f80ed";
  el.style.background = "#f0f7ff";
  el.style.boxShadow = "0 0 0 2px rgba(47,128,237,0.08)";
}

export function bindFieldBlur(el: HTMLInputElement | HTMLTextAreaElement) {
  el.style.borderColor = "#e2e8f0";
  el.style.background = "#fff";
  el.style.boxShadow = "none";
}

export function bindFieldHover(el: HTMLInputElement | HTMLTextAreaElement) {
  if (document.activeElement !== el) el.style.borderColor = "#93c5fd";
}

export function bindFieldLeave(el: HTMLInputElement | HTMLTextAreaElement) {
  if (document.activeElement !== el) el.style.borderColor = "#e2e8f0";
}

export function CmsLabel({ children }: { children: React.ReactNode }) {
  return <div style={labelStyle}>{children}</div>;
}

export function CmsInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <CmsLabel>{label}</CmsLabel>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => bindFieldFocus(e.currentTarget)}
        onBlur={(e) => bindFieldBlur(e.currentTarget)}
        onMouseEnter={(e) => bindFieldHover(e.currentTarget)}
        onMouseLeave={(e) => bindFieldLeave(e.currentTarget)}
      />
    </div>
  );
}

export function CmsTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <CmsLabel>{label}</CmsLabel>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, resize: "vertical", minHeight: rows * 22 }}
        onFocus={(e) => bindFieldFocus(e.currentTarget)}
        onBlur={(e) => bindFieldBlur(e.currentTarget)}
        onMouseEnter={(e) => bindFieldHover(e.currentTarget)}
        onMouseLeave={(e) => bindFieldLeave(e.currentTarget)}
      />
    </div>
  );
}

export function CmsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: 13,
        padding: 16,
        marginBottom: 11,
        transition: "all 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#93c5fd";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(47,128,237,0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}

export function CmsSectionTitle({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: "#0f2a44" }}>{title}</span>
      {badge ? (
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
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function CmsMiniPreview({
  label,
  children,
  dark = false,
}: {
  label: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        Live preview — {label}
      </div>
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1.5px solid #e2e8f0",
          background: dark ? "linear-gradient(165deg, #0f2a44 0%, #1a3d5c 60%, #0d2538 100%)" : "#f8fafc",
          padding: dark ? "18px 16px" : "14px 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CmsToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <CmsLabel>{label}</CmsLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
        <div
          role="switch"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange(!checked);
            }
          }}
          onClick={() => onChange(!checked)}
          style={{
            width: 37,
            height: 21,
            borderRadius: 11,
            background: checked ? "#2f80ed" : "#e2e8f0",
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
              transform: checked ? "translateX(16px)" : "translateX(0)",
              transition: "transform 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f2a44" }}>
          {checked ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}

export function CmsSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
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

export function CmsToast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
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
      {message}
    </div>
  );
}

export function useCmsToast() {
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2800);
  }, []);

  return { toastMsg, toastVisible, showToast };
}

export function CmsPageHeader({
  title,
  previewUrl,
  onPreview,
  onSaveDraft,
  isSaving,
  liveLabel = "Live sync",
}: {
  title: string;
  previewUrl?: string;
  onPreview?: () => void;
  onSaveDraft: () => void;
  isSaving: boolean;
  liveLabel?: string;
}) {
  return (
    <div
      style={{
        background: "#0f2a44",
        padding: "13px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Ico d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6" size={14} stroke="#fff" sw={1.8} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{title}</span>
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
          {liveLabel}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => (onPreview ? onPreview() : previewUrl && window.open(previewUrl, "_blank"))}
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
          }}
        >
          <Ico d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6" size={12} stroke="currentColor" />
          Preview page
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
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
          }}
        >
          <Ico d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21V13H7v8M7 3v5h8" size={12} stroke="#fff" />
          {isSaving ? "Saving..." : "Save draft"}
        </button>
      </div>
    </div>
  );
}

export function CmsStickyFooter({
  dirty,
  isSaving,
  onSaveDraft,
  onPublish,
}: {
  dirty: boolean;
  isSaving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
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
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 11.5, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
        <Ico d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 8v4M12 16h.01" size={12} stroke="#64748b" />
        {dirty ? "You have unsaved changes" : "All changes saved to draft"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onSaveDraft}
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
          }}
        >
          <Ico d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21V13H7v8M7 3v5h8" size={12} stroke="#fff" />
          {isSaving ? "Saving..." : "Save draft"}
        </button>
        <button
          type="button"
          onClick={onPublish}
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
          }}
        >
          Publish live →
        </button>
      </div>
    </div>
  );
}
