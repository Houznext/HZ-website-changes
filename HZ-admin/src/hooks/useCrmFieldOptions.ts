"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/src/utils/apiClient";

export type CrmFieldOptionType = "service_category" | "platform" | "state";

export type CrmFieldOption = {
  id: string;
  fieldType: CrmFieldOptionType;
  value: string;
  label: string;
  sortOrder: number;
  isBuiltin: boolean;
  isDefault: boolean;
};

export type CrmSettingsListItem = {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isBuiltin: boolean;
  isDefault: boolean;
};

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "body" in e) {
    const body = (e as { body?: { message?: unknown } }).body;
    const m = body?.message;
    if (typeof m === "string") return m;
    if (Array.isArray(m)) return m.join(", ");
  }
  if (e instanceof Error) return e.message;
  return "Request failed";
}

export function sortOptions<T extends { sortOrder: number; value: string }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.value.localeCompare(b.value),
  );
}

export function pickDefaultValue(
  items: Array<{ value: string; isDefault?: boolean }>,
  fallback: string,
): string {
  const marked = items.find((i) => i.isDefault);
  if (marked) return marked.value;
  return items[0]?.value ?? fallback;
}

export function mapToCategoryData(items: CrmFieldOption[]) {
  return sortOptions(items).map((item, index) => ({
    id: index + 1,
    role: item.value,
  }));
}

export function mapToPlatformData(items: CrmFieldOption[]) {
  return sortOptions(items).map((item, index) => ({
    id: index + 1,
    platform: item.value,
  }));
}

export function mapToStateOptions(items: CrmFieldOption[]) {
  return sortOptions(items).map((item) => item.value);
}

export function mapToLeadStatusData(
  items: Array<{ value: string; sortOrder: number }>,
) {
  return sortOptions(items).map((item, index) => ({
    id: index + 1,
    leadstatus: item.value,
  }));
}

export function useCrmFieldOptions(fieldType: CrmFieldOptionType) {
  const [items, setItems] = useState<CrmFieldOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listUrl = `${apiClient.URLS.crmlead}/field-options?type=${fieldType}`;
  const baseUrl = `${apiClient.URLS.crmlead}/field-options`;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(listUrl, {}, true);
      const rows = Array.isArray(res.body) ? (res.body as CrmFieldOption[]) : [];
      setItems(rows.filter((r) => r.fieldType === fieldType));
    } catch (e) {
      setError(errMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fieldType, listUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (dto: {
      value: string;
      label?: string;
      sortOrder?: number;
      isDefault?: boolean;
    }) => {
      const res = await apiClient.post(
        baseUrl,
        { fieldType, ...dto },
        true,
      );
      await refresh();
      return res.body as CrmFieldOption;
    },
    [baseUrl, fieldType, refresh],
  );

  const update = useCallback(
    async (
      id: string,
      dto: {
        value?: string;
        label?: string;
        sortOrder?: number;
        isDefault?: boolean;
      },
    ) => {
      const res = await apiClient.patch(`${baseUrl}/${id}`, dto, true);
      await refresh();
      return res.body as CrmFieldOption;
    },
    [baseUrl, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await apiClient.delete(`${baseUrl}/${id}`, {}, true);
      await refresh();
    },
    [baseUrl, refresh],
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      const res = await apiClient.post(
        `${baseUrl}/reorder`,
        { fieldType, orderedIds },
        true,
      );
      const rows = Array.isArray(res.body) ? (res.body as CrmFieldOption[]) : [];
      setItems(rows.filter((r) => r.fieldType === fieldType));
    },
    [baseUrl, fieldType],
  );

  const setDefault = useCallback(
    async (id: string) => {
      await update(id, { isDefault: true });
    },
    [update],
  );

  const sorted = useMemo(() => sortOptions(items), [items]);

  return {
    items: sorted,
    loading,
    error,
    refresh,
    create,
    update,
    delete: remove,
    reorder,
    setDefault,
  };
}

export function useAllCrmFieldOptions() {
  const [byType, setByType] = useState<Record<CrmFieldOptionType, CrmFieldOption[]>>({
    service_category: [],
    platform: [],
    state: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listUrl = `${apiClient.URLS.crmlead}/field-options`;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(listUrl, {}, true);
      const rows = Array.isArray(res.body) ? (res.body as CrmFieldOption[]) : [];
      const grouped: Record<CrmFieldOptionType, CrmFieldOption[]> = {
        service_category: [],
        platform: [],
        state: [],
      };
      for (const row of rows) {
        if (row.fieldType in grouped) {
          grouped[row.fieldType as CrmFieldOptionType].push(row);
        }
      }
      (Object.keys(grouped) as CrmFieldOptionType[]).forEach((key) => {
        grouped[key] = sortOptions(grouped[key]);
      });
      setByType(grouped);
    } catch (e) {
      setError(errMessage(e));
      setByType({ service_category: [], platform: [], state: [] });
    } finally {
      setLoading(false);
    }
  }, [listUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { byType, loading, error, refresh };
}
