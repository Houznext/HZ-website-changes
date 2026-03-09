import React, { useEffect, useState } from "react";
import Button from "@/common/Button";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";
import CustomInput from "@/common/FormElements/CustomInput";
import Modal from "@/common/Modal";
import apiClient from "@/utils/apiClient";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Image from "next/image";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

type AddressCartProps = {
  handleNext: () => void;
};

const toNum = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const INR = (v: any) => `₹${Number(v ?? 0).toFixed(0)}`;

const getProductTypeLabel = (productType: string) => {
  const labels: Record<string, string> = {
    LEGAL_PACKAGE: "Legal Service",
    PROPERTY_PREMIUM_PLAN: "Property Boost",
    FURNITURE_PRODUCT: "Furniture",
    ELECTRONICS_PRODUCT: "Electronics",
    HOME_DECOR_PRODUCT: "Home Decor",
    INTERIOR_PACKAGE: "Interior Service",
    CUSTOM_BUILDER_PACKAGE: "Custom Builder",
    SOLAR_PACKAGE: "Solar",
    PAINTING_SERVICE: "Painting",
    PLUMBING_SERVICE: "Plumbing",
    GENERIC_SERVICE: "Service",
  };
  return labels[productType] || productType?.replace(/_/g, " ") || "Item";
};

const getItemImage = (item: any) => {
  if (item.snapshot?.image) return item.snapshot.image;
  if (item.productType === "LEGAL_PACKAGE")
    return "/images/legalservices/herosection/legalservicesherosection.png";
  return "/images/custombuilder/subservices/furnitures/sofas/image-1.png";
};

