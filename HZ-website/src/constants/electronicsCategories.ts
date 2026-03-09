/**
 * Electronics categories - must match backend enum exactly.
 * @see DC-backend/src/electronics/enum/electronics.enum.ts ElectronicsCategory
 */
export const ELECTRONICS_CATEGORIES = [
  { id: 1, name: "All", category: "" },
  { id: 2, name: "Kitchen Appliances", category: "Kitchen Appliances" },
  { id: 3, name: "Entertainment", category: "Entertainment" },
  { id: 4, name: "Smart Home & Automation", category: "Smart Home & Automation" },
  { id: 5, name: "Cleaning & Laundry", category: "Cleaning & Laundry" },
  { id: 6, name: "Climate Control", category: "Climate Control" },
  { id: 7, name: "Lighting & Power Solutions", category: "Lighting & Power Solutions" },
] as const;

export type ElectronicsCategoryValue =
  (typeof ELECTRONICS_CATEGORIES)[number]["category"];

export type ElectronicsCategoryItem =
  (typeof ELECTRONICS_CATEGORIES)[number];

/** Category string sent to API; empty means no filter (all products). */
export function getElectronicsCategoryForApi(category: string): string[] | undefined {
  const trimmed = category?.trim();
  if (!trimmed) return undefined;
  const valid = ELECTRONICS_CATEGORIES.find(
    (c) => c.category.toLowerCase() === trimmed.toLowerCase()
  );
  return valid ? [valid.category] : undefined;
}
