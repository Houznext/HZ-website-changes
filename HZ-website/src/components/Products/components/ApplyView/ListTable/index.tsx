import React from 'react';
import Button from '@/common/Button';
import { FiEdit, FiTrash } from 'react-icons/fi';

type TableProps = {
    columns: { label: string; key: string }[];
    data: any[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
};

const Table: React.FC<TableProps> = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="border px-4 py-2 text-left">
                                {col.label}
                            </th>
                        ))}
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map((col) => (
                                <td key={col.key} className="border px-4 py-2">
                                    {row[col.key]}
                                </td>
                            ))}
                            <td className="border px-4 py-2">
                                <Button
                                    onClick={() => onEdit(index)}
                                    className="bg-[#3B82F6] text-white py-1 px-3 rounded-md mr-2"
                                >
                                      <FiEdit size={20} />
                                </Button>
                                <Button
                                    onClick={() => onDelete(index)}
                                    className=" text-white py-1 px-3 rounded-md"
                                >
                                    <FiTrash size={20} className="text-red-500" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
