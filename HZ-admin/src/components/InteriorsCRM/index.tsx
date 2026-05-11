"use client";

import { Plus } from "lucide-react";
import { InteriorsCRMProvider, useInteriorsCRM } from "./CRMContext";
import { CRM_TABS } from "./constants";
import Loader from "@/src/common/Loader";
import CRMDashboard from "./tabs/CRMDashboard";
import AllLeads from "./tabs/AllLeads";
import Pipeline from "./tabs/Pipeline";
import LeadDetail from "./tabs/LeadDetail";
import FollowUps from "./tabs/FollowUps";
import Analytics from "./tabs/Analytics";
import TeamAssign from "./tabs/TeamAssign";
import CRMSettings from "./tabs/CRMSettings";
import LeadFormModal from "./components/LeadFormModal";

function InteriorsCRMInner() {
  const {
    loading,
    activeTab,
    setActiveTab,
    detailView,
    leadFormOpen,
    setLeadFormOpen,
    leadFormInitialStatus,
    setLeadFormInitialStatus,
    resetLeadForm,
    setSelectedLeadId,
  } = useInteriorsCRM();

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-120px)]">
      {!detailView ? (
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="bg-[#f1f5f9] p-[3px] rounded-[9px] flex flex-wrap gap-0.5">
            {CRM_TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-2 rounded-[7px] text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-white text-[#2563eb] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedLeadId(null);
              resetLeadForm("New");
              setLeadFormInitialStatus(undefined);
              setLeadFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] text-white px-4 py-2.5 text-[13px] font-semibold shadow-sm hover:bg-blue-700 transition-all duration-150"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            Add Lead
          </button>
        </div>
      ) : null}

      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : detailView ? (
          <LeadDetail />
        ) : (
          <>
            {activeTab === "dashboard" && <CRMDashboard />}
            {activeTab === "leads" && <AllLeads />}
            {activeTab === "pipeline" && <Pipeline />}
            {activeTab === "followups" && <FollowUps />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "assign" && <TeamAssign />}
            {activeTab === "settings" && <CRMSettings />}
          </>
        )}
      </div>

      <LeadFormModal
        open={leadFormOpen}
        onClose={() => setLeadFormOpen(false)}
        initialLeadStatus={leadFormInitialStatus}
      />
    </div>
  );
}

export default function InteriorsCRM() {
  return (
    <InteriorsCRMProvider>
      <InteriorsCRMInner />
    </InteriorsCRMProvider>
  );
}
