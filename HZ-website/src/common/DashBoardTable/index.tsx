import NewUiTable from "@/components/Products/components/NewUiTable";
import Button from "../Button";
import { PlusIcon } from "@/components/Icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import RTable from "../RTable";
import { Delete } from "@mui/icons-material";
import Drawer from "../Drawer";
import CustomForm from "../FormElements";
import { Container } from "@mui/material";

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
  TableColumns,
  customFormDataProps,
  handleAddData,
  handleEditRow,
  title,
}: any) => {
  const [blogFilters, setBlogFilters] = useState<any>({});
  const [allBlogs, setAllBlogs] = useState<BlogData[]>([...data]);
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

  const [rowData, setRowData] = useState<any>([]);

  const pageCount = Math.ceil(allBlogs.length / pageSize);

  // console.log('data is ', data)
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

  const desiredColumnFormat = useCallback(() => {
    const featuredKeys = TableColumns.filter((col: any) => col.status).map(
      (col: any) => col.key
    );
    const tableColumns = featuredKeys.map((col: any) => ({
      accessorKey: col,
      header: formatHeader(col),
      minSize: 300,
    }));
    setColumns(tableColumns);
  }, [TableColumns]);

  const requiredFormat = (data: BlogData[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.log("No data available to format");
      return;
    }

    const colkeys = Object.keys(data[0]);
    const featuredKeys = TableColumns.map((col: any) => col.key);
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
    const formattedRows = data.map((row) => {
      const formattedRow: any = {};
      visibleColumns.forEach((col: any) => {
        formattedRow[col.accessorKey] = row[col.accessorKey] || "";
      });
      return formattedRow;
    });
    setRowData(formattedRows); // Set all the rows at once
  };

  const handleaddColumns = () => {
    setAddColStatus(!addColStatus);
  };

  const handleSelection = (selectedRows: any[]) => {
    // console.log("Selected Rows:", selectedRows);
    // setSelectedRows(selectedRows);
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
    // const updatedBlogs = allBlogs.filter(
    //     (blog) => !selectedRows.some((row) => row.id === blog.id)
    // );
    // setAllBlogs(updatedBlogs);
    // setSelectedRows([]);
  };
  const handleEdit = (row: any, index: number) => {
    handleEditRow(row);
  };

  useEffect(() => {
    // fetchBlogs();
    desiredColumnFormat();
    requiredFormat(data);
  }, [, desiredColumnFormat]);

  useEffect(() => {
    getRowData(data, columns);
  }, [data, columns]);

  return (
    <div className="!max-w-[100%]  h-full !overflow-hidden bg-[#fafafa] py-5 shadow-custom rounded-md">
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
              className="bg-[#3586FF] text-[24px] text-white px-[14px] py-1 rounded-full"
              onClick={handleAddData}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="md:max-w-full max-w-[100%] relative max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar flex mt-3 flex-row md:gap-5 gap-2 md:px-5 px-2 md:pl-7 pl-2">
        <div className="w-[95%]">
          <Container style={{ background: "#f8f9ff", maxWidth: "100%" }}>
            <RTable
              rows={rowData}
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
          </Container>
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
                    <span className="text-[14px] font-Gordita-Normal">
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
