import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import SearchComponent from "@/src/common/SearchSelect";
import { CSVLink } from "react-csv";
import FileInput from "@/src/common/FileInput";
import { MapPin } from "lucide-react";
import { HiOutlineDocument } from "react-icons/hi";
import { useTourGuide } from "../TourGuide/TourGuideProvider";
import { TourStep } from "../TourGuide/TourStep";
import { HelpCircle } from "lucide-react";
import {
  getCurrentAddress,
} from "@/src/utils/locationDetails/datafetchingFunctions";
import Loader from "@/src/components/SpinLoader";
import {
  dailyStatus,
  getIcon,
  DayProgressTableHeader,
  keyLabelMap,
  getStatusIcon,
  getStatusClasses,
  placeTypeMap,
  commercialPlaceTypeMap,
  workTypeMap,
  phaseWorkTypeMap,
  commercialPhaseWorkTypeMap,
  workTypePlaceMap,
  commercialWorkTypePlaceMap,
} from "../helper";
import { EditIcon } from "@/src/common/Icons";
import { MdEdit } from "react-icons/md";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from "next/image";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { MdDateRange, MdFileDownload } from "react-icons/md";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import { MdPending } from "react-icons/md";
import { BsCheck2Circle } from "react-icons/bs";
import { TbProgressBolt } from "react-icons/tb";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { Loader as LoaderIcon } from "lucide-react";
import {
  FaEdit,
  FaEye,
  FaFileInvoice,
  FaChartLine,
  FaInfoCircle,
} from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import PaginationControls from "@/src/components/CrmView/pagination";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import Trends from "./ProgressTrend";
import { useSession } from "next-auth/react";
interface PhaseButtonsInnerProps {
  activePhaseId: number | null;
  openCreatePhase: () => void;
  openEditPhase: (id: number) => void;
  onDeletePhase: (id: number) => void;
  onRecomputePhases: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  openDeleteModal: boolean;
  setOpenDeleteModal: (v: boolean) => void;
}

// ---- Types ----
interface FilterOption {
  id: string;
  label: string;
}
export type FiltersState = {
  [group: string]: Record<string | number, boolean>;
};

type Phase = {
  id: number;
  order: number;
  name: string;
  plannedDays: number;
  plannedCost: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualDays: number;
  actualCost: number;
};

type Estimate = { estimatedCost: number; estimatedDays: number };
type EstimatesMap = { [serviceName: string]: Estimate };

