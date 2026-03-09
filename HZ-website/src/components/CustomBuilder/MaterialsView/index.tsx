import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Tag,
  Layers,
  Hash,
} from "lucide-react";
import Button from "@/common/Button";
import Loader from "@/components/Loader";
import RouterBack from "../RouterBack";
import Image from "next/image";
import Modal from "@/common/Modal";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";

export default function MaterialsView() {
  const router = useRouter();
  const customBuilderId = router?.query?.id as string;

  const {
    data: customBuilder,
    fetchData,
    isLoading,
    materials,
    materialsLoading,
    fetchMaterials,
  } = useCustomBuilderStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (customBuilderId) {
      fetchData(customBuilderId);
      fetchMaterials(customBuilderId);
    }
  }, [customBuilderId]); // eslint-disable-line

  const categories = useMemo(() => {
    const cats = new Set<string>();
    materials.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    let filtered = [...materials];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.category || "").toLowerCase().includes(q) ||
          (m.notes || "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    return filtered;
  }, [materials, search, categoryFilter]);

  const totalCount = materials.length;
  const checkedCount = materials.filter((m) => m.checkedAt).length;

  if (isLoading && !customBuilder) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full md:p-5 p-3">
      <div className="px-2 py-4">
        <RouterBack />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Package className="text-[#3586FF] md:w-6 w-4 md:h-6 h-4" />
        <h1 className="font-bold md:text-[24px] text-[16px]">Materials</h1>
      </div>

      {/* Summary Strip */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-4 py-2.5 shadow-sm">
          <Package className="w-4 h-4 text-[#3586FF]" />
          <span className="text-gray-500 text-[12px] font-medium">Total</span>
          <span className="font-bold text-gray-900 text-[14px]">{totalCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-4 py-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-gray-500 text-[12px] font-medium">Checked</span>
          <span className="font-bold text-gray-900 text-[14px]">{checkedCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-4 py-2.5 shadow-sm">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-500 text-[12px] font-medium">Unchecked</span>
          <span className="font-bold text-gray-900 text-[14px]">
            {totalCount - checkedCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[12px] md:text-[14px] outline-none focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF]/20 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium border transition ${
                !categoryFilter
                  ? "bg-[#3586FF] text-white border-[#3586FF]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium border capitalize transition ${
                  categoryFilter === cat
                    ? "bg-[#3586FF] text-white border-[#3586FF]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {materialsLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12 text-center">
          <Package className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-semibold md:text-lg">
            No materials found
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {search || categoryFilter
              ? "Try adjusting your filters"
              : "Material records will appear here once added"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Images strip */}
              {material.images?.length > 0 && (
                <div
                  className="relative h-[120px] md:h-[160px] bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setPreviewImages(material.images);
                    setPreviewOpen(true);
                  }}
                >
                  <Image
                    src={material.images[0]}
                    alt={material.name}
                    fill
                    className="object-cover"
                  />
                  {material.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">
                      +{material.images.length - 1} more
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 md:text-[15px] text-[13px]">
                    {material.name}
                  </h3>
                  {material.checkedAt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Checked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-semibold">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] md:text-[12px] text-gray-500">
                  {material.category && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span className="capitalize">{material.category}</span>
                    </div>
                  )}
                  {material.quantity != null && (
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {material.quantity} {material.unit || ""}
                      </span>
                    </div>
                  )}
                  {material.images?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{material.images.length} image{material.images.length !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>

                {material.notes && (
                  <p className="mt-2 text-gray-400 text-[10px] md:text-[12px] italic line-clamp-2">
                    {material.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewOpen && (
        <Modal
          isOpen={previewOpen}
          closeModal={() => setPreviewOpen(false)}
          title="Material Images"
          rootCls="z-[99999]"
          titleCls="font-medium md:text-[18px] text-[14px] text-center text-[#3586FF]"
          isCloseRequired={true}
          className="md:max-w-[800px] max-w-[340px] w-full"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            {previewImages.map((url, idx) => (
              <div key={idx} className="relative w-[180px] h-[160px]">
                <Image
                  src={url}
                  alt={`Material ${idx + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
