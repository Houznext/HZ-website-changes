import Button from "@/src/common/Button";
import CustomMultiSelect from "@/src/common/customMultiSelect";
import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import apiClient from "@/src/utils/apiClient";
import React, { useEffect, useState } from "react";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import Modal from "@/src/common/Modal";
import toast from "react-hot-toast";
import { 
  FiSearch, 
  FiBriefcase, 
  FiMapPin, 
  FiUsers, 
  FiClock, 
  FiAward, 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiPlus, 
  FiX,
  FiSave,
  FiFilter,
  FiChevronDown,
  FiCheck,
  FiRefreshCw,
  FiCalendar,
  FiLayers
} from "react-icons/fi";
import { Briefcase, Building2, GraduationCap, Users, Sparkles } from "lucide-react";

const JobTypes = [
  {
    id: 1,
    name: "Full Time",
  },
  {
    id: 2,
    name: "Part Time",
  },
  {
    id: 3,
    name: "Intern",
  },
  {
    id: 4,
    name: "Temporary",
  },
];

interface IFormValues {
  jobTitle: string;
  location: string;
  openings: number;
  jobDescription: string;
  jobDepartmentId: number;
  jobRoleId: number;
  experience: string;
  skills: Array<any>;
  qualification: string;
  jobType: string;
  jobHighlights?: string;
}
interface Option {
  id: number | string;
  name: string;
}
interface ICustomFormProps {
  closeDrawer: () => void;
  editingJob?: any;
}

