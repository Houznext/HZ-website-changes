import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import apiClient from "@/src/utils/apiClient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaBloggerB } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/src/common/Button";
import PaginationControls from "@/src/components/CrmView/pagination";
import { FaEdit, FaTrash, FaEye, FaPlus, FaExternalLinkAlt } from "react-icons/fa";
import { FiCalendar, FiClock, FiX, FiLink } from "react-icons/fi";
import Loader from "@/src/common/Loader";
import FileInput from "@/src/common/FileInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";

export interface TableColumn {
  label: string;
  key: string;
  status: boolean;
}

const BlogsView = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [viewBlog, setViewBlog] = useState<any>(null);
  const [currentpage, setCurrentPage] = useState(1);
  const { hasPermission } = usePermissionStore((state) => state);

  const [blog, setBlog] = useState<any>({
    title: "",
    previewDescription: "",
    thumbnailImageUrl: "",
    CoverImageUrl: "",
    externalResourceLink: "",
    content: "",
    blogStatus: "Regular",
    blogType: "General",
  });
  const [updateBlogId, setUpdateBlogId] = useState<
    number | string | null | undefined
  >(undefined);
  const [allData, setAllData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);


  const handleFormChange = (name: string, value: any) => {
    setBlog((currProp: any) => ({ ...currProp, [name]: value }));
  };

  const isBlogDataChanged = (original: any, current: any) =>
    JSON.stringify(original) !== JSON.stringify(current);

  const resetFormValues = () => {
    setBlog({
      title: "",
      previewDescription: "",
      thumbnailImageUrl: "",
      CoverImageUrl: "",
      externalResourceLink: "",
      content: "",
      blogStatus: "Regular",
      blogType: "General",
    });
    setUpdateBlogId(undefined);
    setOriginalData(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    if (updateBlogId && !isBlogDataChanged(originalData, blog)) {
      setOpenModal(false);
      setLoading(false);
      return;
    }
    try {
      let res: any;
      if (!updateBlogId) {
        res = await apiClient.post(apiClient.URLS.blogs, { ...blog }, true);
      } else {
        res = await apiClient.patch(
          `${apiClient.URLS.blogs}/${updateBlogId}`,
          { id: updateBlogId, ...blog },
          true
        );
      }
      if (res) {
        await fetchBlogs();
        toast.success(
          updateBlogId
            ? "Blog updated successfully!"
            : "Blog added successfully!"
        );
        // Reset form values first, then close modal
        resetFormValues();
        setOpenModal(false);
      }
    } catch (err) {
      console.error("Error during form submission: ", err);
      toast.error("Failed to save blog!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e?: any) => {
    e?.preventDefault();
    resetFormValues();
    setOpenModal(false);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(apiClient.URLS.blogs, {}, true);
      console.log("Fetched blogs: ", res);
      setAllData(Array.isArray(res?.body?.blogs) ? res.body.blogs : []);
    } catch (error) {
      console.error("Failed to fetch blogs: ", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await apiClient.delete(`${apiClient.URLS.blogs}/${id}`, {}, true);
      if (res.status === 200) {
        setAllData((prevData: any) => prevData.filter((b: any) => b.id !== id));
        toast.success("Deleted successfully");
      } else {
        toast.error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Failed to delete blog", error);
      toast.error("Failed to delete blog");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blogData: any) => {
    setBlog(blogData);
    setUpdateBlogId(blogData.id);
    setOriginalData(blogData);
    setOpenModal(true);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ---------- NEW: Filters wiring ----------
  type FiltersState = { [key: string]: Record<string, boolean> };
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});

  // Grouped filter config to pass to ReusableSearchFilter
  const filtersConfig = [
    {
      groupLabel: "Status",
      key: "blogStatus",
      options: [
        { id: "Trending", label: "Trending" },
        { id: "Featured", label: "Featured" },
        { id: "Regular", label: "Regular" },
      ],
    },
    {
      groupLabel: "Type",
      key: "blogType",
      options: [
        { id: "Furniture", label: "Furniture" },
        { id: "Interiors", label: "Interiors" },
        { id: "Residential construction", label: "Residential construction" },
        { id: "Construction for business", label: "Construction for business" },
        { id: "General", label: "General" },
        { id: "Custom builder", label: "Custom builder" },
        { id: "Paints", label: "Paints" },
        { id: "Electronics", label: "Electronics" },
        { id: "VaastuConsultation", label: "Vaastu Consultation" },
        { id: "CivilEngineering", label: "Civil Engineering" },
        { id: "RealEstate", label: "Real Estate" },
      ],
    },
  ] as const;

  // Search + Filters state
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilters]);

  const pickActive = (groupKey: string) =>
    Object.entries(selectedFilters[groupKey] || {})
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);

  const filteredData = useMemo(() => {
    const text = searchQuery.trim().toLowerCase();

    const activeStatus = pickActive("blogStatus");
    const activeTypes = pickActive("blogType");

    return allData.filter((b: any) => {
      const matchesText =
        !text ||
        b.title?.toLowerCase().includes(text) ||
        b.previewDescription?.toLowerCase().includes(text);

      const matchesStatus =
        activeStatus.length === 0 ||
        activeStatus.includes(String(b.blogStatus));
      const matchesType =
        activeTypes.length === 0 || activeTypes.includes(String(b.blogType));

      return matchesText && matchesStatus && matchesType;
    });
  }, [allData, searchQuery, selectedFilters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );

  const displayedData = filteredData.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize
  );
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  const statusCls = (s: string) =>
    s === "Trending"
      ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200"
      : s === "Featured"
        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200"
        : "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border border-slate-200";

  const typeColors: Record<string, string> = {
    Furniture: "bg-purple-50 text-purple-700 border border-purple-200",
    Interiors: "bg-pink-50 text-pink-700 border border-pink-200",
    "Residential construction": "bg-blue-50 text-blue-700 border border-blue-200",
    "Construction for business": "bg-indigo-50 text-indigo-700 border border-indigo-200",
    General: "bg-slate-50 text-slate-600 border border-slate-200",
    "Custom builder": "bg-teal-50 text-teal-700 border border-teal-200",
    Paints: "bg-rose-50 text-rose-700 border border-rose-200",
    Electronics: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    VaastuConsultation: "bg-amber-50 text-amber-700 border border-amber-200",
    CivilEngineering: "bg-orange-50 text-orange-700 border border-orange-200",
    RealEstate: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const getTypeCls = (type: string) => typeColors[type] || typeColors.General;

  const handleAddNew = () => {
    resetFormValues();
    setOpenModal(true);
  };

  const handleView = (blogData: any) => {
    setViewBlog(blogData);
    setViewModal(true);
  };

  return (
    <div className="min-w-full flex flex-col md:px-6 px-3 gap-y-5 bg-[#f5f6f8] min-h-screen py-4">
      {/* Header Section */}
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
              <FaBloggerB className="w-5 h-5 text-[#0C447C]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] font-medium text-[#1A1A1A]">Blogs</h1>
              <p className="text-[12px] text-[#6B7280]">
                {filteredData.length} posts found
              </p>
            </div>
          </div>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("blog", "create")}
          >
            <Button
              className="flex items-center gap-2 px-4 py-[7px] rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors"
              onClick={handleAddNew}
              disabled={!hasPermission("blog", "create")}
            >
              <FaPlus className="w-4 h-4" />
              Add New Blog
            </Button>
          </CustomTooltip>
        </div>
      </div>

      <div className="w-full bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] px-4 py-3 mb-1">
        <ReusableSearchFilter
          searchText={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by title or description..."
          filters={filtersConfig as any}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          rootCls="justify-between"
          className=""
        />
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
            <FaBloggerB className="w-5 h-5 text-[#0C447C]" />
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">{allData?.length}</p>
            <p className="text-[11px] text-[#6B7280]">Total Blogs</p>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-amber-50 flex items-center justify-center">
            <span className="text-amber-600 text-lg">🔥</span>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">{allData.filter((b: any) => b.blogStatus === 'Trending').length}</p>
            <p className="text-[11px] text-[#6B7280]">Trending</p>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-emerald-50 flex items-center justify-center">
            <span className="text-emerald-600 text-lg">⭐</span>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">{allData.filter((b: any) => b.blogStatus === 'Featured').length}</p>
            <p className="text-[11px] text-[#6B7280]">Featured</p>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
            <span className="text-[#6B7280] text-lg">📄</span>
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#111827]">{allData.filter((b: any) => b.blogStatus === 'Regular').length}</p>
            <p className="text-[11px] text-[#6B7280]">Regular</p>
          </div>
        </div>
      </div>
    

      {/* Blog Cards Grid */}
      {displayedData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)]">
          <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
            <FaBloggerB className="w-10 h-10 text-[#9CA3AF]" />
          </div>
          <h3 className="text-[17px] font-medium text-[#1A1A1A] mb-1">No blogs found</h3>
          <p className="text-[12px] text-[#6B7280]">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayedData.map((b: any, index: number) => (
            <div
              key={index}
              className="group bg-white border border-[rgba(0,0,0,0.08)] hover:border-[#1D4E7A] rounded-[12px] transition-colors overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative w-full h-[160px] md:h-[180px] overflow-hidden">
                <Image
                  src={b.thumbnailImageUrl}
                  alt={b.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusCls(b?.blogStatus)}`}>
                    {b?.blogStatus === "Trending" && "🔥 "}
                    {b?.blogStatus === "Featured" && "⭐ "}
                    {b?.blogStatus || "Regular"}
                  </span>
                </div>

                {/* Quick View Button */}
                <Button
                  onClick={() => handleView(b)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#6B7280] hover:bg-white hover:text-[#0C447C] opacity-0 group-hover:opacity-100 transition-all duration-200 border border-[rgba(0,0,0,0.08)]"
                >
                  <FaEye className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h2 className="text-[15px] font-medium text-[#111827] line-clamp-2 leading-snug group-hover:text-[#0C447C] transition-colors duration-200">
                    {b?.title}
                  </h2>
                  <p className="text-[#6B7280] text-[13px] line-clamp-2 mt-1.5 leading-relaxed">
                    {b?.previewDescription}
                  </p>
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${getTypeCls(b?.blogType)}`}>
                    {b?.blogType || "General"}
                  </span>
                  {b?.externalResourceLink && (
                    <a
                      href={b.externalResourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E6F1FB] hover:text-[#0C447C] transition-colors flex items-center gap-1"
                    >
                      <FiLink className="w-3 h-3" />
                      Link
                    </a>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-[rgba(0,0,0,0.06)]" />

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    onClick={() => handleView(b)}
                    className="flex-1 px-3 py-2 rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FaEye className="w-3 h-3" />
                    View
                  </Button>
                  <CustomTooltip
                    label="Access Restricted"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("blog", "edit")}
                  >
                    <Button
                      onClick={() => handleEdit(b)}
                      disabled={!hasPermission("blog", "edit")}
                      className="flex-1 px-3 py-2 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip
                    label="Access Restricted"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("blog", "delete")}
                  >
                    <Button
                      onClick={() => handleDelete(b.id)}
                      disabled={!hasPermission("blog", "delete")}
                      className="px-3 py-2 rounded-[8px] bg-red-50 text-red-600 hover:bg-red-100 text-[12px] font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash className="w-3 h-3" />
                    </Button>
                  </CustomTooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredData?.length > pageSize && (
        <div className="flex items-center justify-center mx-auto mb-6 bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-4">
          <PaginationControls
            currentPage={currentpage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* View Blog Modal */}
      {viewModal && viewBlog && (
        <Drawer
          open={viewModal}
          handleDrawerToggle={() => {
            setViewModal(false);
            setViewBlog(null);
          }}
          closeIconCls="text-slate-500 hover:text-slate-800"
          openVariant="right"
          panelCls="w-[95%] md:w-[70%] lg:w-[50%] shadow-2xl"
          overLayCls="bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-[rgba(0,0,0,0.08)] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
                    <FaBloggerB className="w-4 h-4 text-[#0C447C]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-medium text-[#1A1A1A]">Blog Preview</h2>
                    <p className="text-[12px] text-[#6B7280]">View blog details</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setViewModal(false);
                    setViewBlog(null);
                  }}
                  className="p-2 rounded-[8px] hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Cover Image */}
              <div className="relative w-full h-[250px] md:h-[300px] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={viewBlog.CoverImageUrl || viewBlog.thumbnailImageUrl}
                  alt={viewBlog.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCls(viewBlog?.blogStatus)}`}>
                      {viewBlog?.blogStatus === "Trending" && "🔥 "}
                      {viewBlog?.blogStatus === "Featured" && "⭐ "}
                      {viewBlog?.blogStatus || "Regular"}
                    </span>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${getTypeCls(viewBlog?.blogType)}`}>
                      {viewBlog?.blogType || "General"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight">
                {viewBlog.title}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                {viewBlog.createdAt && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(viewBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewBlog.externalResourceLink && (
                  <a
                    href={viewBlog.externalResourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                  >
                    <FaExternalLinkAlt className="w-3 h-3" />
                    External Resource
                  </a>
                )}
              </div>

              {/* Description Preview */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview Description</h3>
                <p className="text-slate-700 text-[15px] leading-relaxed">
                  {viewBlog.previewDescription}
                </p>
              </div>

              {/* Content */}
              {viewBlog.content && (
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Content</h3>
                  <div
                    className="text-slate-700 text-[15px] leading-relaxed bg-white rounded-xl p-4 border border-slate-100"
                    dangerouslySetInnerHTML={{ __html: viewBlog.content }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[rgba(0,0,0,0.08)] px-6 py-4 flex items-center justify-end gap-3">
              <Button
                onClick={() => {
                  setViewModal(false);
                  setViewBlog(null);
                }}
                className="px-4 py-2 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[13px] font-medium transition-colors"
              >
                Close
              </Button>
              {hasPermission("blog", "edit") && (
                <Button
                  onClick={() => {
                    setViewModal(false);
                    handleEdit(viewBlog);
                  }}
                  className="px-4 py-2 rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors flex items-center gap-2"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                  Edit Blog
                </Button>
              )}
            </div>
          </div>
        </Drawer>
      )}

      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-slate-500 hover:text-slate-800"
          openVariant="right"
          panelCls="w-[95%] md:w-[85%] lg:w-[calc(85%-190px)] shadow-2xl"
          overLayCls="bg-slate-900/60 backdrop-blur-sm"
        >
          {loading && <Loader />}

          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-[rgba(0,0,0,0.08)] px-6 md:px-10 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
                    <FaBloggerB className="w-5 h-5 text-[#0C447C]" />
                  </div>
                  <div>
                    <h1 className="text-[17px] md:text-[18px] font-medium text-[#1A1A1A]">
                      {updateBlogId ? "Edit Blog" : "Create New Blog"}
                    </h1>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">
                      {updateBlogId ? "Update blog information" : "Fill in the details to create a new blog post"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  className="p-2 rounded-[8px] hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <form
              className="flex-1 overflow-y-auto"
              onSubmit={handleSubmit}
            >
              <div className="px-6 md:px-10 py-6">
                {/* Required Fields Notice */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-700 font-medium">Fields marked with <span className="text-red-500">*</span> are required</p>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information Section */}
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">1</span>
                      Basic Information
                    </h3>
                  </div>

                  <CustomInput
                    name="title"
                    id="title"
                    required
                    placeholder="Enter an engaging blog title..."
                    value={blog.title}
                    label="Title"
                    type="text"
                    onChange={(e) =>
                      handleFormChange(e.target.name ?? "", e.target.value ?? "")
                    }
                  />

                  <CustomInput
                    name="externalResourceLink"
                    label="External Resource Link"
                    id="externalResourceLink"
                    placeholder="https://example.com/resource"
                    value={blog.externalResourceLink}
                    type="url"
                    leftIcon={<FiLink className="w-4 h-4" />}
                    onChange={(e) =>
                      handleFormChange(e.target.name ?? "", e.target.value ?? "")
                    }
                  />

                  <CustomInput
                    name="previewDescription"
                    id="previewDescription"
                    label="Preview Description"
                    placeholder="Write a brief, engaging description that will appear in previews..."
                    required
                    rootCls="col-span-1 md:col-span-2"
                    value={blog.previewDescription}
                    note="Keep it under 25 words for best display"
                    type="textarea"
                    maxLength={200}
                    onChange={(e) =>
                      handleFormChange(e.target.name ?? "", e.target.value ?? "")
                    }
                  />

                  {/* Media Section */}
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">2</span>
                      Media & Images
                    </h3>
                  </div>

                  <FileInput
                    name="thumbnailImageUrl"
                    label="Thumbnail Image"
                    sublabel="This will be shown in blog cards and previews"
                    type="file"
                    required
                    initialFileUrl={blog.thumbnailImageUrl}
                    folderName="blogs"
                    onFileChange={(url) =>
                      handleFormChange("thumbnailImageUrl", url)
                    }
                  />

                  <FileInput
                    name="CoverImageUrl"
                    label="Cover Image"
                    sublabel="Main hero image for the blog post"
                    type="file"
                    folderName="blogs"
                    required
                    initialFileUrl={blog.CoverImageUrl}
                    onFileChange={(url) => handleFormChange("CoverImageUrl", url)}
                  />

                  {/* Classification Section */}
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">3</span>
                      Classification
                    </h3>
                  </div>

                  <SingleSelect
                    name="blogStatus"
                    label="Blog Status"
                    selectedOption={blog.blogStatus}
                    type="single-select"
                    handleChange={handleFormChange}
                    optionsInterface={{ isObj: false }}
                    options={["Trending", "Featured", "Regular"]}
                    placeholder="Select status..."
                  />

                  <SingleSelect
                    name="blogType"
                    label="Blog Category"
                    selectedOption={blog.blogType}
                    type="single-select"
                    handleChange={handleFormChange}
                    optionsInterface={{ isObj: false }}
                    options={[
                      "Furniture",
                      "Interiors",
                      "Residential construction",
                      "Construction for business",
                      "General",
                      "Custom builder",
                      "Paints",
                      "Electronics",
                      "VaastuConsultation",
                      "CivilEngineering",
                      "RealEstate",
                    ]}
                    placeholder="Select category..."
                  />

                  {/* Content Section */}
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">4</span>
                      Content
                    </h3>
                  </div>

                  <RichTextEditor
                    name="content"
                    label="Blog Content"
                    type="richtext"
                    rootCls="col-span-1 md:col-span-2"
                    className="min-h-[280px]"
                    placeholder="Write your blog content here..."
                    required
                    value={blog.content}
                    onChange={(value) => handleFormChange("content", value || "")}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-[rgba(0,0,0,0.08)] px-6 md:px-10 py-5 flex items-center justify-between">
                <p className="text-[12px] text-[#6B7280] hidden md:block">
                  {updateBlogId ? "Changes will be saved immediately" : "Blog will be published after submission"}
                </p>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button
                    key={"cancelButton"}
                    className="flex-1 md:flex-none px-4 py-2 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[13px] font-medium transition-colors"
                    onClick={handleReset}
                  >
                    Cancel
                  </Button>
                  <Button
                    key={"submitbutton"}
                    className="flex-1 md:flex-none px-4 py-2 rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={handleSubmit}
                  >
                    {updateBlogId ? (
                      <>
                        <FaEdit className="w-3.5 h-3.5" />
                        Update Blog
                      </>
                    ) : (
                      <>
                        <FaPlus className="w-3.5 h-3.5" />
                        Create Blog
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default BlogsView;