const AddressCart = ({ handleNext }: AddressCartProps) => {
  const [address, setAddress] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const session = useSession();
  const { items, total, subTotal, discountTotal } = useCartStore();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    zipCode: "",
    area: "",
    landmark: "",
    city: "",
    state: { id: 1, name: "Telangana" },
    country: { id: 1, name: "India" },
    label: "",
    isDefault: false,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  const countryOptions = [{ id: 1, name: "India" }];

  const stateOptions = [
    { id: 1, name: "Telangana" },
    { id: 2, name: "Karnataka" },
    { id: 3, name: "Maharashtra" },
    { id: 4, name: "Andhra Pradesh" },
  ];

  const originalTotal = items.reduce(
    (sum, item) => sum + toNum(item.mrp) * (item.quantity ?? 1),
    0
  );
  const sellingTotal = items.reduce(
    (sum, item) => sum + toNum(item.sellingPrice) * (item.quantity ?? 1),
    0
  );
  const computedDiscount = Math.max(originalTotal - sellingTotal, 0);
  const discountPercent =
    originalTotal > 0 ? (computedDiscount / originalTotal) * 100 : 0;
  const hasDiscount = computedDiscount > 0;

  const validateForm = () => {
    const errors: any = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d+$/.test(formData.phone))
      errors.phone = "Phone number must be numeric";

    if (!formData.zipCode.trim()) errors.zipCode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.zipCode))
      errors.zipCode = "Pincode must be 6 digits";

    if (!formData.area.trim()) errors.area = "Area is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.name) errors.state = "State is required";
    if (!formData.country.name) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchAddress = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`${apiClient.URLS.user}/${user.id}`, true);
      if (res.status === 200) {
        const addressData = res?.body?.addresses || [];
        setAddress(addressData);

        const defaultAddr = addressData.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else {
          const storedId = localStorage.getItem("selectedAddressId");
          if (storedId) {
            const matched = addressData.find((a: any) => a.id === Number(storedId));
            if (matched) setSelectedAddressId(matched.id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      toast.error("Error fetching address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.status === "authenticated" && session?.data?.user) {
      setUser(session.data.user);
    }
  }, [session?.status, session?.data?.user]);

  useEffect(() => {
    if (user?.id) fetchAddress();
  }, [user?.id]);

  const handleStateChange = (_name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      state: { id: value.id, name: value.name },
    }));
  };

  const handleCountryChange = (_name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      country: { id: value.id, name: value.name },
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        state: formData.state.name,
        country: formData.country.name,
      };
      let res: any;
      if (editingId) {
        res = await apiClient.patch(
          `${apiClient.URLS.address}/${user?.id}/${editingId}`,
          payload,
          true
        );
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.address}/${user?.id}`,
          payload,
          true
        );
      }
      if (res.status === 201 || res.status === 200) {
        toast.success(editingId ? "Address updated successfully" : "Address added successfully");
        if (editingId) {
          setAddress((prev) =>
            prev.map((item: any) => (item.id === editingId ? res?.body : item))
          );
        } else {
          setAddress((prev) => [...prev, res?.body]);
        }

        if (res?.body?.isDefault) setSelectedAddressId(res.body.id);

        setModal(false);
        setEditingId(null);
        setFormErrors({});
        setFormData({
          name: "",
          phone: "",
          zipCode: "",
          area: "",
          landmark: "",
          city: "",
          state: { id: 1, name: "Telangana" },
          country: { id: 1, name: "India" },
          label: "",
          isDefault: false,
        });
      }
    } catch (err) {
      toast.error(editingId ? "Error updating address" : "Error adding address");
      console.error("Submission error:", err);
    }
  };

  const onDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(`${apiClient.URLS.address}/${user?.id}/${id}`, true);
      if (res.status === 200) {
        toast.success("Address deleted successfully");
        setAddress((prev) => prev.filter((a: any) => a.id !== id));
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
          localStorage.removeItem("selectedAddressId");
        }
      }
    } catch (err) {
      toast.error("Error deleting address");
      console.log(err);
    }
  };

  const onEdit = async (id: number) => {
    try {
      const res = await apiClient.get(`${apiClient.URLS.address}/${user.id}/${id}`, true);
      if (res.status === 200) {
        const { name, phone, zipCode, area, landmark, city, state, country, label, isDefault } =
          res.body;

        const selectedState =
          stateOptions.find((item) => item.name === (state?.name ?? state)) || stateOptions[0];

        const selectedCountry =
          countryOptions.find((item) => item.name === (country?.name ?? country)) || countryOptions[0];

        setFormData({
          name: name || "",
          phone: phone || "",
          zipCode: zipCode || "",
          area: area || "",
          landmark: landmark || "",
          city: city || "",
          state: selectedState,
          country: selectedCountry,
          label: label || "",
          isDefault: isDefault || false,
        });

        setEditingId(id);
        setModal(true);
      }
    } catch (err) {
      toast.error("Error editing address");
      console.log(err);
    }
  };

  const handleAddNewAddress = () => {
    setEditingId(null);
    setFormErrors({});
    setFormData({
      name: "",
      phone: "",
      zipCode: "",
      area: "",
      landmark: "",
      city: "",
      state: { id: 1, name: "Telangana" },
      country: { id: 1, name: "India" },
      label: "",
      isDefault: false,
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingId(null);
  };

  const handleSaveAndContinue = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address to continue");
      return;
    }

    localStorage.setItem("selectedAddressId", selectedAddressId.toString());
    handleNext();
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 rounded-md bg-gray-50 p-2 md:flex-row md:gap-6 md:p-3">
      <div className="flex-1 rounded-[8px] border border-gray-200 bg-white p-3 shadow-sm md:p-4">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2 className="text-[14px] font-bold text-[#3586FF] md:text-[16px]">
            📍 Select Delivery Address
          </h2>
          <Button
            className="rounded-md bg-[#3586FF] text-nowrap px-3 md:py-[6px] py-1 text-[11px] font-medium text-white md:px-4 md:text-[14px]"
            onClick={handleAddNewAddress}
          >
            + Add New Address
          </Button>
        </div>

        <div className="mb-3 h-[1px] w-full bg-gray-200" />

        <div className="space-y-3">
          {address.length > 0 ? (
            address.map((item: any) => (
              <AddressViewCard
                key={item.id}
                {...item}
                isSelected={selectedAddressId === item.id}
                onSelect={() => setSelectedAddressId(item.id)}
                onEdit={() => onEdit(item.id)}
                onDelete={() => onDelete(item.id)}
              />
            ))
          ) : (
            <div className="mt-6 text-center text-[12px] font-medium text-gray-600 md:text-[14px]">
              You don&apos;t have any saved address yet. Add one to proceed.
            </div>
          )}
        </div>

        {/* MODAL */}
        <Modal
          isOpen={modal}
          closeModal={closeModal}
          className="max-w-[750px]"
          rootCls="flex items-center justify-center z-[9999]"
        >
          <div className="mb-4">
            <h3 className="mb-6 text-center text-[16px] font-bold text-[#3586FF] md:text-[18px]">
              Contact Details
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomInput
                label="Name"
                labelCls="md:text-[14px] text-[12px] font-medium"
                required
                type="text"
                className="w-full rounded-md border border-gray-300 px-2"
                name="name"
                value={formData.name}
                placeholder="Enter your name"
                onChange={handleChange}
                errorMsg={formErrors.name}
              />
              <CustomInput
                label="Phone number"
                labelCls="md:text-[14px] text-[12px] font-medium"
                type="number"
                className="w-full rounded-md border border-gray-300 px-2"
                name="phone"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                errorMsg={formErrors.phone}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-[16px] font-medium text-[#3586FF] md:text-[18px]">
              Address
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomInput
                label="Pincode"
                type="text"
                required
                labelCls="md:text-[14px] text-[12px] font-medium"
                className="w-full rounded-md border border-gray-300 px-2"
                name="zipCode"
                placeholder="Enter your pincode"
                value={formData.zipCode}
                onChange={handleChange}
                errorMsg={formErrors.zipCode}
              />
              <CustomInput
                label="Area"
                type="text"
                required
                labelCls="md:text-[14px] text-[12px] font-medium"
                className="w-full rounded-md border border-gray-300 px-2"
                name="area"
                placeholder="Enter your area"
                value={formData.area}
                onChange={handleChange}
                errorMsg={formErrors.area}
              />
              <CustomInput
                label="Landmark"
                labelCls="md:text-[14px] text-[12px] font-medium"
                type="text"
                placeholder="Enter your landmark"
                required
                className="w-full rounded-md border border-gray-300 px-2"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                errorMsg={formErrors.landmark}
              />
              <CustomInput
                label="City"
                labelCls="md:text-[14px] text-[12px] font-medium"
                type="text"
                required
                placeholder="Enter your city"
                className="w-full rounded-md border border-gray-300 px-2"
                name="city"
                value={formData.city}
                onChange={handleChange}
                errorMsg={formErrors.city}
              />

              <div>
                <SingleSelect
                  type="single-select"
                  name="state"
                  options={stateOptions}
                  selectedOption={formData.state}
                  optionsInterface={{ isObj: true, displayKey: "name" }}
                  handleChange={handleStateChange}
                  buttonCls="w-full rounded-md border border-gray-300 p-2"
                  label="State"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  errorMsg={formErrors.state}
                />
              </div>

              <div>
                <SingleSelect
                  type="single-select"
                  label="Country"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  name="country"
                  options={countryOptions}
                  selectedOption={formData.country}
                  optionsInterface={{ isObj: true, displayKey: "name" }}
                  handleChange={handleCountryChange}
                  buttonCls="w-full rounded-md border border-gray-300 p-2"
                />
              </div>

              <CustomInput
                label="Label (e.g., Home, Office)"
                labelCls="md:text-[14px] text-[12px] font-medium"
                type="text"
                name="label"
                placeholder="Enter address label"
                value={formData.label}
                onChange={handleChange}
                errorMsg={formErrors.label}
              />
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <CheckboxInput
              type="checkbox"
              className="mr-2 h-[20px] w-[20px] rounded-sm"
              name="isDefault"
              placeholder="Make this my default address"
              checked={formData.isDefault}
              onChange={handleChange}
              label="Make this my default address"
              labelCls="md:text-[14px] text-[12px] font-medium"
            />
          </div>

          <div className="flex w-full items-center">
            <Button
              onClick={handleSubmit}
              className="mx-auto mt-4 w-full max-w-[400px] rounded-md bg-[#3586FF] py-2 text-[14px] font-medium text-white hover:bg-[#3586FF] md:text-[16px]"
            >
              Save Address
            </Button>
          </div>
        </Modal>
      </div>

      {/* RIGHT - Summary */}
      <div className="flex w-full max-w-[480px] flex-col gap-4 p-1 md:p-2">
        <div className="rounded-md bg-blue-50 p-3 md:p-4">
          <h3 className="mb-2 text-[14px] font-medium md:mb-4 md:text-[16px]">
            Order Summary
          </h3>

          <div className="flex flex-col gap-3 md:gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-2 md:flex-row md:gap-4 md:p-3"
              >
                <div className="relative h-[80px] w-full shrink-0 overflow-hidden rounded-md bg-gray-100 md:h-[72px] md:w-[100px]">
                  <Image
                    src={getItemImage(item)}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-0.5">
                  <h4 className="text-[12px] font-medium text-gray-900 md:text-[14px]">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-600 md:text-[12px]">
                    Qty: {item.quantity}
                  </p>
                  <span className="inline-flex w-fit rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#3586FF] md:text-[11px]">
                    {getProductTypeLabel(item.productType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-blue-50 p-3 md:p-4">
          <h3 className="mb-2 text-[14px] font-medium md:mb-4 md:text-[16px]">
            Price Details ({items.length})
          </h3>

          <div className="space-y-2 text-[11px] md:text-[13px]">
            <div className="flex justify-between border-b border-gray-200 py-2 text-gray-700 md:py-3">
              <span>MRP</span>
              <span>{INR(originalTotal)}</span>
            </div>

            {hasDiscount && (
              <>
                <div className="flex justify-between border-b border-gray-200 py-2 text-[#16A34A] md:py-3">
                  <span>Discount</span>
                  <span>{Math.round(discountPercent)}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2 text-[#16A34A] md:py-3">
                  <span>You save</span>
                  <span>-{INR(computedDiscount)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between border-b border-gray-200 py-2 text-gray-700 md:py-3">
              <span>Sub Total</span>
              <span>{INR(subTotal ?? sellingTotal)}</span>
            </div>

            <div className="flex justify-between py-2 font-semibold text-gray-900 md:py-3">
              <span>Total Payable</span>
              <span>{INR(total ?? sellingTotal)}</span>
            </div>
          </div>

          {hasDiscount && (
            <p className="mt-2 text-[10px] text-[#3586FF] md:mt-4 md:text-[12px]">
              You save <span className="font-medium">{INR(computedDiscount)}</span> on this order.
            </p>
          )}
        </div>

        <div className="mt-1">
          <Button
            className="w-full rounded-md bg-[#3586FF] px-4 py-3 font-medium text-[13px] text-white hover:bg-[#3586FF] md:text-[15px]"
            onClick={handleSaveAndContinue}
            disabled={items.length === 0}
          >
            Deliver to this Address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddressCart;

// ---------------- Address Card ----------------

type AddressViewCardProps = {
  id: number;
  name: string;
  phone: string;
  area: string;
  city: string;
  zipCode: string;
  state: any;
  country: any;
  isDefault?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const AddressViewCard = ({
  name,
  phone,
  area,
  city,
  zipCode,
  state,
  country,
  onEdit,
  onDelete,
  isDefault,
  isSelected,
  onSelect,
}: AddressViewCardProps) => {
  return (
    <div
      className={[
        "relative flex cursor-pointer flex-col gap-2 rounded-md border p-3 transition-all md:flex-row md:items-start md:gap-4 md:p-4",
        isSelected ? "border-[#3586FF] bg-blue-50/60" : "border-gray-200 bg-white",
      ].join(" ")}
      onClick={onSelect}
    >
      {isDefault && (
        <span className="absolute -top-2 left-2 z-10 rounded-full bg-[#3586FF] px-2 py-0.5 text-[10px] font-medium text-white md:-top-3 md:text-xs">
          Default
        </span>
      )}

      <div className=" flex items-start md:mt-1">
        <input
          type="radio"
          name="selectedAddress"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 accent-[#3586FF]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2 text-[11px] md:grid-cols-4 md:text-[13px]">
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-[#3586FF]">Name</p>
          <p className="text-gray-800">{name}</p>
          <p className="mt-1 text-[11px] text-gray-600 md:text-[12px]">
            +91 {phone}
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-[#3586FF]">Area</p>
          <p className="text-gray-800">{area}</p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-[#3586FF]">City / State</p>
          <p className="text-gray-800">
            {city}, {typeof state === "string" ? state : state?.name}
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-[#3586FF]">Country / PIN</p>
          <p className="text-gray-800">
            {typeof country === "string" ? country : country?.name} - {zipCode}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 md:absolute md:right-3 md:top-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onEdit}
          className="flex items-center justify-center rounded-full p-1 text-[#3586FF] hover:bg-blue-50"
          aria-label="Edit Address"
        >
          <span className="text-[14px] md:text-[16px]">
            <FaEdit />
          </span>
        </Button>

        <Button
          onClick={onDelete}
          className="flex items-center justify-center rounded-full p-1 text-red-500 hover:bg-red-50"
          aria-label="Delete Address"
        >
          <span className="text-[14px] md:text-[16px]">
            <FaTrash />
          </span>
        </Button>
      </div>
    </div>
  );
};
