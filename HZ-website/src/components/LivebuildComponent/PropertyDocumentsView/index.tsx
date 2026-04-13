import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { IoDocumentSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import DocumentSection from "../DocumentSection";
import Loader from "@/components/Loader";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import RouterBack from "../RouterBack";

export default function PropertyDocumentsView() {
  const router = useRouter();
  const custom_builder_id = router?.query?.id;
  const { data: customBuilder, isLoading, fetchData } = useCustomBuilderStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (custom_builder_id) {
      fetchData(custom_builder_id.toString());
    }
  }, [custom_builder_id, fetchData]);

  const groupedDocuments = (customBuilder?.documents || []).reduce(
    (acc: Record<string, any[]>, doc: any) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    },
    {}
  );

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <>
      <div className="p-5 w-full">
        <div className="px-2 py-4">
          <RouterBack />
        </div>
        <section className="bg-white rounded-[8px] md:p-6 p-3">
          <div className="flex items-center justify-between md:mb-[22px] mb-[10px]">
            <div className="w-full flex items-center gap-2 md:mb-4 mb-2">
              <IoDocumentSharp className="text-[#3586FF] md:w-6 w-3 md:h-6 h-3" />
              <h1 className="font-bold md:text-[18px] text-[14px] ">
                Property Documents
              </h1>
            </div>
          </div>

          <div>
            <DocumentSection
              costEstimation={groupedDocuments.costEstimation ?? []}
              agreement={groupedDocuments.agreement ?? []}
              weeklyReports={groupedDocuments.weeklyReports ?? []}
              monthlyReports={groupedDocuments.monthlyReports ?? []}
              paymentReports={groupedDocuments.paymentReports ?? []}
              warranty={groupedDocuments.warranty ?? []}
              bills={groupedDocuments.bills ?? []}
              floorPlan={groupedDocuments.floorPlan ?? []}
            />
          </div>
        </section>
      </div>
    </>
  );
}