// ---- Component ----
export const DayProgress = () => {
  const {
    daysEstimated,
    setDaysEstimated,
    dayProgress,
    updateDayProgressLog,
    currentDay,
    customerOnboarding,
    addDayProgressLog,
    custom_builder_id,
    setCustomBuilderID,
    setCurrentDay,
  } = useCustomBuilderStore();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { hasPermission } = usePermissionStore((state) => state);

  const addProgressRef = React.useRef<HTMLDivElement | null>(null);
  const searchFilterRef = React.useRef<HTMLDivElement | null>(null);
  const exportRef = React.useRef<HTMLDivElement | null>(null);
  const invoicesRef = React.useRef<HTMLDivElement | null>(null);
  const trendsRef = useRef(null);

  // ---- Phase State ----
  const [phases, setPhases] = useState<Phase[]>([]);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [editPhaseId, setEditPhaseId] = useState<number | null>(null);
  const session = useSession();
  const [user, setUser] = useState<any>();
  const [phaseForm, setPhaseForm] = useState<Partial<Phase>>({
    order: 1,
    name: "",
    plannedDays: 0,
    plannedCost: null,
    plannedStart: null,
    plannedEnd: null,
  });
  const [phaseErrors, setPhaseErrors] = useState<Record<string, string>>({});

  // ---- Logs + Progress State ----
  const [workdata, setWorkdata] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    workType: {},
  });
  const [currentpage, setCurrentPage] = useState(1);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  type UploadLocation = {
    locality?: string;
    subLocality?: string;
    place_id?: string;
    addressLine?: string;
    accuracyMeters?: number;
    city?: string;
    state?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };

  const [currentLocation, setCurrentLocation] = useState<UploadLocation | null>(
    null,
  );

  const writeLocation = (location: UploadLocation) =>
    setCurrentLocation(location);

  const [serviceEstimates, setServiceEstimates] = useState<EstimatesMap>({});
  const [estimates, setEstimates] = useState<EstimatesMap>({});
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [servicedayAndCostEstimation, setserviceDayAndCostEstimation] =
    useState({
      estimatedDays: 0,
      estimatedCost: 0,
    });
  const [openServicesModal, setOpenServicesModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const activePhase = phases.find((p) => p.id === activePhaseId);
  const activePhaseName = activePhase?.name;

  // ---- Fetch Phases ----
  const fetchPhases = async () => {
    if (!custom_builder_id) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.phases}/${custom_builder_id}`,
      );
      if (res.status === 200) {
        const list: Phase[] = (res.body || []).map((p: any) => ({
          ...p,
          plannedStart: p.plannedStart ? String(p.plannedStart) : null,
          plannedEnd: p.plannedEnd ? String(p.plannedEnd) : null,
        }));
        setPhases(list);
        // if (!activePhaseId && list.length) setActivePhaseId(list[0].id);
        if (activePhaseId === undefined || activePhaseId === null) {
          setActivePhaseId(null);
          setSelectPhase("All Phases");
        }
        await fetchDetails();
      }
    } catch (err) {
      toast.error("Failed to fetch phases");
    }
  };
  const hasPhases = phases && phases.length > 0;

  const handleServiceEstimationChange = (field: string, value: number) => {
    setserviceDayAndCostEstimation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEstimationChange = (name: string, value: any) => {
    setDayAndCostEstimation((prev) => {
      return { ...prev, [name]: value };
    });
  };
  const handleserviceEstimationEdit = (serviceName: string) => {
    const existing = estimates?.[serviceName];

    if (!existing) return;

    setActiveService(serviceName);
    setserviceDayAndCostEstimation({
      estimatedCost: existing.estimatedCost ?? 0,
      estimatedDays: existing.estimatedDays ?? 0,
    });
    setOpenServicesModal(true);
  };


  const handleEstimationEdit = () => {
    setDayAndCostEstimation({
      estimatedCost: Number(estimatedCost),
      estimatedDays: daysEstimated,
    });
    setDaysEstimated(null);
  };
  const handleServiceEstimationSubmit = async () => {
    if (!activeService) {
      toast.error("No service selected");
      return;
    }
    const isValid = validateServiceDayAndCostEstimation();
    if (!isValid) return;

    const updated: EstimatesMap = {
      ...estimates,
      [activeService]: {
        estimatedDays: servicedayAndCostEstimation.estimatedDays,
        estimatedCost: servicedayAndCostEstimation.estimatedCost ?? 0,
      },
    };

    try {
      const response = await apiClient.patch(
        `${apiClient.URLS.cb_services}/${custom_builder_id}/update-estimates`,
        updated,
        true,
      );

      if (response.status === 200) {
        toast.success("Estimates updated successfully!");
      }
      setServiceEstimates(updated);
      setEstimates(updated);

      setserviceDayAndCostEstimation({ estimatedDays: 0, estimatedCost: 0 });
      setEstimationErrors({});
      setActiveService(null);
      setOpenServicesModal(false);
    } catch (error) {
      console.error("Error updating estimates:", error);
      toast.error("Failed to update estimates.");
    }
  };
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);
  const [scope, setScope] = useState("");
  const [constructionType, setConstructionType] = useState("");
  const [totalFloors, setTotalFloors] = useState(null);

  const activePhaseMap = constructionType === "Commercial" ? commercialPhaseWorkTypeMap : phaseWorkTypeMap;

  const filteredWorkTypes = !hasPhases
    ? selectedServices
    : activePhaseName && activePhaseMap[activePhaseName]
      ? selectedServices.filter((item) =>
        activePhaseMap[activePhaseName].includes(item.value),
      )
      : selectedServices;

  const visiblePhases = phases.filter((phase) => {
    const allowedServices = activePhaseMap[phase.name];
    if (!allowedServices) return true;
    return selectedServices.some((s) => allowedServices.includes(s.value));
  });

  // ---- Fetch Logs ----
  const fetchDetails = async () => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}`,
        {},
        true,
      );
      if (response.status === 200) {
        let log = response?.body?.logs || [];
        log = log.sort((a, b) => a.day - b.day);
        setCurrentDay(response?.body?.currentDay + 1);

        log.forEach((log: any) => {
          const existingLog = dayProgress.logs.find(
            (storeLog) => storeLog.id === log.id,
          );
          if (!existingLog) {
            addDayProgressLog({ ...log });
          }
        });
        const scope =
          response?.body?.propertyInformation?.construction_scope?.toLowerCase();
        const cType =
          response?.body?.propertyInformation?.construction_type || "";

        const totalFloors =
          scope === "interior"
            ? response?.body?.propertyInformation?.interior_info?.totalFloors
            : cType === "Commercial"
              ? response?.body?.propertyInformation?.commercial_construction_info?.total_floors
              : response?.body?.propertyInformation?.house_construction_info
                ?.total_floors;

        setScope(scope);
        setConstructionType(cType);
        setTotalFloors(totalFloors);

        // setSelectedServices(
        //   response?.body?.servicesRequired?.selectedServices?.map((item) => ({
        //     label: item?.charAt(0)?.toUpperCase() + item?.slice(1),
        //     value: item,
        //   })) || []
        // );
        setSelectedServices(
          response?.body?.servicesRequired?.selectedServices?.map((item) => ({
            label: item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(),
            value: item.toLowerCase(),
          })) || [],
        );

        setDaysEstimated(response?.body?.estimatedDays);
        setServiceEstimates(
          response?.body?.servicesRequired?.serviceEstimates || {},
        );
        setEstimates(response?.body?.servicesRequired?.serviceEstimates || {});
        setWorkdata(log);
      }
    } catch (err) {
      toast.error("Failed to fetch details");
    } finally {
      setIsLoading(false);
    }
  };
  const [estimationErrors, setEstimationErrors] = useState<any>({});
  const [selectPhase, setSelectPhase] = useState<string | null>(null);

  const [dayAndCostEstimation, setDayAndCostEstimation] = useState<{
    estimatedDays: number;
    estimatedCost: number;
  }>({
    estimatedDays: 0,
    estimatedCost: 0,
  });
  const [estimatedCost, setEstimatedCost] = useState<number | null>(0);
  const validateServiceDayAndCostEstimation = () => {
    const newErrors: any = {};

    if (
      !servicedayAndCostEstimation.estimatedDays ||
      servicedayAndCostEstimation.estimatedDays <= 0
    ) {
      newErrors.estimatedDays = "Estimated days is required";
    }

    if (
      !servicedayAndCostEstimation.estimatedCost ||
      servicedayAndCostEstimation.estimatedCost <= 0
    ) {
      newErrors.estimatedCost = "Estimated cost is required";
    }

    setEstimationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Effects ----
  useEffect(() => {
    if (custom_builder_id) {
      fetchPhases();
      fetchDetails();
    }
  }, [custom_builder_id]);

  useEffect(() => {
    if (router.isReady) {
      setCustomBuilderID(String(router.query.userId));
    }
  }, [router.isReady]);
  // -----------------------------
  // Phase: Validation & Handlers
  // -----------------------------
  const validatePhaseForm = () => {
    const e: Record<string, string> = {};
    if (!phaseForm.name?.trim()) e.name = "Phase name is required";
    if (
      phaseForm.order === undefined ||
      phaseForm.order === null ||
      Number.isNaN(Number(phaseForm.order))
    ) {
      e.order = "Order is required";
    }
    if (
      phaseForm.plannedStart &&
      phaseForm.plannedEnd &&
      new Date(phaseForm.plannedStart) > new Date(phaseForm.plannedEnd)
    ) {
      e.range = "Planned start must be before planned end";
    }
    setPhaseErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreatePhase = () => {
    setEditPhaseId(null);
    setPhaseForm({
      order: (phases?.length || 0) + 1,
      name: "",
      plannedDays: 0,
      plannedCost: null,
      plannedStart: null,
      plannedEnd: null,
    });
    setPhaseErrors({});
    setPhaseModalOpen(true);
  };

  const openEditPhase = (id: number) => {
    const p = phases.find((x) => x.id === id);
    if (!p) return;
    setEditPhaseId(p.id);
    setPhaseForm({
      order: p.order,
      name: p.name,
      plannedDays: p.plannedDays,
      plannedCost: p.plannedCost,
      plannedStart: p.plannedStart,
      plannedEnd: p.plannedEnd,
    });
    setPhaseErrors({});
    setPhaseModalOpen(true);
  };

  // Create = bulkReplace (append new to existing list then POST)
  const onCreatePhase = async () => {
    if (!custom_builder_id) return;
    if (!validatePhaseForm()) return;

    const payload = [
      ...phases.map((p) => ({
        order: p.order,
        name: p.name,
        plannedDays: p.plannedDays,
        plannedCost: p.plannedCost ? Number(p.plannedCost) : null,
        plannedStart: p.plannedStart,
        plannedEnd: p.plannedEnd,
      })),
      {
        order: (phaseForm.order as number) ?? phases.length + 1,
        name: phaseForm.name!,
        plannedDays: phaseForm.plannedDays ?? 0,
        plannedCost: phaseForm.plannedCost
          ? Number(phaseForm.plannedCost)
          : null,
        plannedStart: phaseForm.plannedStart ?? null,
        plannedEnd: phaseForm.plannedEnd ?? null,
      },
    ];

    try {
      const res = await apiClient.post(
        `${apiClient.URLS.phases}/${custom_builder_id}`,
        payload,
        true,
      );
      if (res.status === 201 || res.status === 200) {
        toast.success("Phase added");
        setPhaseModalOpen(false);
        setEditPhaseId(null);
        await fetchPhases();
      }
    } catch (err) {
      toast.error("Failed to add phase");
    }
  };

  // Update single: PATCH /phases/:cbId/:phaseId
  const onUpdatePhase = async () => {
    if (!custom_builder_id || !editPhaseId) return;
    if (!validatePhaseForm()) return;

    const patchBody = {
      order: phaseForm.order,
      name: phaseForm.name,
      plannedDays: Number(phaseForm.plannedDays),
      plannedCost: Number(phaseForm.plannedCost),
      plannedStart: phaseForm.plannedStart,
      plannedEnd: phaseForm.plannedEnd,
    };

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.phases}/${custom_builder_id}/${editPhaseId}`,
        patchBody,
        true,
      );
      if (res.status === 200) {
        toast.success("Phase updated");
        setPhaseModalOpen(false);
        setEditPhaseId(null);
        await fetchPhases();
      }
    } catch (err) {
      toast.error("Failed to update phase");
    }
  };

  // Delete single: DELETE /phases/:cbId/:phaseId

  const onDeletePhase = async (id: number) => {
    if (!custom_builder_id) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.phases}/${custom_builder_id}/${id}`,
        true,
      );
      if (res.status === 200) {
        toast.success("Phase deleted");
        if (activePhaseId === id) setActivePhaseId(null);
        await fetchPhases();
      }
    } catch (err) {
      toast.error("Failed to delete phase");
    }
  };

  // Auto-generate: POST /phases/:cbId/auto-generate
  const onAutoGeneratePhases = async (
    mode: "weighted" | "equal" = "weighted",
  ) => {
    if (!custom_builder_id) return;
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.phases}/${custom_builder_id}/auto-generate`,
        mode === "weighted" ? { mode } : { mode, names: [] },
        true,
      );
      if (res.status === 201 || res.status === 200) {
        toast.success("Phases generated");
        await fetchPhases();
      }
    } catch (err) {
      toast.error("Failed to auto-generate phases");
    }
  };

  // Recompute: POST /phases/:cbId/recompute
  const onRecomputePhases = async () => {
    if (!custom_builder_id) return;
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.phases}/${custom_builder_id}/recompute`,
        {},
        true,
      );
      if (res.status === 200) {
        toast.success("Recomputed actuals");
        await fetchPhases();
      }
    } catch (err) {
      // non-blocking
    }
  };

  // --------------------------------
  // Phase-aware KPIs (computed vals)
  // --------------------------------

  const totalEstimatedDays = Object.values(estimates || {}).reduce(
    (sum, est) => sum + (est?.estimatedDays || 0),
    0,
  );
  const totalEstimatedCost = Object.values(estimates || {}).reduce(
    (sum, est) => sum + (est?.estimatedCost || 0),
    0,
  );

  const selectedPhase = activePhaseId
    ? phases.find((p) => p.id === activePhaseId)
    : null;

  const phaseLogs = activePhaseId
    ? workdata.filter((l) => String(l.phaseId) === String(activePhaseId))
    : workdata;

  const estimatedDaysPhase = selectedPhase?.plannedDays ?? totalEstimatedDays;
  const estimatedCostPhase = selectedPhase?.plannedCost ?? totalEstimatedCost;

  const remainingDaysPhase =
    (estimatedDaysPhase || 0) - (selectedPhase?.actualDays ?? phaseLogs.length);

  // --------------------------------
  // Render: Phase Modal
  // --------------------------------
  const [phaseModalTab, setPhaseModalTab] = useState<"manual" | "auto">("manual");

  const renderPhaseModal = () => {
    if (!phaseModalOpen) return null;
    const isEditing = !!editPhaseId;
    return (
      <Modal
        isOpen={phaseModalOpen}
        closeModal={() => setPhaseModalOpen(false)}
        title={isEditing ? "Edit Phase" : "Phase Management"}
        titleCls="font-semibold md:text-[18px] text-[14px] text-center text-[#3586FF]"
        isCloseRequired={true}
        className="md:max-w-[720px] max-w-[340px]"
        rootCls="z-[99999]"
      >
        {!isEditing && (
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
            <Button
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${phaseModalTab === "manual"
                ? "bg-white text-[#3586FF] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setPhaseModalTab("manual")}
            >
              Create Manual Phase
            </Button>
            <Button
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${phaseModalTab === "auto"
                ? "bg-white text-[#3586FF] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setPhaseModalTab("auto")}
            >
              Auto-Generate Phases
            </Button>
          </div>
        )}

        {(phaseModalTab === "manual" || isEditing) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CustomInput
                label="Phase Name"
                value={phaseForm.name ?? ""}
                onChange={(e) =>
                  setPhaseForm((p) => ({ ...p, name: e.target.value }))
                }
                errorMsg={phaseErrors.name}
                name="name"
                type="text"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                placeholder="e.g. Foundation, MEP & Services"
              />
              <CustomInput
                label="Order"
                type="number"
                value={phaseForm.order ?? phases.length + 1}
                onChange={(e) =>
                  setPhaseForm((p) => ({ ...p, order: +e.target.value }))
                }
                errorMsg={phaseErrors.order}
                name="order"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
              />
              <CustomInput
                label="Planned Days"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                type="number"
                value={phaseForm.plannedDays ?? 0}
                onChange={(e) =>
                  setPhaseForm((p) => ({ ...p, plannedDays: +e.target.value }))
                }
                name="plannedDays"
                placeholder="Number of days"
              />
              <CustomInput
                label="Planned Cost (INR)"
                type="number"
                 labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                value={phaseForm.plannedCost ?? 0}
                onChange={(e) =>
                  setPhaseForm((p) => ({
                    ...p,
                    plannedCost: Number.isNaN(+e.target.value)
                      ? null
                      : +e.target.value,
                  }))
                }
                name="plannedCost"
                placeholder="Budget for this phase"
              />
              <CustomDate
                label="Planned Start"
                labelCls="label-text font-medium"
                name="plannedStart"
                type="date"
                
                value={phaseForm.plannedStart ?? ""}
                onChange={(e) =>
                  setPhaseForm((p) => ({ ...p, plannedStart: e.target.value }))
                }
                errorMsg={phaseErrors.range}
              />
              <CustomDate
                labelCls="label-text font-medium"
                label="Planned End"
                name="plannedEnd"
                type="date"
                
                value={phaseForm.plannedEnd ?? ""}
                onChange={(e) =>
                  setPhaseForm((p) => ({ ...p, plannedEnd: e.target.value }))
                }
                errorMsg={phaseErrors.range}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                className="border border-gray-300 px-4 py-1.5 rounded-md text-gray-600 font-medium text-[13px] hover:bg-gray-50"
                onClick={() => setPhaseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#3586FF] text-white px-4 py-1.5 rounded-md font-medium text-[13px] hover:bg-blue-600"
                onClick={isEditing ? onUpdatePhase : onCreatePhase}
              >
                {isEditing ? "Update Phase" : "Create Phase"}
              </Button>
            </div>
          </>
        )}

        {phaseModalTab === "auto" && !isEditing && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-[14px] font-semibold text-blue-800 mb-1">
                Weighted (Recommended)
              </h4>
              <p className="text-[12px] text-blue-600 mb-3">
                Creates phases based on your selected services. Each phase gets days & cost proportional to service estimates.
                {constructionType === "Commercial"
                  ? " Uses commercial buckets: Documentation, Foundation, Structure, MEP & Services, Envelope & Facade, Infrastructure, Signage & Finishing."
                  : " Uses residential buckets: Documentation, Foundation, Structure, Services, Finishes, Interiors."}
              </p>
              <Button
                className="bg-[#3586FF] text-white text-[13px] font-medium px-4 py-1.5 rounded-md hover:bg-blue-600"
                onClick={() => {
                  onAutoGeneratePhases("weighted");
                  setPhaseModalOpen(false);
                }}
              >
                Generate Weighted Phases
              </Button>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-[14px] font-semibold text-gray-800 mb-1">
                Equal Split
              </h4>
              <p className="text-[12px] text-gray-600 mb-3">
                Splits total estimated days equally into 5 generic phases (Phase 1-5). Cost is not distributed. Best for simple projects without specific service breakdown.
              </p>
              <Button
                className="bg-gray-700 text-white text-[13px] font-medium px-4 py-1.5 rounded-md hover:bg-gray-800"
                onClick={() => {
                  onAutoGeneratePhases("equal");
                  setPhaseModalOpen(false);
                }}
              >
                Generate Equal Phases
              </Button>
            </div>

            {phases.length > 0 && (
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 text-center">
                Auto-generating will replace all existing phases.
              </p>
            )}
          </div>
        )}
      </Modal>
    );
  };

  // --------------------------------
  // Render: Phase Selector Bar
  // --------------------------------
  const getPhaseStatus = (p: Phase) => {
    const percent = p.plannedDays > 0 ? Math.round(((p.actualDays || 0) / p.plannedDays) * 100) : 0;
    if (percent >= 100) return { label: "Done", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50 border-green-300" };
    if (percent > 0) return { label: "Active", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50 border-blue-300" };
    return { label: "Pending", color: "bg-gray-300", textColor: "text-gray-500", bgColor: "bg-gray-50 border-gray-200" };
  };

  const renderPhaseBar = () => {
    return (
      <div className="mb-4">
        {hasPhases && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-gray-500">
                Project Phases ({visiblePhases.filter(p => getPhaseStatus(p).label === "Done").length}/{visiblePhases.length} completed)
              </p>
              <div className="flex items-center gap-3 text-[10px] font-medium">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Done</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Pending</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3 w-full">
              {visiblePhases.map((p, i) => {
                const percent = p.plannedDays > 0 ? Math.min(100, Math.round(((p.actualDays || 0) / p.plannedDays) * 100)) : 0;
                const status = getPhaseStatus(p);
                return (
                  <div key={p.id} className="flex-1 relative group cursor-pointer" onClick={() => { setActivePhaseId(p.id); setSelectPhase(p.name); }}>
                    <div className={`h-2 rounded-full overflow-hidden ${activePhaseId === p.id ? "ring-2 ring-blue-400 ring-offset-1" : ""} bg-gray-200`}>
                      <div className={`h-full ${status.color} transition-all duration-500`} style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {p.name}: {percent}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => { setActivePhaseId(null); setSelectPhase("All Phases"); }}
                className={`shrink-0 px-3 py-1.5 rounded-md text-[12px] font-medium border transition-all ${activePhaseId === null
                  ? "bg-[#3586FF] text-white border-[#3586FF] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
              >
                All Phases
              </button>
              {visiblePhases.map((p) => {
                const percent = p.plannedDays > 0 ? Math.min(100, Math.round(((p.actualDays || 0) / p.plannedDays) * 100)) : 0;
                const status = getPhaseStatus(p);
                const isActive = activePhaseId === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setActivePhaseId(p.id); setSelectPhase(p.name); }}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium border transition-all ${isActive
                      ? "bg-[#3586FF] text-white border-[#3586FF] shadow-sm"
                      : `bg-white ${status.textColor} border-gray-200 hover:border-gray-400`
                      }`}
                    title={`${p.plannedStart ?? "No start date"} → ${p.plannedEnd ?? "No end date"}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : status.color}`} />
                    {p.order}. {p.name}
                    <span className={`text-[10px] ${isActive ? "text-blue-100" : "opacity-60"}`}>{percent}%</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <PhaseButtonsInner
            activePhaseId={activePhaseId}
            openCreatePhase={openCreatePhase}
            openEditPhase={openEditPhase}
            onDeletePhase={onDeletePhase}
            onRecomputePhases={onRecomputePhases}
            hasPermission={hasPermission}
            openDeleteModal={openDeleteModal}
            setOpenDeleteModal={setOpenDeleteModal}
          />
        </div>
      </div>
    );
  };
  // -----------------------------
  // Day Log: Defaults & Modals
  // -----------------------------
  const defaultValues = {
    id: undefined as number | undefined,
    day: currentDay,
    date: "",
    workType: "",
    placeType: [] as string[],
    description: "",
    imageOrVideo: [] as string[],
    laborCount: null as number | null,
    customerNotes: "",
    issues: "",
    status: "",
    floor: [] as string[],
    materials: [] as { material: string; quantity: number; desc: string }[],
    roomType: "",
    featureType: "",
    expensesIncurred: null as number | null,
    // NEW
    phaseId: activePhaseId as number | null,
    uploadedByName: "",
    uploadedByProfile: "",
    uploadLocation: null,
    latitude: null,
    longitude: null,
    city: "",
    state: "",
    country: "",
  };

  const [editId, setEditId] = useState<number | null>(null); // stores day number in edit mode
  const [addModal, setAddModal] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [dayProgressLog, setDayProgressLog] = useState<any>(defaultValues);

  // materials modal
  const [materialModal, setMaterialModal] = useState(false);
  const [materialItem, setMaterailItem] = useState({
    material: "",
    quantity: null as number | null,
    desc: "",
  });
  const [materialErr, setMaterialErr] = useState<any>({});

  // media viewer
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>({});

  // queries counts you had
  const [activeQueries, setActiveQueries] = useState<any[]>([]);
  const [resolvedQueries, setResolvedQueries] = useState<any[]>([]);

  // keep form’s phaseId in sync when user switches active phase
  useEffect(() => {
    setDayProgressLog((prev: any) => ({
      ...prev,
      phaseId: activePhaseId ?? null,
    }));
  }, [activePhaseId]);

  // --------------------------------
  // Fetch Queries (unchanged)
  // --------------------------------
  const FetchQueries = async () => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.queries}/custom-builder/${custom_builder_id}`,
      );
      if (res.status === 200 && res.body) {
        const allQueries = res.body;
        const active = allQueries.filter((q: any) => q.status === "Active");
        const resolved = allQueries.filter((q: any) => q.status === "Resolved");
        setActiveQueries(active);
        setResolvedQueries(resolved);
      }
    } catch (error) {
      toast.error("falied to fetch queries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (custom_builder_id) {
      FetchQueries();
    }
  }, [custom_builder_id]);

  // --------------------------------
  // Validation helpers (with phase)
  // --------------------------------
  const validate = (progressData: any) => {
    const newErrors: any = {};
    if (!progressData.date) newErrors.date = "Date is required";
    if (!progressData.workType) newErrors.workType = "Work type is required";
    if (!progressData.placeType || progressData.placeType.length === 0)
      newErrors.placeType = "Place type is required";
    if (!progressData.description)
      newErrors.description = "Description is required";
    if (hasPhases && !progressData.phaseId)
      newErrors.phaseId = "Phase is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // room/work combo validation you had
  const checkValidCombination = (progressData: any) => {
    const isWholePropertyWork = [
      "document_drafting",
      "borewells",
      "centring",
    ].includes(progressData?.workType);
    const isWholeProperty =
      Array.isArray(progressData?.placeType) &&
      progressData.placeType.includes("whole_property");
    if (isWholePropertyWork && isWholeProperty) return true;
    if (!isWholePropertyWork) return true;
    return false;
  };

  // materials validation
  const validateMaterial = () => {
    const newErrors: any = {};
    if (!materialItem.material)
      newErrors.material = "Material Name is required";
    if (!materialItem.desc) newErrors.desc = "Description is required";
    if (materialItem.quantity === null || materialItem.quantity < 1)
      newErrors.quantity = "Quantity must be ≥ 1";
    setMaterialErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkValidDate = (
    selectedDate: string,
    dayNumber: number,
    isEditMode = false,
  ) => {
    const newTs = new Date(selectedDate).setHours(0, 0, 0, 0);

    const selectedPhaseId = isEditMode
      ? (dayProgress.logs.find((l) => l.day === dayNumber)?.phaseId ??
        activePhaseId)
      : (dayProgressLog.phaseId ?? activePhaseId);

    const p = phases.find((x) => x.id === selectedPhaseId);
    if (p) {
      const s = p.plannedStart
        ? new Date(p.plannedStart).setHours(0, 0, 0, 0)
        : null;
      const e = p.plannedEnd
        ? new Date(p.plannedEnd).setHours(0, 0, 0, 0)
        : null;
      if ((s && newTs < s) || (e && newTs > e)) return false;
    }

    const duplicate = workdata.some(
      (log) =>
        new Date(log.date).setHours(0, 0, 0, 0) === newTs &&
        log.day !== dayNumber,
    );
    if (duplicate) return false;

    const prevLog = workdata.find((log) => log.day === dayNumber - 1);
    const prevDate = prevLog
      ? new Date(prevLog.date).setHours(0, 0, 0, 0)
      : null;

    if (prevDate && newTs <= prevDate) return false;

    const nextLog = workdata.find((log) => log.day === dayNumber + 1);
    const nextDate = nextLog
      ? new Date(nextLog.date).setHours(0, 0, 0, 0)
      : null;

    if (nextDate && newTs >= nextDate) return false;

    return true;
  };

  // --------------------------------
  // Inputs & materials change
  // --------------------------------
  // const handleInputChange = (name: string, value: any) => {
  //   const currentDayId = editId || currentDay;

  //   // if (name === "date") {
  //   //   const isValidDate = checkValidDate(value, currentDayId, editId !== null);
  //   //   if (!isValidDate) {
  //   //     toast.error("Invalid date (outside phase window / sequence).");
  //   //     return;
  //   //   }
  //   // }

  //   const existingLog = dayProgress.logs.find(
  //     (log) => log.day === currentDayId
  //   );
  //   if (!existingLog) {
  //     setDayProgressLog((prev: any) => ({ ...prev, [name]: value }));
  //   } else {
  //     updateDayProgressLog(currentDayId, { [name]: value });
  //   }

  //   if (errors[name]) {
  //     setErrors((prevErrors: any) => {
  //       const newErrors = { ...prevErrors };
  //       delete newErrors[name];
  //       return newErrors;
  //     });
  //   }
  // };
  const handleInputChange = (name: string, value: any) => {
    const currentDayId = editId || currentDay;
    if (name === "date") {
      const isValidDate = checkValidDate(value, currentDayId, editId !== null);
      if (!isValidDate) {
        toast.error("Invalid date (outside phase window / sequence).");
        return;
      }
    }
    setDayProgressLog((prev: any) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleMaterialChange = (name: string, value: any) => {
    setMaterailItem({ ...materialItem, [name]: value });
    if (materialErr[name]) {
      setMaterialErr((prev: any) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };
  const PhaseButtonsInner: React.FC<PhaseButtonsInnerProps> = ({
    activePhaseId,
    openCreatePhase,
    openEditPhase,
    onDeletePhase,
    onRecomputePhases,
    hasPermission,
    openDeleteModal,
    setOpenDeleteModal,
  }) => {
    const { startTour } = useTourGuide();

    // 🔹 Refs for each button we want to highlight
    const addRef = React.useRef<HTMLDivElement | null>(null);
    const editRef = React.useRef<HTMLDivElement | null>(null);
    const deleteRef = React.useRef<HTMLDivElement | null>(null);
    const recomputeRef = React.useRef<HTMLDivElement | null>(null);

    return (
      <>
        {/* 🔹 Register steps for this provider */}
        <TourStep
          order={0}
          targetRef={addRef}
          text="+ Phase: Create a new project phase and define its details."
        />
        {activePhaseId && (
          <>
            <TourStep
              order={1}
              targetRef={editRef}
              text="Edit: Update the currently active phase's information."
            />
            <TourStep
              order={2}
              targetRef={deleteRef}
              text="Delete: Remove the current phase. This action cannot be undone."
            />
            <TourStep
              order={3}
              targetRef={recomputeRef}
              text="Recompute: Recalculate the phase timelines based on latest changes."
            />
          </>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={startTour}
            className="inline-flex items-center font-medium btn-txt bg-[#5297FF] text-white rounded-md px-1 md:px-3 py-0.5 hover:bg-blue-700"
            aria-label="Take a tour of phase actions"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Tour
          </Button>

          <div ref={addRef}>
            <Button
              className="bg-gray-200 md:text-[14px] text-[10px] text-nowrap text-gray-700 md:px-3 font-medium px-2 py-1 rounded-md"
              onClick={openCreatePhase}
            >
              + Phase
            </Button>
          </div>

          <Button
            className="bg-gray-200 md:text-[14px] text-[10px] text-nowrap text-gray-700 md:px-3 font-medium px-2 py-1 rounded-md"
            onClick={() =>
              router.push(
                `/custom-builder/${custom_builder_id}/workprogress/chat`
              )
            }
          >
            Chat
          </Button>

          {activePhaseId && (
            <>
              {/* Edit */}
              <div ref={editRef}>
                <CustomTooltip
                  label="Access Restricted Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="text-[10px] font-medium"
                  showTooltip={!hasPermission("phases", "edit")}
                >
                  <Button
                    className="bg-gray-200 text-gray-700 md:text-[14px] text-[10px] font-medium md:px-3 px-2 py-1 rounded-md"
                    onClick={() => openEditPhase(activePhaseId!)}
                    disabled={hasPermission("phases", "edit")}
                  >
                    Edit
                  </Button>
                </CustomTooltip>
              </div>

              <div ref={deleteRef}>
                <CustomTooltip
                  label="Access Restricted Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="text-[10px] font-medium"
                  showTooltip={!hasPermission("phases", "delete")}
                >
                  <Button
                    className="bg-red-100 text-red-600 md:text-[14px] text-[10px] font-medium md:px-3 px-2 py-1 rounded-md"
                    onClick={() => setOpenDeleteModal(true)}
                    disabled={hasPermission("phases", "delete")}
                  >
                    Delete
                  </Button>
                </CustomTooltip>
              </div>

              {/* Modal = unchanged */}
              <Modal
                isOpen={openDeleteModal}
                closeModal={() => setOpenDeleteModal(false)}
                rootCls="z-[99999]"
                titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                isCloseRequired={false}
                className="md:max-w-[500px] max-w-[270px]"
              >
                <div className="md:p-2 p-1 flex flex-col gap-2 z-20">
                  <div className="flex justify-between items-center md:mb-2 mb-1">
                    <h3 className="md:text-[16px] text-center w-full text-[12px] font-medium text-gray-900">
                      Confirm Deletion
                    </h3>
                  </div>
                  <p className="md:text-[12px] text-center text-[10px] text-gray-500 mb-2">
                    Are you sure you want to delete this Phase? This action
                    cannot be undone.
                  </p>
                  <div className="md:mt-2 mt-1 flex items-end justify-end gap-2 md:space-x-3 space-x-1">
                    <Button
                      className="border-2 font-medium md:text-[12px] text-[10px] btn-text border-gray-300 md:px-3 px-2 md:py-1 py-1 rounded-md"
                      onClick={() => setOpenDeleteModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 text-white font-medium md:text-[12px] text-[10px] md:px-3 px-2 md:py-1 py-1 rounded-md"
                      onClick={() => {
                        onDeletePhase(activePhaseId!);
                        setOpenDeleteModal(false);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Modal>

              {/* Recompute */}
              <div ref={recomputeRef}>
                <Button
                  className="bg-gray-200 text-gray-700 md:text-[14px] text-[10px] md:px-3 px-2 font-medium py-1 rounded-md"
                  onClick={onRecomputePhases}
                >
                  Recompute
                </Button>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const handleMaterialSubmit = () => {
    if (!validateMaterial()) return;

    if (editId == null) {
      setDayProgressLog((prev: any) => ({
        ...prev,
        materials: [...prev.materials, materialItem],
      }));
    }

    const updatedMaterials = [
      ...(editId !== null
        ? dayProgress.logs.find((log) => log.day === editId)?.materials || []
        : []),
      materialItem,
    ];

    updateDayProgressLog(editId || currentDay, { materials: updatedMaterials });
    setMaterailItem({ material: "", quantity: null, desc: "" });
    setMaterialModal(false);
  };

  const handleMaterialClose = () => {
    setMaterailItem({ material: "", quantity: null, desc: "" });
    setMaterialModal(false);
  };

  // --------------------------------
  // Submit / Delete Day Log (phase-aware)
  // --------------------------------
  const handleCancel = () => {
    setEditId(null);
    setAddModal(false);
    setMaterialModal(false);
    setErrors({});
    setLocationInfo(null);
  };
  const getCurrentPosition = (): Promise<UploadLocation | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;
          const address = await getCurrentAddress(latitude, longitude);

          let location: UploadLocation | null = null;
          if (address) {
            location = {
              city: address.city || "",
              state: address.state || "",
              locality: address.locality || "",
              subLocality: address.subLocality || "",
              country: "India",
              latitude: String(latitude),
              longitude: String(longitude),
              place_id:
                address.locality_place_id || address.city_place_id || "",
            };
            setCurrentLocation(location);
          }

          setIsLoading(false);
          resolve(location);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
    });
  };

  const handleSubmit = async () => {
    // let progressData: any;

    // if (editId !== null) {
    //   progressData = dayProgress.logs.find((log) => log.id === editId);
    //   if (!progressData) {
    //     toast.error("Log not found for editing.");
    //     return;
    //   }
    // } else {
    //   progressData = { ...dayProgressLog };
    // }

    let progressData: any = { ...dayProgressLog };

    if (editId !== null) {
      progressData.id = editId;
    }

    // normalize
    if (Array.isArray(progressData.floor)) {
      progressData.floor = progressData.floor.map((f) => String(f));
    }

    if (progressData.workType && !Array.isArray(progressData.workType)) {
      progressData.workType = [progressData.workType];
    }
    // if (progressData.placeType && !Array.isArray(progressData.placeType)) {
    //   progressData.placeType = [progressData.placeType];
    // }
    if (Array.isArray(progressData.placeType)) {
      progressData.placeType = progressData.placeType.map(
        (p: any) => p.value ?? p,
      );
    }

    progressData.phaseId = progressData.phaseId ?? activePhaseId ?? null;
    progressData.uploadedById = user.id;
    progressData.uploadedByName =
      progressData?.uploadedByName || user.fullName || "";
    progressData.uploadedByProfile =
      progressData?.uploadedByProfile || user.profile || "";

    if (!currentLocation) {
      const location = await getCurrentPosition();
      if (location) {
        progressData.uploadLocation = location;
        progressData.latitude = location.latitude;
        progressData.longitude = location.longitude;
        progressData.city = location.city;
        progressData.state = location.state;
        progressData.country = location.country || "India";
      }
    } else {
      progressData.uploadLocation = currentLocation;
      progressData.latitude = currentLocation.latitude;
      progressData.longitude = currentLocation.longitude;
      progressData.city = currentLocation.city;
      progressData.state = currentLocation.state;
      progressData.country = currentLocation.country || "India";
    }

    // validations
    if (!validate(progressData)) return;
    if (!checkValidCombination(progressData)) {
      toast.error("Invalid combination of work type and place type");
      return;
    }

    setIsLoading(true);
    try {
      if (editId !== null) {
        const response = await apiClient.patch(
          `${apiClient.URLS.daily_progress}/${progressData.id}`,
          progressData,
          true,
        );
        if (response.status === 200) {
          // updateDayProgressLog(progressData.id, progressData);
          updateDayProgressLog(progressData.id, response.body);

          setWorkdata((prev) =>
            prev.map((log) =>
              log.id === progressData.id ? response.body : log,
            ),
          );
          toast.success("Day progress updated successfully!");
          // recompute phase actuals (non-blocking)
          apiClient
            .post(
              `${apiClient.URLS.phases}/${custom_builder_id}/recompute`,
              {},
              true,
            )
            .catch(() => { });
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.daily_progress}/${custom_builder_id}`,
          progressData,
          true,
        );
        if (response.status === 201) {
          addDayProgressLog({ ...progressData, id: response.body.id });
          setWorkdata((prev: any) => [...prev, response.body]);
          toast.success("Day progress added successfully!");
          setDayProgressLog({
            ...defaultValues,
            phaseId: activePhaseId ?? null,
          });
          // recompute phase actuals (non-blocking)
          apiClient
            .post(
              `${apiClient.URLS.phases}/${custom_builder_id}/recompute`,
              {},
              true,
            )
            .catch(() => { });
        }
      }
      setIsLoading(false);
      handleCancel();
    } catch (error) {
      toast.error(
        `Failed to ${editId !== null ? "update" : "add"} day progress.`,
      );
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.daily_progress}/${id}`,
        true,
      );
      if (res.status === 200) {
        setWorkdata((prev) => prev.filter((log) => log.id !== id));
        toast.success("Day progress deleted successfully");
        // recompute phase actuals (non-blocking)
        apiClient
          .post(
            `${apiClient.URLS.phases}/${custom_builder_id}/recompute`,
            {},
            true,
          )
          .catch(() => { });
      }
    } catch (error) {
      toast.error("Something went Wrong");
    }
  };

  // --------------------------------
  // Add/Edit modal (phase selector injected)
  // --------------------------------
  const renderMaterials = () => (
    <Modal
      isOpen={materialModal}
      closeModal={() => setMaterialModal(false)}
      isCloseRequired={false}
      className="md:max-w-[700px] max-w-[290px] h-full bg-white md:px-5 px-5 md:py-8 py-4 rounded-md flex items-center justify-center "
      rootCls="z-[99999999] "
    >
      <div className="w-full">
        <h2 className="md:text-[24px] text-[16px] font-medium md:mb-4  mb-2 text-[#2465ce]">
          Materials List:
        </h2>
        <div className="w-full flex md:flex-row flex-col md:gap-4 gap-2">
          <CustomInput
            name="materials"
            label="Material Name"
            placeholder="Material Name"
            labelCls="md:text-[16px] text-[12px] font-medium"
            className="md:p-[6px] p-[3px]"
            onChange={(e) => handleMaterialChange("material", e.target.value)}
            type="text"
            value={materialItem?.material || ""}
            errorMsg={materialErr?.material}
          />
          <CustomInput
            name="quantity"
            label="Quantity"
            placeholder="Quantity"
            labelCls="md:text-[16px] text-[12px] font-medium"
            className="md:p-[6px] p-[3px]"
            onChange={(e) => handleMaterialChange("quantity", +e.target.value)}
            type="number"
            value={materialItem?.quantity ?? ""}
            errorMsg={materialErr?.quantity}
          />
        </div>
        <div className="md:mt-3 mt-2">
          <CustomInput
            name="desc"
            label="Item Description"
            sublabelcls="text-[12px] font-regular text-gray-500"
            labelCls="md:text-[16px] text-[12px] font-medium"
            onChange={(e) => handleMaterialChange("desc", e.target.value)}
            type="textarea"
            className="min-h-[80px] md:text-[14px] text-[12px] md:px-[10px] px-[5px] md:py-2 py-1"
            placeholder="Enter a detailed desc of the item"
            value={materialItem?.desc}
            errorMsg={materialErr?.desc}
          />
        </div>
        <div className="flex flex-row justify-between md:mt-6 mt-3">
          <Button
            className="md:py-2 py-1 md:px-[14px] font-medium px-[7px] md:text-[16px] text-[12px] rounded-md border-2 border-[#3B82F6]"
            onClick={handleMaterialClose}
          >
            Cancel
          </Button>

          <Button
            className="md:py-2 py-1 md:px-[14px] px-[7px] font-medium md:text-[16px] text-[12px] rounded-md border-2 bg-[#3B82F6] text-white"
            type="submit"
            onClick={handleMaterialSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
  const [locationInfo, setLocationInfo] = useState<{
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
  } | null>(null);

  const floorOptions = React.useMemo(() => {
    if (!totalFloors) return [{ label: "Ground Floor", value: 0 }];
    return Array.from({ length: totalFloors }, (_, idx) => ({
      label: idx === 0 ? "Ground Floor" : `${idx} Floor`,
      value: idx,
    }));
  }, [totalFloors]);

  const isCommercialProject = constructionType === "Commercial";
  const activePlaceMap = isCommercialProject ? { ...placeTypeMap, ...commercialPlaceTypeMap } : placeTypeMap;
  const activeWorkTypePlaceMap = isCommercialProject ? commercialWorkTypePlaceMap : workTypePlaceMap;

  const filteredPlaceTypes = useMemo(() => {
    if (dayProgressLog.workType && activeWorkTypePlaceMap[dayProgressLog.workType]) {
      return Object.entries(activePlaceMap)
        .filter(([key]) =>
          activeWorkTypePlaceMap[dayProgressLog.workType].includes(key),
        )
        .map(([key]) => ({
          label: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value: key,
        }));
    }

    return Object.entries(activePlaceMap).map(([key]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: key,
    }));
  }, [dayProgressLog.workType, isCommercialProject]);

  useEffect(() => {
    if (dayProgressLog.workType && activeWorkTypePlaceMap[dayProgressLog.workType]) {
      const validPlaces = activeWorkTypePlaceMap[dayProgressLog.workType];
      const currentPlaces = Array.isArray(dayProgressLog.placeType)
        ? dayProgressLog.placeType.map((p: any) => p.value)
        : [];

      const isStillValid = currentPlaces.every((p) => validPlaces.includes(p));

      if (!isStillValid) {
        handleInputChange("placeType", []);
      }
    }
  }, [dayProgressLog.workType]);

  const renderAddEditModal = () => {
    // const currentLog =
    //   (editId !== null
    //     ? dayProgress.logs.find((log) => log.day === editId)
    //     : dayProgressLog) || dayProgressLog;
    const form = dayProgressLog;

    return (
      <Modal
        isOpen={addModal}
        closeModal={() => setAddModal(false)}
        isCloseRequired={false}
        rootCls="z-[9999]"
      >
        <div className="md:p-6 p-4 md:space-y-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="md:text-[20px] text-[16px] font-bold text-[#3586FF] ">
              {editId ? "Edit Day Progress" : "Add Day Progress"}
            </h2>
            <p className="md:text-[16px] text-[12px] font-medium text-[#3586FF]  rounded-md px-3 py-1 border-2 border-[#5297ff]">
              Day {editId !== null ? editId : currentDay} / {estimatedDaysPhase}
            </p>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
              <Loader />
            </div>
          )}

          <div className="md:space-y-6 space-y-3">
            <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2">
              {hasPhases && (
                <SearchComponent
                  label="Phase"
                  labelCls="label-text text-black"
                  value={form.phaseId}
                  onChange={(val: { label: string; value: any }) =>
                    handleInputChange("phaseId", val.value)
                  }
                  inputClassName="text-gray-500   placeholder:text-[12px] "
                  dropdownCls="bg-gray-50 md:text-[14px] text-[12px] max-w-[450px] font-medium"
                  rootClassName="border-gray-300  md:max-w-[450px]  py-2"
                  options={phases.map((p) => ({
                    label: `${p.order}. ${p.name}`,
                    value: p.id,
                  }))}
                  placeholder="Choose phase..."
                  required
                  errorMsg={errors.phaseId}
                />
              )}

              <CustomDate
                label=" Work Date"
                type="date"
                required
                labelCls="label-text font-medium text-black"
                value={form.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="md:px-2 px-1"
                name={"date"}
                outerInputCls=" border-gray-300 custom-shadow max-w-[450px]"
                errorMsg={errors.date}
              />

              {/* <SearchComponent
                label="Select Floor"
                labelCls="label-text text-black"
                value={form.floor}
                onChange={(val: { label: string; value: any }) =>
                  handleInputChange("floor", val.value)
                }
                inputClassName="text-gray-500   placeholder:text-[12px] "
                dropdownCls="bg-gray-50 md:text-[14px] text-[12px] max-w-[450px] font-medium"
                rootClassName="border-gray-300  md:max-w-[450px]  py-2"
                options={Array.from(
                  {
                    length:
                      customerOnboarding?.propertyInformation?.interior_info
                        ?.total_floors ||
                      customerOnboarding?.propertyInformation
                        ?.house_construction_info?.total_floors ||
                      1,
                  },
                  (_, idx) => ({
                    label: idx === 0 ? "Ground Floor" : `${idx} Floor`,
                    value: idx,
                  })
                )}
                placeholder="Choose floor..."
                required
              /> */}
              <SearchComponent
                label="Select Floor"
                value={form.floor}
                onChange={(vals) => handleInputChange("floor", vals)}
                isMulti
                options={floorOptions}
                placeholder="Choose floor..."
                rootClassName="border-gray-300 md:max-w-[450px] py-2"
                labelCls="label-text text-black"
                inputClassName="text-gray-500 placeholder:text-[12px]"
                dropdownCls="bg-gray-50 font-medium md:text-[14px] text-[12px]"
              />
            </div>

            <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2">
              <SearchComponent
                label="Work Type"
                labelCls="text-[black] label-text "
                placeholder="Select WorkType"
                value={form.workType}
                onChange={(val: { label: string; value: any }) =>
                  handleInputChange("workType", val.value)
                }
                // options={selectedServices}
                options={filteredWorkTypes}
                required
                rootClassName="border-gray-300  md:max-w-[450px]"
                inputClassName="text-gray-500  placeholder:text-[12px]"
                dropdownCls="bg-gray-50 max-w-[450px] font-medium md:text-[14px] text-[12px]"
                showDeleteIcon={true}
                errorMsg={errors.workType}
              />

              <SearchComponent
                label="Status "
                labelCls="text-[black]  label-text "
                placeholder="Select the status"
                value={form?.status}
                onChange={(val: { label: string; value: any }) =>
                  handleInputChange("status", val.value)
                }
                options={dailyStatus}
                required
                rootClassName="border-gray-300 border-gray-300 custom-shadow max-w-[450px]"
                inputClassName="text-gray-500   py-[2px] placeholder:text-[12px] text-[12px] "
                dropdownCls="bg-gray-50 max-w-[450px] font-medium md:text-[14px] text-[12px]"
                showDeleteIcon={true}
              />

              <SearchComponent
                label="Place Type"
                key={dayProgressLog.workType}
                value={form.placeType}
                onChange={(val) => handleInputChange("placeType", val)}
                isMulti
                // options={placeTypes}
                options={filteredPlaceTypes}
                placeholder="Search place..."
                required
                rootClassName="border-gray-300"
                labelCls="text-[black] label-text "
                inputClassName="text-gray-500 text-[12px] placeholder:text-[12px]"
                dropdownCls="bg-gray-50 font-medium md:text-[14px] text-[12px]"
                showDeleteIcon
                errorMsg={errors.placeType}
              />
            </div>

            {form.workType === "interior_service" && (
              <div className="flex md:flex-row flex-col gap-4">
                <div className="w-full">
                  <SearchComponent
                    label="Room Type"
                    value={form?.roomType}
                    onChange={(val: { label: string; value: any }) =>
                      handleInputChange("roomType", val.value)
                    }
                    placeholder="e.g. Living Room"
                    options={[
                      "Living Room",
                      "Bedroom",
                      "Kitchen",
                      "Bathroom",
                      "Dining",
                      "Pop",
                    ].map((r) => ({ label: r, value: r.toLowerCase() }))}
                    rootClassName="border-gray-300"
                    inputClassName="text-gray-500"
                    dropdownCls="bg-gray-50 font-medium"
                    labelCls="text-[12px] font-bold text-black"
                  />
                </div>
                <div className="w-full">
                  <CustomInput
                    label="Feature Type"
                    value={form?.featureType}
                    onChange={(e) =>
                      handleInputChange("featureType", e.target.value)
                    }
                    placeholder="e.g. TV Unit or Pop ceiling"
                    name="featureType"
                    type="text"
                    className="px-3 py-1"
                    labelCls="text-[12px] font-bold text-black"
                  />
                </div>
              </div>
            )}

            <CustomInput
              value={form.description}
              label="Work Description"
              labelCls="label-text font-medium text-black"
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter progress description..."
              className="w-full border border-gray-300 md:text-[14px] text-[12px] rounded-md md:px-3 px-2 md:py-4  py-3 placeholder:text-[12px] placeholder:font-regular"
              errorMsg={errors?.description}
              type="textarea"
              name={"description"}
            />

            <div className="md:w-[100%] w-full ">
              <label className="text-black label-text md:mb-4 block mb-2">
                Progress Images
              </label>
              <ImageFileUploader
                name="Reference images"
                type="file"
                folderName="customBuilder/workprogress"
                onFileChange={(data) => handleInputChange("imageOrVideo", data)}
                initialFileUrl={form?.imageOrVideo}
              />
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
              <CustomInput
                name={"labourcount"}
                label={"Labour count"}
                className="md:px-2 px-1"
                value={form?.laborCount ?? ""}
                labelCls={"label-text font-medium text-black"}
                onChange={(e) =>
                  handleInputChange("laborCount", +e.target.value)
                }
                required
                placeholder={"Enter labour count..."}
                type={"number"}
              />
              <CustomInput
                name={"issues"}
                type={"text"}
                value={form?.issues ?? ""}
                label="Issues"
                labelCls={"label-text font-medium "}
                className="md:px-2 px-1"
                placeholder={"Enter issues you are facing..."}
                onChange={(e) => handleInputChange("issues", e.target.value)}
              />
            </div>

            <CustomInput
              type="textarea"
              label="Customer Notes"
              placeholder="Enter customer notes and remarks..."
              className="md:px-4 px-2 md:py-[6px] py-1 text-[12px] md:text-[14px] rounded-md"
              value={form?.customerNotes ?? ""}
              labelCls="label-text font-medium md:mb-2 mb-1 text-black "
              onChange={(e) =>
                handleInputChange("customerNotes", e.target.value)
              }
              name={"customerNotes"}
            />

            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
              <CustomInput
                type="text"
                name="uploadedByName"
                label="Uploader Name"
                value={form?.uploadedByName ?? ""}
                onChange={(e) =>
                  handleInputChange("uploadedByName", e.target.value)
                }
                placeholder="Enter uploader name..."
                className="md:px-2 px-1"
                labelCls="label-text font-medium text-black"
              />

              <FileInput
                name="uploadedByProfile"
                label="Uploader Image"
                labelCls="font-medium label-text text-[#000000]"
                type="file"
                folderName="custombuilder/dailyprogress"
                required={false}
                initialFileUrl={form?.uploadedByProfile ?? ""}
                onFileChange={(url) =>
                  handleInputChange("uploadedByProfile", url)
                }
              />
            </div>

            <div className="mt-4">
              <Button
                className="bg-[#5297ff] text-white md:text-[14px] flex items-center gap-1 text-[12px] font-medium md:px-3 px-1 py-1 rounded-md"
                onClick={async () => {
                  const location = await getCurrentPosition();
                  if (location) {
                    handleInputChange("uploadLocation", location);
                    handleInputChange("latitude", location.latitude);
                    handleInputChange("longitude", location.longitude);
                    handleInputChange("city", location.city);
                    handleInputChange("state", location.state);
                    handleInputChange("country", location.country);
                    setLocationInfo(location as any);
                    toast.success("Location fetched successfully!");
                  } else {
                    toast.error("Failed to fetch location");
                  }
                }}
              >
                <MapPin className="w-5 h-5 mr-2" /> Use Current Location
              </Button>
              {locationInfo && (
                <p className="mt-2 text-green-600 font-medium">
                  Location captured!
                </p>
              )}
            </div>

            <div className="w-full">
              <div className="w-full  flex justify-between items-center">
                <h3 className="text-black font-medium">Materials</h3>
                <Button
                  className="bg-[#3B82F6] md:text-[14px] text-[12px] text-white font-medium md:px-4 px-2 md:py-[6px] py-[3px] rounded-md "
                  onClick={() => setMaterialModal(true)}
                >
                  + Materials
                </Button>
              </div>

              {renderMaterials()}

              <div className="mt-4">
                {form?.materials?.length > 0 ? (
                  <table className="table-auto w-full border-collapse border border-gray-200">
                    <thead className="rounded-md">
                      <tr className="bg-[#5297ff] text-white ">
                        <th className="border border-gray-300 px-4 py-2 text-left font-bold text-[12px]">
                          Material
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-bold text-[12px]">
                          Quantity
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-bold text-[12px]">
                          About
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] font-medium">
                      {form?.materials.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            {item?.material || "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item?.quantity || "-"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item?.desc || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                    <HiOutlineDocument className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500 md:text-[16px] text-[12px] font-medium mt-2">
                      No materials added yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="bg-gray-500 text-white text-[12px] md:text-[14px] font-medium px-4 py-1 rounded-md"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white text-[12px] md:text-[14px] font-medium px-4 py-1 rounded-md"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // open edit
  // const handleEdit = (id: number) => {
  //   const log = dayProgress.logs.find((log) => log?.id === id);
  //   if (log) {
  //     setDayProgressLog({ ...log });
  //     setEditId(log.day);
  //     setAddModal(true);
  //   }
  // };
  const handleEdit = (id: number) => {
    const log = workdata.find((log) => log?.id === id);
    if (log) {
      const formattedPlaceType = Array.isArray(log.placeType)
        ? log.placeType.map((pt: string) => {
          const match = filteredPlaceTypes.find((opt) => opt.value === pt);

          return (
            match || {
              label: pt.replace(/_/g, " "),
              value: pt,
            }
          );
        })
        : [];

      setDayProgressLog({
        ...log,
        date: log.date as any,
        // placeType: Array.isArray(log.placeType) ? log.placeType : [],
        //  placeType: formattedPlaceType,
        uploadedByName: log.uploadedByName ?? "",
        uploadedByProfile: log.uploadedByProfile ?? "",
      });
      setEditId(log.id);
      setAddModal(true);
    }
  };

  // --------------------------------
  // Filters & pagination (phase-aware)
  // --------------------------------
  useEffect(() => {
    if (!workdata.length) return;
    const workTypes = [
      ...new Set(workdata.map((item) => item.workType).filter(Boolean)),
    ];
    setSelectedFilters(
      Object.fromEntries(workTypes.map((type) => [type, false])) as any,
    );
  }, [workdata]);

  const filteredByPhase = activePhaseId
    ? workdata.filter((w) => String(w.phaseId) === String(activePhaseId))
    : workdata;

  const filteredData = filteredByPhase.filter((item) => {
    const matchesSearch =
      (item.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.customerNotes || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.date || "").includes(searchQuery);
    const matchesFilters =
      Object.values(selectedFilters).every((val) => !val) ||
      selectedFilters[item.workType];
    return matchesSearch && matchesFilters;
  });

  const paginatedData = filteredData.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize,
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages],
  );

  // --------------------------------
  // CSV headers with Phase column
  // --------------------------------
  const csvHeaders = [
    ...DayProgressTableHeader,
    { key: "phaseName", label: "Phase" },
  ];
  const csvData = filteredData.map((d) => ({
    ...d,
    phaseName: phases.find((p) => p.id === d.phaseId)?.name ?? "-",
  }));

  // --------------------------------
  // Logs table render (phase-aware)
  // --------------------------------
  const renderLogs = () => {
    return (
      <div>
        {isLoading ? (
          <LoaderIcon />
        ) : (
          <div>
            {paginatedData?.length > 0 ? (
              <>
                <div className="overflow-x-auto custom-scrollbar  rounded-md shadow-custom mt-2">
                  <table className="md:min-w-full min-w-[800px] w-full md:text-[12px] text-[12px] border border-collapse border-gray-300 rounded-[6px] md:rounded-lg bg-white">
                    <thead>
                      <tr className="bg-gray-200 text-black text-left font-bold">
                        <th className="border border-gray-300 p-2 text-center">
                          Day
                        </th>
                        {DayProgressTableHeader.map((header) => (
                          <th
                            key={header.key}
                            className="border  border-gray-300 p-2 text-center text-nowrap"
                          >
                            {header.label}
                          </th>
                        ))}
                        <th className="border  border-gray-300 p-2 text-center">
                          Phase
                        </th>
                        <th className="border  border-gray-300 p-2 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((log, index) => {
                        const workTypeValue = Array.isArray(log?.workType)
                          ? log?.workType?.[0]
                          : log?.workType;
                        const placeTypeValue = Array.isArray(log?.placeType)
                          ? log?.placeType?.[0]
                          : log?.placeType;

                        return (
                          <tr
                            key={log.id ?? index}
                            className="hover:bg-gray-300 hover:border-gray-100 hover:border font-regular transition-colors duration-200"
                          >
                            <td className="border p-2 text-center">
                              {log.day ?? index + 1}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                              {log?.date}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              <span
                                className={`flex items-center justify-center gap-1 px-1 py-1 rounded-[4px] md:rounded-[10px] ${workTypeMap[workTypeValue]?.style ?? ""
                                  }`}
                              >
                                {workTypeMap[workTypeValue]?.icon}
                                {Array.isArray(log?.workType)
                                  ? log.workType.join(", ")
                                  : (log?.workType ?? "-")}
                              </span>
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              <span
                                className={`flex items-center justify-center gap-1 px-1 py-1 rounded-[4px] md:rounded-[10px] ${placeTypeMap[placeTypeValue]?.style ?? ""
                                  }`}
                              >
                                {placeTypeMap[placeTypeValue]?.icon}
                                {Array.isArray(log?.placeType)
                                  ? log.placeType.join(", ")
                                  : (log?.placeType ?? "N/A")}
                              </span>
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              <span
                                className={`flex items-center justify-center text-nowrap gap-1 px-1 py-1 rounded-[4px] md:rounded-[10px] ${getStatusClasses(
                                  log.status,
                                )}`}
                              >
                                {getStatusIcon(log.status)} {log.status}
                              </span>
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {log?.description
                                ? log.description.length > 20
                                  ? `${log.description.slice(0, 20)}...`
                                  : log.description
                                : "-"}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {log?.laborCount ?? "-"}
                            </td>
                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {Array.isArray(log?.floor)
                                ? log.floor.join(", ")
                                : (log?.floor ?? "-")}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {log?.issues ?? "-"}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap">
                              {log?.customerNotes
                                ? log.customerNotes.length > 20
                                  ? `${log.customerNotes.slice(0, 20)}...`
                                  : log.customerNotes
                                : "-"}
                            </td>
                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap">
                              {log?.uploadedByName ?? "-"}
                            </td>
                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {log?.uploadLocation ? (
                                <>
                                  <CustomTooltip
                                    label={`City: ${log.uploadLocation.city}\nState: ${log.uploadLocation.state}\nCountry: ${log.uploadLocation.country}\nLocality: ${log.uploadLocation.locality}\nLat: ${log.uploadLocation.latitude}\nLng: ${log.uploadLocation.longitude}`}
                                    position="top"
                                    tooltipBg="bg-black/70 backdrop-blur-md"
                                    tooltipTextColor="text-white py-2 px-3 font-medium"
                                    labelCls="cursor-pointer"
                                  >
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${log.uploadLocation.latitude},${log.uploadLocation.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#3586FF]  flex items-center justify-center gap-1 cursor-pointer"
                                      title={`City: ${log.uploadLocation.city}
State: ${log.uploadLocation.state}
Country: ${log.uploadLocation.country}
Locality: ${log.uploadLocation.locality}
Lat: ${log.uploadLocation.latitude}
Lng: ${log.uploadLocation.longitude}`}
                                    >
                                      <MapPin className="md:w-4 md:h-4 w-3 h-3" />
                                      {log.uploadLocation.city}
                                    </a>
                                  </CustomTooltip>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="text-center md:py-2 py-2 md:px-2 px-2 border border-gray-300">
                              {log?.uploadedByProfile?.length > 0 ? (
                                <Button
                                  className="text-[#3586FF]  text-nowrap font-medium"
                                  onClick={() => {
                                    setSelectedMedia(
                                      (Array.isArray(log.uploadedByProfile)
                                        ? log.uploadedByProfile
                                        : [log.uploadedByProfile]
                                      )
                                        .filter(Boolean)
                                        .map((item: string) => ({
                                          url: item,
                                          createdAt: log.createdAt,
                                          source: "uploadedByProfile",
                                        })),
                                    );

                                    setMediaModalOpen(true);
                                  }}
                                >
                                  View Uploader
                                </Button>
                              ) : (
                                "No Media"
                              )}
                            </td>

                            <td className="text-center border border-gray-300">
                              {log?.imageOrVideo?.length > 0 ? (
                                <Button
                                  className="text-[#3586FF]  text-nowrap font-medium"
                                  onClick={() => {
                                    setSelectedMedia(
                                      log.imageOrVideo.map((item) => ({
                                        url: item,
                                        createdAt: log.createdAt,
                                        source: "imageOrVideo",
                                      })),
                                    );
                                    setMediaModalOpen(true);
                                  }}
                                >
                                  View Media ({log.imageOrVideo.length})
                                </Button>
                              ) : (
                                "No Media"
                              )}
                            </td>

                            <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300">
                              {phases.find((p) => p.id === log.phaseId)?.name ??
                                "-"}
                            </td>

                            <td>
                              <div className="flex items-center md:gap-3 gap-1">
                                <CustomTooltip
                                  label="Access Restricted Contact Admin"
                                  position="bottom"
                                  tooltipBg="bg-black/60 backdrop-blur-md"
                                  tooltipTextColor="text-white py-2 px-4 font-medium"
                                  labelCls="text-[10px] font-medium"
                                  showTooltip={hasPermission(
                                    "daily_progress",
                                    "edit",
                                  )}
                                >
                                  <Button
                                    disabled={hasPermission(
                                      "daily_progress",
                                      "edit",
                                    )}
                                    className=" md:text-[16px] text-[12px] font-medium  rounded-md px-3 py-1"
                                    onClick={() => handleEdit(log?.id)}
                                  >
                                    <FaEdit className="text-[#3586FF]  md:text-[16px] text-[12px] cursor-pointer" />
                                  </Button>
                                </CustomTooltip>

                                <Button
                                  className=" md:text-[16px] text-[12px] font-medium  rounded-md px-3 py-1"
                                  onClick={() => {
                                    setViewModalOpen(true);
                                    setSelectedLog(log);
                                  }}
                                >
                                  <FaEye className="text-gray-600 md:text-[16px] text-[12px] cursor-pointer" />
                                </Button>

                                <CustomTooltip
                                  label="Access Restricted Contact Admin"
                                  position="bottom"
                                  tooltipBg="bg-black/60 backdrop-blur-md"
                                  tooltipTextColor="text-white py-2 px-4 font-medium"
                                  labelCls="text-[10px] font-medium"
                                  showTooltip={hasPermission(
                                    "daily_progress",
                                    "delete",
                                  )}
                                >
                                  <Button
                                    onClick={() => handleDelete(log?.id)}
                                    className="px-3 py-1 text-white rounded"
                                    disabled={hasPermission(
                                      "daily_progress",
                                      "delete",
                                    )}
                                  >
                                    <LuTrash2 className="md:text-[16px] text-[12px] text-red-500 cursor-pointer" />
                                  </Button>
                                </CustomTooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Media modal */}
                {mediaModalOpen && (
                  <Modal
                    isOpen={mediaModalOpen}
                    closeModal={() => setMediaModalOpen(false)}
                    title="Media Viewer"
                    rootCls="z-[99999]"
                    titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                    isCloseRequired={true}
                    className="md:max-w-[800px] max-w-[320px] w-full"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-[10px]">
                      {selectedMedia.map((item, idx) => {
                        const isVideo =
                          item?.url.endsWith(".mp4") ||
                          item?.url?.endsWith(".webm");
                        return (
                          <div
                            key={idx}
                            className="w-[160px] h-[150px] relative"
                          >
                            {isVideo ? (
                              <video
                                src={item?.url}
                                controls
                                className="w-full h-full object-cover md:rounded-[10px] rounded-[4px]"
                              />
                            ) : (
                              <Image
                                src={item?.url}
                                alt={`Media ${idx + 1}`}
                                fill
                                className="md:rounded-[10px] rounded-[4px] object-cover"
                              />
                            )}
                            {item.source === "uploadedByProfile" && (
                              <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 md:rounded-b-[10px] rounded-b-[4px]">
                                {new Date(item?.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Modal>
                )}

                {/* View modal */}
                {viewModalOpen && selectedLog && (
                  <Modal
                    isOpen={viewModalOpen}
                    closeModal={() => setViewModalOpen(false)}
                    titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                    isCloseRequired={true}
                    className="md:max-w-[1200px] max-w-[290px] w-full md:rounded-[10px] rounded-[4px]"
                    rootCls="z-[99999]"
                  >
                    <div
                      key={selectedLog?.day}
                      className="relative md:px-10 bg-white mb-4 md:gap-20 gap-4 md:py-[20px] px-6 py-5 flex md:flex-row flex-col justify-between items-center"
                    >
                      <div>
                        <p className="bg-[#5297ff] absolute left-6 -top-[5px] transform -translate-x-[20%] text-white px-4 py-[6px] rounded-[8px] mb-4 font-medium md:text-[14px] text-[10px] md:mb-2  text-nowrap flex items-center gap-1">
                          <TbProgressBolt /> Day {selectedLog?.day}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 md:gap-x-4 gap-x-3 md:gap-y-6 gap-y-3 w-full md:text-[16px] text-[12px]">
                        {Object.entries(selectedLog).map(
                          ([Key, value], index) => {
                            if (
                              [
                                "imageOrVideo",
                                "updatedAt",
                                "createdAt",
                                "day",
                                "id",
                                "expensesIncurred",
                                "roomType",
                                "featureType",
                                "phaseId",

                                "customBuilder",
                                "uploadedBy",
                                "uploadLocation",
                                "uploadedByProfile",
                              ].includes(Key)
                            )
                              return null;

                            const label =
                              keyLabelMap[Key] ||
                              Key.charAt(0).toUpperCase() + Key.slice(1);
                            return (
                              <div
                                key={index}
                                className="flex items-start md:gap-2 gap-1"
                              >
                                <div className="font-medium text-[16px] md:text-[20px]">
                                  {getIcon(label)}
                                </div>
                                <div>
                                  <p className="font-medium mb-1 md:text-[16px] text-[12px]">
                                    {Key.charAt(0).toUpperCase() + Key.slice(1)}
                                  </p>
                                  <p className="md:text-sm text-[12px] text-gray-700">
                                    {Array.isArray(value)
                                      ? value.every(
                                        (v) => typeof v === "string",
                                      )
                                        ? value.join(", ")
                                        : value.every(
                                          (v) =>
                                            typeof v === "object" &&
                                            v !== null,
                                        )
                                          ? value
                                            .map((v) =>
                                              "material" in v &&
                                                "quantity" in v
                                                ? `${(v as any).material} - ${(v as any).quantity
                                                }`
                                                : JSON.stringify(v),
                                            )
                                            .join(", ")
                                          : JSON.stringify(value)
                                      : typeof value === "object" &&
                                        value !== null
                                        ? JSON.stringify(value)
                                        : value !== null &&
                                          value !== undefined &&
                                          value !== ""
                                          ? String(value)
                                          : "N/A"}
                                  </p>
                                </div>
                              </div>
                            );
                          },
                        )}

                        {/* Phase display */}
                        <div className="flex items-start md:gap-2 gap-1">
                          <div className="font-medium text-[16px] md:text-[20px]">
                            {getIcon("Phase")}
                          </div>
                          <div>
                            <p className="font-medium mb-1 md:text-[16px] text-[12px]">
                              Phase
                            </p>
                            <p className="md:text-sm text-[12px] text-gray-700">
                              {phases.find((p) => p.id === selectedLog?.phaseId)
                                ?.name ?? "-"}
                            </p>
                          </div>
                        </div>

                        {selectedLog?.imageOrVideo?.length > 0 && (
                          <div className="col-span-2 md:col-span-0 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[20px] -mt-1">
                                {getIcon("Images")}
                              </p>
                              <p className="md:text-[16px] text-[12px] font-medium mb-1">
                                Images and Videos:
                              </p>
                            </div>

                            <div className="flex flex-wrap md:gap-3 gap-2">
                              {selectedLog.imageOrVideo.map(
                                (item: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative md:w-[80px] md:h-[70px] w-[60px] h-[60px]"
                                  >
                                    <Image
                                      src={item}
                                      alt={`Media ${idx + 1}`}
                                      fill
                                      className="rounded-md object-cover"
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                        {selectedLog?.uploadedByProfile && (
                          <div className="col-span-2 md:col-span-0 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[20px] -mt-1">
                                {getIcon("Images")}
                              </p>
                              <p className="md:text-[16px] text-[12px] font-medium mb-1">
                                Uploader
                              </p>
                            </div>

                            <div className="flex flex-wrap md:gap-3 gap-2">
                              {(Array.isArray(selectedLog.uploadedByProfile)
                                ? selectedLog.uploadedByProfile
                                : [selectedLog.uploadedByProfile]
                              ).map((item: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="relative md:w-[80px] md:h-[70px] w-[60px] h-[60px]"
                                >
                                  <Image
                                    src={item}
                                    alt={`Uploader Media ${idx + 1}`}
                                    fill
                                    className="rounded-md object-cover"
                                  />
                                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-1 md:rounded-b-[10px] rounded-b-[4px]">
                                    {new Date(
                                      selectedLog?.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Modal>
                )}

                <div className="flex md:flex-row flex-col items-center justify-between md:mt-0 mt-2 ">
                  <Legend
                    data={[
                      { colorclass: "bg-green-500", label: "Completed" },
                      { colorclass: "bg-[#5297ff]", label: "In Progress" },
                      { colorclass: "bg-yellow-500", label: "Pending" },
                      { colorclass: "bg-red-500", label: "Delayed" },
                    ]}
                  />
                  {filteredData.length > pageSize && (
                    <PaginationControls
                      currentPage={currentpage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      pageSize={pageSize}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="md:mt-6 mt-4 max-w-xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <TbProgressBolt className="text-[#3586FF] text-3xl" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-gray-800 mb-1">No progress logged yet</h3>
                  <p className="text-[13px] text-gray-500">Follow these steps to start tracking your construction progress</p>
                </div>

                <div className="space-y-3">
                  {[
                    { step: 1, title: "Set Service Estimates", desc: "Click on Estimated Cost / Days cards above to set per-service day & cost estimates.", done: totalEstimatedDays > 0 },
                    { step: 2, title: "Create Phases (Optional)", desc: "Click '+ Phase' to create phases manually, or use Auto-Generate for smart phase creation.", done: hasPhases },
                    { step: 3, title: "Add Daily Progress", desc: "Click '+ Add Progress' to log work done each day with photos, materials, and labor count.", done: workdata.length > 0 },
                  ].map((item) => (
                    <div key={item.step} className={`flex items-start gap-3 p-3 rounded-lg border ${item.done ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                      <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold ${item.done ? "bg-green-500 text-white" : "bg-gray-300 text-white"}`}>
                        {item.done ? "✓" : item.step}
                      </div>
                      <div>
                        <p className={`text-[13px] font-medium ${item.done ? "text-green-700" : "text-gray-800"}`}>{item.title}</p>
                        <p className="text-[11px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --------------------------------
  // Legend + Trends (unchanged)
  // --------------------------------
  const Legend = ({
    data,
  }: {
    data: { colorclass: string; label: string }[];
  }) => {
    return (
      <div className="flex items-center md:gap-3 gap-1 md:text-[12px] text-[10px] font-medium">
        {data.map(({ colorclass, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className={`md:w-3 w-2.5 md:h-3 h-2.5 rounded-[4px] ${colorclass}`}
            ></span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  };

  // --------------------------------
  // Tabs
  // --------------------------------
  const [activeTab, setActiveTab] = useState<string>("OverView");
  const tabLabels = [
    {
      key: "OverView",
      label: "OverView",
      icon: <FaInfoCircle className="text-[12px]" />,
    },
    {
      key: "Trends",
      label: "Trends",
      icon: <FaChartLine className="text-[12px]" />,
    },
  ];

  // --------------------------------
  // Final return
  // --------------------------------
  return (
    <div className="w-full px-1">
      <TourStep
        order={8}
        targetRef={trendsRef}
        text="Trends: View analytics and performance charts for your project."
      />

      {/* Tabs */}
      <div className="flex items-center md:gap-4 gap-1 mt-5 md:mb-3 mb-2">
        {tabLabels.map((item) => (
          <Button
            key={item.key}
            ref={item.key === "Trends" ? trendsRef : null}
            onClick={() => setActiveTab(item.key)}
            className={`md:px-4 py-2 px-2 md:py-1 max-md:text-nowrap rounded-md transform uppercase text-[10px] md:text-[12px] font-bold flex items-center gap-2 ${activeTab === item.key
              ? "bg-[#3586FF] text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>

      <div className="w-full bg-white px-3 py-2 md:px-5 md:py-4 rounded-md shadow-custom">
        {/* Phase Bar + Phase Modal */}
        {renderPhaseBar()}
        {renderPhaseModal()}

        {activeTab === "OverView" ? (
          <>
            {/* Add/Edit Day Log Modal */}
            {addModal && renderAddEditModal()}

            {/* Header */}
            <div className="w-full flex flex-row justify-between items-center">
              <div className="flex flex-row justify-between w-full">
                <h2 className="md:text-[18px] text-[16px] font-bold text-[#3586FF]   mb-2">
                  Day Progress Tracker
                </h2>
              </div>
            </div>

            {/* KPI Tiles (phase-aware) */}
            {(() => {
              const totalWorked = selectedPhase?.actualDays ?? phaseLogs.length;
              const totalSpent = phaseLogs.reduce((s, l) => s + (Number(l.expensesIncurred) || 0), 0);
              const daysProgress = estimatedDaysPhase > 0 ? Math.min(100, Math.round((totalWorked / estimatedDaysPhase) * 100)) : 0;
              const costProgress = (estimatedCostPhase ?? 0) > 0 ? Math.min(100, Math.round((totalSpent / (estimatedCostPhase ?? 1)) * 100)) : 0;
              const hasEstimates = estimatedDaysPhase > 0 || (estimatedCostPhase ?? 0) > 0;
              const daysColor = daysProgress > 90 ? "bg-red-500" : daysProgress > 70 ? "bg-amber-500" : "bg-blue-500";
              const costColor = costProgress > 90 ? "bg-red-500" : costProgress > 70 ? "bg-amber-500" : "bg-green-500";
              const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

              return (
                <div className="grid md:grid-cols-4 grid-cols-2 md:gap-4 gap-3 my-3 mb-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-[12px] font-medium text-gray-500">Estimated Cost</label>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded" onClick={() => setOpenModal(true)}>
                        <EditIcon />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <RiMoneyRupeeCircleLine className="text-green-500" />
                      <span className="md:text-[18px] text-[14px] font-bold text-gray-900">
                        {hasEstimates ? formatCurrency(estimatedCostPhase ?? 0) : "Not set"}
                      </span>
                    </div>
                    {hasEstimates && (estimatedCostPhase ?? 0) > 0 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Spent: {formatCurrency(totalSpent)}</span>
                          <span>{costProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${costColor} rounded-full transition-all duration-500`} style={{ width: `${costProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {!hasEstimates && (
                      <p className="text-[10px] text-amber-500">Set service estimates to track budget</p>
                    )}
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-[12px] font-medium text-gray-500">Estimated Days</label>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded" onClick={() => setOpenModal(true)}>
                        <EditIcon />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MdDateRange className="text-blue-500" />
                      <span className="md:text-[18px] text-[14px] font-bold text-gray-900">
                        {hasEstimates ? estimatedDaysPhase : "Not set"}
                      </span>
                      {hasEstimates && <span className="text-[11px] text-gray-400">days</span>}
                    </div>
                    {hasEstimates && estimatedDaysPhase > 0 && (
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Worked: {totalWorked} days</span>
                          <span>{daysProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${daysColor} rounded-full transition-all duration-500`} style={{ width: `${daysProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {!hasEstimates && (
                      <p className="text-[10px] text-amber-500">Set service estimates to track timeline</p>
                    )}
                  </div>
                  {openModal && (
                    <Modal
                      isOpen={openModal}
                      closeModal={() => setOpenModal(false)}
                      titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                      isCloseRequired={true}
                      className="md:max-w-[1200px] max-w-[360px] w-full md:rounded-[10px] rounded-[4px]"
                      rootCls="z-[99999]"
                    >
                      <div className="w-full flex flex-col md:gap-5 gap-3 md:p-4 p-2 mt-5 bg-white rounded-lg">
                        <div className="flex flex-col md:gap-2 gap-1">
                          <h2 className="md:text-[18px] text-[14px] font-bold text-gray-900">
                            Service Estimation
                          </h2>
                          <p className="text-gray-500 md:text-[14px] text-[10px]">
                            Manage estimates for selected services
                          </p>
                        </div>
                        <div className="flex flex-col md:gap-2 gap-1">
                          <h3 className="md:text-[14px] text-[10px] font-medium text-gray-800">
                            Select Service to Estimate
                          </h3>
                          <div className="flex md:gap-4 gap-2  py-2 md:py-0 items-center md:mt-4 mt-0 px-0 md:mb-4 mb-2 md:overflow-hidden overflow-auto">
                            {selectedServices?.length > 0 &&
                              selectedServices.map((item) => {
                                const estimate = estimates?.[item?.value];

                                const hasEstimates =
                                  estimate &&
                                  estimate.estimatedDays > 0 &&
                                  estimate.estimatedCost > 0;
                                return (
                                  <Button
                                    key={item.value}
                                    onClick={() => {
                                      setActiveService(item.value);
                                      const existing = serviceEstimates[
                                        item.value
                                      ] ?? {
                                        estimatedCost: 0,
                                        estimatedDays: 0,
                                      };

                                      setserviceDayAndCostEstimation({
                                        estimatedCost: existing.estimatedCost ?? 0,
                                        estimatedDays: existing.estimatedDays ?? 0,
                                      });
                                      setOpenServicesModal(true);
                                    }}
                                    className={`md:px-4 py-1 px-2 md:py-2 max-md:text-nowrap rounded-[10px] text-[12px] md:text-[16px] flex items-center gap-1 font-medium
          ${hasEstimates
                                        ? "bg-[#5297ff] text-white"
                                        : "bg-gray-200 text-gray-600"
                                      }`}
                                  >
                                    {hasEstimates && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                    {item.value}
                                  </Button>
                                );
                              })}
                          </div>
                        </div>

                        {openServicesModal && (
                          <Modal
                            isOpen={openServicesModal}
                            closeModal={() => setOpenServicesModal(false)}
                            title={`${activeService}`}
                            titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                            isCloseRequired={false}
                            className="md:max-w-[800px] max-w-[290px] w-full"
                            rootCls="z-[99999]"
                          >
                            <div className="w-full flex flex-col md:gap-5 gap-3 md:p-4 p-2 mt-5 bg-white rounded-lg">
                              <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-2 ">
                                <div className="">
                                  <CustomInput
                                    name={"estimatedDays"}
                                    label={"Estimated Days"}
                                    className="md:px-2 px-1 md:py-1 py-0.5 md:h-[15px] h-[10px]"
                                    value={
                                      servicedayAndCostEstimation?.estimatedDays
                                    }
                                    labelCls={
                                      "md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
                                    }
                                    onChange={(e) =>
                                      handleServiceEstimationChange(
                                        "estimatedDays",
                                        +e.target.value,
                                      )
                                    }
                                    errorMsg={estimationErrors.estimatedDays}
                                    placeholder={"Enter days"}
                                    type={"number"}
                                  />
                                </div>
                                <div className="">
                                  <CustomInput
                                    name={"estimatedCost"}
                                    label={"Estimated Cost"}
                                    className="md:px-2 px-1 md:py-1 py-0.5 md:h-[15px] h-[10px]"
                                    value={
                                      servicedayAndCostEstimation?.estimatedCost
                                    }
                                    labelCls={
                                      "md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
                                    }
                                    onChange={(e) =>
                                      handleServiceEstimationChange(
                                        "estimatedCost",
                                        +e.target.value,
                                      )
                                    }
                                    errorMsg={estimationErrors.estimatedCost}
                                    placeholder={"Enter cost"}
                                    type={"number"}
                                  />
                                </div>
                              </div>

                              <div className="flex w-full items-center justify-between mt-4">
                                <Button
                                  className="md:py-2 py-1 md:px-[28px] px-[14px] md:text-[16px] text-[12px] font-medium rounded-md border-2 border-[#3B82F6]"
                                  onClick={() => {
                                    setEstimationErrors({});
                                    setOpenServicesModal(false);
                                  }}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  className="md:py-2 py-1 md:text-[16px] text-[12px] md:px-[14px] px-[7px] rounded-md border-2 bg-[#3B82F6] text-white self-end"
                                  onClick={handleServiceEstimationSubmit}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </Modal>
                        )}
                        {estimates &&
                          Object?.entries(estimates)?.map(([service, estimate]) => (
                            <div
                              key={service}
                              className="md:p-4 p-2 bg-white flex flex-col gap-2 border shadow-custom md:rounded-[10px] rounded-[4px]"
                            >
                              <div className="flex justify-between items-center">
                                <p className="font-medium text-gray-600 md:text-sm text-[10px]">
                                  {service}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 md:text-sm text-[10px]">
                                    <MdDateRange />
                                    <span className=" font-bold">
                                      {estimate?.estimatedDays} days
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 md:text-sm text-[10px]">
                                    <RiMoneyRupeeCircleLine />
                                    <span className=" font-bold">
                                      {estimate?.estimatedCost}
                                    </span>
                                  </div>
                                  <div>
                                    <Button
                                      className="flex flex-row items-center md:gap-2 gap-1 md:px-4 px-1 md:py-1 py-0.5 border-[2px] md:text-[16px] text-[10px] font-medium text-[#3586FF]  border-[#3B82F6] rounded-md"
                                      onClick={() =>
                                        handleserviceEstimationEdit(service)
                                      }
                                    >
                                      <MdEdit />
                                      <span className="md:block hidden">Edit</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                        <div className="grid grid-cols-2 md:gap-6 gap-2 md:rounded-[10px] rounded-[4px] bg-blue-50 p-1 md:p-4 ">
                          <div className="">
                            <CustomInput
                              name={"estimatedDays"}
                              label={"Total Estimated Days"}
                              className="md:px-2 px-1 md:py-1 py-0"
                              value={totalEstimatedDays}
                              labelCls={
                                "md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
                              }
                              onChange={(e) =>
                                handleEstimationChange(
                                  "estimatedDays",
                                  +e.target.value,
                                )
                              }
                              placeholder={"Enter days"}
                              type={"number"}
                            />
                          </div>
                          <div className="">
                            <CustomInput
                              name={"estimatedCost"}
                              label={"Total Estimated Cost"}
                              className="md:px-2 px-1 md:py-1 py-0"
                              value={totalEstimatedCost}
                              labelCls={
                                "md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
                              }
                              onChange={(e) =>
                                handleEstimationChange(
                                  "estimatedCost",
                                  +e.target.value,
                                )
                              }
                              placeholder={"Enter cost"}
                              type={"number"}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Legend
                            data={[
                              { colorclass: "bg-[#5297ff]", label: "Completed" },
                              { colorclass: "bg-gray-200", label: "Not completed" },
                            ]}
                          />
                        </div>
                      </div>
                    </Modal>
                  )}

                  <div className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <label className="text-[12px] font-medium text-gray-500 block mb-2">Remaining Days</label>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MdDateRange className={`${(remainingDaysPhase ?? 0) <= 0 ? "text-red-500" : (remainingDaysPhase ?? 0) <= 5 ? "text-amber-500" : "text-blue-500"}`} />
                      <span className={`md:text-[18px] text-[14px] font-bold ${(remainingDaysPhase ?? 0) <= 0 ? "text-red-600" : "text-gray-900"}`}>
                        {hasEstimates ? Math.max(0, remainingDaysPhase ?? 0) : "-"}
                      </span>
                      {hasEstimates && <span className="text-[11px] text-gray-400">days left</span>}
                    </div>
                    {hasEstimates && (remainingDaysPhase ?? 0) <= 0 && estimatedDaysPhase > 0 && (
                      <p className="text-[10px] text-red-500 font-medium">Timeline exceeded</p>
                    )}
                    {hasEstimates && (remainingDaysPhase ?? 0) > 0 && (remainingDaysPhase ?? 0) <= 5 && (
                      <p className="text-[10px] text-amber-500 font-medium">Nearing deadline</p>
                    )}
                  </div>

                  <div
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/custom-builder/${custom_builder_id}/workprogress/queries`,
                      )
                    }
                  >
                    <label className="text-[12px] font-medium text-gray-500 block mb-2">Queries</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[12px] font-medium">
                        <MdPending className="text-blue-500" />
                        Active
                        <span className="bg-blue-100 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                          {activeQueries.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-[12px] font-medium">
                        <BsCheck2Circle className="text-green-500" />
                        Resolved
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                          {resolvedQueries.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Toolbar: Search/Filters/Export/Invoices/Add */}
            <div className="shadow-custom p-2 border border-gray-300">
              <TourStep
                order={7}
                targetRef={searchFilterRef}
                text="Search & Filter: Use this to filter work types, days, or dates."
              />

              <TourStep
                order={6}
                targetRef={exportRef}
                text="Export: Download the progress data as a CSV file."
              />

              <TourStep
                order={5}
                targetRef={invoicesRef}
                text="Invoices: View all invoices related to this custom builder."
              />
              <div className="flex md:flex-row flex-col items-center md:gap-3 gap-1 mt-4 w-full max-w-[100%]">
                <div className="flex-[2] z-[99]" ref={searchFilterRef}>
                  <ReusableSearchFilter
                    searchText={searchQuery}
                    placeholder="search work type, day, date"
                    onSearchChange={setSearchQuery}
                    filters={(() => {
                      const allWorkTypes = Array.from(
                        new Set(
                          workdata.map((item) =>
                            String(item.workType).toLowerCase(),
                          ),
                        ),
                      );

                      const filteredWorkTypes =
                        selectPhase && activePhaseMap[selectPhase]
                          ? allWorkTypes.filter((wt) =>
                            activePhaseMap[selectPhase].includes(wt),
                          )
                          : allWorkTypes;

                      return filteredWorkTypes.map(
                        (workType): FilterOption => ({
                          id: workType,
                          label: workType
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" "),
                        }),
                      );
                    })()}
                    className="md:text-[12px] text-[10px]"
                    selectedFilters={selectedFilters}
                    onFilterChange={setSelectedFilters}
                  />
                </div>

                <div className="flex items-center md:gap-3 gap-1">
                  <div ref={exportRef}>
                    <CSVLink
                      data={csvData}
                      headers={csvHeaders}
                      filename="Progressdata"
                    >
                      <Button className="bg-[#2F79E9] md:px-5 px-3 md:py-[6px] py-2 md:text-[14px] text-[12px] rounded-md text-white font-medium flex items-center gap-1">
                        <MdFileDownload /> Export
                      </Button>
                    </CSVLink>
                  </div>
                  <div ref={invoicesRef}>
                    <Button
                      className="bg-[#2F79E9] md:px-5 px-3 md:py-[6px] py-1 md:text-[14px] text-[12px] rounded-md text-white font-medium flex items-center gap-1"
                      onClick={() =>
                        router.push(
                          `/custom-builder/${custom_builder_id}/workprogress/invoices`,
                        )
                      }
                    >
                      <FaFileInvoice size={12} />
                      Invoices
                    </Button>
                  </div>
                  <TourStep
                    order={4}
                    targetRef={addProgressRef}
                    text="Add Progress: Click here to log daily progress for the selected phase."
                  />

                  <div ref={addProgressRef}>
                    <CustomTooltip
                      label="Access Restricted Contact Admin"
                      position="bottom"
                      tooltipBg="bg-black/60 backdrop-blur-md"
                      tooltipTextColor="text-white py-2 px-4 font-medium"
                      labelCls="text-[10px] font-medium"
                      showTooltip={hasPermission("daily_progress", "create")}
                    >
                      <Button
                        className="bg-[#2F79E9] md:px-5 px-3 md:py-[6px] py-2 md:text-[14px] text-[12px] rounded-md text-white font-medium text-nowrap"
                        onClick={() => {
                          setEditId(null);
                          setDayProgressLog({
                            ...defaultValues,
                            phaseId: activePhaseId ?? null,
                          });
                          setAddModal(true);
                        }}
                        disabled={hasPermission("daily_progress", "create")}
                      >
                        + Add Progress
                      </Button>
                    </CustomTooltip>
                  </div>
                </div>
              </div>

              {/* Logs table */}
              <div>{renderLogs()}</div>
            </div>
          </>
        ) : (
          <Trends
            workData={workdata}
            phases={phases}
            estimatedCost={totalEstimatedCost ?? 0}
            estimatedDays={totalEstimatedDays ?? 0}
            activePhaseId={activePhaseId}
          />
        )}
      </div>
    </div>
  );
};
