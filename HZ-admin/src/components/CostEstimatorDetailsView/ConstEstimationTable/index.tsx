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
    <div className="overflow-x-auto rounded-[12px] border border-gray-200 mt-2
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr style={{ background: '#0f2a44' }}>
            <th className="py-2.5 px-4 text-left text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              #
            </th>
            <th className="py-2.5 px-4 text-left text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Item Description
            </th>
            <th className="py-2.5 px-4 text-center text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Qty
            </th>
            <th className="py-2.5 px-4 text-center text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Area (sft/Box)
            </th>
            <th className="py-2.5 px-4 text-right text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Price (₹)
            </th>
            <th className="py-2.5 px-4 text-right text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Amount (₹)
            </th>
            {isInForm && (
              <th className="py-2.5 px-4 text-right text-[9.5px] font-bold text-white uppercase tracking-[0.12em]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-sm">
          {costEstimation?.itemGroups?.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr>
                <td
                  colSpan={isInForm ? 5 : 10}
                  className="py-2 px-4 text-[12px] font-bold text-gray-700
                             bg-gray-50 border-y border-gray-200"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {group.title}
                </td>
                {isInForm && (
                  <td className="py-2 px-3 bg-gray-50 border-y border-gray-200">
                    <div className="flex items-center gap-1.5">
                      {/* Edit section — keep onClick */}
                      <button
                        onClick={() => {
                          editSection(groupIndex);
                          openSectionModal();
                        }}
                        className="w-6 h-6 rounded-[5px] border border-gray-300 bg-white
                                   flex items-center justify-center text-gray-500
                                   hover:text-[#2f80ed] hover:border-[#2f80ed] transition-all"
                      >
                        <MdEdit className="text-[12px]" />
                      </button>
                      {/* Delete section — keep onClick */}
                      <button
                        onClick={() => removeSection(groupIndex)}
                        className="w-6 h-6 rounded-[5px] border border-red-200 bg-red-50
                                   flex items-center justify-center text-red-500 transition-all"
                      >
                        <MdDelete className="text-[12px]" />
                      </button>
                      {/* Add item — keep onClick */}
                      <Button
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-[6px]
                                   bg-[#2f80ed] text-white hover:bg-[#1a6dd6] transition-all"
                        onClick={() => openModal(groupIndex)}
                        size="sm"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Add item
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
              {group.items?.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                >
                  <td
                    className="py-3 px-4 text-center text-[11px] font-medium text-gray-400"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 align-top">
                    <div
                      className="text-[13px] font-semibold text-gray-800"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item?.item_name}
                    </div>
                    <div
                      className="text-[11.5px] text-gray-400 mt-0.5 leading-relaxed"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item?.description}
                    </div>
                  </td>
                  <td
                    className="py-3 px-4 text-center text-[13px] font-medium text-gray-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {item?.quantity}
                  </td>
                  <td
                    className="py-3 px-4 text-center text-[13px] font-medium text-gray-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {item?.area}
                  </td>
                  <td
                    className="py-3 px-4 text-right text-[13px] font-medium text-gray-600 tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ₹{Number(item?.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td
                    className="py-3 px-4 text-right text-[13px] font-bold text-[#2f80ed] tabular-nums"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    ₹{Number(item?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {isInForm && (
                    <td className="py-3 px-4 text-right border-l border-gray-100">
                      <div className="flex justify-end gap-1">
                        {/* Edit item — keep onClick exactly */}
                        <IconButton
                          onClick={() => {
                            editItem(index, groupIndex);
                            openModal(groupIndex);
                          }}
                        >
                          <MdEdit className="text-[14px] text-gray-500 hover:text-[#2f80ed]" />
                        </IconButton>
                        {/* Delete item — keep onClick exactly */}
                        <IconButton onClick={() => deleteItem(item?.id)}>
                          <MdDelete className="text-red-400 text-[16px]" />
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
