import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "@/src/common/Loader";
import Drawer from "@/src/common/Drawer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { ConstEstimationTable } from "./ConstEstimationTable";
import { CostEstimator } from "../CostEstimatorView/helper";
import CostEstimatorForm from "../CostEstimatorView/CostEstimatorForm";
import CostEstimationHeader from "./CostEstimatorHeader";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { ArrowLeft, Download, Pencil, Trash2, FileText } from "lucide-react";
import { useInvoiceStore } from "@/src/stores/invoicesstrore";

const CostEstimatorDetailsView = () => {
  const [details, setDetails] = useState<CostEstimator | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const session = useSession();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const { convertFromQuotation } = useInvoiceStore();

  // States required for editing estimation

  const [editingEstimation, setEditingEstimation] = useState(null);
  const [openModal, setOpenModal] = React.useState(false);

  // useEffect hooks

  useEffect(() => {
    if (session?.status === "authenticated" && router.query.id) {
      const currentUser = session.data?.user;
      setUser(currentUser);
      fetchCostEstimationById();
    }
  }, [session?.status, router.query.id]);

  // Auto-download when opened with ?download=1 (confirmed quotes only)
  useEffect(() => {
    if (isLoading || !details) return;
    if (router.query.download !== "1") return;
    if ((details as any)?.status === "draft") {
      toast.error("Confirm quote first to download the PDF.");
      const { download, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      });
      return;
    }
    const t = setTimeout(() => {
      void generateReport(details.firstname, details.lastname);
      const { download, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, details, router.query.download]);

  // Fetch estimation details

  const fetchCostEstimationById = async () => {
    setIsLoading(true);
    try {
      const branchId =
        session?.data?.user?.branchMemberships?.[0]?.branchId ?? undefined;
      const response = await apiClient.get(
        `${apiClient.URLS.cost_estimator}/${router.query.id}`,
        { branchId },
        true
      );
      if (response.status === 200) {
        setDetails(response.body);
        if (openModal) setEditingEstimation(response.body);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete estimation

  const handleDelete = async (id: string | number) => {
    try {
      const userId = session?.data?.user?.id;
      router.push("/cost-estimator");
      const response = await apiClient.delete(
        `${apiClient.URLS.cost_estimator}/${id}`,
        { userId },
      );
      if (response.status === 200) {
        console.log("Estimation deleted successfully");
        toast.success("Estimation deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Edit estimation

  const handleEdit = (estimation: CostEstimator) => {
    setEditingEstimation(estimation);
    setOpenModal(true);
    handleClose();
  };

  const closeDrawer = () => {
    setOpenModal(false);
    setEditingEstimation(null);
  };

  // Generate report function

  const generateReport = async (firstname: string, lastname: string) => {
    if (!reportRef.current) return;

    // Capture at 820px — much closer to PDF width, so less downscaling needed.
    // Strip outer padding during capture so content fills the full capture width.
    const originalWidth   = reportRef.current.style.width;
    const originalPadding = reportRef.current.style.padding;

    reportRef.current.style.width   = "820px";
    reportRef.current.style.padding = "0";

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: 820,
      windowHeight: 768,
    });

    reportRef.current.style.width   = originalWidth;
    reportRef.current.style.padding = originalPadding;

    const pdfWidth = 595.28;
    const pdfHeightPerPage = 790.89;
    const paddingX = 6;   // reduced from 15 — more horizontal space
    const paddingY = 6;   // reduced from 10

    const contentWidth = pdfWidth - 2 * paddingX;
    const contentHeight = pdfHeightPerPage - 2 * paddingY;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasHeight / canvasWidth;
    const scaledHeight = contentWidth * canvasAspectRatio;

    const totalPages = Math.ceil(scaledHeight / contentHeight);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeightPerPage],
    });

    for (let page = 0; page < totalPages; page++) {
      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");

      const pageHeightInCanvasUnits =
        (contentHeight / contentWidth) * canvasWidth;

      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeightInCanvasUnits;

      pageContext!.fillStyle = "#FFFFFF";
      pageContext!.fillRect(0, 0, canvasWidth, pageHeightInCanvasUnits);

      pageContext?.drawImage(
        canvas,
        0,
        page * pageHeightInCanvasUnits,
        canvasWidth,
        pageHeightInCanvasUnits,
        0,
        0,
        canvasWidth,
        pageHeightInCanvasUnits
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 1.0);

      if (page > 0) pdf.addPage();

      pdf.addImage(
        pageImgData,
        "JPEG",
        paddingX,
        paddingY,
        contentWidth,
        contentHeight,
        undefined,
        "FAST"
      );
    }

    pdf.save(`${firstname}_${lastname}.pdf`);
  };

  const afterDiscount = Number(details?.subTotal || 0) - Number(details?.discount || 0);
  const gstEnabled   = !!(details as any)?.gstEnabled;
  const gstPct       = Number((details as any)?.gstPercentage ?? 18);
  const gstAmount    = gstEnabled ? afterDiscount * (gstPct / 100) : 0;
  const total        = afterDiscount + gstAmount;

  return (
    <div className="mx-auto">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div
            className="md:max-w-8xl mx-auto md:p-4 p-2 bg-white relative"
            ref={reportRef}
          >
            <div id="pdf-header" className="hidden print:block" data-html2canvas-ignore="true">
              <CostEstimationHeader />
            </div>

            {/* ── Sticky action bar — ignored in PDF ── */}
            <div
              className="print:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100"
              data-html2canvas-ignore="true"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  onClick={() => router.push("/cost-estimator")}
                  className="inline-flex items-center gap-2 text-gray-600
                             hover:text-[#2f80ed] text-[13px] font-medium transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back to quotations
                </button>

                <div className="flex items-center gap-2">
                  {/* Download PDF */}
                  <button
                    onClick={() => {
                      if ((details as any)?.status === "draft") {
                        toast.error("Confirm quote first to download the PDF.");
                        return;
                      }
                      void generateReport(details.firstname, details.lastname);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                               bg-white border border-gray-200 hover:bg-gray-50
                               text-gray-700 text-[12.5px] font-medium transition-all"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    title={
                      (details as any)?.status === "draft"
                        ? "Confirm quote first to download"
                        : "Download PDF"
                    }
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>

                  {hasPermission("invoice_estimator", "create") && (
                    <button
                      onClick={async () => {
                        try {
                          const inv = await convertFromQuotation(String(router.query.id));
                          router.push(`/invoice/${inv.id}`);
                        } catch {
                          toast.error("Could not convert to invoice");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                                 bg-white border border-[#2f80ed] hover:bg-[#e8f1fd]
                                 text-[#2f80ed] text-[12.5px] font-semibold transition-all"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <FileText className="w-3.5 h-3.5" /> Convert to Invoice
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(details)}
                    disabled={!hasPermission("cost_estimator", "edit")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                               bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[12.5px]
                               font-semibold shadow-sm hover:shadow-md transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setOpenDeleteModal(true)}
                    disabled={!hasPermission("cost_estimator", "delete")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                               bg-red-50 hover:bg-red-100 border border-red-200
                               text-red-600 text-[12.5px] font-medium transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* ── DOCUMENT HEADER BANNER ── */}
            <div className="rounded-t-[14px] overflow-hidden"
                 style={{ background: '#0f2a44' }}>
              <div className="px-7 py-6 flex items-start justify-between">

                {/* Left: Brand */}
                <div>
                  {/* Logo — plain <img> required for html2canvas */}
                  <img
                    src="/images/Houznext Logo.png"
                    alt="Houznext"
                    width={200}
                    height={50}
                    crossOrigin="anonymous"
                    style={{ objectFit: 'contain', display: 'block' }}
                  />
                  <div
                    className="text-[11px] text-white/40 mt-2 uppercase tracking-[0.12em]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Buy Right · Build Strong · Design Beautiful
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', sans-serif" }}>+91 97597 50770</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', sans-serif" }}>business@houznext.com</span>
                  </div>
                </div>

                {/* Right: Document info — flex column so each row stacks with proper spacing */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      marginBottom: '8px',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Cost Estimate
                  </div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {(details as any)?.quotationNumber
                      ? `QT-${String((details as any).quotationNumber).padStart(4, '0')}`
                      : `QT-${String((details as any)?.id || '').slice(0, 6).toUpperCase() || '------'}`
                    }
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.45)',
                      marginTop: '14px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Issued: {details?.date
                      ? new Date(details.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })
                      : ''}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 700, color: '#f2994a', fontFamily: "'Inter', sans-serif" }}>
                    Valid for 15 days
                  </div>
                </div>
              </div>
            </div>

            {/* ── CLIENT INFO GRID ── */}
            <div className="grid grid-cols-3 gap-5 mt-5 mb-5 p-6
                            bg-gray-50 rounded-[12px] border border-gray-100">

              {/* Col 1 — Prepared for: name + plain-text property/work type */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: "'Montserrat', sans-serif" }}>
                  Prepared for
                </p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', lineHeight: 1.3, fontFamily: "'Montserrat', sans-serif" }}>
                  {details?.firstname} {details?.lastname}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>User contact:</span>{' '}
                  {(details as any)?.customerMobile || '—'}
                </p>
                {details?.bhk && (
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '7px', fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Property type:</span>{' '}{details.bhk}
                    {details?.property_type && ` · ${details.property_type}`}
                  </p>
                )}
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Work type:</span>{' '}{details?.workType || 'Interiors'}
                </p>
              </div>

              {/* Col 2 — Property */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: "'Montserrat', sans-serif" }}>
                  Property
                </p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', lineHeight: 1.3, fontFamily: "'Montserrat', sans-serif" }}>
                  {details?.property_name || '—'}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                  {details?.location?.locality && `${details.location.locality}, `}
                  {details?.location?.city}
                  {details?.location?.state && `, ${details.location.state}`}
                  {details?.location?.pincode && ` — ${details.location.pincode}`}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
                  {details?.bhk}
                  {details?.bhk && details?.property_type && ' · '}
                  {details?.property_type}
                  {details?.workType && ` · ${details.workType}`}
                </p>
              </div>

              {/* Col 3 — Prepared by: designer name + role + email + phone (moved from col 1) */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: "'Montserrat', sans-serif" }}>
                  Prepared by
                </p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', lineHeight: 1.3, fontFamily: "'Montserrat', sans-serif" }}>
                  {details?.designerName || 'Houznext Designer'}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                  Interior Designer
                </p>
                {/* Email + phone moved here from Prepared for */}
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                  {details?.email}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
                  {details?.phone}
                </p>
              </div>
            </div>

            {/* ── GRADIENT DIVIDER ── */}
            <div
              className="h-[2px] rounded-full mb-5"
              style={{ background: 'linear-gradient(to right, #2f80ed, rgba(47,128,237,0.1))' }}
            />

            {/* ── SCOPE OF WORK LABEL ── */}
            <p
              style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px', fontFamily: "'Montserrat', sans-serif" }}
            >
              Scope of work &amp; cost breakdown
            </p>

            {/* ── ITEM TABLE ── */}
            <ConstEstimationTable
              costEstimation={{
                ...details,
                itemGroups: [...(details?.itemGroups || [])].sort(
                  (a, b) => a.order - b.order
                ),
              }}
            />

            {/* ── TOTALS BLOCK ── */}
            <div
              style={{ background: '#0f2a44', borderRadius: '12px', padding: '20px 24px', marginTop: '24px', marginBottom: '20px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
                    Subtotal
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', sans-serif" }}>
                    ₹ {Number(details?.subTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
                    Discount applied
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', sans-serif" }}>
                    − ₹ {Number(details?.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {gstEnabled ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
                      GST ({gstPct}%)
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(242,180,0,0.9)', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', sans-serif" }}>
                      + ₹ {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter', sans-serif" }}>
                      GST — exclusive unless specified
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>
                      As applicable
                    </span>
                  </div>
                )}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: "'Montserrat', sans-serif" }}>
                    Estimated total {gstEnabled ? `(incl. GST ${gstPct}%)` : ''}
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums', fontFamily: "'Montserrat', sans-serif" }}>
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* ── WORK DETAILS ── */}
            {details?.details?.length > 0 && (
              <div style={{ marginTop: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6', padding: '18px 20px' }}>
                <p
                  style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '10px', fontFamily: "'Montserrat', sans-serif" }}
                >
                  Additional work details
                </p>
                <div
                  dangerouslySetInnerHTML={{ __html: details.details }}
                  style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            )}

            {/* ── TERMS & CONDITIONS ── */}
            <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '18px 20px', marginTop: '16px' }}>
              <h3
                style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '14px', fontFamily: "'Montserrat', sans-serif" }}
              >
                Terms &amp; Conditions
              </h3>
              {/* Table layout: dot column + text column — guarantees perfect alignment in html2canvas */}
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {[
                    ['Estimate Validity', 'This cost estimate is valid for 15 days from the date of issue. Prices may change after this period depending on material costs and project scope.'],
                    ['Scope of Work', 'The estimate is prepared based on the initial requirements discussed during consultation. Any changes in design, materials, dimensions, or scope may lead to a revision in cost.'],
                    ['Measurement Disclaimer', 'Final costing will be confirmed after detailed site measurements and design finalization.'],
                    ['Material Availability', 'All materials mentioned are subject to availability. In case of unavailability, Houznext may suggest an equivalent alternative after client approval.'],
                    ['Taxes', 'All prices mentioned are exclusive of applicable taxes unless otherwise specified.'],
                    ['Payment Terms', 'Project execution will begin only after confirmation of design and receipt of the initial advance payment as per the payment schedule.'],
                    ['Timeline', 'Project timelines depend on design finalization, material availability, and site readiness. Any delay in client approvals may affect the completion timeline.'],
                    ['Electrical / Civil Changes', 'Major civil modifications, plumbing, electrical rewiring, or structural changes are not included unless explicitly mentioned in the estimate.'],
                    ['Warranty', 'Houznext provides up to 10 years warranty on selected interior components as per company warranty policy.'],
                    ['Site Conditions', 'The site must be ready for interior work before project commencement. Any delays due to unfinished civil work or external factors may affect timelines.'],
                    ['Design Ownership', 'All designs, drawings, and 3D renders shared remain intellectual property of Houznext until the project is confirmed.'],
                    ['Estimate Purpose', 'This document is an indicative estimate only and does not constitute a final contract or agreement.'],
                  ].map(([title, body]) => (
                    <tr key={title}>
                      {/* Dot bullet */}
                      <td style={{ paddingRight: '10px', paddingBottom: '9px', verticalAlign: 'top', width: '10px', lineHeight: '20px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#6b7280', marginTop: '6px' }} />
                      </td>
                      {/* Text */}
                      <td style={{ verticalAlign: 'top', fontSize: '13px', color: '#6b7280', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, paddingBottom: '9px' }}>
                        <strong style={{ color: '#374151', fontWeight: 600 }}>{title}:</strong>{' '}{body}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── HOUZNEXT PROMISE — moved below T&C ── */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px 20px', marginTop: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1f2937', marginBottom: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                Houznext Promise
              </h2>
              {/* No icons — plain text list with dot bullets using table for alignment */}
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {[
                    'Free 3D Design',
                    'Transparent Pricing',
                    '40+ Quality Checks',
                    '10-Year Warranty',
                    'Real-time updates via LiveBuild (Under development)',
                  ].map((item) => (
                    <tr key={item}>
                      <td style={{ paddingRight: '10px', paddingBottom: '8px', verticalAlign: 'top', width: '10px', lineHeight: '20px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#1f2937', marginTop: '6px' }} />
                      </td>
                      <td style={{ verticalAlign: 'top', fontSize: '13px', fontWeight: 600, color: '#1f2937', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, paddingBottom: '8px' }}>
                        {item}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── THANK YOU FOOTER ── */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', fontFamily: "'Montserrat', sans-serif" }}>
                  Houznext
                </p>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
                  +91 97597 50770 · business@houznext.com
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', color: '#374151', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
                  Thank You
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginTop: '4px', fontFamily: "'Montserrat', sans-serif" }}>
                  {details?.designerName || 'Houznext Designer'}
                </p>
                <p style={{ fontSize: '13px', color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>
                  Interior Designer · Houznext
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Modal — all props unchanged ── */}
      <Modal
        isOpen={openModal}
        closeModal={closeDrawer}
        title=""
        isCloseRequired={false}
        rootCls="z-[9999]"
        className="rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]
                   bg-white/80 backdrop-blur-xl border border-white/40
                   p-0 w-full max-w-5xl mx-auto"
      >
        <div className="p-4 sm:p-6">
          <CostEstimatorForm
            userId={user?.id}
            closeDrawer={closeDrawer}
            editingEstimation={editingEstimation}
            setEditingEstimation={setEditingEstimation}
            fetchDetails={fetchCostEstimationById}
          />
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]
                   md:max-w-[400px] max-w-[330px]"
        rootCls="flex items-center justify-center z-[99999]"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3
            className="text-[15px] font-bold text-gray-800 text-center mb-1"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Confirm Deletion
          </h3>
          <p
            className="text-[12.5px] text-center text-gray-500 mb-5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Are you sure you want to delete this estimation? This action cannot be undone.
          </p>
          <div className="flex gap-2.5 justify-end">
            <button
              onClick={() => setOpenDeleteModal(false)}
              className="px-4 py-2 rounded-[8px] bg-gray-50 hover:bg-gray-100
                         border border-gray-200 text-gray-600 text-[13px]
                         font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (details?.id != null) handleDelete(details.id);
              }}
              className="px-4 py-2 rounded-[8px] bg-red-50 hover:bg-red-100
                         border border-red-200 text-red-600 text-[13px]
                         font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CostEstimatorDetailsView;
