import { flexRender, getCoreRowModel, useReactTable, createColumnHelper } from '@tanstack/react-table';
import type { InfraProject } from '@/types/infra.types';

const col = createColumnHelper<InfraProject>();

export function ProjectsTable({ data }: { data: InfraProject[] }) {
  const table = useReactTable({
    data,
    columns: [
      col.accessor('name', { header: 'Project' }),
      col.accessor('city', { header: 'City' }),
      col.accessor('status', { header: 'Status' }),
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
