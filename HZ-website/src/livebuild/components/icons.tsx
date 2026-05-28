import type { LucideProps } from 'lucide-react';

export const LB_ICON_STROKE = 1.8;

export function lbIconProps(props?: LucideProps): LucideProps {
  return { strokeWidth: LB_ICON_STROKE, strokeLinecap: 'round', ...props };
}
