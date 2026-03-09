import CustomForm, { ICustomFormProps } from '@/common/FormElements';
import { DropDown } from '@/common/PopOver';
import React, { ReactNode, useMemo, useState } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import Image from 'next/image';
import CustomInput from '@/common/FormElements/CustomInput';
import { CiSearch } from 'react-icons/ci';
import CustomTable from '@/common/CustomTable';
import Drawer from '@/common/Drawer';
import CheckboxInput from '@/common/FormElements/CheckBoxInput';
import { MdOutlineArrowDropDown } from 'react-icons/md';
interface IShowMoreDropDownProps {
  id: number;
}


interface IColumnSelectorProps {
  columns: Array<{ key: string, label: ReactNode }>;
  selectedColumns: Array<string>;
  handleColumnSelection: (key: string) => void;
}

const ColumnSelector = ({ columns, selectedColumns, handleColumnSelection }: IColumnSelectorProps) => {
  return (
    <>
      {columns && Array.isArray(columns) && columns.length > 0 ? <DropDown
        placement="bottom-start"
        buttonElement={<div className='flex gap-3 cursor-pointer px-3 py-2 bg-slate-300 rounded items-center'><span className='text-gray-700 font-medium'>Columns</span> <MdOutlineArrowDropDown className="text-black cursor-pointer text-[20px]" /></div>}
      >
        <div className="px-4 py-2 flex flex-col gap-y-2 border bg-white rounded shadow-md">
          {columns.map((column) => (
            <CheckboxInput
              key={column.key}
              type="checkbox"
              checked={selectedColumns.includes(column.key)}
              name={column.key}
              label={column.label}
              value={column.key}
              onChange={() => handleColumnSelection(column.key)}
            />
          ))}
        </div>
      </DropDown> : null}
    </>
  );
};

interface ICommonTableDashBoardProps {
  handleEdit: (id: any) => void;
  handleDelete: (id: any) => void;
  tableColumns: Array<{
    key: string;
    label: ReactNode;
    isObj: { flag: boolean; displayKey?: string };
  }>;
  customFormDataProps: ICustomFormProps;
  handleFormChange: (name: string, value: any) => void;
  handleSubmit: (e: any) => void;
  handleReset: (e: any) => void;
  handleSearch: (e?: any) => void;
  handleFilters: (name: string, value: any) => void;
  toggleModal: (flag: boolean) => void;
  loading: boolean;
  setSearchQuery: (value: string) => void;
  openModal: boolean;
  data: any;
  heading: string
}

const CommonTableDashBoard = ({ handleEdit, handleDelete, customFormDataProps, handleFilters, handleFormChange, handleReset, handleSearch, handleSubmit, loading, tableColumns, toggleModal, setSearchQuery, openModal, data, heading }: ICommonTableDashBoardProps) => {

  const ShowMoreDropDown = ({ id }: IShowMoreDropDownProps) => {
    return (
      <DropDown
        placement="left-start"
        buttonElement={<BsThreeDots className="text-black cursor-pointer" />}
      >
        <div className="px-4 py-2 flex flex-col border bg-white border-gray-500 rounded shadow-md">
          <span
            className="px-2 py-1 cursor-pointer hover:bg-black/15"
            onClick={() => {
              handleEdit(id);
            }}
          >
            View
          </span>
          <span
            className="px-2 py-1 cursor-pointer hover:bg-black/15"
            onClick={() => {
              handleEdit(id);
            }}
          >
            Edit
          </span>
          <span
            className="px-2 py-1 cursor-pointer hover:bg-black/15"
            onClick={() => {
              handleDelete(id);
            }}
          >
            Delete
          </span>
        </div>
      </DropDown>
    );
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0 ? tableColumns.map(col => col.key) : []);

  const handleColumnSelection = (key: string) => {
    setSelectedColumns(prev =>
      prev && Array.isArray(prev) && prev.length > 0 && prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
  };

  const filteredColumns = useMemo(
    () => tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0 ? tableColumns.filter(col => selectedColumns.includes(col.key)) : [],
    [tableColumns, selectedColumns]
  );

  const formData = useMemo(() => {
    const { ref, ...otherFormDataProps } = customFormDataProps || {} as any;
    return otherFormDataProps
  }, [customFormDataProps])


  return (
    <>
      <div className="w-full min-h-full px-5 py-7 bg-[#FFFDF0]">
        {loading && (
          <div className="inset-0 z-[9999] backdrop-blur-[0.5px] fixed bg-white bg-opacity-50 flex justify-center items-center cursor-wait">
            <Image src={`/icons/loader.svg`} alt="" width={100} height={100} />
          </div>
        )}
        <div className="flex justify-between items-start mb-10 gap-6">
          <span className="text-2xl font-bold">{heading}</span>
          <div className="flex-1 flex justify-end gap-4 items-center">
            {
              tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0 && (
                <ColumnSelector
                  columns={tableColumns.map(col => ({ key: col.key, label: col.label }))}
                  selectedColumns={selectedColumns}
                  handleColumnSelection={handleColumnSelection}
                />)
            }

            <form onSubmit={handleSearch}>
              <CustomInput
                name={'search'}
                type={'text'}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                outerInptCls="w-[300px] shadow-md border-[#18213F] rounded-3xl focus-within:border-[#18213F]"
                leftIcon={
                  <CiSearch
                    onClick={handleSearch}
                    className="text-[20px] cursor-pointer"
                  />
                }
              />
            </form>
          </div>
          <button
            className="text-slate-100 px-3 py-2 rounded-md bg-slate-700 mr-3"
            onClick={() => {
              toggleModal(true);
            }}
          >
            + Add
          </button>
        </div>
        {
          data && Array.isArray(data) && data.length > 0 && (
            <CustomTable
              columns={filteredColumns}
              data={data.map((item: any, index: number) => {
                return { ...item, more: <ShowMoreDropDown id={item.id} /> };
              })}
              theadCls="bg-slate-100"
              tbodyCls="bg-white"
            />)
        }
      </div>
      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={toggleModal}
          closeIconCls="text-black"
          openVariant="right"
          panelCls=" w-[90%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          {loading && (
            <div className="inset-0 z-[9999] backdrop-blur-[0.5px] fixed bg-white bg-opacity-50 flex justify-center items-center cursor-wait">
              <Image
                src={`/icons/loader.svg`}
                alt=""
                width={100}
                height={100}
              />
            </div>
          )}
          <CustomForm {...formData} />
        </Drawer>
      )}
    </>
  )
}

export default CommonTableDashBoard
