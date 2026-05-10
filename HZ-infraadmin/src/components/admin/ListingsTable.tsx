import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import type { InfraProperty } from '@/types/infra.types';
import { formatPrice } from '@/lib/format';

const col = createColumnHelper<InfraProperty>();

export function ListingsTable({ data }: { data: InfraProperty[] }) {
  const table = useReactTable({
    data,
    columns: [
      col.accessor('title', { header: 'Title' }),
      col.accessor('propertyType', { header: 'Type' }),
      col.accessor('city', { header: 'City' }),
      col.accessor('basePrice', {
        header: 'Price',
        cell: (c) => formatPrice(c.getValue()),
      }),
      col.accessor('isApproved', {
        header: 'Approved',
        cell: (c) => (c.getValue() ? 'Yes' : 'No') as unknown as string,
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-hzwhite">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border bg-offwhite">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-3 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-offwhite/80">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 font-inter text-[13px]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
