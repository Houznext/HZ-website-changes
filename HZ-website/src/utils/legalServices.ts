/**
 * Fetches legal services for a branch from the backend.
 * Use NEXT_PUBLIC_LEGAL_BRANCH_ID for the default branch (single data source).
 * In future, branchId can be chosen by city/location.
 */
import apiClient from "./apiClient";

export type BranchLegalService = {
  id: string;
  branchId: string;
  title: string;
  kind: "package" | "service";
  features: string[];
  price: string;
  originalPrice: string | null;
  /** GST percentage (e.g. 18 for 18%). Default 18 if not set. */
  gstPercent?: string | number;
  /** Whether price is inclusive of GST. Default true. */
  gstInclusive?: boolean;
  buttonText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const LEGAL_BRANCH_ID =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_LEGAL_BRANCH_ID
    : undefined;

export async function fetchLegalServices(
  branchId?: string
): Promise<BranchLegalService[]> {
  const effectiveBranchId = branchId || LEGAL_BRANCH_ID;
  if (!effectiveBranchId) {
    return [];
  }
  try {
    const res = await apiClient.get(
      `${apiClient.URLS.branches}/${effectiveBranchId}/legal-services`,
      {},
      false
    );
    if (res.status === 200 && Array.isArray(res.body)) {
      return res.body;
    }
    return [];
  } catch (e) {
    console.error("fetchLegalServices error", e);
    return [];
  }
}

export function getDefaultLegalBranchId(): string | undefined {
  return LEGAL_BRANCH_ID;
}
