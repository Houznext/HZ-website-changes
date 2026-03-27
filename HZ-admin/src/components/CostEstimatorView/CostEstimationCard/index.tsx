import { useRouter } from "next/router";
import Modal from "@/src/common/Modal";
import { useState } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import { CEcardProps } from "..";
import { usePermissionStore } from "@/src/stores/usePermissions";

const CostEstimationCard = ({ key, data, onDuplicate, onEdit, onDelete, activeTab }: CEcardProps) => {
  const router = useRouter();
  const { hasPermission } = usePermissionStore((s) => s);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDuplicate = () => setDuplicateModal(true);

  const handleConfirm = async (dataToDup: any) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDuplicate(dataToDup);
      setDuplicateModal(false);
    } catch (err) {
      toast.error("Failed to duplicate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(data.id);
      setDeleteModal(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const netTotal =
    (Number(data?.subTotal) || 0) - (Number(data?.discount) || 0);

  const quotationNum = (data as any)?.quotationNumber;
  const displayQN = quotationNum
    ? `QT-${String(quotationNum).padStart(4, "0")}`
    : (data as any)?.displayQuotationNumber ?? null;

  return (
    <div
      className="group relative bg-white border border-[#eaeef2] rounded-[12px] overflow-hidden
                 transition-all duration-200 ease-out
                 hover:border-[#d0d7de] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-px
                 mb-2"
      key={key}
    >
      {/* Left accent bar — slides in on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2f80ed] rounded-l-[12px]
                   scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"
      />

      {/* Card grid: image | body */}
      <div className="grid" style={{ gridTemplateColumns: "140px 1fr" }}>
        {/* Image panel */}
        <div className="relative overflow-hidden bg-[#eaf1fd]">
          {data?.property_image ? (
            <img
              src={data.property_image}
              alt="Property"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ minHeight: "140px" }}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full gap-2"
              style={{ minHeight: "140px" }}
            >
              {/* No-photo placeholder */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8c959f"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[10px] text-[#8c959f]">No photos</span>
            </div>
          )}

          {/* Status badge top-right of image */}
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#dcfce7] text-[#166534]">
              <span className="w-[5px] h-[5px] rounded-full bg-[#16a34a] animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5 flex flex-col gap-0 min-w-0">
          {/* Top: name + amount */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="min-w-0 flex-1">
              <h3 className="text-[14.5px] font-bold text-[#24292f] tracking-tight leading-tight truncate">
                {data?.firstname} {data?.lastname}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11.5px] text-[#8c959f]">
                <span className="truncate max-w-[180px]">{data?.email}</span>
                {data?.phone && (
                  <>
                    <span className="text-[#d0d7de]">·</span>
                    <span>{data.phone}</span>
                  </>
                )}
                {data?.date && (
                  <>
                    <span className="text-[#d0d7de]">·</span>
                    <span>
                      {new Date(data.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Amount block */}
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-[17px] font-bold text-[#2f80ed] tracking-tight tabular-nums">
                ₹{netTotal.toLocaleString("en-IN")}
              </div>
              {Number(data?.discount) > 0 && (
                <div className="text-[10px] text-[#8c959f] mt-0.5">
                  after ₹{Number(data.discount).toLocaleString("en-IN")}{" "}
                  discount
                </div>
              )}
              {displayQN && (
                <div className="text-[10px] font-mono text-[#8c959f] mt-1">
                  {displayQN}
                </div>
              )}
            </div>
          </div>

          {/* Pills row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            {data?.location?.city && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f6f8fa] border border-[#eaeef2] rounded-full text-[11px] text-[#57606a]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <strong className="text-[#24292f]">
                  {data.location.city}
                  {data.location.state ? `, ${data.location.state}` : ""}
                </strong>
              </span>
            )}
            {data?.bhk && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f6f8fa] border border-[#eaeef2] rounded-full text-[11px] text-[#57606a]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <strong className="text-[#24292f]">{data.bhk}</strong>
                {(data as any)?.property_type
                  ? ` · ${(data as any).property_type}`
                  : ""}
              </span>
            )}
            {data?.designerName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f6f8fa] border border-[#eaeef2] rounded-full text-[11px] text-[#57606a]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[#24292f]">{data.designerName}</span>
              </span>
            )}
            {(data as any)?.workType && (
              <span className="inline-flex items-center px-2 py-0.5 bg-[#f6f8fa] border border-[#eaeef2] rounded-full text-[11px] text-[#57606a]">
                {(data as any).workType}
              </span>
            )}
          </div>

          {/* Thin animated progress bar */}
          <div className="h-[2px] bg-[#eaeef2] rounded-full mb-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2f80ed] to-[#60a5fa] rounded-full w-0
                          group-hover:w-[60%] transition-all duration-700 ease-out"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            {/* Left: primary actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() =>
                  router.push(`/cost-estimator/${activeTab}/${data.id}`)
                }
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2f80ed] hover:bg-[#1a6dd6]
                           text-white text-[12px] font-semibold transition-all duration-150
                           shadow-[0_1px_3px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_12px_rgba(47,128,237,0.4)]
                           hover:-translate-y-px active:translate-y-0"
              >
                View details
              </button>

              {/* Edit */}
              <button
                onClick={() => onEdit(data)}
                disabled={!hasPermission("cost_estimator", "edit")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#f6f8fa]
                           border border-[#d0d7de] text-[#57606a] hover:text-[#24292f] text-[12px] font-medium
                           transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Edit quotation"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>

              <button
                onClick={handleDuplicate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#f6f8fa]
                           border border-[#d0d7de] text-[#57606a] hover:text-[#24292f] text-[12px] font-medium
                           transition-all duration-150"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>
            </div>

            {/* Right: download + delete — fade in on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() =>
                  router.push(
                    `/cost-estimator/${activeTab}/${data.id}?download=1`,
                  )
                }
                className="w-[30px] h-[30px] rounded-lg border border-[#d0d7de] bg-white hover:bg-[#f6f8fa]
                           flex items-center justify-center text-[#57606a] hover:text-[#24292f] transition-all"
                title="Download PDF"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => setDeleteModal(true)}
                disabled={!hasPermission("cost_estimator", "delete")}
                className="w-[30px] h-[30px] rounded-lg border border-[#fca5a5] bg-[#fee2e2] hover:bg-[#fecaca]
                           flex items-center justify-center text-[#dc2626] transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed"
                title="Delete quotation"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        title=""
        className="md:max-w-[400px] max-w-[340px] rounded-[14px] shadow-2xl"
        rootCls="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <h3 className="text-[17px] font-bold text-[#24292f]">Confirm Deletion</h3>
          <p className="text-[12.5px] text-[#57606a] leading-relaxed max-w-[280px]">
            Are you sure you want to delete this quotation? This action cannot be undone.
          </p>
          <div className="mt-2 flex w-full gap-2.5">
            <button
              onClick={() => setDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 py-2 rounded-[8px] border border-[#d0d7de] bg-white
                         text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                         transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 py-2 rounded-[8px] bg-[#fee2e2] hover:bg-[#fecaca] border border-[#fca5a5]
                         text-[13px] font-semibold text-[#dc2626]
                         flex items-center justify-center gap-2
                         transition-all disabled:opacity-60"
            >
              {isDeleting && <LoaderIcon />}
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Duplicate Modal — all logic unchanged, only restyled */}
      <Modal
        isOpen={duplicateModal}
        closeModal={() => setDuplicateModal(false)}
        title=""
        className="md:max-w-[420px] max-w-[340px] rounded-[14px] shadow-2xl"
        rootCls="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center text-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2f80ed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>

          <h3 className="text-[17px] font-bold text-[#24292f]">
            Confirm Duplication
          </h3>

          <p className="text-[12.5px] text-[#57606a] leading-relaxed max-w-[280px]">
            Are you sure you want to duplicate this estimation? A new copy will
            be created with the same details.
          </p>

          <div className="mt-2 flex w-full gap-2.5">
            <button
              onClick={() => setDuplicateModal(false)}
              disabled={isLoading}
              className="flex-1 py-2 rounded-[8px] border border-[#d0d7de] bg-white
                         text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                         transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={() => handleConfirm(data)}
              disabled={isLoading}
              className="flex-1 py-2 rounded-[8px] bg-[#2f80ed] hover:bg-[#1a6dd6]
                         text-[13px] font-semibold text-white
                         flex items-center justify-center gap-2
                         transition-all disabled:opacity-60"
            >
              {isLoading && <LoaderIcon />}
              {isLoading ? "Duplicating…" : "Continue"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CostEstimationCard;
