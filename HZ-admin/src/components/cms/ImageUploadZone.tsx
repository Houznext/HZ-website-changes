import React, { useRef, useState } from "react";
import { uploadFile } from "@/src/utils/uploadFile";
import toast from "react-hot-toast";

interface Props {
  value: string;
  folder: string;
  label: string;
  hint?: string;
  height?: number;
  aspectRatio?: string;
  onUpload: (url: string) => void;
}

export default function ImageUploadZone({
  value,
  folder,
  label,
  hint,
  height = 110,
  aspectRatio,
  onUpload,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      toast.error("Only JPG, PNG, WebP or GIF allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large — max 10 MB");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFile(
        file,
        folder,
        undefined,
        undefined,
        (p) => setProgress(p),
      );
      if (url) {
        onUpload(url);
        toast.success("Image uploaded ✓");
      } else {
        toast.error("Upload failed — try again");
      }
    } catch {
      toast.error("Upload error — check connection");
    } finally {
      setUploading(false);
      setProgress(0);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) ref.current?.click();
          }
        }}
        onClick={() => !uploading && ref.current?.click()}
        className={`
          border-2 border-dashed border-[#bfdbfe] bg-[#f0f7ff] rounded-[10px]
          flex flex-col items-center justify-center gap-2 text-center
          transition-all duration-200 cursor-pointer
          hover:border-[#2f80ed] hover:bg-[#dbeafe]
          ${uploading ? "opacity-60 cursor-wait" : ""}
        `}
        style={{
          height,
          aspectRatio: aspectRatio ?? "auto",
          minHeight: height,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {value && !uploading ? (
          <>
            <img
              src={value}
              alt="uploaded"
              className="absolute inset-0 w-full h-full object-cover rounded-[8px]"
            />
            <div className="absolute inset-0 bg-[rgba(15,42,68,0.55)] flex flex-col items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity rounded-[8px]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-[11px] font-bold text-white">
                Change image
              </span>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2 px-4 w-full">
            <div className="w-full bg-[#e2e8f0] rounded-full h-[4px] overflow-hidden">
              <div
                className="h-full bg-[#2f80ed] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#2f80ed]">
              Uploading {progress}%
            </span>
          </div>
        ) : (
          <>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2f80ed"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[11px] font-bold text-[#2f80ed]">
              {label}
            </span>
            {hint && (
              <span className="text-[10px] text-[#94a3b8]">{hint}</span>
            )}
          </>
        )}
      </div>
    </>
  );
}
