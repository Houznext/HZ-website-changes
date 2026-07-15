import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { IconButton } from "@mui/material";
import {
  CostEstimator,
  calcItemTotalWithGst,
  itemAreaOrQty,
  itemGstDisplay,
} from "../../CostEstimatorView/helper";

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
  const formatINR = (n: number) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /** Form mode: group blocks + Add item under each group (invoice-style flow). */
  if (isInForm) {
    return (
      <div className="space-y-3.5">
        {costEstimation?.itemGroups?.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="rounded-[11px] border border-[#dde8f5] bg-[#f8fafc] p-3.5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div
                className="min-w-0 flex-1 text-[13px] font-bold text-gray-800"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {group.title}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    editSection?.(groupIndex);
                    openSectionModal?.();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-gray-300 bg-white text-gray-500 transition-all hover:border-[#2f80ed] hover:text-[#2f80ed]"
                >
                  <MdEdit className="text-[13px]" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection?.(groupIndex)}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-red-200 bg-red-50 text-red-500 transition-all"
                >
                  <MdDelete className="text-[13px]" />
                </button>
              </div>
            </div>

            {group.items?.length > 0 ? (
              <div className="mb-2.5 overflow-hidden rounded-[9px] border border-[#dde8f5] bg-white">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr style={{ background: "#0f2a44" }}>
                      <th className="px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        #
                      </th>
                      <th className="px-3 py-2 text-left text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        Item Description
                      </th>
                      <th className="px-3 py-2 text-center text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        Area/Qty
                      </th>
                      <th className="px-3 py-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        GST
                      </th>
                      <th className="px-3 py-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        Total
                      </th>
                      <th className="px-3 py-2 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, index) => (
                      <tr
                        key={item?.id ?? index}
                        className="border-t border-gray-100"
                      >
                        <td className="px-3 py-2.5 text-center text-[11px] text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="text-[13px] font-semibold text-gray-800">
                            {item?.item_name}
                          </div>
                          <div className="mt-0.5 text-[11.5px] leading-relaxed text-gray-400">
                            {item?.description}
                          </div>
                          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#5a6a7e]">
                            {(item?.pricing_mode || "area") === "unit"
                              ? "Qty-based"
                              : "Area-based"}
                            {item?.gst_enabled
                              ? ` · GST ${Number(item.gst_percentage) || 0}%`
                              : ""}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-[13px] text-gray-600">
                          {itemAreaOrQty(item)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[13px] tabular-nums text-gray-600">
                          {formatINR(Number(item?.unit_price || 0))}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[13px] tabular-nums text-gray-600">
                          {itemGstDisplay(item)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-[13px] font-bold tabular-nums text-[#2f80ed]">
                          {formatINR(calcItemTotalWithGst(item))}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-0.5">
                            <IconButton
                              size="small"
                              onClick={() => {
                                editItem?.(index, groupIndex);
                              }}
                            >
                              <MdEdit className="text-[14px] text-gray-500" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteItem?.(item?.id as number)}
                            >
                              <MdDelete className="text-[16px] text-red-400" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mb-2.5 rounded-[8px] border border-dashed border-[#c7daf3] bg-white px-3 py-4 text-center text-[12px] text-[#5a6a7e]">
                No items in this section yet.
              </div>
            )}

            <button
              type="button"
              onClick={() => openModal?.(groupIndex)}
              className="flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-[#dde8f5] bg-white px-3 py-2 text-[12px] font-semibold text-[#1f2933] transition-all hover:border-[#2f80ed] hover:text-[#2f80ed]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              + Add item to {group.title}
            </button>
          </div>
        ))}
      </div>
    );
  }

  /** Details / PDF mode */
  return (
    <div
      className="mt-2 overflow-x-auto rounded-[12px] border border-gray-200
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
    >
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr style={{ background: "#0f2a44" }}>
            <th
              className="px-4 py-2.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              #
            </th>
            <th
              className="px-4 py-2.5 text-left text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Item Description
            </th>
            <th
              className="px-4 py-2.5 text-center text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Area/Qty
            </th>
            <th
              className="px-4 py-2.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Amount
            </th>
            <th
              className="px-4 py-2.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              GST
            </th>
            <th
              className="px-4 py-2.5 text-right text-[9.5px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {costEstimation?.itemGroups?.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr>
                <td
                  colSpan={6}
                  className="border-y border-gray-200 bg-gray-50 px-4 py-2 text-[12px] font-bold text-gray-700"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {group.title}
                </td>
              </tr>
              {group.items?.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 transition-colors hover:bg-gray-50/60"
                >
                  <td
                    className="px-4 py-3 text-center text-[11px] font-medium text-gray-400"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div
                      className="text-[13px] font-semibold text-gray-800"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item?.item_name}
                    </div>
                    <div
                      className="mt-0.5 text-[11.5px] leading-relaxed text-gray-400"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item?.description}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-center text-[13px] font-medium text-gray-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {itemAreaOrQty(item)}
                  </td>
                  <td
                    className="px-4 py-3 text-right text-[13px] font-medium tabular-nums text-gray-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatINR(Number(item?.unit_price || 0))}
                  </td>
                  <td
                    className="px-4 py-3 text-right text-[13px] font-medium tabular-nums text-gray-600"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {itemGstDisplay(item)}
                  </td>
                  <td
                    className="px-4 py-3 text-right text-[13px] font-bold tabular-nums text-[#2f80ed]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {formatINR(calcItemTotalWithGst(item))}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
