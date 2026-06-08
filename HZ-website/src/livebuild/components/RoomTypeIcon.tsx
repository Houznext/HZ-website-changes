import {
  Bed,
  Bath,
  ChefHat,
  Sofa,
  BookOpen,
  Sun,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { lbIconProps } from './icons';

function iconForRoomName(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes('kitchen')) return ChefHat;
  if (n.includes('bath')) return Bath;
  if (n.includes('bed')) return Bed;
  if (n.includes('living') || n.includes('dining') || n.includes('hall')) return Sofa;
  if (n.includes('study') || n.includes('pooja')) return BookOpen;
  if (n.includes('balcony') || n.includes('terrace')) return Sun;
  return LayoutGrid;
}

type Props = {
  name: string;
  size?: number;
  color?: string;
  className?: string;
};

export default function RoomTypeIcon({ name, size = 22, color = 'var(--blue)', className = '' }: Props) {
  const Icon = iconForRoomName(name);
  return (
    <span className={`lb-room-icon ${className}`.trim()} aria-hidden>
      <Icon size={size} {...lbIconProps({ color, strokeWidth: 1.75 })} />
    </span>
  );
}
