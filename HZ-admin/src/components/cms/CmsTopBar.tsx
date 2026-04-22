import React from "react";

interface Props {
  title: string;
  subtitle: string;
  previewUrl: string;
  isSaving: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export default function CmsTopBar({
  title,
  subtitle,
  previewUrl,
  isSaving,
  isPublishing,
  onSaveDraft,
  onPublish,
}: Props) {
  return (
    <div className="h-[54px] bg-white border-b border-[#e2e8f0] flex items-center px-5 gap-3 flex-shrink-0">
      <div>
        <h1 className="font-head font-bold text-[15px] text-[#0f2a44]">
          {title}
        </h1>
        <p className="text-[12px] text-[#5a6a7e]">{subtitle}</p>
      </div>
      <div className="ml-auto flex gap-2 items-center">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse inline-block" />
          Live sync
        </span>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-[#0f2a44] border border-[#e2e8f0] hover:border-[#93c5fd] hover:bg-[#e8f1fd] transition-all"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview site
        </a>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-[#0f2a44] border border-[#e2e8f0] hover:border-[#93c5fd] hover:bg-[#e8f1fd] transition-all disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#16a34a] text-white hover:bg-[#15803d] transition-all hover:-translate-y-px disabled:opacity-50"
        >
          {isPublishing ? "Publishing…" : "Publish live"}
        </button>
      </div>
    </div>
  );
}
