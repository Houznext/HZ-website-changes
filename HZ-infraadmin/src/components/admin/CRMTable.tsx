import { flexRender, getCoreRowModel, useReactTable, createColumnHelper } from '@tanstack/react-table';
import type { CrmRow } from '@/types/admin.types';

const col = createColumnHelper<CrmRow>();

export function CRMTable({ data, onPatch }: { data: CrmRow[]; onPatch: (id: string, stage: string) => void }) {
  const table = useReactTable({
    data,
    columns: [
      col.accessor('name', { header: 'Name' }),
      col.accessor('phone', { header: 'Phone' }),
      col.accessor('stage', {
        header: 'Stage',
        cell: (ctx) => (
          <select
            className="rounded border border-border px-2 py-1 font-inter text-xs"
            value={ctx.getValue()}
            onChange={(e) => onPatch(ctx.row.original.leadId, e.target.value)}
          >
            {['new', 'contacted', 'site_visit', 'negotiation', 'converted', 'lost'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ),
      }),
      col.accessor('assignedTo', { header: 'Assigned' }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-hzwhite">
      <table className="w-full text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border bg-offwhite">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-3 py-2 font-montserrat text-[10px] font-bold uppercase text-muted"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-offwhite/80">
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
