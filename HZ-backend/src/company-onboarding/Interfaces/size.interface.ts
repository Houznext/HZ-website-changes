export interface SizeWithUnit {
    size: number;
    unit: 'sq.ft' | 'sq.yard' | 'sq.meter' | 'acre' | 'cent' | 'marla' | 'unit';
  }

  export type AllowedUnits = 'sq.ft' | 'sq.yard' | 'sq.meter' | 'acre' | 'cent' | 'marla' | 'unit';