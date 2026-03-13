import React, { useEffect, useRef, useState } from "react";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import Image from "next/image";
import { deleteFile, uploadFile } from "@/src/utils/uploadFile";
import Button from "@/src/common/Button";
import { twMerge } from "tailwind-merge";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { X } from "lucide-react";
import Modal from "@/src/common/Modal";
import { DocumentIcon } from "../Icons";
import toast from "react-hot-toast";
import { DeleteForever } from "@mui/icons-material";
import { RxCrossCircled } from "react-icons/rx";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "@/src/common/Loader";
import { MdDownload, MdEdit } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { billCategoryOptions } from "../helper";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import { useSession } from "next-auth/react";
const DocumentUpload = () => {
  const {
    updateDocumentUpload,
    documentUpload,
    onboardingSteps,
    setCustomBuilderID,
    custom_builder_id,
  } = useCustomBuilderStore();
  const [tabValues] = useState([
    "costEstimation",
    "agreement",
    "paymentReports",
    "weeklyReports",
    "monthlyReports",
    "warranty",
    "bills",
    "floorPlan",
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("costEstimation");
  const { data: session, status } = useSession();
  const currentuserId = session?.user?.id ;
  const [modalState, setModalState] = useState({
    costEstimator: false,
    agreement: false,
    paymentReports: false,
    weeklyReports: false,
    monthlyReports: false,
    warranty: false,
    bills: false,
    floorPlan: false,
  });
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    fileName: string | null;
    index: number | null;
    docId?: number | null;
  }>({ isOpen: false, fileName: null, index: null, docId: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  console.log(editingDoc);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});

  const [filesel, setFilesel] = useState<any[]>([]);
  const router = useRouter();
  const [custombuilderUser, setCustombuilderUser] = useState({
    userId: 0,
    email: "",
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    docUrl: "",
  });

  useEffect(() => {
    if (router.isReady) {
      setUserId(router.query.userId as string);
    }
  }, [router.isReady]);

  const fetchDetails = async () => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}`,{},true
      );
      if (response.status === 200) {
        const res = response.body;

        const imagedata = {
          agreement: res.documents.filter((d) => d.type === "agreement"),
          costEstimation: res.documents.filter(
            (d) => d.type === "costEstimation"
          ),
          paymentReports: res.documents.filter(
            (d) => d.type === "paymentReports"
          ),
          weeklyReports: res.documents.filter(
            (d) => d.type === "weeklyReports"
          ),
          monthlyReports: res.documents.filter(
            (d) => d.type === "monthlyReports"
          ),
          warranty: res.documents.filter((d) => d.type === "warranty"),
          bills: res.documents.filter((d) => d.type === "bills"),
          floorPlan: res.documents.filter((d) => d.type === "floorPlan"),
        };

        updateDocumentUpload("costEstimation", imagedata.costEstimation, true);
        updateDocumentUpload("agreement", imagedata.agreement, true);
        updateDocumentUpload("paymentReports", imagedata.paymentReports, true);
        updateDocumentUpload("weeklyReports", imagedata.weeklyReports, true);
        updateDocumentUpload("monthlyReports", imagedata.monthlyReports, true);
        updateDocumentUpload("warranty", imagedata.warranty, true);
        updateDocumentUpload("bills", imagedata.bills, true);
        updateDocumentUpload("floorPlan", imagedata.floorPlan, true);

        setCustombuilderUser({
          userId: res?.user?.id as number,
          email: res?.user?.email,
        });

        setIsLoading(false);
        toast.success("Details fetched successfully");
      }
    } catch (error) {
      console.log("error ocred", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const builderIdFromQuery = String(router.query.userId);
      if (builderIdFromQuery) {
        setCustomBuilderID(builderIdFromQuery);
        fetchDetails();
      }
    }
  }, [router.isReady, custom_builder_id]);

  const handleFilesChange = (file: any) => {
    const validFiles = file.filter(
      (file: File) =>
        file.size <= 15 * 1024 * 1024 &&
        ["application/pdf", "image/png", "image/jpeg"].includes(file.type)
    );

    if (validFiles.length !== file.length) {
      toast.error(
        "Some files were not valid (size > 15MB or unsupported format)"
      );
    }

    const updatedFiles = [...filesel, ...validFiles];
    setFilesel(updatedFiles);
  };

  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    documentDate: "",
  });

  const [billMeta, setBillMeta] = useState({
    category: "materials",
    amount: "",
    vendor: "",
    referenceNo: "",
    paidVia: "",
    gstNo: "",
  });
  const handleBillInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBillMeta((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCommonInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleBillSelectChange = (selectedOption: {
    id: number;
    role: string;
  }) => {
    setBillMeta((prev) => ({
      ...prev,
      category: selectedOption.role,
    }));
  };

  enum CBDocumentType {
    COST_ESTIMATION = "costEstimation",
    AGREEMENT = "agreement",
    PAYMENT_REPORT = "paymentReports",
    WEEKLY_REPORT = "weeklyReports",
    MONTHLY_REPORT = "monthlyReports",
    WARRANTY = "warranty",
    BILL = "bills",
    FLOOR_PLAN = "floorPlan",
  }

  const tabToType: Record<string, CBDocumentType> = {
    costEstimation: CBDocumentType.COST_ESTIMATION,
    agreement: CBDocumentType.AGREEMENT,
    paymentReports: CBDocumentType.PAYMENT_REPORT,
    weeklyReports: CBDocumentType.WEEKLY_REPORT,
    monthlyReports: CBDocumentType.MONTHLY_REPORT,
    warranty: CBDocumentType.WARRANTY,
    bills: CBDocumentType.BILL,
    floorPlan: CBDocumentType.FLOOR_PLAN,
  };
  const handleConfirmDelete = async (index: number) => {
    try {
      const docId = deleteModal.docId;
      if (!docId) throw new Error("No document ID found");

      const response = await apiClient.delete(
        `${apiClient.URLS.custom_builder}/${userId}/documents/${docId}`,
        true
      );

      if (response.status === 200) {
        const tabKey = activeTab as
          | "costEstimation"
          | "agreement"
          | "paymentReports"
          | "weeklyReports"
          | "monthlyReports"
          | "warranty"
          | "bills"
          | "floorPlan";

        const updatedDocuments = documentUpload[tabKey].filter(
          (_: any, i: number) => i !== index
        );

        updateDocumentUpload(tabKey, updatedDocuments, true);

        toast.success("File deleted successfully");
      } else {
        throw new Error("Failed to delete document");
      }
    } catch (error) {
      console.error("Error occurred while deleting file:", error);
      toast.error("An error occurred while deleting the file.");
    } finally {
      setDeleteModal({
        isOpen: false,
        fileName: null,
        index: null,
        docId: null,
      });
    }
  };
  const validateErrors = (): boolean => {
    const newErrors: any = {};
    if (!formData.title) {
      newErrors.title = "Title is required";
    }
    if (!formData.documentDate) {
      newErrors.documentDate = "Document Date is required";
    }
    if (!editingDoc && filesel.length === 0) {
      newErrors.files = "At least one file is required";
    }
    if (activeTab === "bills") {
      if (!billMeta.amount) {
        newErrors.amount = "Amount is required";
      }
      if (!billMeta.category) {
        newErrors.category = "Category is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const isValid = validateErrors();
    if (!isValid) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editingDoc && filesel.length === 0) {
      toast.error("No files to upload");
      return;
    }
    setIsSubmitting(true);

    try {
      const tabKey = activeTab as
        | "costEstimation"
        | "agreement"
        | "paymentReports"
        | "weeklyReports"
        | "monthlyReports"
        | "warranty"
        | "bills"
        | "floorPlan";

      const uploadedUrls: string[] = [];
      for (const file of filesel) {
        const url = await uploadFile(file, "customBuilder/documents");
        if (!url) throw new Error(`Failed to upload file: ${file.name}`);
        uploadedUrls.push(url);
      }

      const basePayload: any = {
        type: tabToType[tabKey],
        title: formData.title || undefined,
        notes: formData.notes || undefined,
        documentDate: formData.documentDate || undefined,
        uploadedById: currentuserId || undefined,
      };
      if (tabKey === "bills") {
        basePayload.meta = {
          category: billMeta.category || undefined,
          amount: billMeta.amount
            ? parseFloat(String(billMeta.amount))
            : undefined,
          vendor: billMeta.vendor || undefined,
          referenceNo: billMeta.referenceNo || undefined,
          paidVia: billMeta.paidVia || undefined,
          gstNo: billMeta.gstNo || undefined,
        };
      }

      let res;

      if (editingDoc) {
        const payload = { ...basePayload };

        if (uploadedUrls.length > 0) payload.fileUrl = uploadedUrls[0];

        res = await apiClient.patch(
          `${apiClient.URLS.custom_builder}/${custom_builder_id}/documents/${editingDoc.id}`,
          payload
        );
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Failed to update document");
        toast.success("Document updated!");
      } else {
        const createdDocs = [];
        for (const fileUrl of uploadedUrls) {
          const payload = { ...basePayload, fileUrl };
          const r = await apiClient.post(
            `${apiClient.URLS.custom_builder}/${custom_builder_id}/documents`,
            payload
          );
          if (r.status !== 200 && r.status !== 201)
            throw new Error("Failed to create document");
          createdDocs.push(r.body);
        }
        toast.success("Documents uploaded!");
      }

      setFilesel([]);
      setEditingDoc(null);
      setModalState((prev) => ({ ...prev, [tabKey]: false }));
      setFormData({ title: "", notes: "", documentDate: "" });
      setBillMeta({
        category: "materials",
        amount: "",
        vendor: "",
        referenceNo: "",
        paidVia: "",
        gstNo: "",
      });
      setErrors({});
      await fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (tab: string) => {
    setFormData({
    title: "",
    notes: "",
    documentDate: "",
  }); 

  setBillMeta({
    category: "materials",
    amount: "",
    vendor: "",
    referenceNo: "",
    paidVia: "",
    gstNo: "",
  });
    setErrors({});
    setModalState((prev) => ({
      ...prev,
      [tab]: false,
    }));
  };

  const removeFiles = (index: number) => {
    const fileToRemove = filesel[index];
    const updatedFiles = filesel.filter((_, i) => i !== index);
    setFilesel(updatedFiles);
    toast.success(`${fileToRemove.name} removed successfully`);
  };

  const renderModal = (tab: string) => {
    const isBills = activeTab === "bills";
    const tabLabel = tab.slice(0, 1).toUpperCase() + tab.slice(1).toLowerCase();

    return (
      <Modal
        isOpen={modalState[tab as keyof typeof modalState] as any}
        closeModal={() => handleModalClose(tab)}
        className="w-full max-w-[860px] h-full bg-white rounded-lg overflow-hidden flex flex-col"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
            <Loader />
          </div>
        )}
        <div className="flex items-center justify-between md:px-8 px-4 md:py-5 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="heading-text">Add {tabLabel.replace("-", " ")}</h2>
            <p className="sublabel-text text-gray-500">
              Attach PDF/PNG/JPEG (max 15MB each). Add title, date, and notes
              for better tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="sublabel-text text-gray-600">Selected</span>
            <span className="inline-flex items-center justify-center min-w-[28px] h-[24px] rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 font-bold text-[12px]">
              {filesel?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto md:px-8 px-4 md:py-6 py-4 space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <p className="sub-heading mb-3">Document details</p>
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-x-4 md:gap-y-3 gap-2">
              <CustomInput
                label="Title"
                labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                placeholder="Enter title here"
                name="title"
                type="text"
                className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                value={formData.title}
                onChange={handleCommonInputChange}
                required
                errorMsg={errors?.title}
              />

              <CustomDate
                label="Document Date"
                labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                required
                placeholder="Select date"
                className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                value={formData.documentDate}
                onChange={(e) =>
                  setFormData({ ...formData, documentDate: e.target.value })
                }
                errorMsg={errors?.documentDate}
              />

              <div className="md:col-span-2 col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="label-text">Notes</label>
                  <span className="sublabel-text text-gray-500">
                    {formData.notes?.length || 0}/400
                  </span>
                </div>
                <CustomInput
                  label=""
                  labelCls="hidden"
                  placeholder="Write any context (e.g., vendor terms, payment info, version notes)…"
                  name="notes"
                  type="textarea"
                  className="w-full min-h-[100px] md:min-h-[120px] border border-[#CFCFCF] rounded-md px-3  text-sm md:text-[14px]"
                  value={formData.notes}
                  onChange={handleCommonInputChange}
                />
              </div>
            </div>
          </section>

          {isBills && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
              <p className="sub-heading mb-3">Bill metadata</p>
              <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
                <div className="flex flex-col">
                  <p className="label-text mb-1">Bill Category</p>
                  <SingleSelect
                    type="single-select"
                    name="category"
                    options={billCategoryOptions}
                    rootCls="border border-[#CFCFCF] rounded-md  px-2 w-full"
                    buttonCls="border-none"
                    selectedOption={billCategoryOptions.find(
                      (item) => item.role === billMeta.category
                    )}
                    optionsInterface={{ isObj: true, displayKey: "role" }}
                    handleChange={(_, value) => handleBillSelectChange(value)}
                  />
                  <p className="sublabel-text text-gray-500 mt-1">
                    Choose the expense bucket for analytics & reports.
                  </p>
                </div>

                <CustomInput
                  label="Amount"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  placeholder="Enter amount (₹)"
                  name="amount"
                  type="number"
                  className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                  value={billMeta.amount}
                  onChange={handleBillInputChange}
                  required
                  errorMsg={errors?.amount}
                />

                <CustomInput
                  label="Vendor"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  placeholder="Enter vendor"
                  name="vendor"
                  type="text"
                  className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                  value={billMeta.vendor}
                  onChange={handleBillInputChange}
                />

                <CustomInput
                  label="Reference No"
                  labelCls="label-text"
                  placeholder="Bill/Invoice reference number"
                  name="referenceNo"
                  type="text"
                  className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                  value={billMeta.referenceNo}
                  onChange={handleBillInputChange}
                />

                <CustomInput
                  label="Paid Via (cash/upi/card/bank/cheque/other)"
                   labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  placeholder="Enter payment mode"
                  name="paidVia"
                  type="text"
                  className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                  value={billMeta.paidVia}
                  onChange={handleBillInputChange}
                />

                <CustomInput
                  label="GST No"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  placeholder="Enter GST number"
                  name="gstNo"
                  type="text"
                  className="w-full border border-[#CFCFCF] rounded-md  px-3 "
                  value={billMeta.gstNo}
                  onChange={handleBillInputChange}
                />
              </div>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-2 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="sub-heading">Attachments</p>
              <span className="sublabel-text text-gray-500">
                Max size 15MB • Formats: PDF, PNG, JPEG
              </span>
            </div>
            <DocumentUploader
              handleFiles={handleFilesChange}
              removeFiles={removeFiles}
              existingUrls={editingDoc?.fileUrl ? [editingDoc.fileUrl] : []}
              key={editingDoc?.id ?? "create"}
              errorMsg={errors?.files}
            />
          </section>
        </div>

        <div className="md:px-8 px-4 md:py-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <p className="sublabel-text text-gray-500">
              You’re adding files to{" "}
              <span className="font-medium">{tabLabel}</span>
            </p>
            <div className="flex gap-2">
              <Button
                className="bg-gray-100 text-gray-900 border border-gray-300 btn-text md:px-6 px-4 md: py-[6px] rounded-md"
                onClick={() => handleModalClose(tab)}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                className="bg-[#3B82F6] text-white btn-text md:px-6 px-4 md: py-[6px] rounded-md disabled:opacity-60"
                onClick={handleSubmit}
              >
                {isSubmitting ? "Saving..." : editingDoc ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderDeleteModal = () => {
    if (!deleteModal.isOpen) return null;
    return (
      <Modal
        isOpen={deleteModal.isOpen}
        isCloseRequired={false}
        closeModal={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        className="md:max-w-[380px] max-w-[320px] items-center justify-center"
      >
        <div className="flex flex-col justify-center items-center">
          <p className="text-center font-medium text-gray-700 md:mb-5 mb-3 md:text-[18px] text-[13px]">
            Are you sure you want to delete? Document deletion cannot be undone.
          </p>
          <p className="text-gray-600 leading-9 md:text-[14px] text-[10px]">
            {deleteModal.fileName?.slice?.(0, 20) || "this file"}
          </p>
          <div className="flex w-[70%] justify-between mt-2">
            <Button
              className="bg-gray-100 text-black border-[1.5px] md:text-[14px] text-[12px] border-gray-400 hover:bg-gray-200 md:px-4 px-3 md:py-1.5 py-1 rounded-md font-medium"
              onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#c22828] text-white md:text-[14px] text-[12px] md:px-4 px-3 md:py-1.5 py-1 rounded-md font-medium"
              onClick={() => handleConfirmDelete(deleteModal.index as number)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderTabContent = () => {
    const tabKey = activeTab as
      | "costEstimation"
      | "agreement"
      | "paymentReports"
      | "weeklyReports"
      | "monthlyReports"
      | "warranty"
      | "bills"
      | "floorPlan";
    const tabDocuments = documentUpload[tabKey] || [];

    if (isLoading) {
      return (
        <div className="w-full h-full flex justify-center">
          <Loader />
        </div>
      );
    }

    const handleViewDocument = (doc: string) => {
      setViewModal({ isOpen: true, docUrl: doc });
    };

    const handleDownloadDocument = async (url: string) => {
      try {
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
      }
    };

    return (
      <div className="flex flex-col w-full md:max-w-full max-w-[490px]">
        <div className="flex flex-row justify-end">
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white  px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("custom_builder", "create")}
          >
            <Button
              className="md:px-3 px-2 md:py-1.5 py-1 mb-2 bg-[#3B82F6] md:text-[14px] text-[12px] font-medium text-white rounded-md"
              disabled={!hasPermission("custom_builder", "create")}
              onClick={() => setModalState({ ...modalState, [tabKey]: true })}
            >
              + Add New
            </Button>
          </CustomTooltip>
        </div>

        {tabDocuments?.length === 0 ? (
          <div className="flex flex-row justify-center items-center font-medium bg-blue-100 py-3 px-4 rounded-md w-full text-[13px]">
            <p>There are no cost estimations.</p>
          </div>
        ) : (
          <div className=" grid md:grid-cols-5 grid-cols-3 md:gap-4 gap-2">
            {tabDocuments?.map((doc: any, index: number) => {
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
                      <div className="w-full md:h-24 h-20 overflow-hidden border rounded-md">
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
                    <div className="relative w-full md:h-[120px] h-[80px] overflow-hidden rounded-md">
                      <Image
                        src={doc.fileUrl || ""}
                        alt={doc.title || `Uploaded ${activeTab}`}
                        fill
                        className="object-cover rounded-sm"
                      />
                    </div>
                  )}

                  <div className="mt-2 text-[10px] md:text-[12px] font-medium text-gray-600 ">
                    <p>
                      <span className="font-bold text-black">
                        Title:
                      </span>{" "}
                      {doc?.title || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold  text-black">
                        Notes:
                      </span>{" "}
                      {doc?.notes?.slice(0, 50) || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold  text-black">
                        Date:
                      </span>{" "}
                      {doc?.documentDate || "N/A"}
                    </p>

                    {doc?.meta && (
                      <div className="mt-1 text-[10px] md:text-[12px] font-medium ">
                        <p>
                          <span className="font-bold  text-black">
                            Category:
                          </span>{" "}
                          {doc?.meta?.category || "N/A"}
                        </p>
                        <p>
                          <span className="font-bold  text-black">
                            Amount:
                          </span>{" "}
                          {doc?.meta?.amount || "N/A"}
                        </p>
                        <p>
                          <span className="font-bold  text-black">
                            Vendor:
                          </span>{" "}
                          {doc?.meta?.vendor || "N/A"}
                        </p>
                        <p>
                          <span className="font-bold  text-black">
                            GST No:
                          </span>{" "}
                          {doc?.meta?.gstNo || "N/A"}
                        </p>
                        <p>
                          <span className="font-bold  text-black">
                            Paid Via:
                          </span>{" "}
                          {doc?.meta?.paidVia || "N/A"}
                        </p>
                        <p>
                          <span className="font-bold  text-black">
                            Ref No:
                          </span>{" "}
                          {doc?.meta?.referenceNo || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-2 right-2  gap-2  duration-200 flex justify-between px-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="pointer-events-auto flex gap-2">
                      <Button
                        className=" bg-[#5297ff] text-white p-1 rounded-full hover:bg-blue-700"
                        onClick={() => {
                          setEditingDoc(doc);
                          setFormData({
                            title: doc.title || "",
                            notes: doc.notes || "",
                            documentDate: doc.documentDate || "",
                          });
                          if (activeTab === "bills" && doc.meta) {
                            setBillMeta({
                              category: doc.meta.category || "materials",
                              amount: doc.meta.amount || "",
                              vendor: doc.meta.vendor || "",
                              referenceNo: doc.meta.referenceNo || "",
                              paidVia: doc.meta.paidVia || "",
                              gstNo: doc.meta.gstNo || "",
                            });
                          }
                          setModalState((prev) => ({
                            ...prev,
                            [activeTab]: true,
                          }));
                        }}
                      >
                        <MdEdit className="md:text-[14px] text-[12px]" />
                      </Button>

                      <Button
                        className=" bg-gray-300 text-white p-1 rounded-full hover:bg-green-700"
                        onClick={() => handleViewDocument(doc.fileUrl)}
                      >
                        <IoMdEye className="md:text-[14px] text-[12px]" />
                      </Button>

                      <Button
                        className=" bg-[#5297ff] text-white p-1 rounded-full hover:bg-blue-700"
                        onClick={() => handleDownloadDocument(doc.fileUrl)}
                      >
                        <MdDownload className="md:text-[14px] text-[12px]" />
                      </Button>

                      <Button
                        className=" bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            fileName,
                            index,
                            docId: doc.id,
                          })
                        }
                      >
                        <RxCrossCircled className="text-[14px]" />
                        {renderDeleteModal()}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {renderModal(tabKey)}
        <Modal
          isOpen={viewModal.isOpen}
          closeModal={() => setViewModal({ isOpen: false, docUrl: "" })}
          className="w-full h-full bg-white md:px-8 px-4 md:py-6 py-4 rounded-md flex items-center justify-center"
          rootCls="flex items-center justify-center z-[9999]"
          isCloseRequired={false}
        >
          <div className="flex items-center justify-between md:px-6 px-3 md:py-4  py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="md:text-[14px] text-[12px] font-medium text-gray-800">
              {tabKey} Preview
            </h2>
            <Button
              className="text-gray-500 hover:text-red-500 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              onClick={() => setViewModal({ isOpen: false, docUrl: "" })}
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>{" "}
          <div className="flex-1 overflow-auto w-full flex items-center justify-center p-4 md:p-6 bg-gray-100">
            {viewModal.docUrl.endsWith(".pdf") ? (
              <div className="md:w-[480px] w-[300px] md:h-[500px] h-[300px] overflow-auto">
                <Worker
                  workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                >
                  <Viewer fileUrl={viewModal.docUrl} defaultScale={1.0} />
                </Worker>
              </div>
            ) : (
              <div className="relative md:w-[480px] w-[280px] md:h-[500px] h-[220px]">
                <Image
                  src={viewModal.docUrl}
                  alt="Document Preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="md:px-6 px-2 md:py-3 py-1 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="md:text-[12px] text-[10px] text-gray-600 truncate max-w-xs">
              {viewModal.docUrl.split("/").pop()}
            </div>
            <div className="flex space-x-2">
              <Button
                className="text-[#3586FF]  hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-200 flex items-center"
                onClick={() => {
                  handleDownloadDocument(viewModal.docUrl);
                }}
              >
                <MdDownload className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  return (
    <div className="md:p-5 px-3 py-3 space-y-6 max-w-full overflow-x-auto">
      <h1 className="md:text-[22px] text-[18px] text-[#3586FF]  font-bold mb-2">
        Document Upload
      </h1>

      {/* Tabs - smaller paddings */}
      <div className="flex md:gap-3 gap-2 px-1 py-2 md:py-1 w-full md:max-w-full max-w-[490px] overflow-x-auto">
        {tabValues.map((tab) => (
          <Button
            key={tab}
            className={twMerge(
              "md:px-4 md:py-2 px-2 py-1 md:rounded-md rounded-[6px] text-[12px] md:text-[14px] font-medium",
              activeTab === tab
                ? "bg-[#3B82F6] text-white"
                : "bg-gray-200 text-gray-600"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab.slice(0, 1).toUpperCase() + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 w-full overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DocumentUpload;

const DocumentUploader = ({
  handleFiles,
  removeFiles,
  existingUrls = [],
  errorMsg,
}: {
  handleFiles: (files: File[]) => void;
  removeFiles: (index: number) => void;
  existingUrls?: string[];
  errorMsg?: string;
}) => {
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setLocalFiles((prev) => [...prev, ...files]);
    handleFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setLocalFiles((prev) => [...prev, ...files]);
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleUploadClick = () => inputRef.current?.click();

  const handleRemoveLocalFile = (index: number) => {
    const updated = localFiles.filter((_, i) => i !== index);
    setLocalFiles(updated);
    removeFiles(index);
  };

  return (
    <div
      className="relative w-full h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Drop area */}
      <div
        className={twMerge(
          "w-full md:px-14 md:py-8 p-4 border-2 border-dashed border-[#2f7df3] rounded-md cursor-pointer"
        )}
        onClick={handleUploadClick}
      >
        <div className="flex flex-col w-full justify-center items-center mx-auto">
          <div>
            <DocumentIcon />
          </div>
          <div className="flex flex-col justify-center items-center gap-1.5">
            <p className="font-medium text-[14px] text-[#0381FF]">
              Drag and drop files or Upload
            </p>
            <p className="text-[12px] text-[#7B7C83]">
              Max size 15MB • Formats: PDF, PNG, JPEG
            </p>
          </div>
        </div>
      </div>

      <input
        type="file"
        multiple
        ref={inputRef}
        required
        accept=".pdf,.jpeg,.jpg,.png"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {existingUrls?.length > 0 && (
        <div className="mt-3">
          <p className="text-[12px] text-gray-600 mb-2">Current file</p>
          <div className="grid grid-cols-3 gap-3">
            {existingUrls.map((url, i) => {
              const name = url.split("/").pop() || `file-${i + 1}`;
              const isPdf = url.toLowerCase().endsWith(".pdf");
              return (
                <div
                  key={url}
                  className="relative p-3 border rounded-md shadow bg-white"
                >
                  {isPdf ? (
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-gray-700 mt-1 text-center truncate w-full">
                        {name}
                      </p>
                      <div className="w-full h-28 overflow-hidden border rounded-md flex items-center justify-center">
                        <span className="text-[11px] text-gray-600">
                          PDF preview
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={name}
                      className="object-cover rounded-md w-full h-28"
                    />
                  )}
                  <span className="absolute top-2 left-2 text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    Existing
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {localFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {localFiles.map((file, index) => (
            <div
              key={index}
              className="relative p-3 border rounded-md shadow bg-white"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover rounded-md w-full h-28"
                />
              ) : (
                <p className="text-xs text-gray-700 truncate">{file.name}</p>
              )}

              <Button
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700"
                onClick={() => handleRemoveLocalFile(index)}
              >
                <DeleteForever className="!text-[16px]" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {errorMsg && <p className="text-[12px] text-red-500 mt-2">{errorMsg}</p>}
    </div>
  );
};
