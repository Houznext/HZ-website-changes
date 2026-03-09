import RTable from "@/common/RTable";
import withUserLayout from "@/components/Layouts/UserLayout";
import { Container } from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";

const NewUi = ({ data, columns }: any) => {
  console.log("data is ", data);
  const sampleColumns: ColumnDef<any>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      minSize: 300,
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "visits",
      header: "Visits",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "progress",
      header: "Progress",
    },
  ];

  const defaultData = [
    {
      firstName: "Tanner",
      lastName: "Linsley",
      age: 24,
      visits: 100,
      status: "In Relationship",
      progress: 50,
    },
    {
      firstName: "Tandy",
      lastName: "Miller",
      age: 40,
      visits: 40,
      status: "Single",
      progress: 80,
    },
    {
      firstName: "Joe",
      lastName: "Dirte",
      age: 45,
      visits: 20,
      status: "Complicated",
      progress: 10,
    },
    {
      firstName: "Emily",
      lastName: "Clark",
      age: 29,
      visits: 60,
      status: "Married",
      progress: 90,
    },
    {
      firstName: "John",
      lastName: "Doe",
      age: 35,
      visits: 120,
      status: "Single",
      progress: 40,
    },
    {
      firstName: "Samantha",
      lastName: "Smith",
      age: 32,
      visits: 85,
      status: "In Relationship",
      progress: 60,
    },
    {
      firstName: "Robert",
      lastName: "Johnson",
      age: 28,
      visits: 75,
      status: "Single",
      progress: 70,
    },
    {
      firstName: "Linda",
      lastName: "Williams",
      age: 22,
      visits: 95,
      status: "Complicated",
      progress: 30,
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      age: 38,
      visits: 110,
      status: "Married",
      progress: 55,
    },
    {
      firstName: "Lisa",
      lastName: "Jones",
      age: 27,
      visits: 45,
      status: "In Relationship",
      progress: 65,
    },
    {
      firstName: "James",
      lastName: "Garcia",
      age: 33,
      visits: 90,
      status: "Single",
      progress: 25,
    },
    {
      firstName: "Karen",
      lastName: "Martinez",
      age: 31,
      visits: 50,
      status: "Complicated",
      progress: 15,
    },
    {
      firstName: "David",
      lastName: "Rodriguez",
      age: 41,
      visits: 70,
      status: "Single",
      progress: 35,
    },
    {
      firstName: "Nancy",
      lastName: "Wilson",
      age: 26,
      visits: 55,
      status: "Married",
      progress: 75,
    },
    {
      firstName: "Richard",
      lastName: "Davis",
      age: 36,
      visits: 130,
      status: "In Relationship",
      progress: 85,
    },
    {
      firstName: "Betty",
      lastName: "Miller",
      age: 42,
      visits: 65,
      status: "Single",
      progress: 20,
    },
    {
      firstName: "Charles",
      lastName: "Taylor",
      age: 30,
      visits: 105,
      status: "Complicated",
      progress: 50,
    },
    {
      firstName: "Jessica",
      lastName: "Anderson",
      age: 23,
      visits: 35,
      status: "In Relationship",
      progress: 95,
    },
    {
      firstName: "George",
      lastName: "Thomas",
      age: 39,
      visits: 25,
      status: "Single",
      progress: 40,
    },
    {
      firstName: "Barbara",
      lastName: "Hernandez",
      age: 44,
      visits: 60,
      status: "Married",
      progress: 55,
    },
    {
      firstName: "Edward",
      lastName: "Moore",
      age: 34,
      visits: 80,
      status: "In Relationship",
      progress: 70,
    },
    {
      firstName: "Susan",
      lastName: "Martin",
      age: 37,
      visits: 50,
      status: "Single",
      progress: 10,
    },
    {
      firstName: "Daniel",
      lastName: "Jackson",
      age: 25,
      visits: 90,
      status: "Complicated",
      progress: 30,
    },
    {
      firstName: "Amy",
      lastName: "Thompson",
      age: 43,
      visits: 100,
      status: "Married",
      progress: 65,
    },
    {
      firstName: "Steven",
      lastName: "White",
      age: 29,
      visits: 40,
      status: "In Relationship",
      progress: 85,
    },
  ];

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.ceil(defaultData.length / pageSize);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Function to handle page change
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  // Function to handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return defaultData;
    const sortedArray = [...defaultData].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortedArray;
  }, [defaultData, sortConfig]);

  // Data for the current page
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [pageIndex, pageSize, defaultData]);

  const handleSelection = (selectedRows: any[]) => {
    console.log("Selected Rows:", selectedRows);
  };

  const handleSort = (columnKey: string, direction: "asc" | "desc") => {
    setSortConfig({ key: columnKey, direction });
  };

  return (
    <Container style={{ background: "#f8f9ff", maxWidth: "100%" }}>
      <RTable
        rows={data}
        columns={columns}
        onRowSelection={handleSelection}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageCount={pageCount}
        onSort={handleSort}
        sortable={false}
        thClassName={"bg-[#fafafa] font-600 py-4"}
        trBodyClassName="hover:bg-gray-100"
        tdClassName={"!font-regular text-gray-600  font-[16px]"}
      />
    </Container>
  );
};

export default withUserLayout(NewUi);
