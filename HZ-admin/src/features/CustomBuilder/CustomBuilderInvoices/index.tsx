import React, { useState, useEffect, useMemo } from "react";
import Loader from "@/src/components/SpinLoader";
import Drawer from "@/src/common/Drawer";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { useRouter } from "next/router";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { InvoiceEstimatorTable } from "@/src/components/InvoiceDetailsView";
import apiClient from "@/src/utils/apiClient";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import CustomTooltip from "@/src/common/ToolTip";
import { MdAdd } from "react-icons/md";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { LayoutGrid, Rows } from "lucide-react";
import { MdArrowBack } from "react-icons/md";
import {
  FiUser,
  FiHash,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiMap,
} from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import { usePermissionStore } from "@/src/stores/usePermissions";
import BackRoute from "@/src/common/BackRoute";

export default function CustomBuiderInvoices() {
  const [openModal, setOpenModal] = React.useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allInvoices, setAllInvoices] = useState<any>([]);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const session = useSession();
  const [customBuilderId, setCustomBuilderId] = useState<string | null>(null);
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const [view, setView] = useState<"cards" | "compact">("cards");

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const id = router.query.id || router.asPath.split("/")[2];

    if (id && typeof id === "string") {
      fetchInvoiceEstimator(String(id));
      setCustomBuilderId(id);
    }
  }, [router.isReady, router.query, router.asPath]);

  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);

  const closeDrawer = () => {
    setOpenModal(false);
    setEditingInvoice(null);
  };

  const fetchInvoiceEstimator = async (custombuiderid: string) => {
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.invoice_estimator}/custom-builder/${custombuiderid}`,{},true
      );
      if (response.status === 200) {
        setAllInvoices(response.body);
      }
    } catch (error) {
      console.error("error is", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return allInvoices;

    const lowerSearch = searchQuery.toLowerCase();

    return allInvoices?.filter((item) => {
      return (
        item.billToName?.toLowerCase().includes(lowerSearch) ||
        item.billToAddress?.toLowerCase().includes(lowerSearch) ||
        item.billToCity?.toLowerCase().includes(lowerSearch) ||
        item.invoiceNumber?.toString().includes(lowerSearch) ||
        item.shipToAddress?.toLowerCase().includes(lowerSearch) ||
        item.shipToCity?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [allInvoices, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full ">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="w-full  mt-5 md:p-5  p-3 relative overflow-hidden">
        <div className="mb-2">
          <BackRoute />
        </div>
        <div className="flex md:mb-6 mb-5 justify-between items-center">
          <h1 className="font-bold heading-text text-[#5297FF]">
            Invoice
          </h1>
        </div>
        <div className="flex md:flex-row flex-col items-center justify-between gap-2 w-full">
          <div className="z-10 flex-1 w-full md:w-auto">
            <ReusableSearchFilter
              searchText={searchQuery}
              placeholder="Search by name, email, phone, property name or location"
              onSearchChange={setSearchQuery}
              filters={[]}
              selectedFilters={{}}
              onFilterChange={() => {}}
              className="py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ml-1 md:mb-6 mb-4">
              <Button
                className={`px-2 py-[7px] rounded-md border ${
                  view === "cards"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
                onClick={() => setView("cards")}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>

              <Button
                className={`px-2 py-[7px] rounded-md border ${
                  view === "compact"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
                onClick={() => setView("compact")}
                title="Compact view"
              >
                <Rows className="w-4 h-4" />
              </Button>
            </div>

            <CustomTooltip
              label="Add New Estimation"
              position="bottom"
              tooltipBg="bg-black/60 backdrop-blur-md"
              tooltipTextColor="text-white py-2 px-4 font-medium"
              labelCls="text-[12px] font-medium "
              showTooltip={!hasPermission("invoice_estimator", "create")}
            >
              <Button
                onClick={() => setOpenModal(true)}
                // disabled={!hasPermission("invoice_estimator", "create")}
                className="md:mb-6 mb-4 bg-[#5297ff] text-white font-medium  label-text md:py-1.5 py-1  px-2 md:px-2 rounded-[6px] md:rounded-[8px] flex items-center gap-1"
              >
                <MdAdd className="md:text-[20px] font-medium text-[18px]" />
                Invoice
              </Button>
            </CustomTooltip>
          </div>
        </div>

        <div
          className={
            view === "cards"
              ? "grid md:grid-cols-2 grid-cols-1 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {filteredInvoices?.length > 0 &&
            filteredInvoices?.map((data, index) => (
              <InvoiceCard
                data={data}
                key={index}
                view={view}
                hasPermission={hasPermission}
              />
            ))}
        </div>

        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[90%] sm:w-[95%] lg:w-[calc(100%-390px)] shadow-xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          <InvoiceEstimatorForm
            closeDrawer={closeDrawer}
            initialData={editingInvoice}
            setEditingInvoice={setEditingInvoice}
            editingInvoice={editingInvoice}
            setAllInvoices={setAllInvoices}
            userId={user?.id}
            customBuilderId={customBuilderId}
          />
        </Drawer>
      </div>
    </>
  );
}
interface InvoiceEstimatorFormProps {
  closeDrawer: any;
  initialData: any;
  editingInvoice: any;
  setEditingInvoice: any;
  setAllInvoices?: any;
  fetchDetails?: () => Promise<void>;
  userId: any;
  customBuilderId: any;
}

export const InvoiceEstimatorForm = ({
  closeDrawer,
  initialData,
  editingInvoice,
  setEditingInvoice,
  setAllInvoices,
  fetchDetails,
  userId,
  customBuilderId,
}: InvoiceEstimatorFormProps) => {
  const router = useRouter();

  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [users, setUsers] = useState<any>(null);
  const [customBuilder, setCustomBuilder] = useState<any>(null);
  const [selectedBillToUser, setSelectedBillToUser] = useState(null);

  const [invoiceData, setInvoiceData] = useState({
    userId: userId,
    customBuilderId: customBuilderId,
    billToName: "",
    billToAddress: "",
    billToCity: "",
    shipToAddress: "",
    shipToCity: "",
    subTotal: 0,
    invoiceNumber: "",
    invoiceDate: "",
    invoiceDue: "",
    invoiceTerms: "",
    items: [],
    branchId:"",
  });

  const [itemInformation, setItemInformation] = useState({
    item_name: "",
    quantity: "",
    description: "",
    price: "",
    area: "",
  });

  const closeAddItemModal = () => {
    setItemInformation({
      item_name: "",
      quantity: "",
      description: "",
      price: "",
      area: "",
    });
    setIsEditing(false);
    setEditingItemId(null);
    setOpenAddItemModal(false);
  };
  const fetchUsers = async (id: number) => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${id}`,
        {},
        true
      );
      if (res.status === 200 && res.body) {
        toast.success("details fetched successfully");
        setUsers(res.body);
        setInvoiceData((prev) => ({
          ...prev,
          billToName: res.body.user?.fullName ?? "",
          billToCity: res.body?.location?.city ?? "",
          billToAddress: res.body?.location?.locality ?? "",
          branchId:res.body?.branchId,
        }));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user");
    }
  };

  useEffect(() => {
    fetchUsers(customBuilderId);
  }, []);

  const calculateSubTotal = (items: typeof invoiceData.items) => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const area = Number(item.area) || 1;
      return Number(total) + quantity * price * area;
    }, 0);
  };

  const addItem = async () => {
    if (!itemInformation.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!itemInformation.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const quantity = Number(itemInformation.quantity);
    const price = Number(itemInformation.price);
    const area = Number(itemInformation.area);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity (must be greater than 0)");
      return;
    }

    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price (cannot be negative)");
      return;
    }

    const newItem = {
      item_name: itemInformation.item_name.trim(),
      description: itemInformation.description.trim(),
      quantity: quantity,
      price: price,
      area: area,
    };

    let updatedItems;
    if (isEditing && editingItemId !== null) {
      updatedItems = [...invoiceData.items];
      updatedItems[editingItemId] = newItem;
    } else {
      updatedItems = [...invoiceData.items, newItem];
    }

    const newSubTotal = calculateSubTotal(updatedItems);
    const updatedInvoice = {
      ...invoiceData,
      subTotal: Number(newSubTotal),
      items: updatedItems,
    };

    if (editingInvoice?.id) {
      try {
        const response = await apiClient.put(
          `${apiClient.URLS.invoice_estimator}/${editingInvoice.id}`,
          updatedInvoice,
          true
        );

        if (response.status !== 200) {
          throw new Error("Failed to save changes");
        }

        setInvoiceData(updatedInvoice);
        toast.success(
          isEditing ? "Item updated successfully" : "Item added successfully"
        );

        if (fetchDetails) {
          await fetchDetails();
        }

        closeAddItemModal();
        setItemInformation({
          item_name: "",
          description: "",
          quantity: "",
          price: "",
          area: "",
        });
        setIsEditing(false);
        setEditingItemId(null);
      } catch (error) {
        console.error("Error saving item:", error);
        toast.error("Failed to save changes to server");
      }
    } else {
      setInvoiceData(updatedInvoice);
      toast.success(
        isEditing ? "Item updated successfully" : "Item added successfully"
      );

      closeAddItemModal();
      setItemInformation({
        item_name: "",
        description: "",
        quantity: "",
        price: "",
        area: "",
      });
      setIsEditing(false);
      setEditingItemId(null);
    }
  };

  useEffect(() => {
    if (initialData) {
      setInvoiceData({
        userId: userId,
        customBuilderId: initialData.customBuilderId,
        subTotal: Number(initialData.subTotal) || 0,
        billToName: initialData.billToName || "",
        billToAddress: initialData.billToAddress || "",
        billToCity: initialData.billToCity || "",
        shipToAddress: initialData.shipToAddress || "",
        shipToCity: initialData.shipToCity || "",
        invoiceNumber: initialData.invoiceNumber || "",
        invoiceDate: initialData.invoiceDate || "",
        invoiceDue: initialData.invoiceDue || "",
        invoiceTerms: initialData.invoiceTerms || "",
        items: initialData.items || [],
        branchId:initialData.branchId,
      });
    } else {
      setInvoiceData({
        userId: userId,
        customBuilderId: customBuilderId,
        subTotal: 0,
        billToName: "",
        billToAddress: "",
        billToCity: "",
        shipToAddress: "",
        shipToCity: "",
        invoiceNumber: "",
        invoiceDate: "",
        invoiceDue: "",
        invoiceTerms: "",
        items: [],
        branchId:""
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({} as any);

  const editItem = (index: number) => {
    const item = invoiceData?.items[index];
    setItemInformation({
      item_name: item?.item_name,
      description: item?.description,
      quantity: item?.quantity?.toString(),
      price: item?.price?.toString(),
      area: item?.area?.toString(),
    });
    setEditingItemId(index);
    setIsEditing(true);
    setOpenAddItemModal(true);
  };

  const removeItem = (index: number) => {
    const updatedItems = invoiceData?.items.filter((_, i) => i !== index);
    const newSubTotal = calculateSubTotal(updatedItems);
    setInvoiceData((prev) => ({
      ...prev,
      items: updatedItems,
      subTotal: newSubTotal,
    }));
  };

  const handleFormChange = (section: string, field: string, value: string) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };
  const handleItemChange = (field: string, value: string) => {
    setItemInformation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const normalizedItems = invoiceData.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      area: Number(item.area) || 1,
      price: Number(item.price),
    }));
    const subtotal = invoiceData.items.reduce((acc, item) => {
      return (
        acc +
        Number(item.price) * Number(item.quantity) * (Number(item.area) || 1)
      );
    }, 0);

    const payload = {
      ...invoiceData,
      userId: invoiceData.userId,
      customBuilderId: customBuilderId,
      subTotal: Number(subtotal),
      items: normalizedItems,
      branchId: invoiceData.branchId,

    };

    try {
      let response = null;

      if (editingInvoice) {
        response = await apiClient.put(
          `${apiClient.URLS.invoice_estimator}/${editingInvoice.id}`,
          payload,
          true
        );
      } else {
        response = await apiClient.post(
          apiClient.URLS.invoice_estimator,
          payload,
          true
        );
      }

      if (response?.status === 201 || response?.status === 200) {
        const updatedInvoice = response.body;

        setInvoiceData((prev) => ({
          ...prev,
          ...updatedInvoice,
          subTotal: updatedInvoice.subTotal,
          items: updatedInvoice.items,
        }));

        setEditingInvoice(updatedInvoice);

        if (fetchDetails) {
          fetchDetails();
        }
        toast.success(
          response.status === 201
            ? "Successfully created invoice details"
            : "Successfully updated invoice details"
        );
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("failed to submit form");
    }

    closeDrawer();
  };

  const openItemModal = () => {
    setOpenAddItemModal(true);
  };

  return (
    <>
      <div className="flex flex-col md:gap-3 gap-2 w-full">
        <h1 className="text-gray-700 text-xl md:text-2xl md:pl-10 font-bold">
          Fill Invoice Details
        </h1>
        <form className=" flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium md:text-xl text-[14px] text-[#3586FF] ">
                Basic Details
              </h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                <CustomInput
                  name="billToName"
                  id="billToName"
                  placeholder="Enter name"
                  value={invoiceData.billToName}
                  label="Name"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  disabled
                  onChange={(e) =>
                    handleFormChange(
                      "basicDetails",
                      "billToName",
                      e?.target?.value ?? ""
                    )
                  }
                />
                <CustomInput
                  name="billToAddress"
                  id="billToAddress"
                  placeholder="Enter address"
                  value={invoiceData.billToAddress}
                  label="Address"
                  disabled
                  labelCls="font-medium md:text-[16px] text-[12px] mt-2"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(
                      "basicDetails",
                      "billToAddress",
                      e?.target?.value ?? ""
                    )
                  }
                />
                <CustomInput
                  name="billToCity"
                  id="billToCity"
                  placeholder="Enter city"
                  value={invoiceData.billToCity}
                  label="City"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  disabled
                  onChange={(e) =>
                    handleFormChange(
                      "basicDetails",
                      "billToCity",
                      e?.target?.value ?? ""
                    )
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium md:text-xl text-[14px] text-[#3586FF] ">
                Shipping Details
              </h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                <CustomInput
                  name="shipToAddress"
                  id="shipToAddress"
                  placeholder="Enter address"
                  value={invoiceData.shipToAddress}
                  label="Address"
                  labelCls="font-medium md:text-[16px] text-[12px] mt-2"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(
                      "shippingDetails",
                      "shipToAddress",
                      e?.target?.value ?? ""
                    )
                  }
                />
                <CustomInput
                  name="shipToCity"
                  id="shipToCity"
                  placeholder="Enter city"
                  value={invoiceData.shipToCity}
                  label="City"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(
                      "shippingDetails",
                      "shipToCity",
                      e?.target?.value ?? ""
                    )
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium md:text-xl text-[14px] text-[#3586FF] ">
                Invoice Info
              </h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                <CustomInput
                  name="invoiceNumber"
                  id="invoiceNumber"
                  placeholder="Invoice No."
                  value={invoiceData.invoiceNumber}
                  label="Invoice Number"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceNumber",
                      e?.target?.value ?? ""
                    )
                  }
                />

                <CustomDate
                  label={"Date "}
                  labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceDate",
                      e?.target?.value ?? ""
                    )
                  }
                  placeholder="Date"
                  className="px-3 md:py-1 py-[2px]"
                  name="date"
                />

                <CustomDate
                  label={"Due Date "}
                  labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                  value={invoiceData.invoiceDue}
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceDue",
                      e?.target?.value ?? ""
                    )
                  }
                  placeholder="Due date"
                  className="px-3 md:py-1 py-[2px]"
                  name="due"
                />
                <CustomInput
                  name="invoiceTerms"
                  id="invoiceTerms"
                  placeholder="Terms"
                  value={invoiceData.invoiceTerms}
                  label="Terms"
                  labelCls="font-medium md:text-[16px] text-[12px] mt-2"
                  className="px-3 md:py-1 py-[2px]"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceTerms",
                      e?.target?.value ?? ""
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end items-end">
              <Button
                className="md:py-1 py-1 font-medium btn-txt md:px-5 px-3 rounded-md border-2 bg-[#3B82F6] text-white"
                onClick={() => setOpenAddItemModal(true)}
                size="sm"
              >
                Add item
              </Button>
            </div>
          </div>
          {invoiceData?.items.length > 0 && (
            <InvoiceEstimatorTable
              invoiceData={invoiceData}
              isInForm={true}
              editItem={editItem}
              deleteItem={removeItem}
              openModal={openItemModal}
            />
          )}
          {invoiceData?.items.length > 0 && (
            <div className="flex w-full items-center justify-end md:mt-5 mt-3">
              <div className="md:mt-4 mt-2 text-right flex flex-col items-start gap-2 ">
                <p className="font-bold border-b-[1px] md:text-[16px] text-[12px] border-[#5297FF] pb-2">
                  Subtotal: ₹ {invoiceData?.subTotal}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-row justify-between mt-10 md:px-10 mb-5">
            <Button
              key={"closeButton"}
              className="md:py-1 py-1 md:px-5 px-3 rounded-md border-2 btn-txt font-medium border-[#3B82F6]"
              onClick={closeDrawer}
            >
              Close
            </Button>

            <Button
              type="submit"
              className="md:py-1 py-1 md:px-5 px-3 rounded-md border-2 btn-txt font-medium bg-[#3B82F6] text-white"
            >
              Submit
            </Button>
          </div>
          <Modal
            isOpen={openAddItemModal}
            closeModal={closeAddItemModal}
            title="Add Item"
            titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
            isCloseRequired={false}
            className="md:w-[800px] w-[290px]"
            rootCls="z-[99999]"
          >
            <div className="flex flex-col md:gap-3  gap-2 w-full">
              <div className="flex flex-row gap-6">
                <CustomInput
                  name="item_name"
                  label="Item Name"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  className="px-3 md:py-1 py-[2px]"
                  placeholder="Enter item name"
                  onChange={(e) =>
                    handleItemChange("item_name", e.target.value)
                  }
                  type="text"
                  required
                  value={itemInformation.item_name ?? ""}
                  errorMsg={errors.item_name}
                />
                <CustomInput
                  name="quantity"
                  label="Quantity"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  placeholder="Enter quantity"
                  className="px-3 md:py-1 py-[2px]"
                  onChange={(e) => handleItemChange("quantity", e.target.value)}
                  type="number"
                  required
                  value={itemInformation.quantity || ""}
                  errorMsg={errors.quantity}
                />
              </div>

              <div className="flex flex-row gap-6">
                <CustomInput
                  name="description"
                  label="Item Description"
                  placeholder="Enter a detailed description of the item"
                  sublabelcls="text-[12px] font-regular text-gray-500"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  onChange={(e) =>
                    handleItemChange("description", e.target.value)
                  }
                  type="textarea"
                  required
                  className="min-h-[100px] px-5 md:py-1 py-[2px] md:text-[12px] text-[12px]"
                  value={itemInformation.description}
                  errorMsg={errors.description}
                />
              </div>

              <div className="flex flex-row gap-6">
                <CustomInput
                  name="area"
                  label="Area"
                  labelCls="btn-text font-medium"
                  placeholder="Enter area (sft/Box)"
                  className="md:px-[6px]  px-1 py-1"
                  onChange={(e) => {
                    handleItemChange("area", e.target.value);
                  }}
                  type={"number"}
                  required
                  value={itemInformation?.area || null}
                />
                <CustomInput
                  name="price"
                  label="Price (₹)"
                  labelCls="font-medium md:text-[16px] text-[12px]"
                  placeholder="Enter price"
                  className="px-3 md:py-1 py-[2px]"
                  onChange={(e) => handleItemChange("price", e.target.value)}
                  type="number"
                  required
                  value={itemInformation.price || ""}
                />
              </div>

              <div className="flex w-full items-center justify-between mt-4">
                <Button
                  className="md:py-1 py-1 md:px-5 px-3 btn-txt font-medium rounded-md border-2 border-[#3B82F6]"
                  onClick={() => setOpenAddItemModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="md:py-1 py-1 md:px-5 px-3 btn-txt font-medium rounded-md border-2 bg-[#3B82F6] text-white"
                  onClick={addItem}
                >
                  {isEditing ? "Save" : "Add"} Item
                </Button>
              </div>
            </div>
          </Modal>
        </form>
      </div>
    </>
  );
};
export const InvoiceCard = ({ data, view }: any) => {
  const router = useRouter();
  return (
    <div
      key={data.id}
      className={`w-full bg-white rounded flex flex-col md:gap-4 gap-2 md:p-4 p-2 shadow shadow-gray-200 border border-gray-200
    ${view === "compact" ? "md:max-w-[1352px]" : " md:max-w-[660px]"}
  `}
    >
      <div className="grid md:grid-cols-5 grid-cols-2 w-full md:gap-x-4 md:gap-y-3 gap-3 px-1 md:py-4 py-2 md:px-0">
        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiUser /> Name
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {data?.billToName}
          </p>
        </div>

        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiHash /> Invoice No
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {data?.invoiceNumber}
          </p>
        </div>

        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiCalendar /> Date
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {new Date(data.invoiceDate).toDateString()}
          </p>
        </div>

        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiClock /> Due
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {new Date(data?.invoiceDue).toDateString()}
          </p>
        </div>

        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiMapPin /> Address
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-wrap">
            {data?.billToAddress}
          </p>
        </div>

        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <FiMap /> City
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {data.billToCity}
          </p>
        </div>
        <div className="flex flex-col md:gap-2 gap-1">
          <p className="flex items-center gap-1 tracking-[1.2px] md:text-[16px] text-[12px] text-nowrap text-gray-500 font-medium">
            <BiRupee /> SubTotal
          </p>
          <p className="font-medium md:text-[16px] text-[10px] text-nowrap">
            {data.subTotal}
          </p>
        </div>
      </div>

      <div className="flex items-center md:justify-start justify-center w-full pt-4">
        <Button
          className="md:px-5 px-3 py-2 md:text-[16px] text-[12px] rounded font-medium text-white bg-[#3586FF]"
          onClick={() =>
            router.push(
              `/custom-builder/${data?.customBuilderId}/workprogress/invoices/${data.id}`
            )
          }
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
