import Button from "../Button";
import { useCallback, useEffect, useState } from "react";
import RTable from "../RTable";
import { Delete } from "@mui/icons-material";
import apiClient from "@/src/utils/apiClient";
import { PlusIcon } from "../Icons";

interface TableColumn {
  label: string;
  key: string;
  status: boolean;
}

interface BlogData {
  [key: string]: any;
}

export const DashboardTable = ({
  data,

  customFormDataProps,
  handleAddData,
  handleEditRow,
  title,
}: any) => {
  const [blogFilters, setBlogFilters] = useState<any>({});
  const [allBlogs, setAllBlogs] = useState<BlogData[]>([]);
  const [selectedRows, setSelectedRows] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<any>([]);
  const [addColStatus, setAddColStatus] = useState(false);
  const [alloptions, setAllOptions] = useState<TableColumn[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const pageCount = Math.ceil(allBlogs.length / pageSize);

  const TableColumns: TableColumn[] = [
    { label: "Title", key: "title", status: true },
    { label: "Blog Status", key: "blogStatus", status: true },
    { label: "Blog Type", key: "blogType", status: true },
    { label: "Preview Description", key: "previewDescription", status: true },
  ];

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handleSort = (columnKey: string, direction: "asc" | "desc") => {
    setSortConfig({ key: columnKey, direction });
  };

  const formatHeader = (col: string): string => {
    return col
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const desiredColumnFormat = () => {
    const featuredKeys = TableColumns.filter((col) => col.status).map(
      (col) => col.key
    );
    const tableColumns = featuredKeys.map((col) => ({
      accessorKey: col,
      header: formatHeader(col),
      minSize: 300,
    }));
    setColumns(tableColumns);
  };

  const requiredFormat = (data: BlogData[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    const colkeys = Object.keys(data[0]);
    const featuredKeys = TableColumns.map((col) => col.key);
    const nonMatchingColkeys = colkeys.filter(
      (col) => !featuredKeys.includes(col)
    );
    const formatColkeys = nonMatchingColkeys.map((col) => ({
      label: formatHeader(col),
      key: col,
      status: false,
    }));
    const updatedColumns = [...TableColumns, ...formatColkeys];
    setAllOptions(updatedColumns);
    const tableColumns = updatedColumns
      .filter((col) => col.status)
      .map((col) => ({
        accessorKey: col.key,
        header: col.label,
        minSize: 300,
      }));
    setColumns(tableColumns);
  };

  const getPaginatedData = (
    data: BlogData[],
    pageIndex: number,
    pageSize: number
  ) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  const getRowData = (data: BlogData[], visibleColumns: any) => {
    return data.map((row) => {
      const formattedRow: any = {};
      visibleColumns.forEach((col: any) => {
        formattedRow[col.accessorKey] = row[col.accessorKey] || "";
      });
      return formattedRow;
    });
  };

  const handleaddColumns = () => {
    setAddColStatus(!addColStatus);
  };
  const handleEdit = (row: any, index: number) => {
    handleEditRow(row);
  };

  const handleSelection = (selectedRows: any[]) => {
    setSelectedRows(selectedRows);
  };

  const handleCheckboxChange = (colKey: string) => {
    const updatedOptions = alloptions.map((col) => {
      if (col.key === colKey) {
        return { ...col, status: !col.status };
      }
      return col;
    });

    setAllOptions(updatedOptions);

    const updatedColumns = updatedOptions
      .filter((col) => col.status)
      .map((col) => ({
        accessorKey: col.key,
        header: col.label,
        minSize: 300,
      }));

    setColumns(updatedColumns);
  };

  const handleDelete = () => {
    const updatedBlogs = allBlogs.filter(
      (blog) => !selectedRows.some((row) => row.id === blog.id)
    );
    setAllBlogs(updatedBlogs);
    setSelectedRows([]);
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: blogFilters?.blogType,
      });

      if (res?.body?.length > 0 && Array.isArray(res?.body)) {
        setAllBlogs(res.body);
        requiredFormat(res.body);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch the blogs: ", error);
      setLoading(false);
    }
  }, [blogFilters]);

  useEffect(() => {
    fetchBlogs();
    desiredColumnFormat();
  }, [fetchBlogs, blogFilters]);

  return (
    <div className="min-w-[100%] h-full !overflow-hidden bg-[#fafafa] py-5 shadow-custom rounded-md">
      <div className="sticky top-0 z-10 px-[30px] bg-white mx-[28px] mb-6 py-[2px] shadow-md rounded-sm">
        <div className="flex flex-row items-center mb-4 justify-between">
          <p className="text-[24px] font-medium">{title}</p>
          <div className="flex flex-row items-center justify-center gap-3">
            {selectedRows.length > 0 && (
              <div
                className="p-2 bg-red-300 rounded-full cursor-pointer"
                onClick={handleDelete}
              >
                <Delete />
              </div>
            )}
            <Button
              className="bg-[#5297ff] text-[24px] text-white px-[14px] py-1 rounded-full"
              onClick={handleAddData}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="min-w-full relative max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar flex mt-3 flex-row gap-5 px-5 pl-7">
        <div className="w-[95%]">
          <RTable
            rows={getRowData(
              getPaginatedData(allBlogs, pageIndex, pageSize),
              columns
            )}
            columns={columns}
            onRowSelection={handleSelection}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageCount={pageCount}
            onSort={handleSort}
            handleEdit={handleEdit}
            sortable={false}
            thClassName={"bg-[#fafafa] font-600 py-4"}
            trBodyClassName="hover:bg-gray-100"
            tdClassName={"!font-regular text-gray-600  font-[16px]"}
          />
        </div>
        <div className="mr-3">
          <div className="cursor-pointer mt-3" onClick={handleaddColumns}>
            <PlusIcon />
          </div>
          {addColStatus && (
            <div className="absolute top-10 right-0 bg-white w-[200px] h-[200px] overflow-auto px-2 custom-scrollbar">
              {alloptions.map((col) => (
                <div key={col.key} className="border-b-2 py-2 px-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={col.status}
                      onChange={() => handleCheckboxChange(col.key)}
                      className="mr-2 rounded-sm"
                    />
                    <span className="text-[14px] font-regular">
                      {col.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
