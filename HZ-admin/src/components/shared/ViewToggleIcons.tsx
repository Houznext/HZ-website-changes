import { LayoutGrid, List } from 'lucide-react';

type Props = {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
};

export function ViewToggleIcons({ view, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => onChange('grid')}
        className={`p-2 ${view === 'grid' ? 'bg-[#2f80ed] text-white' : 'bg-white text-gray-500'}`}
      >
        <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => onChange('list')}
        className={`p-2 ${view === 'list' ? 'bg-[#2f80ed] text-white' : 'bg-white text-gray-500'}`}
      >
        <List className="w-4 h-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
