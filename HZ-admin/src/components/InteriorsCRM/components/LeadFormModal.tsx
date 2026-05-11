"use client";

import { useEffect } from "react";
import LeadFormDrawer from "../../NewCrmView/LeadFormDrawer";
import { useInteriorsCRM } from "../CRMContext";

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  initialLeadStatus?: string;
}

export default function LeadFormModal({
  open,
  onClose,
  initialLeadStatus,
}: LeadFormModalProps) {
  const {
    formData,
    setFormData,
    refetch,
    branchUsers,
    setLeadFormInitialStatus,
    selectedLeadId,
    setSelectedLeadId,
  } = useInteriorsCRM();

  useEffect(() => {
    if (!open || selectedLeadId) return;
    if (initialLeadStatus) {
      setFormData((prev) => ({ ...prev, leadstatus: initialLeadStatus }));
    }
  }, [open, initialLeadStatus, selectedLeadId, setFormData]);

  useEffect(() => {
    if (!open) setLeadFormInitialStatus(undefined);
  }, [open, setLeadFormInitialStatus]);

  const handleClose = () => {
    setSelectedLeadId(null);
    onClose();
  };

  return (
    <LeadFormDrawer
      open={open}
      onClose={handleClose}
      leadId={selectedLeadId}
      presentation="modal"
      staffOptions={branchUsers}
      branchOptions={[]}
      formData={formData}
      setFormData={setFormData}
      onSuccess={() => {
        void refetch();
        handleClose();
      }}
    />
  );
}
