import React, { useRef, useState } from "react";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { Download } from "@mui/icons-material";
import { EditIcon } from "@/src/common/Icons";
import Button from "@/src/common/Button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { FaRegFileAlt, FaTools } from "react-icons/fa";
import { MdLocationOn, MdContactPhone, MdAddHome } from "react-icons/md";
import { iconMap } from "./helper";
import CostEstimationHeader from "@/src/components/CostEstimatorDetailsView/CostEstimatorHeader";
import FloorPlanSvgViewer from "./components/FloorPlanSvgViewer";
import { PlacedPlan } from "@/src/lib/floorplan/contracts";
import Modal from "@/src/common/Modal";

const SummaryDetails = () => {
  const { customerOnboarding, setOnboardingSteps } = useCustomBuilderStore();
  const {
    contactDetails,
    addressDetails,
    propertyInformation,
    servicesRequired,
  } = customerOnboarding;

  const reportRef = useRef<HTMLDivElement>(null);
  const generateInFlightRef = useRef(false);

  const [floorPlanResult, setFloorPlanResult] = useState<PlacedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [generationStage, setGenerationStage] = useState<
    "IDLE" | "AI_PLANNING" | "SOLVING" | "RENDERING"
  >("IDLE");


  /* ---------- UI helpers ---------- */
  const PrettyLabel: React.FC<{ text: string }> = ({ text }) => (
    <p className="font-medium text-[11px] md:text-[12px] uppercase tracking-wide text-gray-500">
      {text
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())}
    </p>
  );

  const PrettyValue: React.FC<{ value: any }> = ({ value }) => {
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="px-2 py-1 rounded-full border border-[#5297ff] bg-blue-50 text-[11px] md:text-[12px] text-[#3586FF] "
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    if (typeof value === "object" && value !== null) {
      const text = `${value.size ?? ""} ${value.unit ?? " "}`.trim();
      return (
        <p className="font-medium text-[13px] md:text-[15px] text-gray-800 break-words">
          {text || "N/A"}
        </p>
      );
    }
    return (
      <p className="font-medium text-[13px] md:text-[15px] text-gray-800 break-words">
        {String(value || "N/A")}
      </p>
    );
  };

  /* ---------- Section (UI-only) ---------- */
  const renderSection = (
    title: string,
    icon: JSX.Element,
    details: { [key: string]: any },
    index?: number
  ) => {
    const handleEdit = (i: number) => setOnboardingSteps(i);

    const pairs = Object.entries(details).filter(([key, value]) => {
      const lower = key.toLowerCase();
      if (["id", "password", "confirmpassword"].includes(lower)) return false;
      if (value === null || value === undefined) return false;
      return true;
    });

    return (
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm md:p-5 p-3 md:mb-6 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#3586FF] ">
              <span className="text-[18px]">{icon}</span>
            </span>
            <h2 className="font-bold text-[16px] md:text-[18px] text-[#3586FF] ">
              {title.charAt(0).toUpperCase() + title.slice(1)}
            </h2>
          </div>

          {typeof index === "number" && index > -1 && (
            <div className="block print:hidden exclude-from-pdf">
              <Button
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-[#3586FF]  hover:bg-blue-50  px-3  py-1 rounded-md font-medium text-[12px] md:text-[14px]"
                onClick={() => handleEdit(index)}
              >
                <EditIcon />
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          {pairs.map(([key, value]) => {
            if (key === "reference_images" && Array.isArray(value)) {
              return (
                <div key={key}>
                  <PrettyLabel text="Reference Images" />
                  <div className="flex flex-wrap gap-2 mt-1">
                    {value.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`reference-${idx}`}
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              );
            }

            if (key === "color_scheme" && Array.isArray(value)) {
              return (
                <div key={key}>
                  <PrettyLabel text="Color Scheme" />
                  <div className="flex flex-wrap gap-2 mt-1">
                    {value.map(
                      (item: { label: string; color: string }, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 border rounded-md px-2 py-1"
                        >
                          <div
                            className="w-5 h-5 rounded"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-gray-700 md:text-[12px] text-[10px] font-regular">
                            {item.label}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            }

            // Handle comma-separated selected values
            if (
              typeof value === "string" &&
              value.includes(",") &&
              key.toLowerCase().includes("selected")
            ) {
              return (
                <div key={key}>
                  <PrettyLabel text={key} />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                      .map((chip, i) => (
                        <span
                          key={`${chip}-${i}`}
                          className="px-2 py-1 rounded-full border border-[#5297ff] bg-blue-50 text-[11px] md:text-[12px] text-[#3586FF] "
                        >
                          {chip}
                        </span>
                      ))}
                  </div>
                </div>
              );
            }
            if (
              Array.isArray(value) &&
              value.length > 0 &&
              typeof value[0] === "object"
            ) {
              return (
                <div key={key}>
                  <PrettyLabel text={key.replace(/_/g, " ").toUpperCase()} />
                  <div className="overflow-x-auto mt-1">
                    <table className="min-w-full border border-gray-200 text-[8px] md:text-[10px]">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(value[0]).map((col) => (
                            <th
                              key={col}
                              className="border md:px-2 px-1 md:py-1 py-0 text-left font-medium "
                            >
                              {col.replace(/_/g, " ").toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {value.map((item: any, idx: number) => (
                          <tr key={idx} className="even:bg-gray-50">
                            {Object.values(item).map((val: any, i) => (
                              <td
                                key={i}
                                className="border md:px-2 px-1 md:py-1 py-0 text-center text-gray-700"
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {iconMap[key] && (
                    <span className="text-gray-500">{iconMap[key]}</span>
                  )}
                  <PrettyLabel text={key} />
                </div>
                <PrettyValue value={value} />
              </div>
            );
          })}
        </div>
      </section>
    );
  };



  /* ---------- PDF export (fixed) ---------- */
  const generateReport = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 3, // crisp, but not huge
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (doc) => {
        const h = doc.getElementById("pdf-header");
        if (h) h.classList.remove("hidden");

        doc.querySelectorAll(".exclude-from-pdf").forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });
      },
      windowWidth: document.documentElement.clientWidth,
    });

    // PDF setup
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(`${propertyInformation?.propertyName || "summary"}.pdf`);
  };

  const fetchFloorPlans = async () => {
    if (propertyInformation?.construction_scope !== "House") return;
    if (generateInFlightRef.current) return;
    const propertyType = String(
      propertyInformation?.property_type ||
      (propertyInformation as any)?.propertyType ||
      ""
    ).trim();
    const constructionType = String(
      propertyInformation?.construction_type ||
      (propertyInformation as any)?.constructionType ||
      ""
    ).trim();
    if (!propertyType) {
      toast.error("Property type is required before generating floor plans.");
      return;
    }
    if (!constructionType) {
      toast.error("Construction type is required before generating floor plans.");
      return;
    }
    generateInFlightRef.current = true;
    setIsFetching(true);
    setGenerationStage("AI_PLANNING");
    try {
      const hci = propertyInformation?.house_construction_info || ({} as any);
      const sanitizeLengthUnit = (value: any) => {
        if (!value) return value;
        const unit = (value.unit || "").toLowerCase();
        if (unit === "sq.ft" || unit === "sqft") {
          return { ...value, unit: "ft" };
        }
        return value;
      };
      console.log("Sending generation request to API with body:", propertyInformation)
      const response = await fetch("/api/floorplans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyInformation,
          property_type: propertyType,
          construction_type: constructionType,
          house_construction_info: {
            ...hci,
            length: sanitizeLengthUnit(hci.length),
            width: sanitizeLengthUnit(hci.width),
          },
          schemaVersion: "1.0.0",
          construction_scope: "House",
          vastuPreference: "BALANCED",
          generateVariants: 3,
          tolerance: { areaTolerancePct: 5 },
        }),
      });
      console.log("Received response from floor plan generation API with status:", response);
      setGenerationStage("SOLVING");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Generation failed");
      }
      setGenerationStage("RENDERING");
      setFloorPlanResult(data?.placedPlan || null);
      if (Array.isArray(data?.warnings) && data.warnings.length > 0) {
        toast.success(`Generated with ${data.warnings.length} warning(s).`);
      } else {
        toast.success("Floor plan generated successfully");
      }
    } catch (error: any) {
      console.error("Error fetching floor plans:", error?.message);
      toast.error("Failed to fetch floor plans");
      setFloorPlanResult(null);
    } finally {
      setIsFetching(false);
      setGenerationStage("IDLE");
      generateInFlightRef.current = false;
    }
  };

  const handleTryFlexible = async () => {
    if (propertyInformation?.construction_scope !== "House") return;
    if (generateInFlightRef.current) return;
    const propertyType = String(
      propertyInformation?.property_type ||
      (propertyInformation as any)?.propertyType ||
      ""
    ).trim();
    const constructionType = String(
      propertyInformation?.construction_type ||
      (propertyInformation as any)?.constructionType ||
      ""
    ).trim();
    if (!propertyType) {
      toast.error("Property type is required before generating floor plans.");
      return;
    }
    if (!constructionType) {
      toast.error("Construction type is required before generating floor plans.");
      return;
    }
    generateInFlightRef.current = true;
    setIsFetching(true);
    setGenerationStage("AI_PLANNING");
    try {
      const response = await fetch("/api/floorplans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyInformation,
          property_type: propertyType,
          construction_type: constructionType,
          schemaVersion: "1.0.0",
          construction_scope: "House",
          vastuPreference: "FLEXIBLE",
          generateVariants: 3,
          tolerance: { areaTolerancePct: 8 },
        }),
      });
      setGenerationStage("SOLVING");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Generation failed");
      }
      setGenerationStage("RENDERING");
      setFloorPlanResult(data?.placedPlan || null);
      setIsViewerOpen(true);
    } catch (error: any) {
      toast.error(error?.message || "Flexible vastu generation failed");
    } finally {
      setIsFetching(false);
      setGenerationStage("IDLE");
      generateInFlightRef.current = false;
    }
  };

  return (
    <>
      <div className="md:px-10 px-1" ref={reportRef}>
        <div id="pdf-header" className="hidden print:block">
          <div className="px-4 py-3">
            <CostEstimationHeader />
          </div>
        </div>

        <div className="flex items-center justify-between md:mb-5 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#3586FF] ">
              <FaRegFileAlt />
            </span>
            <h1 className="font-bold text-[16px] md:text-[18px] text-[#3586FF] ">
              Summary Details :
            </h1>
          </div>

          <div className="block exclude-from-pdf">
            <Button
              className="inline-flex items-center gap-2 md:px-4 px-3 md:py-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] md:text-[14px] shadow-sm"
              onClick={generateReport}
            >
              <Download className="!text-white" /> Download
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          {renderSection(
            "Contact Details",
            <MdContactPhone />,
            contactDetails,
            0
          )}
          {renderSection(
            "Address Details",
            <MdLocationOn />,
            addressDetails,
            0
          )}

          {propertyInformation?.construction_scope === "House" &&
            propertyInformation?.construction_type !== "Commercial" &&
            renderSection(
              "Property Information",
              <MdAddHome />,
              {
                construction_type: propertyInformation?.construction_type,
                property_type: propertyInformation?.property_type,
                construction_scope: propertyInformation?.construction_scope,
                ...propertyInformation.house_construction_info,
                floors:
                  propertyInformation?.house_construction_info?.floors?.map(
                    (floor, index) =>
                      `Floor ${index + 1}: ${floor?.portions} portion(s)`
                  ),
              },
              1
            )}

          {propertyInformation?.construction_scope === "House" &&
            propertyInformation?.construction_type === "Commercial" &&
            renderSection(
              "Commercial Property Information",
              <MdAddHome />,
              {
                construction_type: propertyInformation?.construction_type,
                commercial_type: propertyInformation?.commercial_property_type,
                construction_scope: propertyInformation?.construction_scope,
                ...propertyInformation.commercial_construction_info,
              },
              1
            )}

          {propertyInformation?.construction_scope === "Interior" &&
            renderSection(
              "Property Information",
              <MdAddHome />,
              {
                construction_type: propertyInformation?.construction_type,
                property_type: propertyInformation?.property_type,
                construction_scope: propertyInformation?.construction_scope,
                ...propertyInformation.interior_info,
                floors: propertyInformation?.interior_info?.floors.map(
                  (floor, index) =>
                    `Floor ${index + 1}: ${floor?.portions} portion(s)`
                ),
              },
              1
            )}

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm md:p-5 p-3">
            {renderSection(
              "Services Required",
              <FaTools />,
              {
                serviceType: servicesRequired.serviceType,
                selectedServices: Array.isArray(
                  servicesRequired?.selectedServices
                )
                  ? servicesRequired.selectedServices.join(", ")
                  : undefined,
              },
              2
            )}
            {servicesRequired.serviceDetails &&
              Object.entries(servicesRequired.serviceDetails).map(
                ([serviceKey, serviceDetails]) =>
                  serviceDetails
                    ? renderSection(
                      serviceKey.replace(/_/g, " ").toUpperCase(),
                      <FaTools />,
                      serviceDetails
                    )
                    : null
              )}
          </section>

          {propertyInformation?.construction_scope === "House" && (
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm md:p-5 p-3 exclude-from-pdf">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[16px] md:text-[18px]">
                  Generated Floor Plans
                </h2>
                <Button
                  className="md:px-4 px-3 md:py-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-[12px] md:text-[14px]"
                  disabled={isFetching}
                  onClick={fetchFloorPlans}
                >
                  {isFetching ? "Generating..." : "Generate floor plans"}
                </Button>
              </div>
              {isFetching && (
                <p className="mb-3 text-sm text-blue-700">
                  {generationStage === "AI_PLANNING" && "AI planning in progress..."}
                  {generationStage === "SOLVING" && "Constraint solving in progress..."}
                  {generationStage === "RENDERING" && "Rendering SVG variants..."}
                </p>
              )}
              {floorPlanResult ? (
                <div className="rounded-xl border border-[#0f766e]/25 bg-gradient-to-r from-[#ecfeff] via-[#f0fdfa] to-[#f5f3ff] p-4">
                  <p className="text-sm text-slate-700">
                    Floor plan is ready. Open the full-screen viewer for variants, zoom/pan, and exports.
                  </p>
                  <div className="mt-3">
                    <Button
                      className="rounded-md bg-[#0f766e] px-4 py-2 text-sm font-medium text-white hover:bg-[#115e59]"
                      onClick={() => setIsViewerOpen(true)}
                    >
                      Open SVG Viewer
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No floor plans generated yet.</p>
              )}
            </section>
          )}
        </div>
      </div>
      <Modal
        isOpen={isViewerOpen}
        closeModal={() => setIsViewerOpen(false)}
        title="Generated Floor Plan"
        className="max-w-[1240px] p-4 md:p-5"
        isCloseRequired
      >
        {floorPlanResult ? (
          <FloorPlanSvgViewer
            plan={floorPlanResult}
            propertyId={propertyInformation?.id ? String(propertyInformation.id) : undefined}
            onTryFlexible={handleTryFlexible}
          />
        ) : null}
      </Modal>
    </>
  );
};

export default SummaryDetails;
