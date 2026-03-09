import React, { HTMLProps, useEffect, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import styles from "./index.module.scss";
import Button from "../Button";
import { FaEdit } from "react-icons/fa";

interface IProps {
  rows: any[];
  columns: ColumnDef<any>[];
  onRowSelection?: (selectedRows: any[]) => void;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageCount: number;
  sortable?: boolean;
  onSort: (columnKey: string, direction: "asc" | "desc") => void;
  tableHeadClasses?: string;
  thClassName?: string; // Custom class for th
  trHeadClassName?: string; // Custom class for tr in thead
  trBodyClassName?: string; // Custom class for tr in tbody
  tdClassName?: string; // Custom class for td
  handleEdit?: (rowData: any, rowIndex: number) => void,
}

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

const RTable = ({
  rows,
  columns,
  onRowSelection,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageCount,
  sortable = false,
  onSort,
  tableHeadClasses,
  thClassName,
  trHeadClassName,
  trBodyClassName,
  tdClassName, handleEdit
}: IProps) => {
  const [data, _setData] = React.useState(() => [...rows]);
  const [rowSelection, setRowSelection] = React.useState({});

  useEffect(() => {
    if (rows?.length) {
      _setData([...rows]);
    }
  }, [pageSize, pageIndex, pageCount, onSort]);

  const defaultColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
            className: "cursor-pointer rounded-[2px] border-2 border-gray-300",
          }}
        />
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
              className: "cursor-pointer rounded-[2px] border-2 border-gray-300",
            }}
          />
        </div>
      ),
    },
    ...columns,
  ], [columns]);

  const table = useReactTable({
    data,
    pageCount: pageCount,
    state: {
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const handleEditRow = (rowData: any, rowIndex: number) => {

    if (handleEdit) {
      handleEdit(rowData, rowIndex);
    }
  };
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original) || [];
    if (onRowSelection) {
      onRowSelection(selectedRows);
    }
  }, [table.getSelectedRowModel().rows, onRowSelection]);

  const handleSortClick = (columnKey: string, direction: "asc" | "desc") => {
    onSort(columnKey, direction); // Trigger sorting function from parent
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={twMerge(`${styles.thead}`, tableHeadClasses)}>
          {table?.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={twMerge(styles.trhead, trHeadClassName)}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={twMerge(thClassName)}>
                  <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center' }}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && sortable && (
                      <div style={{ marginLeft: "8px" }}>
                        <button
                          onClick={() => onSort(header.column.id, "asc")}
                          style={{ cursor: "pointer", marginRight: "4px" }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => onSort(header.column.id, "desc")}
                          style={{ cursor: "pointer" }}
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>


        <tbody className={styles.tbody}>
          {table?.getRowModel().rows.map((row,rowIndex) => (
            <tr key={row.id} className={twMerge(styles.trbody, trBodyClassName)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={twMerge(tdClassName, 'font-regular text-[14px]')}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td className="text-center">
                <button
                  onClick={() => handleEditRow(row, rowIndex)}
                  className="text-[#3586FF]  hover:text-blue-700 cursor-pointer"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

      <div className={styles.paginationContainer}>
        <Button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!table.getCanPreviousPage()}
          className="px-10 py-2 bg-gray-300 text-white rounded"
        >
          Previous
        </Button>
        <span>
          <strong>
            {pageIndex + 1} of {table.getPageCount()}
          </strong>
        </span>
        <Button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!table.getCanNextPage()}
          className="px-10 py-2 bg-[#3586FF] text-white rounded"
        >
          Next
        </Button>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="w-[60px] p-2 border border-gray-300 rounded font-bold"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RTable;
