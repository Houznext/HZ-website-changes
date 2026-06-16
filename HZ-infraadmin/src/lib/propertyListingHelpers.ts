/** Property types where construction status does not apply. */
export const PROPERTY_TYPES_WITHOUT_CONSTRUCTION_STATUS = ['Land', 'Plot', 'Farmhouse'] as const;

export function needsConstructionStatus(propertyType: unknown): boolean {
  return !PROPERTY_TYPES_WITHOUT_CONSTRUCTION_STATUS.includes(
    String(propertyType ?? '') as (typeof PROPERTY_TYPES_WITHOUT_CONSTRUCTION_STATUS)[number],
  );
}
