import React from "react";

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (row: T, index: number) => React.ReactNode;
}

const Table = <T,>({ headers, data, renderRow }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto rounded-[4px]">
      <table className="table-auto border-collapse border border-gray-300 w-full text-left ">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, index) => (
              <th key={index} className="border border-gray-300 px-4 py-2 md:text-[16px] text-[12px]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-gray-300 md:text-[16px] text-[12px] px-4 py-2 text-center text-gray-600"
              >
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
