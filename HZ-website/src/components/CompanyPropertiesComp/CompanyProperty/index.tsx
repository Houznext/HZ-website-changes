import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import { LuLandmark } from "react-icons/lu";
import { IoBusinessOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import {
  LuHourglass,
  LuBriefcase,
  LuMail,
  LuUser,
  LuBadge,
} from "react-icons/lu";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import Modal from "@/common/Modal";

import ReusableSearchFilter from "@/common/SearchFilter";

import { List, Grid } from "lucide-react";

export const CompanyPropertyView = () => {
  const router = useRouter();
  const session = useSession();

  const [companyData, setCompanyData] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    {}
  );

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (session?.status === "authenticated" && session?.data?.user)
      setUser(session?.data?.user);
  }, [session?.status]);

  const fetchCompanyDetails = async (userId: string) => {
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.companyonboarding}/my-company/projects/${userId}`,
        {},
        true
      );
      if (response.status === 200) {
        setCompanyData(response?.body);
        toast.success("Company fetched successfully");
      }
    } catch (error) {
      console.log("error occured in company fetching", error);
      toast.error("Error occured in company fetching");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCompanyDetails(user.id);
    }
  }, [user]);

  const handleClick = (id: number) => {
    router.push(`/user/company-property/${id}/edit`);
  };

  const handleAddProperty = () => {
    router.push("/user/company-property/create");
  };

  const handleDelete = (id: number) => {
    setDeleteModal(true);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await apiClient.delete(
        `${apiClient.URLS.companyonboarding}/${deleteId}`
      );
      if (response.status === 200) {
        toast.success("Company deleted successfully");
        fetchCompanyDetails(user?.id);
        setDeleteModal(false);
      }
    } catch (error) {
      console.log("error occured in company deleting", error);
      toast.error("Error occured in company deleting");
    } finally {
      setLoading(false);
    }
  };

  const companyNames = useMemo(() => {
    const set = new Set(
      companyData
        .map((item) => item.company?.companyName)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [companyData]);

  const reraIds = useMemo(() => {
    const set = new Set(
      companyData
        .map((item) => item.company?.RERAId)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [companyData]);

  const developerEmails = useMemo(() => {
    const set = new Set(
      companyData
        .map((item) => item.developerInformation?.email)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [companyData]);

  const companyNameFilter = useMemo(() => {
    const group = (selectedFilters?.companyName ?? {}) as Record<
      string,
      boolean
    >;
    const picked = Object.entries(group).find(([_, v]) => v);
    return picked ? picked[0] : "";
  }, [selectedFilters]);

  const reraIdFilter = useMemo(() => {
    const group = (selectedFilters?.reraId ?? {}) as Record<string, boolean>;
    const picked = Object.entries(group).find(([_, v]) => v);
    return picked ? picked[0] : "";
  }, [selectedFilters]);

  const developerEmailFilter = useMemo(() => {
    const group = (selectedFilters?.developerEmail ?? {}) as Record<
      string,
      boolean
    >;
    const picked = Object.entries(group).find(([_, v]) => v);
    return picked ? picked[0] : "";
  }, [selectedFilters]);

  const filterConfig = useMemo(
    () =>
      [
        {
          groupLabel: "Company Name",
          key: "companyName",
          options: companyNames.map((c) => ({ id: c, label: c })),
        },
        {
          groupLabel: "RERA ID",
          key: "reraId",
          options: reraIds.map((r) => ({ id: r, label: r })),
        },
        {
          groupLabel: "Developer Email",
          key: "developerEmail",
          options: developerEmails.map((e) => ({ id: e, label: e })),
        },
      ] as any,
    [companyNames, reraIds, developerEmails]
  );

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    return companyData.filter((item: any) => {
      const name = item.company?.companyName || "";
      const rera = item.company?.RERAId || "";
      const email = item.developerInformation?.email || "";

      const hay = `${name} ${rera} ${email}`.toLowerCase();
      const matchesQuery = q ? hay.includes(q) : true;

      const matchesCompanyName = companyNameFilter
        ? name === companyNameFilter
        : true;
      const matchesReraId = reraIdFilter ? rera === reraIdFilter : true;
      const matchesDeveloperEmail = developerEmailFilter
        ? email === developerEmailFilter
        : true;

      return (
        matchesQuery &&
        matchesCompanyName &&
        matchesReraId &&
        matchesDeveloperEmail
      );
    });
  }, [
    companyData,
    query,
    companyNameFilter,
    reraIdFilter,
    developerEmailFilter,
  ]);

  return (
    <>
      <div className="relative w-full h-full md:p-[40px] p-3">
        <div className="flex flex-row justify-between items-center w-full md:mt-0 mt-2">
          <div className="w-full h-full md:text-[24px] text-[16px] font-medium">
            Company Property
          </div>
          <div>
            <Button
              className="bg-[#3586FF] text-white font-medium py-2 px-4 w-full text-nowrap rounded-md"
              onClick={handleAddProperty}
            >
              + Add Company
            </Button>
          </div>
        </div>

        <div className="w-full mt-8  flex flex-col md:flex-row md:items-center gap-3">
          <ReusableSearchFilter
            searchText={query}
            onSearchChange={setQuery}
            placeholder="Search by company, RERA ID, developer email..."
            filters={filterConfig}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            rootCls="w-full "
          />

          <div className="flex items-center ml-auto md:ml-0 rounded-lg overflow-hidden border border-gray-200">
            <Button
              onClick={() => setViewMode("list")}
              className={`px-3 h-8 grid place-items-center ${viewMode === "list" ? "bg-gray-100" : "bg-white"
                }`}
              aria-label="List view"
            >
              <List size={18} />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              className={`px-3 h-8 grid place-items-center ${viewMode === "grid" ? "bg-gray-100" : "bg-white"
                }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </Button>
          </div>
        </div>

        {/* List (we can later add a separate grid layout if needed) */}
        <div className="flex flex-col gap-4 mt-8">
          {filteredProjects?.length > 0 ? (
            filteredProjects.map((project: any) => (
              <ComProperty
                key={project.id}
                id={project.id}
                companyName={project.company?.companyName}
                RERAId={project.company?.RERAId}
                about={project.company?.about}
                estdYear={project.company?.estdYear}
                Logo={project.company?.Logo}
                developerInformation={project.developerInformation}
                promotionType={project.promotionType}
                setLoading={setLoading}
                setCompanyData={setCompanyData}
                handleDelete={() => handleDelete(project.id)}
                onClick={() => handleClick(project.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-10 shadow-sm">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <IoBusinessOutline className="h-10 w-10 text-[#3586FF]" />
              </div>
              <h2 className="md:text-[20px] text-[16px] font-medium text-gray-800 mb-2">
                No Projects Found
              </h2>
              <p className="md:text-[16px] text-[12px] font-medium text-gray-500 max-w-sm text-center">
                It looks like this developer doesn’t have any company projects
                associated yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        className="md:max-w-[550px] max-w-[330px] rounded-[6px]"
        rootCls="flex items-center border justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="md:p-6 p-3 flex flex-col gap-3 z-20 ">
          <div className="flex justify-between items-center  mb-2">
            <h3 className="md:text-[20px] text-center w-full text-[14px]  font-medium text-gray-900">
              Confirm Delete
            </h3>
          </div>
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 text-red-600 rounded-full md:p-4 p-3">
              <MdDelete size={32} />
            </div>
          </div>
          <p className="md:text-[14px] text-[12px] text-gray-500 text-center font-medium">
            Are you sure you want to delete this company? This action will
            permanently remove the company and all its associated projects,
            sellers, and data. This action cannot be undone.
          </p>

          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className="md:h-[50px] h-[35px] md:px-[28px] px-[14px] md:text-[16px] text-[12px] rounded-md border-2 bg-gray-100 hover:bg-gray-200  font-medium text-gray-700"
              onClick={() => setDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              className="md:h-[50px] h-[35px] md:px-[28px] px-[20px] font-medium md:text-[16px] text-[12px] rounded-md border-2 bg-[#3586FF] text-white flex items-center justify-center gap-2"
              onClick={handleDeleteConfirm}
              size="sm"
              disabled={loading}
            >
              {loading && <LoaderIcon />}
              {loading ? "Duplicating..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const ComProperty = ({
  Logo,
  companyName,
  id,
  estdYear,
  about,
  RERAId,
  developerInformation,
  onClick,
  handleDelete,
}: any) => {
  return (
    <div className="flex md:flex-row flex-col items-center justify-between w-full border border-gray-200 rounded-lg px-4 py-2 gap-3">
      <div className="flex md:flex-row flex-col items-center md:gap-14 gap-8">
        <div className="relative md:w-[180px] md:h-[180px] w-[120px] h-[120px] rounded-full overflow-hidden">
          <Image
            fill
            className="w-full h-full object-cover"
            src={Logo?.[0] || "/images/companylogo.jpg"}
            alt="company logo"
          />
        </div>
        <div className="md:w-[70%] w-full">
          <div className="grid md:grid-cols-3 grid-cols-2 w-full md:gap-8 gap-4 md:ml-[10px] ml-[2px]">
            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuLandmark className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>

              <div className="flex flex-col">
                <p className="md:text-[16px] text-[12px] font-medium text-gray-400">
                  Company Name
                </p>
                <p className="md:text-[16px] text-[10px] font-medium text-black">
                  {companyName}
                </p>
              </div>
            </div>
            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuHourglass className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>

              <div className="flex flex-col">
                <p className=" md:text-[16px] text-[12px] font-medium text-gray-400">
                  Established Year
                </p>
                <p className="md:text-[16px] text-[10px] font-medium text-black">
                  {estdYear}
                </p>
              </div>
            </div>
            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuBriefcase className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>

              <div className="flex flex-col">
                <p className="md:text-[16px] text-[12px] font-medium text-gray-400">
                  About Company
                </p>
                <p className="md:block hidden md:text-[16px] text-[10px] font-medium text-black">
                  {about?.slice(0, 100)}...
                </p>
                <p className="block md:hidden md:text-[16px] text-[10px] font-medium text-black">
                  {about?.slice(0, 50)}...
                </p>
              </div>
            </div>

            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuUser className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>

              <div className="flex flex-col">
                <p className=" md:text-[16px] text-[12px] font-medium text-gray-400">
                  Developer Name
                </p>
                <p className="md:text-[16px] text-[10px] font-medium text-black">
                  {developerInformation?.fullName}
                </p>
              </div>
            </div>
            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuBadge className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>
              <div className="flex flex-col">
                <p className=" md:text-[16px] text-[12px] font-medium text-gray-400">
                  RERA ID
                </p>
                <div className="md:text-[16px] text-[10px] font-medium">
                  {RERAId}
                </div>
              </div>
            </div>

            <div className="flex  md:gap-4 gap-2">
              <div>
                <LuMail className="md:text-[20px] text-[16px] text-[#3586FF]" />
              </div>

              <div className="flex flex-col">
                <p className=" md:text-[16px] text-[12px] font-medium text-gray-400">
                  Developer Email
                </p>
                <p className="md:text-[16px] text-[10px] font-medium text-black">
                  {developerInformation?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pr-[10px] flex items-center gap-2">
        <Button
          onClick={onClick}
          className="bg-[#3586FF] text-white py-2 md:px-4 px-3 font-medium md:text-[16px] text-[12px] text-nowrap rounded-md flex items-center gap-2"
        >
          <FaEdit /> Edit
        </Button>
        <Button
          className="md:px-5 px-3 py-2 bg-red-500  md:text-[16px] font-medium text-[12px] text-white rounded-md flex items-center gap-2"
          onClick={() => handleDelete(id)}
        >
          <FaTrash /> Delete
        </Button>
      </div>
    </div>
  );
};
