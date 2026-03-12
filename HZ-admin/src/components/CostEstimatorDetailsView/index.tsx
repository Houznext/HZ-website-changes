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
import { ArrowLeft, CalendarDays, Download, FileBadge2, Home, MapPin, Pencil, Trash2, User2 } from "lucide-react";

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

  const handleDelete = async (id: number) => {
    try {
      const userId = session?.data?.user?.id;
      router.push("/cost-estimator");
      const response = await apiClient.delete(
        `${apiClient.URLS.cost_estimator}/${id}`, { data: { userId } }
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

    const originalWidth = reportRef.current.style.width;

    reportRef.current.style.width = "1024px";

    const pdfHeader = document.getElementById("pdf-header");
    pdfHeader?.classList.remove("hidden");

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
      windowHeight: 768,
    });

    pdfHeader?.classList.add("hidden");

    reportRef.current.style.width = originalWidth;

    const pdfWidth = 595.28;
    const pdfHeightPerPage = 790.89;
    const paddingX = 15;
    const paddingY = 10;

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
  const total =
    Number(details?.subTotal || 0) - Number(details?.discount || 0);

  return (
    <div className="mx-auto">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div
            className="md:max-w-8xl   mx-auto md:p-4 p-2 bg-white relative"
            ref={reportRef}
          >
            <div id="pdf-header" className="hidden print:block">
              <CostEstimationHeader />
            </div>

            {/* Sticky action bar – IGNORE in PDF */}
            <div
              className="print:hidden sticky top-0 z-20 bg-[#f7f8fa]/80 backdrop-blur-sm no-export make-static"
              data-html2canvas-ignore="true"
            >
              <div className="max-w-8xl mx-auto btn-text flex items-center justify-between gap-2 px-2 md:px-0 py-3">
                <Button onClick={() => router.push("/cost-estimator")} className="inline-flex items-center gap-2 text-gray-700 hover:text-[#3586FF]  font-medium">
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
                    onClick={() => generateReport(details.firstname, details.lastname)}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>

                  <Button
                    className="px-3 py-1 rounded-md bg-[#5297ff] hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-50"
                    onClick={() => handleEdit(details)}
                    disabled={!hasPermission("cost_estimator", "edit")}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>

                  <Button
                    className="px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium flex items-center gap-2 disabled:opacity-50"
                    onClick={() => setOpenDeleteModal(true)}
                    disabled={!hasPermission("cost_estimator", "delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>


            {/* Title */}
            <div className="w-full mb-6">
              <div className="flex items-center justify-center">
                <span className="inline-block font-semibold md:text-3xl text-2xl tracking-wide leading-tight text-slate-900">
                  Quotation
                </span>
              </div>
              <div className="mt-3 h-px w-full bg-slate-300" />
            </div>

            {/* Customer & Property Info */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-4 md:mb-6 mb-4">
              {/* Left: Quotation For & Property */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-[#2f80ed] font-semibold text-xs md:text-sm uppercase tracking-[0.12em]">
                      Quotation For
                    </p>
                    <p className="font-semibold text-[14px] md:text-[16px] text-slate-900">
                      {details?.firstname} {details?.lastname}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-[#2f80ed] font-semibold text-xs md:text-sm uppercase tracking-[0.12em]">
                      Property Type
                    </p>
                    <p className="font-semibold text-[14px] md:text-[16px] text-slate-900">
                      {details?.bhk || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Location / Date */}
              <div className="flex flex-col items-start md:items-end gap-1 text-slate-800 text-[12px] md:text-[14px]">
                <span>
                  {details?.location?.locality},{" "}
                  {details?.location?.state?.charAt(0)?.toUpperCase()}
                  {details?.location?.state?.slice(1)}
                </span>
                <span>{new Date(details?.date).toDateString()}</span>
              </div>
            </div>

            {/* Price Summary – light blue bar */}
            <div className="w-full md:mb-5 mb-3 print:mb-2">
              <div className="flex flex-col sm:flex-row bg-[#e4efff] rounded-2xl overflow-hidden border border-slate-200">
                <div className="flex-1 px-4 py-3">
                  <p className="font-medium text-slate-700 text-[11px] uppercase tracking-[0.14em] mb-1">
                    Subtotal
                  </p>
                  <p className="font-semibold text-[18px] md:text-[20px] text-slate-900">
                    ₹{" "}
                    {Number(details?.subTotal || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-slate-200/70 self-stretch sm:self-auto" />
                <div className="flex-1 px-4 py-3">
                  <p className="font-medium text-slate-700 text-[11px] uppercase tracking-[0.14em] mb-1">
                    Discount
                  </p>
                  <p className="font-semibold text-[18px] md:text-[20px] text-emerald-600">
                    - ₹{" "}
                    {Number(details?.discount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-slate-200/70 self-stretch sm:self-auto" />
                <div className="flex-1 px-4 py-3">
                  <p className="font-medium text-slate-700 text-[11px] uppercase tracking-[0.14em] mb-1">
                    Total (INR)
                  </p>
                  <p className="font-semibold text-[20px] md:text-[22px] text-[#2f80ed]">
                    ₹{" "}
                    {total.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-slate-200/70 self-stretch sm:self-auto" />
                <div className="flex-1 px-4 py-3">
                  <p className="font-medium text-slate-700 text-[11px] uppercase tracking-[0.14em] mb-1">
                    Work Type
                  </p>
                  <p className="font-semibold text-[16px] md:text-[18px] text-slate-900">
                    {details?.workType || "Interior Works"}
                  </p>
                </div>
              </div>
            </div>
            {/* Table */}
            <ConstEstimationTable
              costEstimation={{
                ...details,
                itemGroups: [...(details?.itemGroups || [])].sort(
                  (a, b) => a.order - b.order
                ),
              }}
            />
            {details?.details?.length > 0 && (
              <>
                <p className="text-[18px] mt-6 font-semibold text-slate-900">
                  Work Details
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: details?.details,
                  }}
                  className="flex flex-col w-full md:px-5 px-2 md:py-6 py-4 items-start md:gap-2 gap-1 md:leading-[24px] leading-[18px] font-regular text-slate-800 md:text-[14px] text-[11px]"
                ></div>
              </>
            )}

            {/* Terms & Conditions full width */}
            <div className="bg-gray-50 rounded-md border border-slate-200 p-4 md:mt-8 mt-6">
              <h3 className="font-semibold text-[14px] md:text-[16px] mb-3 text-slate-900">
                Terms and Conditions
              </h3>
              <ol className="list-decimal pl-5 space-y-1.5 text-gray-700 font-regular md:text-[12px] text-[11px]">
                <li>
                  <strong>Estimate Validity:</strong> This cost estimate is valid for 15 days from the
                  date of issue. Prices may change after this period depending on material costs and
                  project scope.
                </li>
                <li>
                  <strong>Scope of Work:</strong> The estimate is prepared based on the initial
                  requirements discussed during consultation. Any changes in design, materials,
                  dimensions, or scope may lead to a revision in cost.
                </li>
                <li>
                  <strong>Measurement Disclaimer:</strong> Final costing will be confirmed after
                  detailed site measurements and design finalization.
                </li>
                <li>
                  <strong>Material Availability:</strong> All materials mentioned are subject to
                  availability. In case of unavailability, Houznext may suggest an equivalent
                  alternative after client approval.
                </li>
                <li>
                  <strong>Taxes:</strong> All prices mentioned are exclusive of applicable taxes
                  unless otherwise specified.
                </li>
                <li>
                  <strong>Payment Terms:</strong> Project execution will begin only after confirmation
                  of design and receipt of the initial advance payment as per the payment schedule.
                </li>
                <li>
                  <strong>Timeline:</strong> Project timelines depend on design finalization, material
                  availability, and site readiness. Any delay in client approvals may affect the
                  completion timeline.
                </li>
                <li>
                  <strong>Electrical / Civil Changes:</strong> Major civil modifications, plumbing,
                  electrical rewiring, or structural changes are not included unless explicitly
                  mentioned in the estimate.
                </li>
                <li>
                  <strong>Warranty:</strong> Houznext provides up to 10 years warranty on selected
                  interior components as per company warranty policy.
                </li>
                <li>
                  <strong>Site Conditions:</strong> The site must be ready for interior work before
                  project commencement. Any delays due to unfinished civil work or external factors may
                  affect timelines.
                </li>
                <li>
                  <strong>Design Ownership:</strong> All designs, drawings, and 3D renders shared
                  remain intellectual property of Houznext until the project is confirmed.
                </li>
                <li>
                  <strong>Estimate Purpose:</strong> This document is an indicative estimate only and
                  does not constitute a final contract or agreement.
                </li>
              </ol>
            </div>

            {/* Houznext Promise */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg md:p-5 p-3 mt-6">
              <h2 className="text-[#2f80ed] font-semibold text-[16px] md:text-[18px] mb-3">
                Houznext Promise
              </h2>
              <ul className="font-medium text-gray-700 md:text-[14px] text-[12px] space-y-1">
                <li>Free 3D Design</li>
                <li>Transparent Pricing</li>
                <li>40+ Quality Checks</li>
                <li>10-Year Warranty</li>
                <li>Real-time updates via our online tracking system (Under development)</li>
              </ul>
            </div>

            {/* Thank you footer */}
            <div className="mt-6 flex justify-end">
              <div className="text-right max-w-xs">
                <p
                  className="text-lg md:text-xl text-slate-900"
                  style={{ fontFamily: "cursive" }}
                >
                  Thank You
                </p>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {details?.designerName || "Houznext Designer"}
                </p>
                <p className="text-xs text-slate-600">Interior Designer</p>
              </div>
            </div>
          </div>
        </>
      )}
      <Drawer
        open={openModal}
        handleDrawerToggle={() => setOpenModal(false)}
        closeIconCls="text-black"
        openVariant="right"
        rootCls="z-[9999]"
        panelCls="w-[90%] sm:w-[95%] lg:w-[calc(100%-340px)] shadow-xl"
        overLayCls="bg-gray-700 bg-opacity-40"
      >
        <CostEstimatorForm
          userId={user?.id}
          closeDrawer={closeDrawer}
          editingEstimation={editingEstimation}
          setEditingEstimation={setEditingEstimation}
          fetchDetails={fetchCostEstimationById}
        />
      </Drawer>
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[400px] max-w-[330px] rounded-[6px]"
        rootCls="flex items-center border justify-center z-[99999]"
        isCloseRequired={false}
      >
        <div className="md:p-6 p-3 flex flex-col  z-20 ">
          <div className="flex justify-between items-center  mb-2">
            <h3 className="md:text-[20px] text-center w-full text-[16px]  font-bold text-red-500">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-[12px] text-center font-regular text-[10px] text-gray-500 mb-4">
            Are you sure you want to delete this estimation? This action cannot
            be undone.
          </p>
          <div className=" mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className=" md:px-[28px] px-[14px] label-text md:py-1 rounded-md border-2 bg-gray-100 hover:bg-gray-200  font-medium text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              className=" md:px-[28px] px-[14px]  font-medium  md:py-1 label-text  rounded-md border-2 bg-red-600 text-white"
              onClick={() => handleDelete(details?.id)}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CostEstimatorDetailsView;
