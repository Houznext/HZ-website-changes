import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import SearchComponent from "@/src/common/SearchSelect";
import { FaRupeeSign, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { LuTrash2 } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import Loader from "@/src/common/Loader";

const paymentStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Partial", value: "Partial" },
  { label: "Completed", value: "Completed" },
  { label: "Overdue", value: "Overdue" },
  { label: "Refunded", value: "Refunded" },
];

const paymentMethodOptions = [
  { label: "Cash", value: "Cash" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "UPI", value: "UPI" },
  { label: "Cheque", value: "Cheque" },
  { label: "Credit Card", value: "Credit Card" },
  { label: "Debit Card", value: "Debit Card" },
  { label: "Other", value: "Other" },
];

const paymentTypeOptions = [
  { label: "Advance", value: "Advance" },
  { label: "Milestone", value: "Milestone" },
  { label: "Material Purchase", value: "Material Purchase" },
  { label: "Labour Payment", value: "Labour Payment" },
  { label: "Final Settlement", value: "Final Settlement" },
  { label: "Other", value: "Other" },
];

const defaultForm = {
  amount: "",
  status: "Pending",
  paymentMethod: "",
  paymentType: "Milestone",
  paymentDate: "",
  dueDate: "",
  description: "",
  referenceNumber: "",
  notes: "",
  phaseName: "",
  receivedBy: "",
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Partial: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
  Refunded: "bg-purple-100 text-purple-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  Pending: <FaClock className="text-yellow-500" />,
  Completed: <FaCheckCircle className="text-green-500" />,
  Overdue: <FaExclamationTriangle className="text-red-500" />,
};

