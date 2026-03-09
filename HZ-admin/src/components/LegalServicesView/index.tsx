"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Loader from "@/src/common/Loader";
import DragImageInput from "@/src/common/DragImageInput";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import {
  FaBriefcase,
  FaPlus,
  FaEdit,
  FaTrash,
  FaRupeeSign,
  FaTags,
  FaImage,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";
import CustomDate from "@/src/common/FormElements/CustomDate";

type LegalPackage = {
  id: string;
  branchId: string;
  title: string;
  kind: string;
  features: string[];
  price: string;
  originalPrice: string | null;
  buttonText: string | null;
  sortOrder: number;
  isActive: boolean;
  imageUrls?: string[];
  couponCode?: string | null;
  discountType?: string | null;
  discountValue?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  createdAt?: string;
};

type OrderItem = {
  id: string;
  productType: string;
  productId: string;
  name: string;
  sellingPrice: string;
  itemTotal: string;
  quantity: number;
};

type LegalOrder = {
  id: string;
  orderNo: string;
  status: string;
  type: string;
  grandTotal: string;
  amountPaid: string;
  amountDue: string;
  billingDetails?: { name?: string; phone?: string; email?: string };
  serviceDetails?: { assignedToUserId?: string; assignedAt?: string; notes?: string };
  items?: OrderItem[];
  statusHistory?: { status: string; at: string; note?: string }[];
  branch?: { id: string; name?: string };
  createdAt: string;
};

const KIND_OPTIONS = [
  { label: "Package", value: "package" },
  { label: "Service", value: "service" },
];

const ORDER_STATUS_OPTIONS = [
  "CREATED",
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default function LegalServicesView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"packages" | "orders">("packages");
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [packages, setPackages] = useState<LegalPackage[]>([]);
  const [orders, setOrders] = useState<LegalOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<LegalPackage | null>(
    null
  );
  const [packageToDelete, setPackageToDelete] =
    useState<LegalPackage | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LegalOrder | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assignAgentId, setAssignAgentId] = useState("");
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    kind: "package",
    features: [""],
    price: "",
    originalPrice: "",
    buttonText: "Book Now",
    sortOrder: "0",
    isActive: true,
    imageUrls: [] as string[],
    couponCode: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    validFrom: "",
    validTo: "",
  });

  const membership =
    (session?.user as any)?.branchMemberships?.find(
      (m: any) => m.isPrimary || m.branchId === selectedBranchId
    ) || (session?.user as any)?.branchMemberships?.[0];
  const sessionBranchId = membership?.branchId;
  const canSelectBranch =
    (session?.user as any)?.branchRoles?.some(
      (r: any) => r.roleName === "SuperAdmin"
    ) && membership?.isBranchHead;
  const effectiveBranchId =
    selectedBranchId || sessionBranchId || String(membership?.branchId || "");

  const fetchBranches = useCallback(async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.branches}/idwithname`,
        {},
        true
      );
      const list: any[] = res.body || [];
      setBranchOptions(
        list.map((b) => ({
          label: b.branchName || b.name || b.id,
          value: String(b.branchId ?? b.id),
        }))
      );
      if (!selectedBranchId && list.length > 0) {
        const first = list[0];
        setSelectedBranchId(String(first.branchId ?? first.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedBranchId]);

  const fetchPackages = useCallback(async () => {
    if (!effectiveBranchId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services/manage`,
        {},
        true
      );
      if (res.status === 200 && res.body) {
        setPackages(Array.isArray(res.body) ? res.body : []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  }, [effectiveBranchId]);

  const fetchOrders = useCallback(async () => {
    if (!effectiveBranchId) return;
    setOrdersLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.orders}`,
        { type: "LEGAL", branchId: effectiveBranchId },
        true
      );
      if (res.status === 200) {
        const data = res.body;
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setOrders(list);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [effectiveBranchId]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (effectiveBranchId && activeTab === "packages") fetchPackages();
  }, [effectiveBranchId, activeTab, fetchPackages]);

  useEffect(() => {
    if (effectiveBranchId && activeTab === "orders") fetchOrders();
  }, [effectiveBranchId, activeTab, fetchOrders]);

  const resetForm = () => {
    setFormData({
      title: "",
      kind: "package",
      features: [""],
      price: "",
      originalPrice: "",
      buttonText: "Book Now",
      sortOrder: "0",
      isActive: true,
      imageUrls: [],
      couponCode: "",
      discountType: "percent",
      discountValue: "",
      validFrom: "",
      validTo: "",
    });
    setSelectedPackage(null);
  };

  const openAddPackage = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openEditPackage = (pkg: LegalPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      title: pkg.title,
      kind: pkg.kind || "package",
      features:
        pkg.features?.length > 0 ? pkg.features : [""],
      price: pkg.price || "",
      originalPrice: pkg.originalPrice || "",
      buttonText: pkg.buttonText || "Book Now",
      sortOrder: String(pkg.sortOrder ?? 0),
      isActive: pkg.isActive ?? true,
      imageUrls: pkg.imageUrls ?? [],
      couponCode: pkg.couponCode || "",
      discountType: (pkg.discountType === "fixed" ? "fixed" : "percent") as "percent" | "fixed",
      discountValue: pkg.discountValue || "",
      validFrom: pkg.validFrom ? pkg.validFrom.slice(0, 16) : "",
      validTo: pkg.validTo ? pkg.validTo.slice(0, 16) : "",
    });
    setDrawerOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast.error("Valid price is required");
      return;
    }
    if (!effectiveBranchId) {
      toast.error("Branch is required");
      return;
    }
    const features = formData.features.filter((f) => f?.trim());
    if (features.length === 0) {
      toast.error("At least one feature is required");
      return;
    }
    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      kind: formData.kind,
      features,
      price: Number(formData.price),
      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : undefined,
      buttonText: formData.buttonText || "Book Now",
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive,
      imageUrls: formData.imageUrls?.length ? formData.imageUrls : undefined,
    };
    if (formData.couponCode?.trim()) {
      payload.couponCode = formData.couponCode.trim();
      payload.discountType = formData.discountType;
      payload.discountValue = formData.discountValue ? Number(formData.discountValue) : undefined;
      payload.validFrom = formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined;
      payload.validTo = formData.validTo ? new Date(formData.validTo).toISOString() : undefined;
    }

    setLoading(true);
    try {
      if (selectedPackage?.id) {
        const res = await apiClient.patch(
          `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services/${selectedPackage.id}`,
          payload,
          true
        );
        if (res.status === 200) {
          toast.success("Package updated");
          setDrawerOpen(false);
          fetchPackages();
        }
      } else {
        const res = await apiClient.post(
          `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services`,
          payload,
          true
        );
        if (res.status === 201 || res.status === 200) {
          toast.success("Package created");
          setDrawerOpen(false);
          fetchPackages();
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save package");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete?.id || !effectiveBranchId) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services/${packageToDelete.id}`,
        {},
        true
      );
      if (res.status === 200) {
        toast.success("Package deleted");
        setDeleteModalOpen(false);
        setPackageToDelete(null);
        fetchPackages();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete package");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setStatusUpdating(true);
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.orders}/${orderId}/status`,
        { status },
        true
      );
      if (res.status === 200) {
        toast.success("Status updated");
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignAgent = async (orderId: string) => {
    if (!assignAgentId.trim()) return;
    setAssigningAgent(true);
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.orders}/${orderId}/assign-agent`,
        { agentUserId: assignAgentId.trim() },
        true
      );
      if (res.status === 200) {
        toast.success("Agent assigned");
        setSelectedOrder(res.body);
        setAssignAgentId("");
        fetchOrders();
      }
    } catch {
      toast.error("Failed to assign agent");
    } finally {
      setAssigningAgent(false);
    }
  };

  const addFeatureRow = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const movePackageOrder = async (pkg: LegalPackage, direction: "up" | "down") => {
    const idx = packages.findIndex((p) => p.id === pkg.id);
    if (idx < 0) return;
    const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
    const neighbor = packages[neighborIdx];
    if (!neighbor || !effectiveBranchId) return;
    const pkgOrder = pkg.sortOrder ?? 0;
    const neighborOrder = neighbor.sortOrder ?? 0;
    try {
      await apiClient.patch(
        `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services/${pkg.id}`,
        { sortOrder: neighborOrder },
        true
      );
      await apiClient.patch(
        `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services/${neighbor.id}`,
        { sortOrder: pkgOrder },
        true
      );
      toast.success("Order updated");
      fetchPackages();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#3586FF] flex items-center gap-2">
          <FaBriefcase />
          Legal Services
        </h1>
        <div className="flex items-center gap-2">
          {canSelectBranch && (
            <div className="min-w-[180px]">
              <SingleSelect
                type="single-select"
                name="branch"
                optionsInterface={{ isObj: false }}
                options={branchOptions.map((b) => b.label)}
                selectedOption={
                  branchOptions.find((b) => b.value === selectedBranchId)
                    ?.label || selectedBranchId || ""
                }
                handleChange={(_, v) => {
                  const opt = branchOptions.find((o) => o.label === v);
                  if (opt) setSelectedBranchId(opt.value);
                }}
                placeholder="Select branch"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Button
          className={`flex items-center gap-2 px-4 label-text py-2 rounded-lg ${activeTab === "packages"
            ? "bg-[#3586FF] text-white"
            : "bg-gray-100 text-gray-700"
            }`}
          onClick={() => setActiveTab("packages")}
        >
          <FaBriefcase />
          Packages
        </Button>
        <Button
          className={`flex items-center gap-2 px-4 py-2 label-text rounded-lg ${activeTab === "orders"
            ? "bg-[#3586FF] text-white"
            : "bg-gray-100 text-gray-700"
            }`}
          onClick={() => setActiveTab("orders")}
        >
          <HiOutlineClipboardList />
          Orders
        </Button>
      </div>

      {activeTab === "packages" && (
        <>
          <div className="flex justify-end">
            <Button
              className="flex items-center label-text gap-2 bg-[#3586FF] text-white px-4 py-2 rounded-lg"
              onClick={openAddPackage}
            >
              <FaPlus />
              Add Package
            </Button>
          </div>
          {loading ? (
            <Loader />
          ) : packages.length === 0 ? (
            <div className="text-center py-12 label-text text-gray-500 bg-white rounded-xl border">
              No packages yet. Add your first legal package above.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="overflow-hidden bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  {/* Image or placeholder */}
                  <div className="relative h-40 bg-gray-100">
                    {pkg.imageUrls?.length ? (
                      <Image
                        src={pkg.imageUrls[0]}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <FaImage className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditPackage(pkg); }}
                        className="p-1.5 rounded bg-white/90 hover:bg-white text-[#3586FF] shadow"
                        title="Edit"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPackageToDelete(pkg);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-white/90 hover:bg-red-50 text-red-600 shadow"
                        title="Delete"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); movePackageOrder(pkg, "up"); }}
                        disabled={packages.indexOf(pkg) === 0}
                        className="p-1.5 rounded bg-white/90 hover:bg-white text-gray-600 shadow disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <FaArrowUp className="text-sm" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); movePackageOrder(pkg, "down"); }}
                        disabled={packages.indexOf(pkg) === packages.length - 1}
                        className="p-1.5 rounded bg-white/90 hover:bg-white text-gray-600 shadow disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <FaArrowDown className="text-sm" />
                      </button>
                    </div>
                    {pkg.couponCode && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded bg-amber-500 text-white text-xs font-medium flex items-center gap-1">
                        <FaTags /> {pkg.couponCode}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{pkg.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 capitalize shrink-0">
                        {pkg.kind}
                      </span>
                    </div>
                    <ul className="mt-2 text-sm text-gray-600 space-y-0.5 flex-1">
                      {pkg.features?.slice(0, 3).map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center gap-2">
                      <FaRupeeSign className="text-green-600 shrink-0" />
                      <span className="font-bold text-gray-900">{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    {(pkg.validFrom || pkg.validTo) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Valid:{" "}
                        {pkg.validFrom
                          ? new Date(pkg.validFrom).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                        {" → "}
                        {pkg.validTo
                          ? new Date(pkg.validTo).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    )}
                    {!pkg.isActive && (
                      <span className="text-xs text-amber-600 mt-1 inline-block">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "orders" && (
        <>
          {ordersLoading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="text-center py-12 label-text text-gray-500 bg-white rounded-xl border">
              No legal orders yet.
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setSelectedOrder(order);
                    setOrderDetailModalOpen(true);
                  }}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="font-mono text-sm text-gray-600">
                        #{order.orderNo}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">
                        {order.billingDetails?.name || "Customer"}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {order.billingDetails?.phone}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${order.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <FaRupeeSign />
                      {order.grandTotal}
                    </span>
                    <span className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Drawer
        open={drawerOpen}
        handleDrawerToggle={setDrawerOpen}
        title={selectedPackage ? "Edit Package" : "Add Package"}
        openVariant="right"
      >
        <form onSubmit={handleSavePackage} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold  text-blue-500 border-b pb-2">Basic Info :</h3>
            <CustomInput
              name="title"
              type="text"
              label="Title *"
              placeholder="e.g. Property Title Verification"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              className="label-text"
              required
            />
            <SingleSelect
              name="kind"
              type="single-select"
              label="Kind"
              optionsInterface={{ isObj: false }}
              options={["package", "service"]}
              selectedOption={formData.kind}
              handleChange={(_, v) =>
                setFormData((p) => ({ ...p, kind: v || "package" }))
              }
            />
          </div>

          {/* Images */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <FaImage /> Images
            </h3>
            <DragImageInput
              key={`images-${selectedPackage?.id ?? "new"}`}
              label="Service images (first image as cover)"
              folderName="legal-services"
              maxFiles={5}
              maxFileSize={5}
              acceptedFormats={["image/png", "image/jpg", "image/jpeg", "image/webp"]}
              initialUrls={formData.imageUrls}
              onFilesChange={(urls) => setFormData((p) => ({ ...p, imageUrls: urls }))}
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">Features *</h3>
            {formData.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <CustomInput
                  name="feature"
                  type="text"
                  placeholder={`Feature ${i + 1}`}
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                />
                <Button
                  type="button"
                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded shrink-0"
                  onClick={() => removeFeature(i)}
                >
                  <FaTrash />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              className="  flex items-center gap-1 label-text rounded-md bg-blue-500 py-1 px-4 text-white text-nowrap hover:bg-gray-200 text-sm"
              onClick={addFeatureRow}
            >
              <FaPlus className="mr-1" /> Add feature
            </Button>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                name="price"
                type="number"
                label="Price (₹)"
                placeholder="4999"
                value={formData.price}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: e.target.value }))
                }
                required
              />
              <CustomInput
                name="originalPrice"
                type="number"
                label="Original (₹)( optional)"
                placeholder="7999"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, originalPrice: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Offers & Coupons */}
          <div className="space-y-4 p-3 bg-amber-50/60 rounded-lg border border-amber-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FaTags /> Offers & Coupons
            </h3>
            <CustomInput
              name="couponCode"
              type="text"
              label="Coupon code (e.g. LEGAL20)"
              placeholder="Optional"
              value={formData.couponCode}
              onChange={(e) =>
                setFormData((p) => ({ ...p, couponCode: e.target.value }))
              }
            />
            {formData.couponCode && (
              <div className="grid grid-cols-2 gap-3">
                <SingleSelect
                  name="discountType"
                  type="single-select"
                  label="Discount type"
                  optionsInterface={{ isObj: false }}
                  options={["percent", "fixed"]}
                  selectedOption={formData.discountType}
                  handleChange={(_, v) =>
                    setFormData((p) => ({ ...p, discountType: (v || "percent") as "percent" | "fixed" }))
                  }
                />
                <CustomInput
                  name="discountValue"
                  type="number"
                  label={formData.discountType === "percent" ? "Discount %" : "Discount (₹)"}
                  placeholder={formData.discountType === "percent" ? "20" : "500"}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, discountValue: e.target.value }))
                  }
                />
              </div>
            )}
            {formData.couponCode && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomDate
                    label="Valid From"
                    name="validFrom"
                    labelCls="font-medium label-text mb-2"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, validFrom: e.target.value }))
                    }
                    outerInputCls="bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3586FF] focus:border-transparent"
                    className="w-full px-3  border label-text border-gray-300 rounded-md focus:ring-2 focus:ring-[#3586FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <CustomDate
                    label="Valid To"
                    name="validTo"
                    labelCls="font-medium label-text mb-2"
                    type="datetime-local"
                    value={formData.validTo}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, validTo: e.target.value }))
                    }
                      outerInputCls="bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3586FF] focus:border-transparent"

                    className="w-full px-3 border label-text border-gray-300 rounded-md focus:ring-2 focus:ring-[#3586FF] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Display & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">Display & Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <CustomInput
                name="buttonText"
                type="text"
                label="Button text"
                placeholder="Book Now"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, buttonText: e.target.value }))
                }
              />
              <CustomInput
                name="sortOrder"
                type="number"
                label="Sort order"
                placeholder="0"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, sortOrder: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, isActive: e.target.checked }))
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t mb-10">
            <Button
              type="button"
              className="bg-gray-100 label-text px-3 rounded-md py-2 text-gray-700 hover:bg-gray-200"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#3586FF] label-text px-3 py-2 rounded-md text-white hover:bg-[#2870e0]"
              disabled={loading}
            >
              {loading ? "Saving..." : selectedPackage ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Drawer>

      <Modal
        isOpen={deleteModalOpen}
        closeModal={() => {
          setDeleteModalOpen(false);
          setPackageToDelete(null);
        }}
        title="Delete Package"
        isCloseRequired
      >
        <div className="p-4">
          <p>
            Delete &quot;{packageToDelete?.title}&quot;? This cannot be undone.
          </p>
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              onClick={() => {
                setDeleteModalOpen(false);
                setPackageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={handleDeletePackage}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={orderDetailModalOpen}
        closeModal={() => {
          setOrderDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.orderNo}`}
        isCloseRequired
        className="max-w-2xl"
      >
        {selectedOrder && (
          <div className="p-4 space-y-6">
            {/* Status Pipeline */}
            <div className="flex items-center gap-1">
              {ORDER_STATUS_OPTIONS.filter(s => s !== "CANCELLED").map((s, i, arr) => {
                const currentIdx = ORDER_STATUS_OPTIONS.indexOf(selectedOrder.status);
                const stepIdx = ORDER_STATUS_OPTIONS.indexOf(s);
                const isCancelled = selectedOrder.status === "CANCELLED";
                const isCompleted = !isCancelled && stepIdx <= currentIdx;
                const isCurrent = !isCancelled && stepIdx === currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`flex items-center justify-center min-w-[28px] h-7 rounded-full text-[10px] font-bold px-1
                        ${isCurrent ? "bg-[#3586FF] text-white ring-2 ring-blue-200" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}
                      title={s}
                    >
                      {i + 1}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 ${isCompleted && stepIdx < currentIdx ? "bg-green-500" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
              {selectedOrder.status === "CANCELLED" && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">CANCELLED</span>
              )}
            </div>

            {/* Customer & Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.billingDetails?.name || "—"}
                </p>
                <p className="text-sm text-gray-600">{selectedOrder.billingDetails?.phone}</p>
                <p className="text-sm text-gray-600">{selectedOrder.billingDetails?.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                <p className="font-bold text-lg text-gray-900">₹ {selectedOrder.grandTotal}</p>
                <p className="text-sm text-gray-600">Paid: ₹ {selectedOrder.amountPaid}</p>
                {selectedOrder.amountDue && Number(selectedOrder.amountDue) > 0 && (
                  <p className="text-sm text-amber-600">Due: ₹ {selectedOrder.amountDue}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Items</p>
              <div className="border rounded-lg divide-y">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 px-4"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-2">× {item.quantity}</span>
                      )}
                    </div>
                    <span className="font-medium">₹ {item.itemTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Assignment */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Assign Agent</p>
              {selectedOrder.serviceDetails?.assignedToUserId ? (
                <p className="text-sm text-green-600">
                  Assigned to: {selectedOrder.serviceDetails.assignedToUserId}
                  {selectedOrder.serviceDetails.assignedAt && (
                    <span className="text-gray-400 ml-2">
                      ({new Date(selectedOrder.serviceDetails.assignedAt).toLocaleDateString()})
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-amber-600 mb-2">No agent assigned yet</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assignAgentId}
                  onChange={(e) => setAssignAgentId(e.target.value)}
                  placeholder="Agent User ID"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <Button
                  onClick={() => handleAssignAgent(selectedOrder.id)}
                  disabled={assigningAgent || !assignAgentId.trim()}
                >
                  {assigningAgent ? "..." : "Assign"}
                </Button>
              </div>
            </div>

            {/* Update status */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Update status</p>
              <SingleSelect
                type="single-select"
                name="status"
                optionsInterface={{ isObj: false }}
                options={ORDER_STATUS_OPTIONS}
                selectedOption={selectedOrder.status}
                handleChange={(_, v) => {
                  if (v) updateOrderStatus(selectedOrder.id, v);
                }}
              />
              {statusUpdating && (
                <p className="text-xs text-gray-500 mt-1">Updating...</p>
              )}
            </div>

            {/* Timeline - stepper style */}
            {selectedOrder.statusHistory?.length ? (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Order timeline</p>
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-0">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="relative pb-4 last:pb-0">
                      <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-[#3586FF] border-2 border-white shadow" />
                      <div>
                        <span className="font-medium text-gray-900">{h.status}</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(h.at).toLocaleString()}
                        </p>
                        {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
