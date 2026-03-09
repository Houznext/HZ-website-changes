import React, { useState, useEffect, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import LeadCard from "./Leadcard";
import LeadDetailsModal from "./Leaddetailsmodal";
import { Lead, categoryData } from "./types";

function safeUserDisplay(val: unknown): string {
  if (val == null) return "N/A";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const o = val as Record<string, unknown>;
    if (typeof o.fullName === "string") return o.fullName;
    if (typeof o.firstName === "string")
      return (
        o.firstName + (typeof o.lastName === "string" ? ` ${o.lastName}` : "")
      );
  }
  return "N/A";
}

interface FuturePotentialDashboardProps {
  user: any;
  selectedBranch: string | null;
  hasPermission: (module: string, action: string) => boolean;
  setFormData: (data: any) => void;
  setSelectedLeadId: React.Dispatch<React.SetStateAction<string | null>>;
  setOpenModal: (open: boolean) => void;
  onLeadDeleted?: (leadId: string) => void;
  onLeadUpdated?: (lead: Lead) => void;
}

export default function FuturePotentialDashboard({
  user,
  selectedBranch,
  hasPermission,
  setFormData,
  setSelectedLeadId,
  setOpenModal,
  onLeadDeleted,
  onLeadUpdated,
}: FuturePotentialDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFuturePotentialLeads = async () => {
    if (!user?.id) return;
    const membership = user?.branchMemberships?.[0];
    const branchId = selectedBranch ?? membership?.branchId ?? "";
    if (!branchId) return;

    setLoading(true);
    try {
      const params: Record<string, string> = {
        userId: String(user.id),
        branchId: String(branchId),
        isFuturePotential: "true",
      };

      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user`,
        params,
        true,
      );

      if (res.status === 200 && res.body) {
        setLeads(res.body);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuturePotentialLeads();
  }, [user?.id, selectedBranch]);

  const filteredLeads = useMemo(() => {
    let list = leads;

    if (categoryFilter && categoryFilter !== "All Categories") {
      list = list.filter(
        (l) => (l.serviceType || "").toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (l) =>
          (l.Fullname || "").toLowerCase().includes(q) ||
          (l.Phonenumber || "").includes(q) ||
          (l.email || "").toLowerCase().includes(q) ||
          (l.city || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [leads, categoryFilter, searchQuery]);

  const categoryOptions = useMemo(
    () => ["All Categories", ...categoryData.map((c) => String(c.role))],
    [],
  );

  const handleStatusChange = async (leadId: string, status: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.branchId) return;
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}/leadstatus`,
        {
          leadstatus: status,
          actorId: user?.id,
          actorBranchId: lead.branchId,
        },
        true,
      );
      if (res.status === 200 && res.body) {
        const updated = { ...lead, ...res.body };
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        onLeadUpdated?.(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (value: string, id: string) => {
    const lead = leads.find((l: any) => l.id === id);
    if (lead) handleStatusChange(id, value);
  };

  const handleEdit = (lead: Lead) => {
    setFormData(lead);
    setSelectedLeadId(lead.id);
    setOpenModal(true);
  };

  const handleDelete = async (lead: Lead) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/${lead.id}?branchId=${lead.branchId}`,
        {},
        true,
      );
      if (res.status === 200) {
        setLeads((prev) => prev.filter((l) => l.id !== lead.id));
        if (selectedLead?.id === lead.id) {
          setSelectedLead(null);
          setOpenDetailsModal(false);
        }
        onLeadDeleted?.(lead.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLead = async (
    leadId: string,
    patch: Partial<Lead>,
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.branchId) return;
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}`,
        { ...patch, actorBranchId: lead.branchId },
        true,
      );
      if (res.status === 200 && res.body) {
        const updated = { ...lead, ...res.body };
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
        if (selectedLead?.id === leadId) setSelectedLead(updated);
        onLeadUpdated?.(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignUser = async (_leadId: string, _userId: string) => {
    // Can wire up if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-10 w-10 border-2 border-[#3586FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 px-1 py-2 bg-white rounded-xl shadow-custom border border-gray-200">
        <div className="flex items-center gap-2">
          <FaStar className="text-amber-500 text-xl" />
          <h2 className="font-bold text-[#3586FF] text-lg">
            Future Potential Leads
          </h2>
          <span className="text-sm text-gray-600">({filteredLeads.length})</span>
        </div>

        <div className="flex flex-wrap gap-3 flex-1">
          <div className="min-w-[180px]">
            <SingleSelect
              type="single-select"
              name="categoryFilter"
              optionsInterface={{ isObj: false }}
              options={categoryOptions}
              selectedOption={categoryFilter}
              handleChange={(_, v) => setCategoryFilter(v ?? "All Categories")}
              placeholder="Filter by category"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <CustomInput
              type="text"
              name="searchQuery"
              placeholder="Search by name, phone, email, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="flex flex-col gap-1 p-2 rounded-lg border border-gray-200 bg-white hover:border-[#3586FF]/40 transition"
          >
            <LeadCard
              lead={lead}
              onDragStart={() => {}}
              onClick={() => {
                setSelectedLead(lead);
                setOpenDetailsModal(true);
              }}
              onStatusChange={(id, status) => handleChange(status, id)}
              hasPermission={hasPermission}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssign={handleAssignUser}
              roleUsers={[]}
            />
            <div className="text-[10px] text-gray-500 px-2 pb-1">
              <span className="font-medium">Created by:</span>{" "}
              {safeUserDisplay(lead.createdBy)} •{" "}
              <span className="font-medium">Category:</span>{" "}
              {lead.serviceType || "N/A"}
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No Future Potential leads found. Mark leads as Future Potential from
          the Overview tab.
        </div>
      )}

      {selectedLead && openDetailsModal && (
        <LeadDetailsModal
          lead={selectedLead}
          open={openDetailsModal}
          onClose={() => {
            setOpenDetailsModal(false);
            setSelectedLead(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={(id, status) => handleStatusChange(id, status)}
          onUpdateLead={handleUpdateLead}
          hasPermission={hasPermission}
        />
      )}
    </div>
  );
}
