import Button from "@/src/common/Button";
import React, { useState } from "react";
import Modal from "@/src/common/Modal";
import { MdDelete, MdEdit } from "react-icons/md";
import { IconButton } from "@mui/material";
import { CostEstimator } from "../../CostEstimatorView/helper";

export const ConstEstimationTable = ({
  costEstimation,
  isInForm,
  editItem,
  deleteItem,
  removeSection,
  handleSubmit,
  openModal,
  openSectionModal,
  editSection,
}: {
  costEstimation: CostEstimator;
  isInForm?: boolean;
  editItem?: (itemId: number, sectionIndex: number) => void;
  deleteItem?: (id: number) => void;
  removeSection?: (id: number) => void;
  handleSubmit?: () => void;
  editSection?: (id: number) => void;

  openModal?: (sectionIndex: number) => void;
  openSectionModal?: () => void;
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-8 shadow-[0_6px_24px_rgba(15,42,68,0.06)]">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-[#2f80ed] text-white text-xs uppercase tracking-[0.14em]">
            <th className="py-3 px-4 text-left">#</th>
            <th className="py-3 px-4 text-left">
              Item Description
            </th>
            <th className="py-3 px-4 text-center">
              Qty
            </th>
            <th className="py-3 px-4 text-center">
              Area (sft/Box)
            </th>
            <th className="py-3 px-4 text-right">
              Price (₹)
            </th>
            <th className="py-3 px-4 text-right">
              Amount (₹)
            </th>
            {isInForm && (
              <th className="py-2 px-4 text-right border border-gray-300 ">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-sm">
          {costEstimation?.itemGroups?.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr className="w-full bg-slate-50/80">
                <td
                  colSpan={isInForm ? 5 : 10}
                  className="font-semibold w-full py-2 px-4 text-[#0f2a44]"
                >
                  {group.title}
                </td>
                {isInForm && (
                  <div className="flex items-center justify-center gap-3 mt-1 ml-3  w-full ">
                    <MdEdit
                      className="text-[18px]"
                      onClick={() => {
                        editSection(groupIndex);
                        openSectionModal();
                      }}
                    />
                    <MdDelete
                      className="text-red-500 text-[18px]"
                      onClick={() => removeSection(groupIndex)}
                    />
                    <div>
                      <Button
                        className="text-nowrap  font-medium md:text-[12px] text-[10px] md:px-[20px] px-[14px] py-1 rounded-md border-2 bg-[#3B82F6] text-white"
                        onClick={() => openModal(groupIndex)}
                        size="sm"
                      >
                        Add item
                      </Button>
                    </div>
                  </div>
                )}
              </tr>
              {group.items?.map((item, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium text-slate-700">
                    {index + 1}
                  </td>
                  <td className="py-2 md:px-4 px-2 align-top">
                    <div className="font-medium text-slate-900">
                      {item?.item_name}
                    </div>
                    <div className="text-gray-600 font-regular md:text-[12px] text-[10px] md:leading-[20px] leading-[16px] tracking-[0.4px] mt-0.5">
                      {item?.description}
                    </div>
                  </td>
                  <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium text-slate-800">
                    {item?.quantity}
                  </td>
                  <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium text-slate-800">
                    {item?.area}
                  </td>
                  <td className="md:py-4 py-2 md:px-4 px-2 text-right font-medium text-[#2f80ed]">
                    {item?.unit_price}
                  </td>
                  <td className="md:py-4 py-2 md:px-4 px-2 text-right font-medium text-[#2f80ed]">
                    {item?.amount}
                  </td>

                  {isInForm && (
                    <td className="py-2 px-4 text-right font-medium border border-gray-300">
                      <div className="flex w-full justify-end space-x-5">
                        <IconButton
                          onClick={() => {
                            editItem(index, groupIndex);
                            openModal(groupIndex);
                          }}
                        >
                          <MdEdit className="text-md" />
                        </IconButton>
                        <IconButton onClick={() => deleteItem(item?.id)}>
                          <MdDelete className="text-red-500 text-xl" />
                        </IconButton>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