const CareerAdminView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [careers, setCareers] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [editingJob, setEditingJob] = useState<any>(null);
  const [viewJob, setViewJob] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { hasPermission } = usePermissionStore((state) => state);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${apiClient.URLS.careers}`);
      if (response.status === 200) {
        setCareers(response.body || []);
      }
    } catch (e) {
      console.log("Error occurred while fetching careers", e);
      toast.error("Failed to fetch job listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter((career: any) => {
    const matchesSearchText =
      !searchText ||
      career?.jobTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      career?.jobDepartment?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      career?.location?.toLowerCase().includes(searchText.toLowerCase());

    const matchesJobType = !selectedJobType || career?.jobType === selectedJobType;

    return matchesSearchText && matchesJobType;
  });

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setOpenModal(true);
  };

  const handleView = (job: any) => {
    setViewJob(job);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (job: any) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      setDeleteLoading(true);
      const response = await apiClient.delete(
        `${apiClient.URLS.careers}/${jobToDelete.id}`,
        {},
        true
      );
      if (response.status === 200) {
        toast.success("Job listing deleted successfully");
        fetchCareers();
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete job listing");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingJob(null);
    fetchCareers();
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setOpenModal(true);
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  // Stats
  const totalJobs = careers.length;
  const totalOpenings = careers.reduce((acc: number, job: any) => acc + (job.openings || 0), 0);
  const jobTypeCount = JobTypes.reduce((acc: any, type) => {
    acc[type.name] = careers.filter((j: any) => j.jobType === type.name).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="mx-auto max-w-8xl space-y-5">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Careers Portal</h1>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Manage job listings & applications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCareers}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <CustomTooltip
                label="Access Restricted"
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                showTooltip={!hasPermission("careers", "create")}
              >
                <button
                  onClick={handleAddNew}
                  disabled={!hasPermission("careers", "create")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Job</span>
                </button>
              </CustomTooltip>
            </div>
          </div>

          {/* Stats Row */}
          <div className="relative mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                <FiBriefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalJobs}</p>
                <p className="text-xs text-slate-500">Total Jobs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalOpenings}</p>
                <p className="text-xs text-slate-500">Total Openings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{jobTypeCount["Full Time"] || 0}</p>
                <p className="text-xs text-slate-500">Full Time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{jobTypeCount["Intern"] || 0}</p>
                <p className="text-xs text-slate-500">Internships</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <CustomInput
                name="search"
                placeholder="Search by job title, department, or location..."
                onChange={(e) => setSearchText(e.target.value)}
                type="text"
                value={searchText}
                leftIcon={<FiSearch className="w-4 h-4" />}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  selectedJobType 
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>{selectedJobType || 'All Types'}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10">
                  <button
                    onClick={() => { setSelectedJobType(''); setFilterOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${!selectedJobType ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                  >
                    {!selectedJobType && <FiCheck className="w-4 h-4" />}
                    <span className={!selectedJobType ? '' : 'ml-6'}>All Types</span>
                  </button>
                  {JobTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedJobType(type.name); setFilterOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${selectedJobType === type.name ? 'text-blue-600 font-medium' : 'text-slate-600'}`}
                    >
                      {selectedJobType === type.name && <FiCheck className="w-4 h-4" />}
                      <span className={selectedJobType === type.name ? '' : 'ml-6'}>{type.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Cards Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200/60 bg-white p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 bg-slate-200 rounded" />
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCareers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Job Listings Found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                {searchText || selectedJobType 
                  ? "No jobs match your search criteria. Try adjusting your filters."
                  : "Start by creating your first job listing to attract talented candidates."}
              </p>
              {!searchText && !selectedJobType && hasPermission("careers", "create") && (
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25"
                >
                  <FiPlus className="w-4 h-4" />
                  Create First Job
                </button>
              )}
            </div>
          ) : (
            filteredCareers.map((job: any) => (
              <JobCard
                key={job.id}
                job={job}
                handleEdit={handleEdit}
                handleView={handleView}
                handleDelete={handleDeleteClick}
                hasPermission={hasPermission}
              />
            ))
          )}
        </div>
      </div>

      {/* Job Form Drawer */}
      <Drawer
        open={openModal}
        handleDrawerToggle={() => setOpenModal(false)}
        closeIconCls="hidden"
        openVariant="right"
        panelCls="w-[95%] sm:w-[90%] lg:w-[calc(100%-200px)] shadow-2xl"
        overLayCls="bg-slate-900/60 backdrop-blur-sm"
      >
        <JobForm closeDrawer={handleClose} editingJob={editingJob} />
      </Drawer>

      {/* View Job Modal */}
      <Modal
        isOpen={viewModalOpen}
        closeModal={() => setViewModalOpen(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[700px] w-[95%] !p-0 overflow-hidden max-h-[90vh]"
        rootCls="z-[9999]"
      >
        {viewJob && (
          <div className="overflow-y-auto max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiBriefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{viewJob.jobTitle}</h3>
                    <p className="text-blue-100 text-sm">{viewJob.jobDepartment?.name} • {viewJob.jobRole?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewModalOpen(false)} 
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <FiX className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Quick Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" /> {viewJob.location}
                  </p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Experience</p>
                  <p className="text-sm font-semibold text-slate-800">{viewJob.experience}</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Job Type</p>
                  <p className="text-sm font-semibold text-slate-800">{viewJob.jobType}</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Openings</p>
                  <p className="text-sm font-semibold text-slate-800">{viewJob.openings} positions</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-blue-500" /> Job Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">{viewJob.jobDescription}</p>
              </div>

              {/* Qualification */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <FiAward className="w-4 h-4 text-blue-500" /> Qualification
                </h4>
                <p className="text-sm text-slate-600">{viewJob.qualification}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewJob.skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              {viewJob.jobHighlights && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Job Highlights</h4>
                  <div 
                    className="text-sm text-slate-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: viewJob.jobHighlights }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        closeModal={() => setDeleteModalOpen(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[400px] w-[90%] !p-0 overflow-hidden"
        rootCls="z-[9999]"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <FiTrash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Job Listing?</h3>
          <p className="text-sm text-slate-500 mb-6">
            Are you sure you want to delete &quot;{jobToDelete?.jobTitle}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? (
                <FiRefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FiTrash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CareerAdminView;

const JobForm = ({ closeDrawer, editingJob }: ICustomFormProps) => {
  const [formValues, setFormValues] = useState<IFormValues>({
    jobTitle: "",
    location: "",
    openings: 0,
    jobDescription: "",
    jobDepartmentId: 0,
    jobRoleId: 0,
    experience: "",
    skills: [],
    qualification: "",
    jobType: "",
    jobHighlights: undefined,
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const skillOptions = [
    { id: 1, name: "JavaScript" },
    { id: 2, name: "React" },
    { id: 3, name: "Node.js" },
    { id: 4, name: "CSS" },
    { id: 5, name: "TypeScript" },
    { id: 6, name: "Python" },
    { id: 7, name: "Java" },
    { id: 8, name: "SQL" },
    { id: 9, name: "Communication" },
    { id: 10, name: "Leadership" },
    { id: 11, name: "Sales" },
    { id: 12, name: "Marketing" },
    { id: 13, name: "Excel" },
    { id: 14, name: "Design" },
    { id: 15, name: "AutoCAD" },
  ];

  const [jobDepId, setJobDepId] = useState<Option[]>([]);
  const [RoleId, setRoleId] = useState<{ id: number; title: string }[]>([]);

  const handleChange = (name: string, value: any) => {
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
    
    if (name === "jobDepartmentId" || name === "jobRoleId") {
      setFormValues((prev) => ({
        ...prev,
        [name]: value.id,
      }));
    } else if (name === "skills") {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formValues.jobTitle?.trim()) newErrors.jobTitle = "Job Title is required";
    if (!formValues.location?.trim()) newErrors.location = "Location is required";
    if (!formValues.openings || formValues.openings <= 0) newErrors.openings = "Number of openings is required";
    if (!formValues.jobDescription?.trim()) newErrors.jobDescription = "Job Description is required";
    if (!formValues.jobType) newErrors.jobType = "Job Type is required";
    if (!formValues.jobDepartmentId) newErrors.jobDepartmentId = "Job Department is required";
    if (!formValues.jobRoleId) newErrors.jobRoleId = "Job Role is required";
    if (!formValues.experience?.trim()) newErrors.experience = "Experience is required";
    if (!formValues.qualification?.trim()) newErrors.qualification = "Qualification is required";
    if (!formValues.skills?.length) newErrors.skills = "At least one skill is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (editingJob) {
      setFormValues({
        jobTitle: editingJob.jobTitle || "",
        location: editingJob.location || "",
        openings: editingJob.openings || 0,
        jobDescription: editingJob.jobDescription || "",
        jobDepartmentId: editingJob.jobDepartment?.id || 0,
        jobRoleId: editingJob.jobRole?.id || 0,
        experience: editingJob.experience || "",
        skills: Array.isArray(editingJob.skills)
          ? editingJob.skills.map((skill: any) =>
              typeof skill === "string" ? { id: skill, name: skill } : skill
            )
          : [],
        qualification: editingJob.qualification || "",
        jobType: editingJob.jobType || "",
        jobHighlights: editingJob.jobHighlights || "",
      });
    }
  }, [editingJob]);

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...formValues,
      skills: formValues.skills.map((item: any) => item.name),
    };

    try {
      setLoading(true);
      if (editingJob) {
        const response = await apiClient.patch(`${apiClient.URLS.careers}`, {
          ...payload,
          id: editingJob.id,
        }, true);
        if (response.status === 200) {
          toast.success("Job listing updated successfully!");
        }
      } else {
        const response = await apiClient.post(`${apiClient.URLS.careers}`, payload, true);
        if (response.status === 200 || response.status === 201) {
          toast.success("Job listing created successfully!");
        }
      }
      closeDrawer();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save job listing");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDepartmentId = async () => {
    try {
      const response = await apiClient.get(`${apiClient.URLS.careers}/departments`);
      if (response.status === 200) {
        const departments = response.body.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
        setJobDepId(departments);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRoleId = async () => {
    if (formValues.jobDepartmentId === 0) return;
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.careers}/department/${formValues.jobDepartmentId}`
      );
      if (response.status === 200) {
        const roles = response.body.map((item: any) => ({
          id: item.id,
          title: item.title,
        }));
        setRoleId(roles);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchJobDepartmentId();
  }, []);

  useEffect(() => {
    if (formValues.jobDepartmentId !== 0) {
      fetchRoleId();
    }
  }, [formValues.jobDepartmentId]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {editingJob ? <FiEdit3 className="w-5 h-5 text-white" /> : <FiPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingJob ? "Edit Job Listing" : "Create New Job"}
              </h2>
              <p className="text-blue-100 text-sm">Fill in the job details below</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Required Fields Notice */}
      <div className="flex-shrink-0 px-6 py-3 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700 flex items-center gap-2">
          <span className="text-red-500">*</span> All marked fields are required
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiBriefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Basic Information</h3>
                <p className="text-xs text-slate-500">Job title and location details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                name="jobTitle"
                label="Job Title"
                placeholder="e.g. Senior Software Engineer"
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                type="text"
                value={formValues.jobTitle}
                errorMsg={errors.jobTitle}
                required
              />
              <CustomInput
                name="location"
                label="Location"
                placeholder="e.g. Bangalore, India"
                onChange={(e) => handleChange("location", e.target.value)}
                type="text"
                value={formValues.location}
                errorMsg={errors.location}
                leftIcon={<FiMapPin className="w-4 h-4" />}
                required
              />
            </div>
          </div>

          {/* Section 2: Department & Role */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Department & Role</h3>
                <p className="text-xs text-slate-500">Select department and specific role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleSelect
                type="single-select"
                label="Job Department"
                name="jobDepartmentId"
                options={jobDepId}
                handleChange={handleChange}
                selectedOption={{
                  id: formValues.jobDepartmentId || jobDepId[0]?.id,
                  name: jobDepId.find((item) => item.id === formValues.jobDepartmentId)?.name || "Select Department",
                }}
                optionsInterface={{ isObj: true, displayKey: "name" }}
                errorMsg={errors.jobDepartmentId}
                required
              />
              <SingleSelect
                type="single-select"
                label="Job Role"
                name="jobRoleId"
                options={RoleId}
                handleChange={handleChange}
                selectedOption={{
                  id: formValues.jobRoleId || RoleId[0]?.id,
                  title: RoleId.find((item) => item.id === formValues.jobRoleId)?.title || "Select Role",
                }}
                optionsInterface={{ isObj: true, displayKey: "title" }}
                errorMsg={errors.jobRoleId}
                required
              />
            </div>
          </div>

          {/* Section 3: Job Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiLayers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Job Details</h3>
                <p className="text-xs text-slate-500">Type, openings, and requirements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SingleSelect
                type="single-select"
                name="jobType"
                label="Job Type"
                optionsInterface={{ isObj: true, displayKey: "name" }}
                options={JobTypes}
                selectedOption={{
                  id: JobTypes.find((t) => t.name === formValues.jobType)?.id || 0,
                  name: formValues.jobType || "Select Type",
                }}
                handleChange={(name, value) => handleChange("jobType", value.name)}
                errorMsg={errors.jobType}
                required
              />
              <CustomInput
                name="openings"
                label="Number of Openings"
                placeholder="e.g. 5"
                onChange={(e) => handleChange("openings", parseInt(e.target.value) || 0)}
                type="number"
                value={formValues.openings}
                errorMsg={errors.openings}
                leftIcon={<FiUsers className="w-4 h-4" />}
                required
              />
              <CustomInput
                name="experience"
                label="Experience Required"
                placeholder="e.g. 2-4 years"
                onChange={(e) => handleChange("experience", e.target.value)}
                type="text"
                value={formValues.experience}
                errorMsg={errors.experience}
                leftIcon={<FiClock className="w-4 h-4" />}
                required
              />
            </div>

            <CustomInput
              name="qualification"
              label="Qualification"
              placeholder="e.g. Bachelor's in Computer Science or equivalent"
              onChange={(e) => handleChange("qualification", e.target.value)}
              type="text"
              value={formValues.qualification}
              errorMsg={errors.qualification}
              leftIcon={<FiAward className="w-4 h-4" />}
              required
            />

            <CustomMultiSelect
              label="Required Skills"
              options={skillOptions}
              selectedOptions={formValues.skills}
              onChange={(selected: Option[]) => handleChange("skills", selected)}
              errorMsg={errors.skills}
            />
          </div>

          {/* Section 4: Description */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <FiLayers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Description & Highlights</h3>
                <p className="text-xs text-slate-500">Detailed job information</p>
              </div>
            </div>

            <CustomInput
              name="jobDescription"
              label="Job Description"
              placeholder="Describe the role, responsibilities, and expectations..."
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              type="textarea"
              value={formValues.jobDescription}
              errorMsg={errors.jobDescription}
              required
            />

            <div>
              <label className="mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide">
                Job Highlights (Optional)
              </label>
              <RichTextEditor
                type="richtext"
                className="min-h-[150px] rounded-xl border-2 border-slate-200"
                placeholder="Add key highlights, perks, and benefits..."
                value={formValues.jobHighlights}
                onChange={(e: any) => handleChange("jobHighlights", e)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
        <button
          onClick={closeDrawer}
          className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:bg-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? (
            <FiRefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {editingJob ? "Update Job" : "Publish Job"}
        </button>
      </div>
    </div>
  );
};

const JobCard = ({ job, handleEdit, handleView, handleDelete, hasPermission }: any) => {
  const jobTypeColors: Record<string, string> = {
    "Full Time": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Part Time": "bg-blue-100 text-blue-700 border-blue-200",
    "Intern": "bg-purple-100 text-purple-700 border-purple-200",
    "Temporary": "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Side - Main Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="hidden sm:flex w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Briefcase className="w-7 h-7" />
            </div>

            {/* Title & Department */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {job?.jobTitle}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {job?.jobDepartment?.name} • {job?.jobRole?.title}
                  </p>
                </div>
                
                {/* Job Type Badge */}
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${jobTypeColors[job?.jobType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {job?.jobType}
                </span>
              </div>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                  <FiMapPin className="w-3.5 h-3.5" />
                  {job?.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                  <FiClock className="w-3.5 h-3.5" />
                  {job?.experience}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                  <FiAward className="w-3.5 h-3.5" />
                  {job?.qualification}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <FiUsers className="w-3.5 h-3.5" />
                  {job?.openings} {job?.openings === 1 ? 'Opening' : 'Openings'}
                </span>
              </div>

              {/* Skills */}
              {job?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.skills.slice(0, 5).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex lg:flex-col items-center gap-2 lg:border-l lg:border-slate-100 lg:pl-5">
          <button
            onClick={() => handleView(job)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <FiEye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </button>

          <CustomTooltip
            label="Access Restricted"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("careers", "edit")}
          >
            <button
              onClick={() => handleEdit(job)}
              disabled={!hasPermission("careers", "edit")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiEdit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </CustomTooltip>

          <CustomTooltip
            label="Access Restricted"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("careers", "delete")}
          >
            <button
              onClick={() => handleDelete(job)}
              disabled={!hasPermission("careers", "delete")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};
