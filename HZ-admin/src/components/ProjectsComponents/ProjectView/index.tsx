import ReusableSearchFilter from "@/src/common/SearchFilter";
import apiClient from "@/src/utils/apiClient";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ProjectCard } from "../ProjectCard";
import Loader from "@/src/common/Loader";
import Button from "@/src/common/Button";
import { twMerge } from "tailwind-merge";
import {
  LayoutGrid,
  Rows,
  ArrowUpDown,
  Share2,
  Download,
  X,
} from "lucide-react";
import Modal from "@/src/common/Modal";

type LayoutMode = "list" | "grid";
type SortBy =
  | "relevance"
  | "nameAZ"
  | "priceLowHigh"
  | "priceHighLow"
  | "cityAZ";

const MAX_COMPARE = 4;

const ProjectView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [projectTypeOptions, setprojectTypeOptions] = React.useState<
    { id: string; label: string }[]
  >([]);
  const [promotionTypeOptions, setpromotionTypeOptions] = useState<
    { id: string; label: string }[]
  >([]);

  type FiltersState = {
    projectTypeData: Record<string, boolean>;
    priceRangeData: Record<string, boolean>;
    promotionTypeData: Record<string, boolean>;
  };
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    projectTypeData: {},
    priceRangeData: {},
    promotionTypeData: {},
  });

  const [layout, setLayout] = useState<LayoutMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");

  
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<Array<string | number>>([]);

  const toggleCompare = (p: any) => {
    setCompareIds((prev) => {
      const exists = prev.includes(p.id);
      if (exists) return prev.filter((i) => i !== p.id);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} projects`);
        return prev;
      }
      return [...prev, p.id];
    });
  };

  const clearCompare = () => setCompareIds([]);

  const comparedProjects = useMemo(
    () => (projectData || []).filter((p: any) => compareIds.includes(p.id)),
    [projectData, compareIds]
  );

  const exportComparedCSV = () => {
    if (comparedProjects.length === 0) return;
    const headers = [
      "Name",
      "City",
      "Min Price",
      "Max Price",
      "Type",
      "Developer",
      "Company",
      "Estd Year",
      "Promotion",
    ];
    const rows = comparedProjects.map((p: any) => [
      p.name,
      p.location?.city || "-",
      p.minPrice || "-",
      p.maxPrice || "-",
      p.propertyType || "-",
      p.company?.developer || "-",
      p.company?.name || "-",
      p.company?.estdYear || "-",
      (p.promotionType || []).join("; "),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects_compare.csv";
    a.click();
    toast.success("Compared list exported");
  };

  const shareCompared = async () => {
    if (comparedProjects.length === 0) return;
    const text =
      "Compare projects:\n" +
      comparedProjects
        .map((p: any) => `• ${p.name} (${p.location?.city || "-"})`)
        .join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Projects Compare", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied compared list to clipboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.company_Onboarding}/get-all-projects`
      );
      if (response?.status === 200) {
        setProjectData(response?.body?.data || []);
        toast.success("Projects fetched successfully");
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error occurred in projects fetching");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectData?.length > 0) {
      const uniqueProjectTypes = Array.from(
        new Set(
          projectData
            .map((project: any) => project?.propertyType?.trim())
            .filter(Boolean)
        )
      );
      setprojectTypeOptions(
        uniqueProjectTypes.map((type) => ({
          id: String(type),
          label: String(type)
            .split(/(?=[A-Z])/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
        }))
      );
      const allPromotions = projectData.flatMap(
        (project: any) => project?.promotionType || []
      );
      const uniqueTypePromotions = Array.from(
        new Set(allPromotions.filter((tag): tag is string => !!tag))
      );
      setpromotionTypeOptions(
        uniqueTypePromotions.map((tag) => ({
          id: String(tag),
          label: String(tag),
        }))
      );
    }
  }, [projectData]);

  const isEmpty = (filters: Record<string, boolean>) =>
    Object.values(filters).every((val) => !val);

  const filteredData = useMemo(() => {
    if (!projectData) return [];
    return projectData.filter((project: any) => {
      const matchSearch =
        (project?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project?.location?.city
          ?.toLowerCase()
          .trim()
          .includes(searchQuery.toLowerCase().trim()) ||
        (project?.location?.locality || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const projectTypeFilters = selectedFilters.projectTypeData;
      const matchProjectType =
        isEmpty(projectTypeFilters) ||
        projectTypeFilters[project?.propertyType?.trim()];

      const PromotionTypeFilters = selectedFilters.promotionTypeData;
      const matchPromotionType =
        isEmpty(PromotionTypeFilters) ||
        (project.promotionType &&
          project.promotionType.some(
            (type: string) => PromotionTypeFilters[type]
          ));
      const priceFilters = selectedFilters.priceRangeData;
      const activePriceRanges = Object.keys(priceFilters).filter(
        (k) => priceFilters[k]
      );
      const matchPrice =
        isEmpty(priceFilters) ||
        activePriceRanges.some((range) => {
          const price = project?.minPrice || 0;
          if (range.endsWith("+")) {
            const min = parseInt(range.replace("+", ""), 10);
            return price >= min;
          }
          const [min, max] = range.split("-").map(Number);
          return price >= min && price <= max;
        });

      return (
        matchSearch && matchProjectType && matchPromotionType && matchPrice
      );
    });
  }, [projectData, searchQuery, selectedFilters]);

  const sortedData = useMemo(() => {
    const data = [...filteredData];
    switch (sortBy) {
      case "nameAZ":
        data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "priceLowHigh":
        data.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
        break;
      case "priceHighLow":
        data.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
        break;
      case "cityAZ":
        data.sort((a, b) =>
          (a.location?.city || "").localeCompare(b.location?.city || "")
        );
        break;
      default:
        break;
    }
    return data;
  }, [filteredData, sortBy]);

  const exportToCSV = () => {
    const headers = ["Name", "City", "Min Price", "Type", "Promotion"];
    const rows = sortedData.map((p: any) => [
      p.name,
      p.location?.city || "-",
      p.minPrice || "-",
      p.propertyType || "-",
      (p.promotionType || []).join("; "),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.csv";
    a.click();
    toast.success("Exported to CSV");
  };

  return (
    <div className="w-full">
      {loading ? (
        <Loader />
      ) : (
        <div className="relative w-full p-5">
          <h1 className="heading-text">Projects</h1>

          <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-2 md:px-3 md:py-0 mb-4 md:mt-4 mt-2">
            <div className="flex md:flex-row flex-col items-center gap-1 lg:gap-3">
              <div className="flex-1 md:mt-2 mt-0">
                <ReusableSearchFilter
                  searchText={searchQuery}
                  placeholder="Search by project name or location"
                  onSearchChange={setSearchQuery}
                  filters={[
                    {
                      groupLabel: "Project Type",
                      key: "projectTypeData",
                      options: projectTypeOptions,
                    },
                    {
                      groupLabel: "Promotion Type",
                      key: "promotionTypeData",
                      options: promotionTypeOptions,
                    },
                    {
                      groupLabel: "Price Range",
                      key: "priceRangeData",
                      options: [
                        { id: "0-5000000", label: "Below 50L" },
                        { id: "5000000-10000000", label: "50L - 1Cr" },
                        { id: "10000000-20000000", label: "1Cr - 2Cr" },
                        { id: "20000000+", label: "Above 2Cr" },
                      ],
                    },
                  ]}
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                />
              </div>

              <div className="flex items-center gap-2 md:mb-4 mb-2">
                <Button
                  className={twMerge(
                    "px-2 py-1 rounded-md border",
                    layout === "list"
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  )}
                  onClick={() => setLayout("list")}
                  title="List"
                >
                  <Rows className="w-4 h-4" />
                </Button>
                <Button
                  className={twMerge(
                    "px-2 py-1 rounded-md border",
                    layout === "grid"
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300"
                  )}
                  onClick={() => setLayout("grid")}
                  title="Grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>

                <Button
                  className="border border-blue-300 md:text-[14px] text-[12px] text-[#3586FF]  bg-white hover:bg-blue-50 px-3 py-0.5 rounded-md flex items-center gap-2 font-medium"
                  onClick={exportToCSV}
                  title="Export filtered list"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-y-2 md:items-center items-start justify-between">
            <div className="flex md:gap-4 gap-2 mt-2 font-medium md:text-[12px] text-[8px] ">
              <span>Total: {sortedData.length} Projects</span>
              <span>
                Filters:{" "}
                {Object.keys(selectedFilters.projectTypeData).filter(
                  (k) => selectedFilters.projectTypeData[k]
                ).length +
                  Object.keys(selectedFilters.promotionTypeData).filter(
                    (k) => selectedFilters.promotionTypeData[k]
                  ).length}
              </span>
              <span>
                Cities:{" "}
                {new Set(projectData?.map((p: any) => p?.location?.city)).size}
              </span>
            </div>

            <div className="flex items-center gap-2 md:text-[14px] text-[10px] font-medium">
              <ArrowUpDown className="w-4 h-4 text-gray-500" /> Sort:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="border rounded-md px-2 py-1.5 md:text-[12px] text-[10px]"
              >
                <option value="relevance">Relevance</option>
                <option value="nameAZ">Name A → Z</option>
                <option value="cityAZ">City A → Z</option>
                <option value="priceLowHigh">Price Low → High</option>
                <option value="priceHighLow">Price High → Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            {sortedData?.length > 0 ? (
              layout === "grid" ? (
                <div
                  className={twMerge(
                    "grid gap-4",
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  {sortedData.map((project: any, idx: number) => (
                    <ProjectCard
                      key={idx}
                      project={project}
                      variant="grid"
                      isCompared={compareIds.includes(project.id)}
                      onToggleCompare={() => toggleCompare(project)}
                      compareDisabled={
                        !compareIds.includes(project.id) &&
                        compareIds.length >= MAX_COMPARE
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="md:space-y-4 space-y-6">
                  {sortedData.map((project: any, idx: number) => (
                    <ProjectCard
                      key={idx}
                      project={project}
                      variant="list"
                      isCompared={compareIds.includes(project.id)}
                      onToggleCompare={() => toggleCompare(project)}
                      compareDisabled={
                        !compareIds.includes(project.id) &&
                        compareIds.length >= MAX_COMPARE
                      }
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center w-full h-[120px] rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}
          </div>

          {compareIds.length > 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border shadow-custom md:rounded-[10px] rounded-[4px] px-3 py-2 md:px-4 md:py-3 z-40 md:max-w-[95%] max-w-full overflow-x-auto  md:w-auto">
              <div className="flex items-center md:gap-3 gap-1 flex-wrap">
                <span className="text-[10px] md:text-[12px] text-gray-700 font-medium">
                  Compare: {compareIds.length}/{MAX_COMPARE}
                </span>

                <div className="flex items-center md:gap-2 gap-1">
                  {comparedProjects.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 border md:rounded-[10px] rounded-[4px] px-2 py-1"
                    >
                      <div className="w-6 h-6 rounded overflow-hidden bg-gray-100">
                        <img
                          className="w-full h-full object-cover"
                          src={
                            p?.mediaDetails?.propertyImages?.[0] ||
                            "https://via.placeholder.com/60x60.png?text=P"
                          }
                          alt={p.name}
                        />
                      </div>
                      <span className="md:text-[12px] text-[10px] font-medium max-w-[120px] truncate">
                        {p.name}
                      </span>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => toggleCompare(p)}
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="ml-auto flex items-center md:gap-2 gap-1 font-medium">
                  <Button
                    className="px-3 py-1.5 md:rounded-[10px] rounded-[4px] border bg-white hover:bg-gray-50 text-gray-700 text-[10px] md:text-[12px]"
                    onClick={clearCompare}
                  >
                    Clear
                  </Button>
                  <Button
                    className="px-3 py-1.5 md:rounded-[10px] rounded-[4px] border bg-white hover:bg-gray-50 text-gray-700 text-[10px] md:text-[12px] flex items-center gap-1"
                    onClick={shareCompared}
                  >
                    <Share2 className="md:w-3.5 w-2 md:h-3.5 h-2" />
                    Share
                  </Button>
                  <Button
                    className="px-3 py-1.5 md:rounded-[10px] rounded-[4px] border bg-white hover:bg-gray-50 text-gray-700 text-[10px] md:text-[12px] flex items-center gap-1"
                    onClick={exportComparedCSV}
                  >
                    <Download className="md:w-3.5 w-2 md:h-3.5 h-2" />
                    Export
                  </Button>
                  <Button
                    className="md:px-4 px-2 md:py-1.5 py-1 md:rounded-[10px] rounded-[4px] bg-[#5297ff] hover:bg-blue-700 text-white text-[10px] md:text-[12px]"
                    onClick={() => setCompareOpen(true)}
                  >
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Modal
            isOpen={compareOpen}
            closeModal={() => setCompareOpen(false)}
            className="md:max-w-5xl max-w-[95vw]"
            title="Compare Projects"
            rootCls="z-[99999] "
            titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
            isCloseRequired
          >
            <div className="w-full">
              {comparedProjects.length < 2 ? (
                <p className="text-gray-600 md:text-[12px] text-[10px]">
                  Select at least two projects to compare.
                </p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-gray-500 text-[10px] md:text-[12px] p-2 border-b"></th>
                        {comparedProjects.map((p: any) => (
                          <th key={p.id} className="text-left p-2 border-b">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                                <img
                                  className="w-full h-full object-cover"
                                  src={
                                    p?.mediaDetails?.propertyImages?.[0] ||
                                    "https://via.placeholder.com/60x60.png?text=P"
                                  }
                                  alt={p.name}
                                />
                              </div>
                              <div>
                                <div className="font-bold md:text-[14px] text-[12px]">
                                  {p.name}
                                </div>
                                <div className="text-gray-500 text-[11px]">
                                  {p.location?.city || "-"}
                                </div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [
                          "Price Range",
                          (p: any) =>
                            `₹ ${p.minPrice?.toLocaleString?.() || "-"} - ₹ ${
                              p.maxPrice?.toLocaleString?.() || "-"
                            }`,
                        ],
                        [
                          "Location",
                          (p: any) =>
                            `${p.location?.locality || "-"}, ${
                              p.location?.city || "-"
                            }`,
                        ],
                        ["Property Type", (p: any) => p.propertyType || "-"],
                        ["Developer", (p: any) => p.company?.developer || "-"],
                        ["Company", (p: any) => p.company?.name || "-"],
                        ["Estd Year", (p: any) => p.company?.estdYear || "-"],
                        [
                          "Promotions",
                          (p: any) => (p.promotionType || []).join(", ") || "-",
                        ],
                      ].map(([label, getter]) => (
                        <tr key={label as string} className="align-top">
                          <td className="font-bold text-[#3586FF]  text-[10px] md:text-[12px] p-2 border-b whitespace-nowrap">
                            {label as string}
                          </td>
                          {comparedProjects.map((p: any) => (
                            <td
                              key={`${p.id}-${label}`}
                              className="p-2 border-b text-[10px] md:text-[12px] font-medium"
                            >
                              {(getter as any)(p)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
