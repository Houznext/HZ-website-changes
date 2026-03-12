import React, { useState, useEffect, useMemo } from "react";
import Loader from "@/src/common/Loader";
import Drawer from "@/src/common/Drawer";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { InvoiceEstimatorTable } from "../InvoiceDetailsView";
import apiClient from "@/src/utils/apiClient";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import CustomTooltip from "@/src/common/ToolTip";
import { MdAdd } from "react-icons/md";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { InvoiceCard } from "./InvoiceCard";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { useInvoiceStore } from "@/src/stores/invoicesstrore";
import SearchComponent from "@/src/common/SearchSelect";

export default function InvoiceView() {
  const [openModal, setOpenModal] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const session = useSession();
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const { allInvoices, isLoading, fetchInvoiceEstimator, setAllInvoices } = useInvoiceStore();
  const [branchId, setBranchId] = useState<string >(null);
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);



  const closeDrawer = () => {
    setOpenModal(false);
    setEditingInvoice(null);
  };

  const fetchBranches = async () => {
    // Branch listing API removed; keep UI but without remote branch options.
    setBranchOptions([]);
  };

  const membership = session?.data?.user?.branchMemberships?.[0];
  

  const canShowBranchFilter =
    membership?.branchRoles?.some(r => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";
    // 👇 Decide which branchId to use
const effectiveBranchId = useMemo(() => {
  if (canShowBranchFilter) {
    return selectedBranch; // ORG selected branch
  }

  // Without branches module, fall back to no explicit branch filter.
  return membership?.branchId ? String(membership.branchId) : "";
}, [canShowBranchFilter, selectedBranch, membership]);


  const filteredInvoices = useMemo(() => {
    const lowerSearch = searchQuery?.toLowerCase() || "";

    return allInvoices?.filter((item) => {

      const matchesSearch =
        !lowerSearch ||
        item.billToName?.toLowerCase().includes(lowerSearch) ||
        item.billToAddress?.toLowerCase().includes(lowerSearch) ||
        item.billToCity?.toLowerCase().includes(lowerSearch) ||
        item.invoiceNumber?.toString().includes(lowerSearch) ||
        item.shipToAddress?.toLowerCase().includes(lowerSearch) ||
        item.shipToCity?.toLowerCase().includes(lowerSearch);

      const matchesBranch =
        !selectedBranch || item.branchId === selectedBranch;

      return matchesSearch && matchesBranch;
    });
  }, [allInvoices, searchQuery, selectedBranch]);

  //useEffects fetching the data

  // useEffect(() => {
  //   if (session?.status === "authenticated") {
  //     setUser(session.data?.user);
  //     setBranchId(session?.data?.user?.branchMemberships?.[0]?.branchId);
  //     fetchBranches();
  //   }
  // }, [session?.status]);
  useEffect(() => {
  if (session?.status !== "authenticated") return;

  setUser(session.data?.user);

  const sessionBranch =
    session.data?.user?.branchMemberships?.[0]?.branchId;

  if (!canShowBranchFilter && sessionBranch) {
    setSelectedBranch(String(sessionBranch));
  }

  fetchBranches();
}, [session?.status, canShowBranchFilter]);


  // useEffect(() => {
  //   if (user?.id) {

  //     if (allInvoices?.length == 0) {
  //       fetchInvoiceEstimator((user.id), { branchId, page: 1, limit: 10 });
  //     }
  //   }
  // }, [user]);
  useEffect(() => {
  if (!user?.id) return;
  if (!effectiveBranchId) return;

  fetchInvoiceEstimator(user.id, {
    branchId: effectiveBranchId,
    page: 1,
    limit: 10,
  });
}, [user?.id, effectiveBranchId]);


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
        <div className="flex md:mb-6 mb-5 justify-between items-center">
          <h1 className="font-bold heading-text text-[#5297FF]">Invoice</h1>
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
              disabled={!hasPermission("invoice_estimator", "create")}
              className="mt-auto bg-[#5297ff] text-white   label-text md:py-[14px] py-1 md:p-2 px-2 rounded-full "
            >
              <MdAdd className="md:text-[20px] font-medium text-[18px]" />
            </Button>
          </CustomTooltip>
        </div>
        <div >
          <ReusableSearchFilter
            searchText={searchQuery}
            placeholder="Search by name, email, phone, property name or location"
            onSearchChange={setSearchQuery}
            filters={[]}
            selectedFilters={{}}
            onFilterChange={() => { }}
            branchOptions={branchOptions}
            selectedBranch={selectedBranch}
            onBranchChange={(opt) => {
              setSelectedBranch(opt?.value ?? null)
            }}
            showBranchFilter={canShowBranchFilter}
            className=" py-[3px]"
          />
        </div>

        <div className="flex flex-col md:gap-6 gap-3 md:px-1  px-1">
          {filteredInvoices?.length > 0 &&
            filteredInvoices?.map((data, index) => (
              <InvoiceCard data={data} key={index} hasPermission={hasPermission} />
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
            branchOptions={branchOptions}
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
  branchId?: string;
  branchOptions?: any
}

export const InvoiceEstimatorForm = ({
  closeDrawer,
  initialData,
  editingInvoice,
  setEditingInvoice,
  setAllInvoices,
  fetchDetails,
  userId,
  branchId,
  branchOptions
}: InvoiceEstimatorFormProps) => {

  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [invoiceData, setInvoiceData] = useState({
    userId: Number(userId),
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
    branchId: branchId ?? "",
  });

  console.log("branchOptions", branchOptions);
  const [itemInformation, setItemInformation] = useState({
    item_name: "",
    quantity: "",
    description: "",
    price: "",
    area: ""
  });

  const closeAddItemModal = () => {
    setItemInformation({
      item_name: "",
      quantity: "",
      description: "",
      price: "",
      area: ""
    });
    setIsEditing(false);
    setEditingItemId(null);
    setOpenAddItemModal(false);
  };

  const onBranchChange = (option: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      branchId: String(option?.value ?? ""),
    }));
  };

  const calculateSubTotal = (items: typeof invoiceData.items) => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const area = Number(item.area) || 1;
      return Number(total) + quantity * price * area;
    }, 0);
  };

  const addItem = async () => {
    console.log("itemInformation", itemInformation);
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
    const area = Number(itemInformation.area)

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
      area: area
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
      // branchId:invoiceData.branchId ?? branchId,
      branchId: String(invoiceData.branchId),
    };

    if (editingInvoice?.id) {
      try {
        const response = await apiClient.put(
          `${apiClient.URLS.invoice_estimator}/${editingInvoice.id}`,
          updatedInvoice, true
        );

        if (response.status !== 200) {
          throw new Error("Failed to save changes");
        }

        setInvoiceData(updatedInvoice);
        toast.success(
          isEditing ? "Item updated successfully" : "Item added successfully"
        );
        closeAddItemModal();

        if (fetchDetails) {
          await fetchDetails();
        }

        
        setItemInformation({
          item_name: "",
          description: "",
          quantity: "",
          price: "",
          area: ''
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
        area: ""
      });
      setIsEditing(false);
      setEditingItemId(null);
    }
  };

  useEffect(() => {
    if (initialData) {
      setInvoiceData({
        userId: userId,
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
       branchId: String(initialData.branchId ?? branchId ?? ""), 
      });
    } else {
      setInvoiceData({
        userId: userId,
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
         branchId: String(branchId ?? ""),
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
      area: item?.area?.toString()
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
      return acc + Number(item.price) * Number(item.quantity) * (Number(item.area) || 1);
    }, 0);

    const payload = {
      ...invoiceData,
      userId: (invoiceData.userId),
      subTotal: Number(subtotal),
      items: normalizedItems,
      // branchId: invoiceData.branchId ?? (branchId),
      branchId: String(invoiceData.branchId),
    };
    try {
      let response = null;

      if (editingInvoice) {
        response = await apiClient.put(
          `${apiClient.URLS.invoice_estimator}/${editingInvoice.id}`,
          payload, true
        );
      } else {
        response = await apiClient.post(
          apiClient.URLS.invoice_estimator,
          payload, true
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
        closeDrawer();
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("failed to submit form");
    }

  };

  const openItemModal = () => {
    setOpenAddItemModal(true);
  };

  return (
    <>
      <div className="flex flex-col md:gap-3 gap-2 w-full">
        <h1 className="text-gray-700 text-lg md:text-xl font-bold">
          Fill Invoice Details
        </h1>
        <form className=" flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-2 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium text-medium text-[#3586FF] ">
                Basic Details
              </h2>
              <div className="w-full flex md:flex-row flex-col md:gap-4 items-center justify-center  px-2 gap-2">
                <div className="w-full">
                  <CustomInput
                    name="billToName"
                    id="billToName"
                    placeholder="Enter name"
                    value={invoiceData.billToName}
                    label="Name"
                    labelCls="font-medium label-text"
                    className="md:px-2 px-1 "
                    type="text"
                    onChange={(e) =>
                      handleFormChange(
                        "basicDetails",
                        "billToName",
                        e?.target?.value ?? ""
                      )
                    }
                    required
                  />
                </div>
                <div className="w-full">
                  <CustomInput
                    name="billToAddress"
                    id="billToAddress"
                    placeholder="Enter address"
                    value={invoiceData.billToAddress}
                    label="Address"
                    labelCls="font-medium label-text "
                    className="md:px-2 px-1 "
                    type="text"
                    onChange={(e) =>
                      handleFormChange(
                        "basicDetails",
                        "billToAddress",
                        e?.target?.value ?? ""
                      )
                    }
                    required
                  />
                </div>
                <div className="w-full">
                  <CustomInput
                    name="billToCity"
                    id="billToCity"
                    placeholder="Enter city"
                    value={invoiceData.billToCity}
                    label="City"
                    labelCls="font-medium label-text"
                    className="md:px-2 px-1"
                    type="text"
                    onChange={(e) =>
                      handleFormChange(
                        "basicDetails",
                        "billToCity",
                        e?.target?.value ?? ""
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:gap-3 gap-2 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium text-medium text-[#3586FF] ">
                Shipping Details
              </h2>
              <div className="w-full flex flex-col md:flex-row   gap-x-5">
                <CustomInput
                  name="shipToAddress"
                  id="shipToAddress"
                  placeholder="Enter address"
                  value={invoiceData.shipToAddress}
                  label="Address"
                  labelCls="font-medium label-text "
                  className="md:px-2 px-1 "
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
                  labelCls="font-medium label-text"
                  className="md:px-2 px-1 "
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

            <div className="flex flex-col md:gap-5 gap-2 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
              <h2 className="font-medium text-medium text-[#3586FF] ">
                Invoice Info
              </h2>
              <div className="w-full flex flex-col md:flex-row gap-2">
                <CustomInput
                  name="invoiceNumber"
                  id="invoiceNumber"
                  placeholder="Invoice No."
                  value={invoiceData.invoiceNumber}
                  label="Invoice Number"
                  labelCls="font-medium label-text"
                  className="md:px-2 px-1 "
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
                  labelCls="label-text font-medium"
                  value={invoiceData.invoiceDate}
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceDate",
                      e?.target?.value ?? ""
                    )
                  }
                  placeholder="Date"
                  className="md:px-2 px-1 "
                  name="date"
                  required
                />

                <CustomDate
                  label={"Due Date "}
                  labelCls="label-text font-medium"
                  value={invoiceData.invoiceDue}
                  onChange={(e) =>
                    handleFormChange(
                      "invoiceInfo",
                      "invoiceDue",
                      e?.target?.value ?? ""
                    )
                  }
                  placeholder="Due date"
                  className="md:px-2 px-1 "
                  name="due"
                />
                <SearchComponent
                  label="Branch"
                  inputClassName="text-[11px] font-regular md:py-[4px] py-[2px]"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  rootClassName=" py-[4px] rounded-[4px] w-full"
                  placeholder="Select branch"
                  value={
                    branchOptions?.find((opt) => opt.value === invoiceData?.branchId)
                      ?.label || ""
                  }
                  onChange={onBranchChange}
                  options={branchOptions}
                  isMulti={false}
                  showDeleteIcon={true}
                />

              </div>

              <div>
                <CustomInput
                  name="invoiceTerms"
                  id="invoiceTerms"
                  placeholder="Terms and Conditions"
                  value={invoiceData.invoiceTerms}
                  label="Terms and Conditions"
                  labelCls="font-medium label-text"
                  className="md:px-2 px-1 py-2 text-[12px] md:text-[14px]"
                  type="textarea"
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
                className="py-1 font-medium label-text md:px-[28px] px-[14px] rounded-md border-2 bg-[#3B82F6] text-white"
                onClick={() => setOpenAddItemModal(true)}
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
                <p className="font-bold border-b-[1px] label-text border-[#5297FF] pb-2">
                  Subtotal: ₹ {invoiceData?.subTotal}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-row justify-between mt-10 px-2  mb-5">
            <Button
              key={"closeButton"}
              className="py-1 md:px-[28px] px-[16px] rounded-md border-2 label-text font-medium border-[#3B82F6]"
              onClick={closeDrawer}
            >
              Close
            </Button>

            <Button
              type="submit"
              className="py-1 md:px-[28px] px-[16px] rounded-md border-2 label-text font-medium bg-[#3B82F6] text-white"
            >
              Submit
            </Button>
          </div>
          <Modal
            isOpen={openAddItemModal}
            closeModal={closeAddItemModal}
            title="Add Item"
            titleCls="font-medium label-text text-center text-[#3586FF] "
            isCloseRequired={false}
            className="md:w-[800px] w-[290px]"
            rootCls="z-[9999999]"
          >
            <div className="flex flex-col md:gap-3  gap-2 w-full">
              <div className="flex flex-row gap-6">
                <CustomInput
                  name="item_name"
                  label="Item Name"
                  labelCls="font-medium label-text"
                  className="md:px-2 px-1 "
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
                  labelCls="font-medium label-text"
                  placeholder="Enter quantity"
                  className="md:px-2 px-1 "
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
                  labelCls="font-medium label-text"
                  onChange={(e) =>
                    handleItemChange("description", e.target.value)
                  }
                  type="textarea"
                  required
                  className="min-h-[80px] px-3 py-2  md:text-[12px] text-[11px]"
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
                  className="px-1 "
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
                  labelCls="font-medium label-text"
                  placeholder="Enter price"
                  className="md:px-2 px-1 "
                  onChange={(e) => handleItemChange("price", e.target.value)}
                  type="number"
                  required
                  value={itemInformation.price || ""}
                />
              </div>

              <div className="flex w-full items-center justify-between mt-4">
                <Button
                  className="py-1 md:px-[28px] px-[14px] label-text font-medium rounded-md border-2 border-[#3B82F6]"
                  onClick={() => setOpenAddItemModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="py-[4px] md:px-[28px] px-[14px] label-text font-medium rounded-md border-2 bg-[#3B82F6] text-white"
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
