import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import { useCompareStore } from "@/store/useCompareStore";
import Modal from "@/common/Modal";
import { useRouter } from "next/router";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";

type Option = { label: string; value: string };

const buildOptions = (arr: (string | undefined | null)[]) => {
  const uniq = Array.from(new Set(arr.filter(Boolean) as string[]));
  return uniq.map((x) => ({ label: x, value: x }));
};

export function AddCompareProductModal({
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  const { items, toggleItem } = useCompareStore();

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const canAdd = items.length < 4;
  const categoryFromRoute = (router.query.category as string) || "";
  const compareCategory = items?.[0]?.category;
  const pathParts = router.asPath.split("/");

  const enforcedCategory = compareCategory || categoryFromRoute;
  const actualRoute = pathParts[2];

  useEffect(() => {
    if (!isOpen) return;
    setQ("");
    setBrand("");
    setSubCategory("");
    setList([]);
  }, [isOpen]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (enforcedCategory) params.set("category", enforcedCategory);

    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (subCategory) params.set("subCategory", subCategory);

    params.set("page", "1");
    params.set("limit", "20");
    return params.toString();
  }, [q, brand, subCategory, compareCategory]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCompareItems = async () => {
      setLoading(true);
      try {
        let res;

        if (actualRoute === "furnitures") {
          res = await apiClient.get(
            `${apiClient.URLS.furniture}?${queryString}`
          );
          const body: any = res?.body ?? res;
          const data: any = body?.data ?? body;
          setList(Array.isArray(data) ? data : []);
        } else if (actualRoute === "homedecor") {
          res = await apiClient.get(
            `${apiClient.URLS.homeDecor}?${queryString}`
          );
          setList(res?.body?.data || []);
        } else if (actualRoute === "electronics") {
          res = await apiClient.get(
            `${apiClient.URLS.electronics}?${queryString}`
          );
          setList(res?.body?.data || []);
        }
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompareItems();
  }, [isOpen, queryString]);

  const brandOptions: Option[] = useMemo(
    () => buildOptions(list.map((x) => x.brand)),
    [list]
  );

  const subCategoryOptions: Option[] = useMemo(
    () => buildOptions(list.map((x) => x.subCategory)),
    [list]
  );

  const handleSelect = (p: any) => {
    if (!canAdd) return toast.error("You can compare up to 4 items only");
    if (items.some((x) => x.id === p.id)) return toast("Already added");
    toggleItem(p);
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      className="max-w-[900px] md:min-h-[350px] min-h-[320px]"
      rootCls="z-[99999]"
      title="Add Product to Compare"
      titleCls="heading-text text-[#5297ff] text-center"
      isCloseRequired={false}
    >
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-3 gap-1">
          <CustomInput
            name=""
            type="text"
            className=" px-2 md:py-1 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
            placeholder="Search product..."
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-0 text-[14px] outline-none bg-white"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brandOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-0 text-[14px] outline-none bg-white"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {subCategoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-[12px] font-Gordita-Medium text-gray-600">
              Loading...
            </p>
          ) : list.length === 0 ? (
            <p className="text-[14px] text-gray-600 font-Gordita-Bold text-center">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 md:gap-3 gap-1">
              {list.map((p) => {
                const disabled = !canAdd || items.some((x) => x.id === p.id);

                return (
                  <Button
                    key={p.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(p)}
                    className={`border rounded-xl p-3 text-left hover:shadow transition ${
                      disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="w-full h-28 bg-gray-50 rounded-lg mb-2 overflow-hidden">
                      <img
                        src={
                          p.images?.[0]?.url ||
                          "/images/custombuilder/subservices/furnitures/sofas/image-1.png"
                        }
                        alt={p.images?.[0]?.alt || p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-[12px] font-Gordita-Medium line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-gray-600">
                      {p.brand || "-"}
                    </p>
                    <p className="text-[12px] font-Gordita-Bold mt-1">
                      ₹{p.baseSellingPrice}
                    </p>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {!canAdd && (
          <div className="mt-4 p-3 bg-yellow-50 border text-sm font-Gordita-Bold text-yellow-800 rounded-lg">
            Compare is full (4/4). Remove one product to add another.
          </div>
        )}
      </div>
    </Modal>
  );
}
