"use client";

import { usePermissionStore } from "@/src/stores/usePermissions";
import { useCrmLeadStatusDefinitions } from "@/src/hooks/useCrmLeadStatusDefinitions";
import CrmFieldOptionsSection from "../components/CrmFieldOptionsSection";
import CrmSortableOptionsList from "../components/CrmSortableOptionsList";

export default function CRMSettings() {
  const { hasPermission } = usePermissionStore();
  const canEdit = hasPermission("crm", "edit");
  const {
    items: statusItems,
    loading: statusLoading,
    error: statusError,
    create: createStatus,
    update: updateStatus,
    delete: deleteStatus,
    reorder: reorderStatus,
    setDefault: setStatusDefault,
  } = useCrmLeadStatusDefinitions();

  return (
    <div className="space-y-6">
      <CrmFieldOptionsSection
        fieldType="service_category"
        title="Service category"
        description="Options shown when adding or editing a lead."
        canEdit={canEdit}
      />

      <CrmFieldOptionsSection
        fieldType="platform"
        title="Platform"
        description="Lead source platforms (Walkin, Facebook, etc.)."
        canEdit={canEdit}
      />

      <CrmFieldOptionsSection
        fieldType="state"
        title="State"
        description="States available in the lead form location dropdown."
        canEdit={canEdit}
      />

      <CrmSortableOptionsList
        title="Lead statuses"
        description="Values stored on leads and used in reports."
        canEdit={canEdit}
        items={statusItems}
        loading={statusLoading}
        error={statusError}
        onCreate={async (dto) => {
          await createStatus(dto);
        }}
        onUpdate={async (id, dto) => {
          await updateStatus(id, dto);
        }}
        onDelete={async (id) => {
          await deleteStatus(id);
        }}
        onReorder={async (orderedIds) => {
          await reorderStatus(orderedIds);
        }}
        onSetDefault={async (id) => {
          await setStatusDefault(id);
        }}
      />
    </div>
  );
}
