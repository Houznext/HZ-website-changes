import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Drawer from "@/src/common/Drawer";
import toast from "react-hot-toast";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { IoMdMore } from "react-icons/io";
import { InvoiceEstimatorForm } from "../InvoiceView"
import { MdDelete, MdEdit } from "react-icons/md";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";
import Loader from "../SpinLoader";
import CostEstimationHeader from "../CostEstimatorDetailsView/CostEstimatorHeader";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import { ArrowLeft } from "lucide-react";

export default function InvoiceDetailsView() {
  const params = useParams();
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string}[]>([]);
  const session = useSession();
  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);

  console.log("invoiceData", invoiceData);
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setOpenModal(true);
    handleClose();
  };


  const fetchBranches = async () => {
    // Branch listing API removed on backend; avoid calling it here.
    setBranchOptions([]);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const closeDrawer = () => {
    setOpenModal(false);
    setEditingInvoice(null);
  };

  const fetchinvoiceEstimationById = async () => {
    const invoiceId = (router.query.id);
    if (!invoiceId || invoiceId === "undefined") return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.invoice_estimator}/${invoiceId}`, {}, true
      );
      if (response.status === 200) {
        setInvoiceData(response.body);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchinvoiceEstimationById();
     fetchBranches();
  }, [router.query.id]);

  const handleDelete = async (id: number) => {
    try {
      router.back();
      const response = await apiClient.delete(
        `${apiClient.URLS.invoice_estimator}/${id}`,{}, true
      );
      if (response.status === 200) {
        console.log("Estimation deleted successfully");
        toast.success("Estimation deleted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const generateReport = async (billToName: string) => {
    if (!reportRef.current) return;

    const originalStyles = {
      overflowX: reportRef.current.style.overflowX,
      width: reportRef.current.style.width,
    };

    const pdfHeader = document.getElementById("pdf-header");
    const excludeElements = document.querySelectorAll(".exclude-from-pdf");

    excludeElements.forEach(
      (el) => ((el as HTMLElement).style.display = "none")
    );
    pdfHeader?.classList.remove("hidden");

    reportRef.current.style.overflowX = "visible";
    reportRef.current.style.width = "800px";

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 800,
    });

    excludeElements.forEach((el) => ((el as HTMLElement).style.display = ""));
    pdfHeader?.classList.add("hidden");

    reportRef.current.style.overflowX = originalStyles.overflowX;
    reportRef.current.style.width = originalStyles.width;

    const imgData = canvas.toDataURL("image/jpeg", 1.5);
    const pdfWidth = 595.28;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${billToName}.pdf`);
  };

  return (
    <div className="mx-auto ">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div
            className="max-w-4xl mx-auto border border-gray-300 shadow-lg md:p-10 p-2 md:mt-10 mt-5 bg-white rounded-[4px] md:rounded-[10px] relative"
            ref={reportRef}
          >
            <div id="pdf-header" className="hidden print:block">
              <CostEstimationHeader />
            </div>
            <div
              className="print:hidden sticky top-0 z-20 bg-[#f7f8fa]/80 backdrop-blur-sm no-export make-static"
              data-html2canvas-ignore="true"
            > <div className="max-w-8xl mx-auto btn-text flex items-center justify-between gap-2 px-2 md:px-0 py-3">
                <Button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-700 hover:text-[#3586FF]  font-medium">
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      generateReport(invoiceData?.billToName);
                      handleClose();
                    }}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
                  >
                    Download
                  </Button>
                  <CustomTooltip
                    label="Access Restricted Contact Admin"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("invoice_estimator", "edit")}
                  >
                    <Button
                      onClick={() => {
                        handleEdit(invoiceData);
                        handleClose();
                      }}
                      className="px-3 py-1 rounded-md bg-[#5297ff] hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-50"
                      disabled={!hasPermission("invoice_estimator", "edit")}
                    >
                      Edit
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip
                    label="Access Restricted Contact Admin"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("invoice_estimator", "delete")}
                  >
                    <Button
                      onClick={() => {
                        handleClose();
                        setOpenDeleteModal(true);
                      }}
                      className="px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium flex items-center gap-2 disabled:opacity-50"
                      disabled={!hasPermission("invoice_estimator", "delete")}
                    >
                      Delete
                    </Button>
                  </CustomTooltip>

                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-4 gap-2 md:mt-6 mt-3 md:text-[12px]  font-medium text-[10px]">
              <div>
                <p>
                  <span>Invoice No:</span> {invoiceData?.invoiceNumber}
                </p>
                <p>
                  <span>Invoice Date:</span>{" "}
                  <span className="text-gray-500 ml-2">
                    {new Date(invoiceData?.invoiceDate).toDateString()}
                  </span>
                </p>
                <p>
                  <span>Due Date:</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(invoiceData?.invoiceDue).toDateString()}
                  </span>
                </p>
                <p>
                  <span>Terms:</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-4 gap-2 md:mt-6 mt-3 md:text-sm text-[14px] border border-gray-300 md:rounded-lg rounded-[4px] overflow-hidden">
              <div className="border-r border-gray-200 md:p-4 p-2">
                <h3 className="font-bold md:text-base text-[10px] md:mb-2 mb-1">
                  Bill To:
                </h3>
                <div className="">
                  <p className="md:text-[14px] text-blue-400 font-medium text-[10px]">
                    {invoiceData?.billToName}
                  </p>
                  <p className="md:text-[12px]  font-regular text-[10px]">
                    {invoiceData?.billToAddress}
                  </p>
                  <p className="md:text-[12px]  font-regular text-[10px]">
                    {invoiceData?.billToCity}
                  </p>
                </div>
              </div>
              <div className="md:p-4 p-2">
                <h3 className="font-bold md:text-base text-[10px] md:mb-2 mb-1">
                  Ship To:
                </h3>
                <p className="md:text-[12px]  font-regular text-[10px]">
                  {invoiceData?.shipToAddress}
                </p>
                <p className="md:text-[12px]  font-regular text-[10px]">
                  {invoiceData?.shipToCity}
                </p>
              </div>
            </div>

            <div>
              <InvoiceEstimatorTable
                invoiceData={invoiceData}
                isInForm={false}
              />
            </div>
            <div className="flex w-full md:mt-3 mt-1 justify-end md:text-[16px] text-[12px]">
              <div className="mt-2 text-right flex flex-col  gap-2  ">
                <p className="font-medium border-b-[1px] border-[#5297FF] pb-2">
                  <span className="text-[#3581f3] font-medium">
                    Total: ₹</span> {invoiceData?.subTotal ? invoiceData?.subTotal : invoiceData?.items.map((item: any) => item.price * item.quantity).reduce((acc: number, item: number) => acc + item, 0)}
                </p>

              </div>
            </div>

            <div className="md:mt-8 mt-4   ">
              <p className="font-medium md:text-[16px] text-[12px] text-[#3586FF] ">
                Thanks for Choosing Us.
              </p>
              <p className="md:mt-2 md:text-[12px] text-[10px] mt-1 font-regular text-gray-700">
                Terms & Conditions
              </p>
              <p className="text-gray-700 md:text-[12px] text-[10px] leading-4">
                Full payment is due on receipt of this invoice.
                <br />
                Late payments may incur additional charges or interest as per
                applicable laws.
              </p>
            </div>
          </div>
        </>
      )}
      <Drawer
        open={openModal}
        handleDrawerToggle={() => setOpenModal(false)}
        closeIconCls="text-black"
        openVariant="right"
        panelCls="w-[90%] sm:w-[95%] lg:w-[calc(100%-340px)] shadow-xl"
        overLayCls="bg-gray-700 bg-opacity-40"
        rootCls="z-[999999]"
      >
        <InvoiceEstimatorForm
          closeDrawer={closeDrawer}
          initialData={editingInvoice}
          setEditingInvoice={setEditingInvoice}
          editingInvoice={editingInvoice}
          fetchDetails={fetchinvoiceEstimationById}
          userId={user?.id}
          branchOptions={branchOptions}
        />
      </Drawer>
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[330px]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="md:p-6 p-3 z-20 ">
          <div className="flex justify-between items-center md:mb-4 mb-2">
            <h3 className="md:text-[20px] text-center w-full text-[14px]  font-medium text-gray-900">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-sm text-center text-[12px] text-gray-500 mb-4">
            Are you sure you want to delete this estimation? This action cannot
            be undone.
          </p>
          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className=" md:px-[28px] px-[14px] md:text-[16px] text-[12px] rounded-md border-2 bg-gray-100 hover:bg-gray-200  font-medium text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
            >
              Cancel
            </Button>

            <Button
              className=" md:px-[28px] px-[14px] md:text-[16px] text-[12px]  rounded-md border-2 bg-red-600 text-white"
              onClick={() => handleDelete(invoiceData.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export const InvoiceEstimatorTable = ({
  invoiceData,
  isInForm,
  editItem,
  deleteItem,
  openModal,
}: {
  invoiceData: any;
  isInForm?: boolean;
  editItem?: (id: number) => void;
  deleteItem?: (id: number) => void;
  openModal?: () => void;
}) => {
  return (
    <div className="overflow-x-auto  rounded-md shadow-custom mt-8">
      <table className="md:min-w-full min-w-[800px] w-full md:text-sm text-[12px] border border-collapse border-gray-300 rounded-[6px] md:rounded-lg">
        <thead>
          <tr className="bg-[#5297ff] text-white text-left">
            <th className="border  border-gray-300 p-2">#</th>
            <th className="border  border-gray-300 p-2">Items Description</th>
            <th className="border  border-gray-300 p-2 text-center">Qty</th>
            <th className="border  border-gray-300 p-2 text-center">
              Area(sft/Box)
            </th>
            <th className="py-3 px-4 text-right border border-gray-300">
              Price(₹)
            </th>
            <th className="border  border-gray-300 p-2 text-center">
              Amount(₹)
            </th>
            {isInForm && <th className="border p-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {invoiceData?.items.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50 font-regular">
              <td className="border p-2">{index + 1}</td>
              <td className=" py-2 md:px-4 px-2  border  border-gray-300">
                <div className="font-medium md:text-[14px] text-[12px]">
                  {item?.item_name}
                </div>
                <div className=" text-gray-600  font-regular  md:text-[12px] text-[10px]  leading-[25px] tracking-[0.6px]">
                  {item?.description}
                </div>
              </td>
              <td className=" py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                {item.quantity}
              </td>
              <td className=" py-2 md:px-4 px-2 text-center font-medium border border-gray-300">
                {item?.area}
              </td>
              <td className=" py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                ₹{item.price}
              </td>
              <td className=" py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                ₹{(item.quantity * item.price * item.area).toFixed(2)}
              </td>
              {isInForm && (
                <td className=" py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                  <div className="flex w-full justify-end space-x-5">
                    <IconButton
                      onClick={() => {
                        editItem(index);
                        openModal();
                      }}
                    >
                      <MdEdit className="text-xl" />
                    </IconButton>
                    <IconButton onClick={() => deleteItem(index)}>
                      <MdDelete className="text-red-500 text-xl" />
                    </IconButton>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
