"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/src/utils/apiClient";
import { sortOptions } from "@/src/hooks/useCrmFieldOptions";

export type CrmLeadStatusDefinition = {
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

export function useCrmLeadStatusDefinitions() {
  const [items, setItems] = useState<CrmLeadStatusDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `${apiClient.URLS.crmlead}/status-definitions`;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(baseUrl, {}, true);
      setItems(Array.isArray(res.body) ? res.body : []);
    } catch (e) {
      setError(errMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

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
      const res = await apiClient.post(baseUrl, dto, true);
      await refresh();
      return res.body as CrmLeadStatusDefinition;
    },
    [baseUrl, refresh],
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
      return res.body as CrmLeadStatusDefinition;
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
        { orderedIds },
        true,
      );
      setItems(Array.isArray(res.body) ? res.body : []);
    },
    [baseUrl],
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
