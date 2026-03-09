import Button from "@/common/Button";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";
import { useCompareStore } from "@/store/useCompareStore";
import { X } from "lucide-react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { AddCompareProductModal } from "../AddCompareProductModal";
import EmptyCart from "@/components/CheckoutFlow/EmptyCard";

const MAX_COMPARE = 4;

const CompareView = () => {
  const { items, remove } = useCompareStore();
  const [showDiff, setShowDiff] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-700">
        <p className="text-[16px] font-bold">
          <EmptyCart title={"Your compare list is empty"} />
        </p>
      </div>
    );
  }

  const columns = useMemo(() => {
    const filled = [...items];
    while (filled.length < MAX_COMPARE) filled.push(null as any);
    return filled;
  }, [items]);
  const firstItemName = items[0]?.name ?? "Products";

  const specRows = useMemo(
    () => [
      { label: "Brand", get: (i: any) => i?.brand },
      { label: "Category", get: (i: any) => i?.subCategory },
      { label: "Material", get: (i: any) => i?.otherProperties?.material },
      { label: "Style", get: (i: any) => i?.otherProperties?.style },
      { label: "Warranty", get: (i: any) => i?.warranty },
      { label: "Delivery Time", get: (i: any) => i?.deliveryTime },
      { label: "Assembly", get: (i: any) => i?.assembly },
      { label: "Return Policy", get: (i: any) => i?.returnPolicy },
      { label: "Description", get: (i: any) => i?.description },
    ],
    []
  );

  return (
    <div className="bg-gray-100 max-w-[85%] w-full mx-auto min-h-screen">
      <div className="w-full mt-3 flex items-center py-3 justify-between px-3">
        <p className="text-[12px] font-Gordita-Bold text-[#5297ff]">
          {items.length} items
        </p>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_COMPARE }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${idx < items.length ? "bg-blue-600" : "bg-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-[12px] font-medium text-gray-600">
            {items.length}/{MAX_COMPARE} selected
          </span>
        </div>
      </div>
      <div className="max-w-full mx-auto px-4 py-6 overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px] bg-white rounded-xl">
          <thead className=" z-20 bg-white border-b">
            <tr>
              <th className="bg-gray-50 p-4 text-left md:text-[14px] text-[12px] text-gray-700 ">
                <div>
                  <h1 className="text-[12px] md:text-[14px] font-medium text-black ">
                    Compare {firstItemName}{" "}
                    <span className="text-gray-500">vs others</span>
                  </h1>
                  <p className="text-[12px] font-bold text-gray-500">
                    {items?.length} items
                  </p>
                  <CheckboxInput
                    type="checkbox"
                    checked={showDiff}
                    label="Show differences only"
                    name=""
                    labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                    onChange={() => setShowDiff((s) => !s)}
                    className="accent-blue-600"
                  />
                </div>
              </th>

              {columns.map((p, idx) => (
                <th key={idx} className="p-2 align-top w-1/5 ">
                  {p ? (
                    <div className="relative h-full flex flex-col items-center gap-2 border border-gray-200 p-2 rounded-md">
                      <Button
                        onClick={() => remove(p.id)}
                        className="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1 shadow hover:bg-red-400"
                        aria-label="Remove"
                      >
                        <X size={14} />
                      </Button>

                      <div className="relative w-24 h-24 rounded-md">
                        <Image
                          src={
                            p.images?.[0]?.url ||
                            "/images/custombuilder/subservices/furnitures/sofas/image-1.png"
                          }
                          alt={p.images?.[0]?.alt || p.name}
                          fill
                          unoptimized
                          className="object-cover rounded-md"
                        />
                      </div>

                      <p className="text-xs font-medium line-clamp-2 text-center">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-Gordita-Medium text-slate-900">
                          ₹{p.baseSellingPrice}
                        </p>

                        <div className="flex items-center justify-center gap-2 text-xs">
                          {p.baseMrp && (
                            <span className="line-through text-gray-400">
                              ₹{p.baseMrp}
                            </span>
                          )}
                          {p.baseDiscountPercent > 0 && (
                            <span className="text-green-600">
                              {p.baseDiscountPercent}% off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setAddOpen(true)}
                      className="h-full border-2 border-dashed font-Gordita-Medium rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm p-8 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      + Add product
                    </Button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="mt-7">
            {specRows.map((r) => (
              <CompareRow
                key={r.label}
                label={r.label}
                values={columns.map((it) => r.get(it))}
                showDiff={showDiff}
              />
            ))}
          </tbody>
        </table>
      </div>
      {addOpen && (
        <AddCompareProductModal
          isOpen={addOpen}
          closeModal={() => setAddOpen(false)}
        />
      )}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-[14px] font-medium text-blue-800">
              <span className="font-bold">Tip:</span> Use the "Show
              differences only" toggle to focus on specifications that vary
              between products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareView;

const CompareRow = ({
  label,
  values,
  showDiff,
}: {
  label: string;
  values: any[];
  showDiff: boolean;
}) => {
  const normalized = values.map((v) => (v === undefined ? null : v));
  const hasAtLeastTwoRealItems =
    normalized.filter((v) => v !== null).length >= 2;
  const same =
    hasAtLeastTwoRealItems &&
    normalized.every((v) => v === normalized.find((x) => x !== null));

  if (same && showDiff) return null;

  return (
    <tr className="border-t">
      <td className="bg-gray-50 p-4 text-[14px] font-bold text-[#5297ff] ">
        {label}
      </td>
      {normalized.map((v, i) => (
        <td
          key={i}
          className="p-4 text-[12px] font-medium text-wrap text-gray-700 text-center align-top"
        >
          {v === null || v === "" ? (
            "-"
          ) : v === true ? (
            <span>✔</span>
          ) : (
            <span>{String(v)}</span>
          )}
        </td>
      ))}
    </tr>
  );
};
