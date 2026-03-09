import React, { useCallback, useEffect, useMemo, useState } from "react";
import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import FileInput from "@/src/common/FileInput";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import PaginationControls from "@/src/components/CrmView/pagination";
import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";
import CustomTooltip from "@/src/common/ToolTip";
import { usePermissionStore } from "@/src/stores/usePermissions";
import apiClient from "@/src/utils/apiClient";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  FaQuoteLeft,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import ImageUploader from "@/src/common/DragImageInput";

type Testimonial = {
  id?: number | string;
  name: string;
  content: string;
  userimage?: string;
  rating: number;
  category: string;
  location: string;
  testimonialImages?: string[];
  testimonialVideos?: string[];
};

const CATEGORY_OPTIONS = [
  { id: 1, category: "furniture" },
  { id: 2, category: "custom_builder" },
  { id: 3, category: "interiors" },
];

const ratingOptions = ["1", "2", "3", "4", "5"];

const badgeCls = "text-[10px] md:px-2 px-1 py-0.5 rounded-full ring-1";
const catCls = "bg-blue-50 text-blue-700 ring-blue-200";
const ratingCls = "bg-amber-50 text-amber-700 ring-amber-200";

const TestimonialsView = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentpage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const session = useSession();
  const [user, setUser] = useState<any>(null);

  const [testimonial, setTestimonial] = useState<Testimonial>({
    name: "",
    content: "",
    userimage: "",
    rating: 0,
    category: "",
    location: "",
    testimonialImages: [],
    testimonialVideos: [],
  });

  const [updateId, setUpdateId] = useState<number | string | null | undefined>(
    undefined
  );
  const [allData, setAllData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<Testimonial | null>(null);

  const { hasPermission } = usePermissionStore((s) => s);
  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);



  const handleFormChange = (name: string, value: any) => {
    setTestimonial((curr: Testimonial) => ({ ...curr, [name]: value }));
  };
  const handleUpload = async (url: any) => {
    setTestimonial((currProp: any) => ({ ...currProp, userimage: url }));
  };
  const handleSelectChange = (selectedOption: {
    id: number;
    category: string;
  }) => {
    setTestimonial({ ...testimonial, category: selectedOption.category });
  };
  const handleimageUpload = (
    key: "testimonialImages" | "testimonialVideos",
    files: string[]
  ) => {
    setTestimonial((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));
  };

  const isDataChanged = (original: any, current: any) =>
    JSON.stringify(original) !== JSON.stringify(current);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: testimonial.name,
      content: testimonial.content,
      userimage: testimonial.userimage,
      rating: testimonial.rating,
      category: testimonial.category,
      location: testimonial.location,
      testimonialImages: testimonial.testimonialImages,
      testimonialVideos: testimonial.testimonialVideos,
      user: user?.id,
    };

    if (updateId && !isDataChanged(originalData, testimonial)) {
      setOpenModal(false);
      return;
    }

    try {
      let res: any;
      if (!updateId) {
        res = await apiClient.post(
          apiClient.URLS.testimonials,
          payload,
          true
        );
      } else {
        res = await apiClient.patch(
          `${apiClient.URLS.testimonials}/${updateId}`,
          { id: updateId, ...payload },
          true
        );
      }

      if (res) {
        await fetchTestimonials();
        setOpenModal(false);
        toast.success(
          updateId
            ? "Testimonial updated successfully!"
            : "Testimonial added successfully!"
        );
        setUpdateId(undefined);
        handleReset(e);
      }
    } catch (err) {
      console.error("Error saving testimonial: ", err);
      toast.error("Failed to save testimonial!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e?: any) => {
    if (e) e.preventDefault();
    setTestimonial({
      name: "",
      content: "",
      userimage: "",
      rating: 0,
      category: "",
      location: "",
      testimonialImages: [],
      testimonialVideos: [],
    });
    setOpenModal(false);
    setUpdateId(undefined);
    setOriginalData(null);
  };
  const pretty = (s: string) =>
    s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const filtersConfig = [
    {
      groupLabel: "Category",
      key: "category",
      options: CATEGORY_OPTIONS.map(c => ({
        id: c.category.toLowerCase(),
        label: pretty(c.category)
      })),
    },
    {
      groupLabel: "Rating",
      key: "rating",
      options: ratingOptions.map(r => ({
        id: String(r),
        label: String(r),
      })),
    },
  ] as const;



  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(apiClient.URLS.testimonials, {}, true);
      setAllData(Array.isArray(res?.body) ? res.body : []);
    } catch (error) {
      console.error("Failed to fetch testimonials: ", error);
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number | string) => {
    setLoading(true);
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.testimonials}/${id}`,
        true
      );
      if (res.status === 200) {
        setAllData((prev: any) => prev.filter((t: any) => t.id !== id));
        toast.success("Deleted successfully");
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (row: Testimonial) => {
    try {
      setLoading(true);
      const id = row.id;
      if (!id) return;
      const res = await apiClient.get(
        `${apiClient.URLS.testimonials}/${id}`,
        {},
        true
      );
      const t = res?.body as Testimonial;
      setTestimonial({
        name: t?.name ?? "",
        content: t?.content ?? "",
        userimage: t?.userimage ?? "",
        rating: Number(t?.rating ?? 0),
        category: t?.category ?? "",
        location: t?.location ?? "",
        testimonialImages: t?.testimonialImages ?? [],
        testimonialVideos: t?.testimonialVideos ?? [],
      });
      setUpdateId(id);
      setOriginalData(t);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to edit testimonial: ", error);
      toast.error("Failed to open testimonial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);


  type FiltersState = { [key: string]: Record<string, boolean> };
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});
  const [searchQuery, setSearchQuery] = useState("");

  const pickActive = (groupKey: string) =>
    Object.entries(selectedFilters[groupKey] || {})
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilters]);

  const filteredData = useMemo(() => {
    const text = searchQuery.trim().toLowerCase();
    const activeCats = pickActive("category");
    const activeRatings = pickActive("rating");

    return allData.filter(t => {
      const cat = String(t.category || "").toLowerCase();
      const matchesText =
        !text ||
        t.name?.toLowerCase().includes(text) ||
        t.content?.toLowerCase().includes(text) ||
        t.location?.toLowerCase().includes(text) ||
        cat.includes(text);

      const matchesCat =
        activeCats.length === 0 || activeCats.includes(cat);

      const matchesRating =
        activeRatings.length === 0 || activeRatings.includes(String(t.rating));

      return matchesText && matchesCat && matchesRating;
    });
  }, [allData, searchQuery, selectedFilters]);



  const totalPages = Math.ceil(filteredData.length / pageSize);
  const displayedData = filteredData.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize
  );
  console.log(displayedData)

  const handlePageChange = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  const handlePageSizeChange = (n: number) => {
    setPageSize(n);
    setCurrentPage(1);
  };

  // ---------- UI ----------
  if (loading && !openModal) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-w-full flex flex-col md:px-10 px-3 gap-y-5">

      <div className="sticky top-0 z-10">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur border border-slate-200 shadow-[0_6px_24px_rgba(2,6,23,0.06)] rounded-xl px-5 py-2 mt-[50px]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 grid place-items-center ring-1 ring-purple-100">
              <FaQuoteLeft />
            </div>
            <div className="heading-text">Testimonials</div>
          </div>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("testimonials", "create")}
          >
            <Button
              className="flex md:px-5 px-3 md:py-2 py-1 label-text rounded-lg bg-[#3586FF] !font-medium items-center gap-2 text-white shadow-[0_6px_20px_rgba(53,134,255,0.30)] hover:bg-[#2E74E0] active:scale-[.99] transition"
              onClick={() => setOpenModal(true)}
              disabled={!hasPermission("testimonials", "create")}
            >
              + Add New
            </Button>
          </CustomTooltip>
        </div>
      </div>


      <div className="w-full">
        <ReusableSearchFilter
          searchText={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by name, content, location, category"
          filters={filtersConfig as any}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          rootCls="justify-between "
          className="py-1 md:py-1"
        />
      </div>


      <div className="grid md:gap-5 gap-2 grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {displayedData?.length > 0 &&
          displayedData.map((t) => (
            <div
              key={String(t.id ?? `${t.name}-${t.location}`)}
              className="
                group bg-white border border-slate-200 rounded-xl
                shadow-[0_4px_18px_rgba(2,6,23,0.06)]
                hover:shadow-[0_10px_30px_rgba(2,6,23,0.12)]
                transition overflow-hidden
              "
            >
              <div className="relative w-full h-[100px] md:h-[160px] bg-slate-50">
                {t.userimage ? (
                  <Image
                    src={t.userimage}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-slate-400">
                    <FaUser className="md:w-8 w-5 md:h-8 h-5" />
                  </div>
                )}

                <span className='absolute top-2 right-2 md:text-[12px]  bg-blue-50 text-blue-700 ring-blue-200 font-medium  text-[10px] md:px-2 px-1 py-0.5 rounded-full'>
                  {t.category || "General"}
                </span>
              </div>

              <div className="p-2 md:p-4 flex flex-col md:gap-2 gap-1">
                <div className="flex items-center justify-between md:gap-2 gap-1">
                  <h2 className="md:text-[14px] text-[12px] font-medium text-slate-900 line-clamp-1">
                    {t.name}
                  </h2>
                  <span className={`${badgeCls} ${ratingCls}`}>
                    ⭐ {t.rating || 0}
                  </span>
                </div>

                <p className="text-slate-600 text-[10px] md:text-[13px] font-regular line-clamp-3">
                  {t.content}
                </p>

                <div className="flex items-center md:gap-2 gap-1">

                  {t.location && (
                    <span className="md:text-[12px] text-[10px] text-slate-600 flex items-center gap-1">
                      <FaMapMarkerAlt /> {t.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <CustomTooltip
                    label="Access Restricted Contact Admin"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("testimonials", "edit")}
                  >
                    <Button
                      onClick={() => handleEdit(t)}
                      disabled={!hasPermission("testimonials", "edit")}
                      className="
                          md:px-3 px-2 md:py-1.5 py-0.5  md:rounded-md rounded-[6px] bg-[#3f85ed] text-white
                        hover:bg-[#2E74E0] active:scale-[.99] transition
                        flex items-center gap-2
                      "
                    >
                      <FaEdit className="md:w-[12px] w-[9px] md:h-[12px] h-[9px]" />
                      <span className="text-[12px] font-medium md:block hidden">
                        Edit
                      </span>
                    </Button>
                  </CustomTooltip>

                  <CustomTooltip
                    label="Access Restricted Contact Admin"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("testimonials", "delete")}
                  >
                    <Button
                      onClick={() => t.id && handleDelete(t.id)}
                      disabled={!hasPermission("testimonials", "delete")}
                      className="
                        md:px-3 px-2 md:py-1.5 py-0.5 md:rounded-md rounded-[6px] bg-red-500 text-white
                        hover:bg-red-600 active:scale-[.99] transition
                        flex items-center gap-2
                      "
                    >
                      <FaTrash className="md:w-[12px] w-[9px] md:h-[12px] h-[9px]" />
                      <span className="text-[12px] md:block hidden font-medium">
                        Delete
                      </span>
                    </Button>
                  </CustomTooltip>
                </div>
              </div>
            </div>
          ))}
      </div>


      {filteredData?.length > pageSize && (
        <div className="flex items-center justify-center mx-auto mb-[20px]">
          <PaginationControls
            currentPage={currentpage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}


      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[90%] md:w-[80%] lg:w-[calc(90%-190px)] shadow-2xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 md:px-10 px-4 py-2">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 grid place-items-center ring-1 ring-purple-100">
                <FaQuoteLeft />
              </div>
              <h1 className="text-gray-800 md:text-2xl text-xl font-bold">
                {updateId ? "Edit Testimonial" : "Add Testimonial"}
              </h1>
            </div>

            <div className="text-red-500 font-regular text-[12px] md:px-10 px-4">
              All fields are required
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
                <Loader />
              </div>
            )}

            <form
              className="flex flex-col md:gap-3 gap-1 w-full bg-gray-100 md:px-8 px-2 md:py-6  py-3 rounded-[10px] shadow-custom"
              onSubmit={handleSubmit}
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-2 md:px-10 px-4 md:gap-y-4 gap-y-3 gap-x-5">
                <CustomInput
                  name="name"
                  id="name"
                  className="py-0 px-3 placeholder:text-gray-500"
                  labelCls="font-medium label-text text-[#000000]"
                  required
                  placeholder="Enter name"
                  value={testimonial.name}
                  label="Name"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(e.target.name ?? "", e.target.value ?? "")
                  }
                />

                <CustomInput
                  name="location"
                  id="location"
                  className="py-0 px-3 placeholder:text-gray-500"
                  labelCls="font-medium label-text text-[#000000]"
                  required
                  placeholder="Enter location"
                  value={testimonial.location}
                  label="Location"
                  type="text"
                  onChange={(e) =>
                    handleFormChange(e.target.name ?? "", e.target.value ?? "")
                  }
                />

                <SingleSelect
                  name="category"
                  label="Category"
                  labelCls="font-medium label-text text-[#000000]"
                  rootCls="px-1 py-1 w-full rounded-[6px]"

                  type="single-select"

                  options={CATEGORY_OPTIONS}

                  selectedOption={
                    CATEGORY_OPTIONS.find(
                      (item) => item.category === testimonial.category
                    ) || { id: 1, category: "furniture" }
                  }
                  optionsInterface={{
                    isObj: true,
                    displayKey: "category",
                  }}
                  handleChange={(name, value) => handleSelectChange(value)}
                />

                <SingleSelect
                  name="rating"
                  label="Rating"
                  labelCls="font-medium label-text text-[#000000]"
                  rootCls="px-1 md:py-2 py-1 w-full rounded-[6px] "
                  selectedOption={String(testimonial.rating || "")}
                  type="single-select"

                  handleChange={(name: string, val: any) =>
                    handleFormChange(name, Number(val))
                  }
                  optionsInterface={{ isObj: false }}
                  options={ratingOptions}
                />

                <FileInput
                  name="userimage"
                  label="User Image"
                  labelCls="font-medium label-text text-[#000000]"
                  type="file"
                  folderName="testimonials"
                  required
                  initialFileUrl={testimonial.userimage}
                  onFileChange={(url) => handleUpload(url)}
                />

                <CustomInput
                  name="content"
                  id="content"
                  label="Content"
                  className="py-1 px-3 placeholder:text-gray-500 text-[14px] min-h-[120px]"
                  labelCls="font-medium label-text text-[#000000]"
                  placeholder="Enter testimonial content"
                  required
                  rootCls="col-span-1 md:col-span-2"
                  value={testimonial.content}
                  type="textarea"
                  onChange={(e) =>
                    handleFormChange(e.target.name ?? "", e.target.value ?? "")
                  }
                />

                <div className="col-span-1 md:col-span-1 w-full">
                  <ImageUploader
                    label="Upload Testimonial Images"
                    onFilesChange={(files: string[]) =>
                      handleimageUpload("testimonialImages", files)
                    }
                    maxFiles={5}
                    maxFileSize={10}
                    folderName="testimonialImages"
                    acceptedFormats={["image/png", "image/jpg", "image/jpeg"]}
                    outerCls="border-blue-200 border-2 rounded-md p-3 bg-blue-50"
                    initialUrls={testimonial.testimonialImages || []}
                    buttonCls="bg-[#5297ff] hover:bg-blue-600 transition-colors"
                  />
                </div>

                <div className="col-span-1 md:col-span-1 w-full">
                  <ImageUploader
                    label="Upload Testimonial Videos"
                    onFilesChange={(files: string[]) =>
                      handleimageUpload("testimonialVideos", files)
                    }
                    maxFiles={2}
                    maxFileSize={50}
                    folderName="testimonialVideos"
                    acceptedFormats={["video/mp4", "video/mov"]}
                    outerCls="border-green-200 border-2 rounded-md p-3 bg-green-50"
                    initialUrls={testimonial.testimonialVideos || []}
                    buttonCls="bg-green-500 hover:bg-green-600 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 md:mt-6 mt-3 md:px-10 px-4 md:mb-6 mb-3">
                <Button
                  className="text-slate-700 md:px-4 px-2  md:py-2 py-1 md:text-[16px] text-[12px] rounded-md bg-slate-100 border border-slate-300 hover:bg-slate-50 active:scale-[.99] transition font-medium"
                  type="button"
                  onClick={handleReset}
                >
                  Cancel
                </Button>
                <Button
                  className="text-white md:px-4 px-2  md:py-2 py-1 md:text-[16px] text-[12px]  rounded-md bg-[#3586FF] hover:bg-[#2E74E0] shadow-[0_6px_20px_rgba(53,134,255,0.35)] active:scale-[.99] transition font-medium"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default TestimonialsView;
