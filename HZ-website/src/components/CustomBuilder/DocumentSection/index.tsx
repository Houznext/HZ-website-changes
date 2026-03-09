import Button from "@/common/Button";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import Modal from "@/common/Modal";
import { IoMdEye } from "react-icons/io";
import { LuDownload, LuLoader2 } from "react-icons/lu";
import { X } from "lucide-react";
import { MdDownload, MdEdit } from "react-icons/md";

interface DocumentSectionProps {
  costEstimation: string[];
  weeklyReports: string[];
  monthlyReports: string[];
  paymentReports: string[];
  agreement?: string[];
  warranty?: string[];
  bills?: string[];
  floorPlan?: string[];
}

const DocumentSection = ({
  costEstimation = [],
  weeklyReports = [],
  monthlyReports = [],
  paymentReports = [],
  agreement = [],
  floorPlan = [],
  bills = [],
  warranty = [],
}: DocumentSectionProps) => {
  const [activeTab, setActiveTab] = useState("costEstimation");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const tabValues = [
    "costEstimation",
    "agreement",
    "paymentReports",
    "weeklyReports",
    "monthlyReports",
    "warranty",
    "bills",
    "floorPlan",
  ];

  const documentsMap: Record<string, string[]> = {
    costEstimation,
    agreement,
    paymentReports,
    weeklyReports,
    monthlyReports,
    warranty,
    bills,
    floorPlan,
  };

  const currentDocuments = documentsMap[activeTab] || [];

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };
  const handleDownload = async (url: string, index: number) => {
    try {
      setDownloadingIndex(index);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div>
      <div className="flex md:gap-3 gap-2 px-1 py-2 md:py-1 w-full md:max-w-full max-w-[290px] overflow-x-auto">
        {tabValues.map((tab) => (
          <Button
            key={tab}
            className={twMerge(
              "md:px-4 md:py-2 px-2 py-1 min-w-max md:rounded-md rounded-[6px] text-[10px] text-nowrap md:text-[14px] font-medium",
              activeTab === tab
                ? "bg-[#3B82F6] text-white"
                : "bg-gray-200 text-gray-600"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (char) => char.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="mt-8">
        {currentDocuments?.length === 0 ? (
          <div className="flex flex-row justify-center text-[#3586FF] items-center font-medium bg-blue-100 py-3 px-4 rounded-md shadow-custom w-full md:text-[12px] text-[10px] border ">
            <p>There are no Documents for  {activeTab} .</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 grid-cols-2 md:gap-4 gap-2">
            {currentDocuments?.map((doc: any, index: number) => {
              const fileName = doc.fileUrl?.split("/").pop();
              return (
                <div
                  key={doc.id || index}
                  className="group relative px-3 py-3 border rounded-md shadow bg-white w-full md:max-w-[250px]"
                >
                  {doc.fileUrl && doc.fileUrl.endsWith(".pdf") ? (
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-700 mt-1 text-center">
                        {fileName || `Document ${index + 1}`}
                      </p>
                      <div className="w-full h-28 overflow-hidden border rounded-md">
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                          <Viewer
                            fileUrl={doc.fileUrl}
                            defaultScale={0.9}
                            plugins={[]}
                          />
                        </Worker>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full md:h-[150px] h-[100px] overflow-hidden rounded-md">
                      <Image
                        src={doc.fileUrl || ""}
                        alt={doc.title || `Uploaded ${activeTab}`}
                        fill
                        className="object-cover rounded-sm"
                      />
                    </div>
                  )}

                  <div className="mt-2 md:p-1 p-1 text-[10px] md:text-[12px] font-medium text-gray-600">
                    <p>
                      <span className="font-bold text-black">
                        Title:
                      </span>{" "}
                      {doc?.title || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold text-black">
                        Notes:
                      </span>{" "}
                      {doc?.notes?.slice(0, 50) || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold text-black">
                        Date:
                      </span>{" "}
                      {doc?.documentDate || "N/A"}
                    </p>

                    {doc?.meta && (
                      <div className="mt-1 text-[10px] md:text-[12px] font-medium">
                        <p>
                          <span className="font-bold text-black">
                            Category:
                          </span>{" "}
                          {doc?.meta?.category || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-black">
                            Amount:
                          </span>{" "}
                          {doc?.meta?.amount || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-black">
                            Vendor:
                          </span>{" "}
                          {doc?.meta?.vendor || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-black">
                            GST No:
                          </span>{" "}
                          {doc?.meta?.gstNo || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-black">
                            Paid Via:
                          </span>{" "}
                          {doc?.meta?.paidVia || "-"}
                        </p>
                        <p>
                          <span className="font-bold text-black">
                            Ref No:
                          </span>{" "}
                          {doc?.meta?.referenceNo || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 top-2 right-3 flex justify-center opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <div className="pointer-events-auto flex gap-2 bg-white/95 backdrop-blur-sm py-1 px-2 rounded-full shadow-md border border-gray-200">
                      <Button
                        className="bg-[#3586FF] text-white p-1 rounded-full hover:bg-gray-400"
                        onClick={() => handlePreview(doc.fileUrl)}
                      >
                        <IoMdEye className="md:text-[14px] text-[12px]" />
                      </Button>

                      <Button
                        className="bg-[#3586FF] text-white p-1 rounded-full hover:bg-blue-700"
                        onClick={() => handleDownload(doc.fileUrl, index)}
                        disabled={downloadingIndex === index}
                      >
                        {downloadingIndex === index ? (
                          <LuLoader2 className="animate-spin text-white md:text-[20px] text-[12px]" />
                        ) : (
                          <LuDownload className="md:text-[14px] text-[12px]" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewUrl && (
        <Modal
          isOpen={Boolean(previewUrl)}
          closeModal={closePreview}
          className="w-full h-full bg-white md:px-8 px-4 md:py-6 py-4 rounded-md flex flex-col items-center justify-center"
          rootCls="flex items-center justify-center z-[9999]"
          isCloseRequired={false}
        >
          <div className="flex items-center justify-between md:px-6 px-3 md:py-4 py-2 border-b border-gray-200 bg-gray-50 w-full">
            <h2 className="md:text-[14px] text-[12px] font-medium text-gray-800">
              View Document
            </h2>
          </div>

          <div className="flex-1 overflow-auto w-full flex items-center justify-center p-4 md:p-6 bg-gray-100">
            {previewUrl?.endsWith(".pdf") ? (
              <div className="md:w-[480px] w-[300px] md:h-[500px] h-[300px] overflow-auto border rounded-md bg-white">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl={previewUrl} defaultScale={1.0} />
                </Worker>
              </div>
            ) : (
              <div className="relative md:w-[480px] w-[280px] md:h-[500px] h-[220px]">
                <Image
                  src={previewUrl}
                  alt="Document Preview"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            )}
          </div>

          <div className="md:px-6 px-2 md:py-3 py-1 border-t border-gray-200 bg-gray-50 flex items-center justify-between w-full">
            <div className="md:text-[12px] text-[10px] text-gray-600 truncate max-w-xs">
              {previewUrl?.split("/").pop()}
            </div>
            <div className="flex space-x-2">
              <Button
                className="text-[#3586FF] hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-200 flex items-center"
                onClick={() => handleDownload(previewUrl, 0)}
              >
                <MdDownload className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DocumentSection;
