"use client";

import CrmSortableOptionsList from "./CrmSortableOptionsList";
import {
  useCrmFieldOptions,
  type CrmFieldOptionType,
} from "@/src/hooks/useCrmFieldOptions";

type CrmFieldOptionsSectionProps = {
  fieldType: CrmFieldOptionType;
  title: string;
  description: string;
  canEdit: boolean;
};

export default function CrmFieldOptionsSection({
  fieldType,
  title,
  description,
  canEdit,
}: CrmFieldOptionsSectionProps) {
  const {
    items,
    loading,
    error,
    create,
    update,
    delete: deleteOpt,
    reorder,
    setDefault,
  } = useCrmFieldOptions(fieldType);

  return (
    <CrmSortableOptionsList
      title={title}
      description={description}
      canEdit={canEdit}
      items={items}
      loading={loading}
      error={error}
      onCreate={async (dto) => {
        await create(dto);
      }}
      onUpdate={async (id, dto) => {
        await update(id, dto);
      }}
      onDelete={async (id) => {
        await deleteOpt(id);
      }}
      onReorder={async (orderedIds) => {
        await reorder(orderedIds);
      }}
      onSetDefault={async (id) => {
        await setDefault(id);
      }}
    />
  );
}
