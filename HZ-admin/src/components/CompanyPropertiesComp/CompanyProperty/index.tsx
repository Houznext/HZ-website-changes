import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import toast, { LoaderIcon } from "react-hot-toast";
import Image from "next/image";
import { LuLandmark } from "react-icons/lu";
import { Download, LayoutGrid, Rows, ArrowUpDown, Clock, CheckCircle, FileText, XCircle, Eye } from "lucide-react";
import {
  LuHourglass,
  LuBriefcase,
  LuMail,
  LuUser,
  LuBadge,
} from "react-icons/lu";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import {
  MdStar,
  MdAttachMoney,
  MdVerified,
  MdWorkspacePremium,
  MdTrendingUp,
  MdPeopleAlt,
} from "react-icons/md";
import Modal from "@/src/common/Modal";
import { MdDelete } from "react-icons/md";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import { useCompanyStore, CompanyStatusFilter } from "@/src/stores/companystore";
import { useSession } from "next-auth/react";
export const CompanyPropertyView = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [companyData, setCompanyData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const { hasPermission, permissions } = usePermissionStore((state) => state);
  const [view, setView] = useState<"cards" | "compact">("cards");
  const [sort, setSort] = useState<"recent" | "name" | "year">("recent");
  const { 
    companyDetails, 
    fetchCompanies, 
    setCompanyDetails, 
    isLoading,
    statusFilter,
    setStatusFilter,
    statusCounts,
    approveCompany,
    total
  } = useCompanyStore();

  // Status tabs
  const statusTabs: { key: CompanyStatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'All', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-gray-100 text-gray-700' },
    { key: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-yellow-100 text-yellow-700' },
    { key: 'approved', label: 'Approved', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700' },
    { key: 'draft', label: 'Drafts', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-700' },
  ];

  // Handle approval
  const handleApprove = async (companyId: string) => {
    if (!session?.user?.id) return;
    const success = await approveCompany(companyId, true, session.user.id, true);
    if (success) fetchCompanies(1, 50, statusFilter, '', true);
  };

  // Handle rejection
  const handleReject = async (companyId: string, reason?: string) => {
    if (!session?.user?.id) return;
    const success = await approveCompany(companyId, false, session.user.id, false, reason);
    if (success) fetchCompanies(1, 50, statusFilter, '', true);
  };

  // Handle publish
  const handlePublish = async (companyId: string, alsoApprove: boolean = false) => {
    if (!session?.user?.id) return;
    const success = await approveCompany(companyId, alsoApprove, session.user.id, true);
    if (success) fetchCompanies(1, 50, statusFilter, '', true);
  };

  const handleAddProperty = () => {
    router.push("/company-property/create");
  };


  const handleClick = (id: number) => {
    router.push(`/company-property/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    setDeleteModal(true);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await apiClient.delete(
        `${apiClient.URLS.company_Onboarding}/${deleteId}`,{},
        true
      );
      if (response.status === 200) {
        toast.success("Company deleted successfully");
        await fetchCompanies();
        setDeleteModal(false);
      }
    } catch (error) {
      console.log("error occured in company deleting", error);
      toast.error("Error occured in company deleting");
    }
  };

  useEffect(() => {
    fetchCompanies(1, 50, statusFilter, '', true);
  }, []);

  const filterCompanyData = useMemo(() => {
    const out = companyDetails.filter((company: any) => {
      const nameMatch = company.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const developerNameMatch = company.developerInformation.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const estbYearMatch = company.estdYear.toString().includes(searchQuery);
      return nameMatch || developerNameMatch || estbYearMatch;
    });
    if (sort === "name") {
      out.sort((a, b) =>
        (a?.companyName || "").localeCompare(b?.companyName || "")
      );
    } else if (sort === "year") {
      out.sort((a, b) => {
        const ta = Number(a?.estdYear) || 0;
        const tb = Number(b?.estdYear) || 0;
        return tb - ta;
      });
    } else {
      out.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    }

    return out;
  }, [companyDetails, selectedFilters, sort]);

  return (
    <>
      <div className="relative w-full overflow-x-hidden h-full md:p-8 p-4">
        {/* Page Header */}
        <div className="flex flex-row justify-between items-center w-full mb-6">
          <div className="border-b border-gray-100 pb-2">
            <h1 className="heading-text">Company Property</h1>
          </div>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("company", "create")}
          >
            <Button
              disabled={!hasPermission("company", "create")}
              className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              onClick={handleAddProperty}
            >
              + Add Company
            </Button>
          </CustomTooltip>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusTabs.map((tab) => {
            const count = statusCounts[tab.key] || 0;
            const badgeColor = tab.key === 'pending' ? 'bg-yellow-500' : 
                              tab.key === 'approved' ? 'bg-green-500' : 
                              tab.key === 'draft' ? 'bg-blue-500' : 'bg-gray-500';
            return (
              <Button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  statusFilter === tab.key
                    ? 'bg-[#3586FF] text-white shadow-md'
                    : `${tab.color} hover:opacity-80`
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`${statusFilter === tab.key ? 'bg-white/20' : badgeColor} text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <ReusableSearchFilter
                searchText={searchQuery}
                placeholder="Search by Company Name, Developer Name, Estd Year"
                onSearchChange={setSearchQuery}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 sublabel-text text-gray-700 flex items-center gap-2 transition-all"
                onClick={() =>
                  setSort((s) =>
                    s === "recent" ? "name" : s === "name" ? "year" : "recent"
                  )
                }
                title={`Sort: ${sort}`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="font-semibold capitalize text-[#3586FF]">
                  {sort}
                </span>
              </Button>

              <Button
                className={`p-2.5 rounded-lg border transition-all ${
                  view === "cards"
                    ? "bg-[#3586FF] text-white border-[#3586FF] shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setView("cards")}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>

              <Button
                className={`p-2.5 rounded-lg border transition-all ${
                  view === "compact"
                    ? "bg-[#3586FF] text-white border-[#3586FF] shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setView("compact")}
                title="Compact view"
              >
                <Rows className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Company Cards / Rows */}
        {view === "cards" ? (
          <div className="flex flex-col gap-4">
            {filterCompanyData.length ? (
              filterCompanyData.map((company: any) => (
                <ComProperty
                  key={company.id}
                  {...company}
                  hasPermission={hasPermission}
                  promotionType={company.promotionType}
                  setLoading={setLoading}
                  setCompanyData={setCompanyData}
                  handleDelete={() => handleDelete(company.id)}
                  onClick={() => handleClick(company.id)}
                  handleApprove={() => handleApprove(company.id)}
                  handleReject={(reason?: string) => handleReject(company.id, reason)}
                  handlePublish={(alsoApprove: boolean) => handlePublish(company.id, alsoApprove)}
                />
              ))
            ) : (
              <EmptyCompanies />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filterCompanyData.length ? (
              filterCompanyData.map((c: any) => (
                <ComCompanyRow
                  key={c.id}
                  {...c}
                  hasPermission={hasPermission}
                  promotionType={c.promotionType}
                  setLoading={setLoading}
                  setCompanyData={setCompanyData}
                  handleDelete={() => handleDelete(c.id)}
                  onClick={() => handleClick(c.id)}
                  handleApprove={() => handleApprove(c.id)}
                  handleReject={(reason?: string) => handleReject(c.id, reason)}
                  handlePublish={(alsoApprove: boolean) => handlePublish(c.id, alsoApprove)}
                />
              ))
            ) : (
              <EmptyCompanies />
            )}
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        className="md:max-w-[480px] max-w-[340px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-red-50 text-red-500 rounded-full p-4">
            <MdDelete size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Confirm Delete
          </h3>
          <p className="sublabel-text text-gray-500 text-center leading-relaxed">
            Are you sure you want to delete this company? This action will
            permanently remove the company and all its associated projects,
            sellers, and data. This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-2 w-full">
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              onClick={() => setDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 transition-all"
              onClick={() => handleDeleteConfirm()}
              size="sm"
              disabled={loading}
            >
              {loading && <LoaderIcon />}
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
const EmptyCompanies = () => (
  <div className="col-span-full py-20 grid place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <LuLandmark className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-medium font-semibold text-gray-700">
        No companies found
      </p>
      <p className="sublabel-text text-gray-500 mt-1">
        Try a different search or clear filters.
      </p>
    </div>
  </div>
);

const ComProperty = ({
  Logo,
  companyName,
  estdYear,
  about,
  id,
  RERAId,
  promotionType,
  setLoading,
  developerInformation,
  onClick,
  setCompanyData,
  handleDelete,
  hasPermission,
  handleApprove,
  handleReject,
  handlePublish,
  isPosted,
  isApproved,
  approvedBy,
  approvedDate,
}) => {
  const [promotions, setPromotions] = useState<string[]>(promotionType || []);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Status helpers
  const isPendingApproval = isPosted && !isApproved;
  const isDraft = !isPosted;

  // Status badge
  const getStatusBadge = () => {
    if (isApproved) return { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle className="w-3 h-3" /> };
    if (isPendingApproval) return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <Clock className="w-3 h-3" /> };
    if (isDraft) return { label: 'Draft', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: <FileText className="w-3 h-3" /> };
    return null;
  };
  const statusBadge = getStatusBadge();
  const handleSelect = (option: string) => {
    setPromotions((prev) =>
      prev?.includes(option)
        ? prev?.filter((item) => item !== option)
        : [...prev, option]
    );
  };
  const handleClose = async () => {
    setLoading(true);

    try {
      const response = await apiClient.patch(
        `${apiClient.URLS.company_Onboarding}/admin/${id}/company-promotion`,
        {
          promotionType: promotions,
          approvedBy: "admin",
          updatedBy: "admin",
        },
        true
      );

      if (!response.ok) {
        console.error("Failed to update promotions");
        return;
      }
      toast.success("promotion updated successfully!");
      setCompanyData((prev) => ({
        ...prev,
        promotions,
      }));
      console.log("Patch success:", response.data);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };
  const iconMap: Record<string, JSX.Element> = {
    Featured: <MdStar className="text-amber-500 mr-2" />,
    Sponsored: <MdAttachMoney className="text-emerald-500 mr-2" />,
    Verified: <MdVerified className="text-sky-600 mr-2" />,
    Premium: <MdWorkspacePremium className="text-violet-600 mr-2" />,
    Top: <MdTrendingUp className="text-pink-500 mr-2" />,
    Popular: <MdPeopleAlt className="text-orange-500 mr-2" />,
  };

  const renderDropdown = (label: string, key: string, options?: string[]) => {
    if (!options) return null;
    const displayLabel =
      promotions?.length > 0 ? promotions?.join(", ") : label;

    return (
      <div className="relative md:w-[100%]">
        <Menu as="div" className="inline-block text-left md:w-[100%] ">
          {({ open, close }) => (
            <>
              <Menu.Button
                className={`flex items-center border md:w-[100%] md:text-[${
                  promotions?.length > 2 ? "10px" : "14px"
                }] text-[10px] md:px-4 px-2 md:py-[4px] py-[3px] rounded-md font-medium bg-white text-black hover:bg-gray-100 flex items-center`}
              >
                {iconMap[displayLabel]} {displayLabel}
                <ChevronDownIcon className="w-4 h-4 ml-auto" />
              </Menu.Button>

              {open && (
                <Menu.Items className="md:absolute relative mt-1 w-auto md:w-[100%] bg-white border rounded-md shadow-lg md:max-h-60 md:overflow-auto p-2 z-50">
                  {options.map((option) => (
                    <div key={option}>
                      <Button
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={` w-full border-[1px] key-text border-gray-200 font-medium px-4 py-1 rounded-[4px] mb-[2px]  text-left flex items-center ${
                          promotions?.includes(option)
                            ? "bg-[#5297ff] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <span>{iconMap[option]}</span>
                        {option}
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end mt-2">
                    <CustomTooltip
                      label="Access Restricted Contact Admin"
                      position="bottom"
                      tooltipBg="bg-black/60 backdrop-blur-md"
                      tooltipTextColor="text-white py-2 px-4 font-medium"
                      labelCls="text-[10px] font-medium"
                      showTooltip={!hasPermission("company", "edit")}
                    >
                      <Button
                        disabled={!hasPermission("company", "edit")}
                        className="bg-[#5297ff] key-text font-medium text-white md:px-3 px-1 md:py-1 py-1 md:rounded-[8px] rounded-[4px]"
                        onClick={() => {
                          handleClose();
                          close();
                        }}
                      >
                        Apply
                      </Button>
                    </CustomTooltip>
                  </div>
                </Menu.Items>
              )}
            </>
          )}
        </Menu>
      </div>
    );
  };
  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6 flex flex-col md:flex-row gap-6">
      {/* Company Logo */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <div className="relative w-[90px] h-[90px] md:w-[130px] md:h-[130px] rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50">
          <Image
            fill
            className="object-cover"
            src={Logo[0] || "/images/companylogo.jpg"}
            alt="company logo"
          />
        </div>
      </div>

      {/* Company Info Grid */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoItem
          icon={<LuLandmark className="text-[#3586FF]" />}
          label="Company Name"
          value={companyName}
        />
        <InfoItem
          icon={<LuHourglass className="text-[#3586FF]" />}
          label="Established Year"
          value={estdYear}
        />
        <InfoItem
          icon={<LuBriefcase className="text-[#3586FF]" />}
          label="About Company"
          value={`${about?.slice(0, 80)}...`}
        />
        <InfoItem
          icon={<LuUser className="text-[#3586FF]" />}
          label="Developer Name"
          value={developerInformation?.fullName}
        />
        <InfoItem
          icon={<LuBadge className="text-[#3586FF]" />}
          label="RERA ID"
          value={RERAId}
        />
        <InfoItem
          icon={<LuMail className="text-[#3586FF]" />}
          label="Developer Email"
          value={developerInformation?.email}
        />
      </div>

      {/* Actions Section */}
      <div className="md:w-[180px] flex md:flex-col gap-2 justify-between items-start">
        {/* Status Badge */}
        {statusBadge && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusBadge.color}`}>
            {statusBadge.icon}
            {statusBadge.label}
          </div>
        )}

        {/* Approval Info */}
        {isApproved && approvedBy && (
          <p className="text-[10px] text-gray-500">
            By: <span className="text-emerald-600">{approvedBy}</span>
            {approvedDate && ` • ${new Date(approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
          </p>
        )}

        {/* Approval Actions */}
        {isPendingApproval && handleApprove && handleReject && (
          <div className="flex gap-1.5 w-full">
            <Button
              className="flex-1 py-1 rounded text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"
              onClick={handleApprove}
              disabled={!hasPermission("company", "edit")}
            >
              <CheckCircle className="w-3 h-3" /> Approve
            </Button>
            <Button
              className="flex-1 py-1 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1"
              onClick={() => setShowRejectModal(true)}
              disabled={!hasPermission("company", "edit")}
            >
              <XCircle className="w-3 h-3" /> Reject
            </Button>
          </div>
        )}

        {/* Publish Actions for Drafts */}
        {isDraft && handlePublish && (
          <div className="flex flex-col gap-1.5 w-full">
            <Button
              className="w-full py-1 rounded text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"
              onClick={() => handlePublish(true)}
              disabled={!hasPermission("company", "edit")}
            >
              <CheckCircle className="w-3 h-3" /> Publish & Approve
            </Button>
            <Button
              className="w-full py-1 rounded text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center justify-center gap-1"
              onClick={() => handlePublish(false)}
              disabled={!hasPermission("company", "edit")}
            >
              <Eye className="w-3 h-3" /> Publish Only
            </Button>
          </div>
        )}

        {renderDropdown("Promotion Badge", "promotionBadge", [
          "Featured",
          "Sponsored",
          "Verified",
          "Premium",
          "Top",
          "Popular",
        ])}

        <div className="flex items-center gap-2">
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("company", "edit")}
          >
            <Button
              onClick={onClick}
              className="bg-[#3586FF] hover:bg-[#2563eb] text-white py-1.5 px-3 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
            >
              <FaEdit className="w-3 h-3" /> Edit
            </Button>
          </CustomTooltip>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("company", "delete")}
          >
            <Button
              disabled={!hasPermission("company", "delete")}
              className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
              onClick={() => handleDelete(id)}
            >
              <FaTrash className="w-3 h-3" /> Delete
            </Button>
          </CustomTooltip>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Company</h3>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none"
              rows={3}
              placeholder="Enter rejection reason (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button
                className="flex-1 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
                onClick={() => { handleReject(rejectReason); setShowRejectModal(false); setRejectReason(''); }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 text-lg">{icon}</div>
    <div className="flex flex-col min-w-0">
      <p className="sublabel-text text-gray-500 font-medium">{label}</p>
      <p className="label-text font-medium text-gray-800 truncate">{value || "—"}</p>
    </div>
  </div>
);

const Meta = ({ icon, text }: { icon?: JSX.Element; text: string }) => (
  <span className="inline-flex items-center gap-1.5 sublabel-text px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-600 shrink-0">
    {icon} <span className="truncate max-w-[10rem] md:max-w-none">{text}</span>
  </span>
);

const ComCompanyRow = (props: any) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start md:items-center gap-4 min-w-0">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
          <Image
            fill
            className="object-cover"
            src={props.Logo?.[0] || "/images/companylogo.jpg"}
            alt={`${props.companyName} logo`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h3 className="label-text font-semibold text-gray-800 line-clamp-1">
              {props.companyName}
            </h3>
            <span className="sublabel-text text-gray-500">
              • Estd. {props.estdYear || "—"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <Meta
              icon={<LuUser className="w-3.5 h-3.5" />}
              text={props.developerInformation?.fullName || "—"}
            />
            <Meta icon={<LuBadge className="w-3.5 h-3.5" />} text={props.RERAId || "—"} />
            <Meta
              icon={<LuMail className="w-3.5 h-3.5" />}
              text={props.developerInformation?.email || "—"}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 md:flex-shrink-0">
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!props.hasPermission("company", "edit")}
        >
          <Button
            className="bg-[#3586FF] hover:bg-[#2563eb] text-white py-2 px-4 rounded-lg btn-text font-medium flex items-center gap-2 transition-all"
            onClick={props.onClick}
            disabled={!props.hasPermission("company", "edit")}
          >
            <FaEdit className="w-3.5 h-3.5" /> Edit
          </Button>
        </CustomTooltip>

        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!props.hasPermission("company", "delete")}
        >
          <Button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg btn-text font-medium flex items-center gap-2 transition-all"
            onClick={() => props.handleDelete(props.id)}
            disabled={!props.hasPermission("company", "delete")}
          >
            <FaTrash className="w-3.5 h-3.5" /> Delete
          </Button>
        </CustomTooltip>
      </div>
    </div>
  </div>
);
