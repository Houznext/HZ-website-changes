import React, { useState } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import { FiGrid } from "react-icons/fi";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PriceFloorPlan = ({ propertyData, data }: any) => {
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  const selectedUnit = propertyData?.units?.[selectedUnitIndex];
  const selectedPlan = selectedUnit?.flooringPlans[selectedPlanIndex];

  const isPDF = (url: string) => url?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full">

      <h2 className="text-[#3586FF] md:text-[16px] text-[14px] font-bold mb-5 flex items-center gap-2">
        <FiGrid className="text-[#3586FF] text-lg" />
        Price & Floor Plan
      </h2>


      <div className="flex gap-3 border-b pb-3 overflow-x-auto scrollbar-hide">
        {propertyData?.units?.map((unit: any, index: number) => (
          <Button
            key={unit.id}
            onClick={() => {
              setSelectedUnitIndex(index);
              setSelectedPlanIndex(0);
            }}
            className={`transition-all duration-300 px-3 py-2 md:text-sm text-[10px] font-medium md:min-w-[110px] min-w-[75px] rounded-lg shadow-sm
              ${selectedUnitIndex === index
                ? "bg-[#3586FF] text-white border border-[#3586FF] font-Gordiata-Bold"
                : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-blue-400 hover:bg-blue-50"
              }`}
          >
            <span>{unit?.BHK}</span>
            <p className="md:mb-1 mb-0.5 md:text-[13px] text-[10px]">Apartment</p>
            <span className="text-[11px] md:text-[13px] font-medium">
              ₹{(unit.flooringPlans[0]?.TotalPrice / 10000000).toFixed(2)} Cr
            </span>
          </Button>
        ))}
      </div>


      {selectedUnit?.flooringPlans.length > 1 && (
        <div className="flex gap-3 py-3 border-b overflow-x-auto scrollbar-hide">
          {selectedUnit.flooringPlans.map((plan: any, index: number) => (
            <Button
              key={plan.id}
              onClick={() => setSelectedPlanIndex(index)}
              className={`transition-all duration-300 px-3 py-1 md:text-sm text-[10px] rounded-md
                ${selectedPlanIndex === index
                  ? "text-[#3586FF] font-bold border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-[#3586FF]"
                }`}
            >
              {plan.BuiltupArea?.size} SQ.FT
            </Button>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="md:mt-5 mt-3">
        <h3 className="text-black md:text-[15px] text-[11px] font-bold">
          ₹ {(selectedPlan?.TotalPrice / 100000).toFixed(1)} L
        </h3>


        <div className="gap-4 mt-3 flex flex-wrap">
          {selectedPlan?.floorplan?.length > 0 ? (
            selectedPlan.floorplan.map((floorplan: string, idx: number) =>
              isPDF(floorplan) ? (
                <div
                  key={idx}
                  className="md:w-[200px] w-[150px] md:h-[150px] h-[100px] bg-white border rounded-xl shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <Document file={floorplan}>
                    <Page
                      pageNumber={1}
                      width={300}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </Document>
                </div>
              ) : (
                <div
                  key={idx}
                  className="relative border rounded-xl bg-gray-100 md:w-[200px] w-[120px] md:h-[150px] h-[100px] shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={floorplan}
                    alt={`Floor Plan ${idx + 1}`}
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
              )
            )
          ) : (
            <p className="text-gray-500 label-text p-4">No Floor Plan Available</p>
          )}
        </div>
      </div>


      <div className="flex md:gap-6 gap-3 md:mt-5 mt-3 md:text-[15px] text-[11px]">
        <div className="flex-1 p-3 rounded-lg bg-gray-50 border shadow-sm">
          <p className="font-medium md:text-[14px] text-[12px]">
            Builtup Area
          </p>
          <p className="md:text-[12px] text-[10px] text-gray-700">
            {selectedPlan?.BuiltupArea?.size}{" "}
            {selectedPlan?.BuiltupArea?.unit || "N/A"}
          </p>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-gray-50 border shadow-sm">
          <p className="font-medium md:text-[14px] text-[12px]">
            Possession Status
          </p>
          <p className="text-[#3586FF] md:text-[12px] text-[10px] font-medium">
            {data?.constructionStatus?.status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceFloorPlan;