const PaymentTracking = () => {
  const router = useRouter();
  const customBuilderId = router.query.userId as string;

  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...defaultForm });
  const [isSaving, setIsSaving] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!customBuilderId) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.payment_tracking}/custom-builder/${customBuilderId}`,
        {},
        true
      );
      if (res.status === 200) {
        setPayments(res.body?.payments || []);
        setSummary(res.body?.summary || {});
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [customBuilderId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleInputChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(String(form.amount));
    if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...form, amount: parsedAmount };
      const res = editingId
        ? await apiClient.patch(
          `${apiClient.URLS.payment_tracking}/${editingId}`,
          payload,
          true
        )
        : await apiClient.post(
          `${apiClient.URLS.payment_tracking}/${customBuilderId}`,
          payload,
          true
        );

      if (res.status === 200 || res.status === 201) {
        toast.success(editingId ? "Payment updated" : "Payment recorded");
        setModalOpen(false);
        setForm({ ...defaultForm });
        setEditingId(null);
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (payment: any) => {
    setEditingId(payment.id);
    setForm({
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod || "",
      paymentType: payment.paymentType || "Milestone",
      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().split("T")[0]
        : "",
      dueDate: payment.dueDate
        ? new Date(payment.dueDate).toISOString().split("T")[0]
        : "",
      description: payment.description || "",
      referenceNumber: payment.referenceNumber || "",
      notes: payment.notes || "",
      phaseName: payment.phaseName || "",
      receivedBy: payment.receivedBy || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.payment_tracking}/${deleteId}`,
        true
      );
      if (res.status === 200) {
        toast.success("Payment deleted");
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) return <Loader />;

  return (
    <div className="mt-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaRupeeSign className="text-blue-600 text-sm" />
            </div>
            <p className="text-[12px] font-medium text-gray-500">Total Amount</p>
          </div>
          <p className="text-[20px] font-bold text-gray-900">
            {formatCurrency(summary?.totalAmount || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-sm" />
            </div>
            <p className="text-[12px] font-medium text-gray-500">Paid Amount</p>
          </div>
          <p className="text-[20px] font-bold text-green-600">
            {formatCurrency(summary?.paidAmount || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <FaClock className="text-yellow-600 text-sm" />
            </div>
            <p className="text-[12px] font-medium text-gray-500">Pending Amount</p>
          </div>
          <p className="text-[20px] font-bold text-yellow-600">
            {formatCurrency(summary?.pendingAmount || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-sm" />
            </div>
            <p className="text-[12px] font-medium text-gray-500">Overdue</p>
          </div>
          <p className="text-[20px] font-bold text-red-600">
            {summary?.overdueCount || 0}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {summary?.totalAmount > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[14px] font-semibold text-gray-700">Payment Progress</p>
            <p className="text-[14px] font-medium text-gray-500">
              {Math.round(((summary?.paidAmount || 0) / (summary?.totalAmount || 1)) * 100)}%
            </p>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((summary?.paidAmount || 0) / (summary?.totalAmount || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Header + Add button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold text-gray-800">Payment Records</h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setForm({ ...defaultForm });
            setModalOpen(true);
          }}
          className="px-4 md:py-2 py-1 bg-[#3B82F6] text-white rounded-lg font-medium text-[14px] hover:bg-blue-600 transition-colors"
        >
          + Record Payment
        </Button>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
          <FaRupeeSign className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 text-[16px] font-medium">No payments recorded yet</p>
          <p className="text-gray-400 text-[14px] mt-1">
            Click &quot;Record Payment&quot; to add the first payment
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Method</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Reference</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-[12px] font-medium">
                        {p.paymentType || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                      {p.description || p.phaseName || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(Number(p.amount))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.paymentMethod || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {statusIcons[p.status]}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.referenceNumber || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(p.id);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        className="md:max-w-[650px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        isCloseRequired={false}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-bold text-gray-900">
              {editingId ? "Edit Payment" : "Record Payment"}
            </h3>
            <button onClick={() => setModalOpen(false)}>
              <IoClose className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <CustomInput
              label="Amount (INR)"
              type="number"
              required
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1  rounded-lg text-[14px]"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              name="amount"
            />

            <SearchComponent
              label="Payment Status"
              labelCls="text-[13px] font-medium text-gray-700"
              options={paymentStatusOptions}
              onChange={(v) => handleInputChange("status", v.value)}
              value={form.status}
            />

            <SearchComponent
              label="Payment Method"
              labelCls="text-[13px] font-medium text-gray-700"
              options={paymentMethodOptions}
              onChange={(v) => handleInputChange("paymentMethod", v.value)}
              value={form.paymentMethod}
            />

            <SearchComponent
              label="Payment Type"
              labelCls="text-[13px] font-medium text-gray-700"
              options={paymentTypeOptions}
              onChange={(v) => handleInputChange("paymentType", v.value)}
              value={form.paymentType}
            />

            <CustomDate
              label="Payment Date"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg  sublabel-text text-gray-600"
              value={form.paymentDate}
              onChange={(e) => handleInputChange("paymentDate", e.target.value)}
              name="paymentDate"
            />

            <CustomDate
              label="Due Date"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg  sublabel-text text-gray-600"
              value={form.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              name="dueDate"
            />

            <CustomInput
              label="Phase / Milestone"
              type="text"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg text-[14px]"
              placeholder="e.g., Foundation, Structure"
              value={form.phaseName}
              onChange={(e) => handleInputChange("phaseName", e.target.value)}
              name="phaseName"
            />

            <CustomInput
              label="Reference Number"
              type="text"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg text-[14px]"
              placeholder="Transaction ID or receipt no."
              value={form.referenceNumber}
              onChange={(e) =>
                handleInputChange("referenceNumber", e.target.value)
              }
              name="referenceNumber"
            />

            <CustomInput
              label="Received By"
              type="text"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg text-[14px]"
              placeholder="Person name"
              value={form.receivedBy}
              onChange={(e) => handleInputChange("receivedBy", e.target.value)}
              name="receivedBy"
            />
          </div>

          <div className="mt-2">
            <CustomInput
              name="description"
              type="textarea"
              label="Description"
              labelCls="text-[13px] font-medium text-gray-700"
              placeholder="Payment description..."
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="mt-2">
            <CustomInput
              label="Notes"
              name="notes"
              labelCls="text-[13px] font-medium text-gray-700"
              className="md:px-2 px-1 rounded-lg text-[14px]"
              type="textarea"
              placeholder="Internal notes..."
              value={form.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setModalOpen(false)}
              className="px-5 md:py-2 py-1 btn-text border rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 md:py-2 py-1 btn-text bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Save Payment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        closeModal={() => setDeleteModalOpen(false)}
        className="md:max-w-[400px] max-w-[320px]"
        isCloseRequired={false}
      >
        <div className="p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <LuTrash2 className="text-red-500 text-xl" />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            Delete Payment
          </h3>
          <p className="text-[14px] text-gray-500 mb-6">
            Are you sure you want to delete this payment record? This action
            cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              className="px-5 btn-text border rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="px-5 btn-text bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentTracking;
