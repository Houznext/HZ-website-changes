import React, { useEffect, useMemo, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import RTable from "@/src/common/RTable";
import apiClient from "@/src/utils/apiClient";
import { ColumnDef } from "@tanstack/react-table";

const StoreOrders = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    apiClient
      .get(apiClient.URLS.orders, { type: "FURNITURE", page: pageIndex + 1, limit: pageSize }, true)
      .then((res: any) => {
        const data = Array.isArray(res?.body?.data) ? res.body.data : [];
        setRows(data);
      })
      .catch(() => setRows([]));
  }, [pageIndex, pageSize]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "orderNo", header: "Order no." },
      { accessorKey: "status", header: "Order status" },
      { accessorKey: "grandTotal", header: "Amount" },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => (row.original?.items?.length ?? 0),
      },
    ],
    [],
  );

  return (
    <div className="w-full p-4">
      <h1 className="text-[20px] font-semibold mb-3">Store orders</h1>
      <RTable
        rows={rows}
        columns={columns}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        pageCount={Math.max(1, Math.ceil(rows.length / Math.max(1, pageSize)))}
        sortable={false}
        onSort={() => {}}
      />
    </div>
  );
};

export default withAdminLayout(StoreOrders);
