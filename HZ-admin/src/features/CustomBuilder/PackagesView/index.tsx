import React, { useState, useEffect } from "react";
import Modal from "@/src/common/Modal";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import { MdDelete, MdEdit } from "react-icons/md";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import { ConstructionScope } from "../helper";
import { GiPaintRoller } from "react-icons/gi";
import { HiOutlineHome } from "react-icons/hi";

import CustomInput from "@/src/common/FormElements/CustomInput";
import { useRouter } from "next/router";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import Button from "@/src/common/Button";
import useCustomBuilderStore from "@/src/stores/custom-builder";

import { MdArrowBack } from "react-icons/md";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import SearchComponent from "@/src/common/SearchSelect";
import BackRoute from "@/src/common/BackRoute";

export default function PackagesView() {
  const [packages, setPackages] = useState([]);
  const [OpenModal, setOpenModal] = useState(false);
  const [OpenPackageModal, setOpenPackageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(
    null
  );
  const [selectedScope, setSelectedScope] = useState<string>("house");
  const { customerOnboarding } = useCustomBuilderStore();
  const { propertyInformation } = customerOnboarding;
  const { hasPermission, permissions } = usePermissionStore((state) => state);

  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedPackageToDelete, setSelectedPackageToDelete] = useState(null);

  const [editingPackage, setEditingPackage] = useState(null);

  const [OpenFeatureModal, setOpenFeatureModal] = useState(false);
  const [packageData, setPackageData] = useState<{
    name: string;
    ratePerSqft: number;
    branchId: string;
    features: any[];
    construction_scope: string;
  }>({
    name: "",
    ratePerSqft: 0,
    branchId: "",
    features: [],
    construction_scope: "",
  });
  const router = useRouter();

  const [featureInformation, setFeatureInformation] = useState({
    title: "",
    // points: [""],
  });
  const [points, setPoints] = useState("");

  const CloseModel = () => {
    setPackageData((prev) => ({
      name: "",
      ratePerSqft: 0,
      branchId: prev.branchId,
      features: [],
      construction_scope: "",
    }));
    setOpenPackageModal(false);
    setEditingPackage(null);
  };
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: any }
  ) => {
    if ("target" in e) {
      const { name, value } = e.target;
      setPackageData({ ...packageData, [name]: value });
    } else {
      setPackageData({ ...packageData, [e.name]: e.value });
    }
  };

  const handleFeatureChange = (field: string, value: string) => {
    setFeatureInformation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const addFeatures = async () => {
    if (!featureInformation.title.trim()) {
      toast.error("Feature title is required");
      return;
    }

    if (!points.trim()) {
      toast.error("Feature description is required");
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(points, "text/html");
    const parsedPoints = Array.from(doc.querySelectorAll("li, p"))
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);

    if (parsedPoints.length === 0) {
      toast.error("Please provide at least one valid point");
      return;
    }
    const newFeature = {
      title: featureInformation.title.trim(),
      points: parsedPoints,
    };
    let updatedFeatures;
    if (isEditingFeature && editingFeatureIndex !== null) {
      updatedFeatures = [...packageData.features];
      updatedFeatures[editingFeatureIndex] = newFeature;
    } else {
      updatedFeatures = [...packageData.features, newFeature];
    }
    const updatedPackage = {
      ...packageData,
      ratePerSqft: Number(packageData.ratePerSqft),
      features: updatedFeatures,
    };

    if (editingPackage?.id) {
      try {
        const response = await apiClient.patch(
          `${apiClient.URLS.packages}/${editingPackage.id}`,
          updatedPackage,
          true
        );
        if (response.status !== 200) {
          throw new Error("Failed to save changes");
        }
        setPackageData(updatedPackage);
        toast.success(
          isEditingFeature
            ? " Feature updated successfully"
            : "Feature added successfully"
        );
        if (fetchPackages) {
          await fetchPackages(selectedBranchId, selectedScope);
        }
        setFeatureInformation({ title: "" });
        setPoints("");
        setOpenFeatureModal(false);
        setIsEditingFeature(false);
      } catch (error) {
        console.error("Error saving item:", error);
        toast.error("Failed to save changes to server");
      }
    } else {
      setPackageData(updatedPackage);
      toast.success(
        isEditingFeature
          ? "Feature updated successfully"
          : "Feature added successfully"
      );

      setFeatureInformation({ title: "" });
      setPoints("");
      setOpenFeatureModal(false);
      setIsEditingFeature(false);
      setEditingFeatureIndex(null);
    }
  };
  const construction_scope = propertyInformation?.construction_scope;
  const [errors, setErrors] = useState<{ construction_scope?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!packageData.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (!packageData.ratePerSqft || isNaN(Number(packageData.ratePerSqft))) {
      toast.error("Valid Rate per Sqft is required");
      return;
    }
    if (!selectedBranchId) {
      toast.error("Please select a branch");
      return;
    }

    if (!packageData.construction_scope) {
      setErrors((prev) => ({
        ...prev,
        construction_scope: "Please select a construction scope",
      }));
      return;
    }

    const normalizedFeatures = packageData.features.map((feature) => ({
      title: feature.title.trim(),
      points: feature.points.map((pt) => pt.trim()).filter(Boolean),
    }));

    const payload = {
      name: packageData.name.trim(),
      ratePerSqft: Number(packageData.ratePerSqft),
      branchId: selectedBranchId,
      features: normalizedFeatures,
      construction_scope: packageData.construction_scope,
    };

    try {
      let response = null;

      if (editingPackage?.id) {
        response = await apiClient.patch(
          `${apiClient.URLS.packages}/${editingPackage.id}`,
          payload,
          true
        );
      } else {
        response = await apiClient.post(apiClient.URLS.packages, payload, true);
      }

      if (response?.status === 200 || response?.status === 201) {
        const updated = response.body;

        setPackageData((prev) => ({
          ...prev,
          ...updated,
        }));

        if (fetchPackages) {
          await fetchPackages(selectedBranchId, selectedScope);
        }

        toast.success(
          response.status === 201
            ? "Package created successfully"
            : "Package updated successfully"
        );

        CloseModel();
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("Failed to submit package");
    }
  };

  const editFeature = (index: number) => {
    const featureToedit = packageData.features[index];
    setFeatureInformation({
      title: featureToedit.title,
    });
    const htmlPoints = featureToedit.points
      .map((point) => `<li>${point}</li>`)
      .join("");
    setPoints(`<ul>${htmlPoints}</ul>`);
    setEditingFeatureIndex(index);
    setIsEditingFeature(true);
    setOpenFeatureModal(true);
  };
  const removeFeature = (index: number) => {
    const updatedFeature = packageData.features.filter((__, i) => i !== index);
    setPackageData((prev) => ({
      ...prev,
      features: updatedFeature,
    }));
  };

  const fetchPackages = async (
    selectedBranchId: number | string,
    constructionScope: string
  ) => {
    if (!selectedBranchId || !constructionScope) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.packages}/branch/${selectedBranchId}/scope/${constructionScope}`,{},true
      );
      if (response.status === 200) {
        setPackages(response.body);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await apiClient.delete(
        `${apiClient.URLS.packages}/${id}`,{},
        true
      );
      if (response.status === 200) {
        setPackages((prevData: any) =>
          prevData.filter((p: any) => p.id !== id)
        );
        toast.success("package deleted successfully");
        setOpenDeleteModal(false);
        setSelectedPackageToDelete(null);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);

    setPackageData({
      name: pkg.name || "",
      ratePerSqft: pkg.ratePerSqft?.toString() || "",
      branchId: pkg?.branch?.id || "",
      features: pkg.features || [],
      construction_scope: pkg?.construction_scope,
    });

    // if (pkg.state?.id) {
    //   setSelectedStateId(pkg.state.id);
    //   fetchTowns(pkg.state.id);
    // }

    setOpenPackageModal(true);
  };
  const scopeLabels: Record<string, { label: string; icon: React.ReactNode }> =
    {
      house: { label: "House ", icon: <HiOutlineHome /> },
      interior: { label: "Interior ", icon: <GiPaintRoller /> },
    };

  const closeFeatureModal = () => {
    setFeatureInformation({ title: "" });
    setPoints("");
    setIsEditingFeature(false);
    setEditingFeatureIndex(null);
    setOpenFeatureModal(false);
  };
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const fetchBranches = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.branches}/idwithname`,
        {},
        true
      );
      const list: any[] = res.body || [];
      setBranchOptions(
        list.map((branch) => ({
          label: branch.branchName,
          value: branch.branchId,
        }))
      );
    } catch (error) {
      console.error("error is ", error);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId && selectedScope) {
      fetchPackages(selectedBranchId, selectedScope);
    }
  }, [selectedBranchId, selectedScope]);

  const selectedScopeOption = ConstructionScope.find(
    (opt) => opt.toLowerCase() === packageData.construction_scope?.toLowerCase()
  );
  console.log(branchOptions)

  if (isLoading) {
    return <Loader />;
  }
  return (
    <>
      <BackRoute />

      <h1 className="md:text-[24px] text-[#3586FF]  text-[12px] md:mt-[10px] mt-[5px] font-bold md:px-5 px-0">
        Packages Management
      </h1>
      <div className="md:space-y-8 space-y-2  md:px-10 px-1 md:py-8 py-5 ">
        <div className="md:space-y-8 space-y-2 md:mt-[20px] mt-[4px] md:px-4 px-0">
          <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-5 md:mb-4 mb-2  md:max-w-[70%] max-w-full">
            <SearchComponent
              label="Select Branch"
              labelCls="label-text md:text-[14px] text-[12px] font-medium text-black"
              inputClassName="text-[11px] font-regular py-[0px]"
              placeholder="Search branch..."
              value={
                branchOptions.find((opt) => opt.value === selectedBranchId)
                  ?.label || ""
              }
              options={branchOptions}
              onChange={(option) => {
                setSelectedBranchId(option.value);
              }}
              rootClassName="w-full"
            />
          </div>

          <div className="md:px-5 px-2 shadow-custom md:rounded-[8px] rounded-[4px] md:py-5 py-2">
            <div className="flex items-end justify-end">
              <CustomTooltip
                label="Access Restricted Contact Admin"
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                showTooltip={hasPermission("package", "create")}
              >
                <Button
                  className="bg-[#5297ff] font-medium btn-txt  text-white md:px-6 px-3 md:py-1 py-1 rounded-[4px] md:rounded-[8px] "
                  onClick={() => setOpenPackageModal(true)}
                  disabled={!hasPermission("package", "create")}
                >
                  Add Package
                </Button>
              </CustomTooltip>
            </div>
            {OpenPackageModal && (
              <Modal
                isOpen={OpenPackageModal}
                className="md:max-w-[780px]  md:min-h-[640px] min-h-[500px]  "
                rootCls="flex items-center justify-center z-[9999]"
                title="Add Package"
                titleCls="font-bold md:mt-4 mt-2 md:mb-4 mb-2 text-center"
                closeModal={() => setOpenPackageModal(false)}
                isCloseRequired={false}
              >
                <div className="flex flex-col justify-between gap-3 w-full h-full">
                  <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                    <CustomInput
                      label="Package Name"
                      type="text"
                      name="name"
                      value={packageData.name}
                      placeholder="enter Name here"
                      required
                      labelCls="font-medium md:text-[16px] text-[12px]"
                      className="px-3 md:py-1 py-[2px]"
                      onChange={handleInputChange}
                    />
                    <CustomInput
                      label="Price per sqft"
                      type="text"
                      name="ratePerSqft"
                      value={packageData.ratePerSqft}
                      placeholder="enter price here"
                      required
                      labelCls="font-medium md:text-[16px] text-[12px]"
                      className="px-3 md:py-1 py-[2px]"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:px-10">
                    <SelectBtnGrp
                      options={ConstructionScope}
                      label="Construction Scope"
                      labelCls="md:text-[14px] text-[12px] font-medium text-black"
                      required
                      defaultValue={
                        selectedScopeOption || packageData.construction_scope
                      }
                      onSelectChange={(
                        value:
                          | string
                          | { name: string; label?: React.ReactNode }
                      ) => {
                        const selectedValue =
                          typeof value === "string"
                            ? value.toLowerCase()
                            : value.name.toLowerCase();
                        handleInputChange({
                          name: "construction_scope",
                          value: selectedValue,
                        });
                        setErrors((prev) => ({
                          ...prev,
                          construction_scope: "",
                        }));
                      }}
                      error={errors.construction_scope}
                      btnClass="mb-4 md:px-4 px-2 md:py-2 py-1 md:rounded-md font-medium rounded-[4px] md:text-[14px] text-[12px]"
                      className="flex flex-row md:gap-2 gap-1"
                    />
                  </div>

                  <div className="md:space-y-3 space-y-2 ">
                    <div className="flex justify-end w-full items-end flex-grow">
                      <Button
                        className=" font-medium btn-txt md:px-5 md:rounded-[8px] rounded-[4px] px-3 border-2 md:py-1 py-1 bg-[#3B82F6] text-white "
                        onClick={() => setOpenFeatureModal(true)}
                        size="sm"
                      >
                        Add Features
                      </Button>
                    </div>
                    {packageData?.features.length > 0 && (
                      <div className="mt-4 w-full  md:px-10">
                        {packageData?.features?.map((feature, index) => (
                          <div
                            key={index}
                            className=" p-3 mb-4 border-[1px] border-gray-300 rounded-md shadow-sm flex gap-2 items-start justify-between w-full"
                          >
                            <div>
                              <p className="md:text-[14px] text-[12px] font-medium mb-2">
                                {feature.title}
                              </p>

                              <div
                                className=" md:text-[12px] text-[10px] text-gray-700"
                                dangerouslySetInnerHTML={{
                                  __html: feature?.points,
                                }}
                              ></div>
                            </div>

                            <div className="flex gap-3 mt-3">
                              <Button
                                type="button"
                                onClick={() => editFeature(index)}
                              >
                                <MdEdit className="text-[#3586FF]  text-xl" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeFeature(index)}
                              >
                                <MdDelete className="text-red-500 text-xl" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {OpenFeatureModal && (
                    <Modal
                      isOpen={OpenFeatureModal}
                      title="Add feature"
                      className="md:w-[600px] w-[290px]"
                      rootCls="flex items-center justify-center z-[9999]"
                      closeModal={closeFeatureModal}
                      isCloseRequired={false}
                    >
                      <div className="flex flex-col md:gap-3  gap-2 w-full">
                        <div className="grid grid-cols-1 gap-2">
                          <CustomInput
                            label="Feature Name"
                            type="text"
                            name="title"
                            value={featureInformation.title}
                            placeholder="enter Name here"
                            required
                            labelCls="font-medium md:text-[16px] text-[12px]"
                            className="px-3 md:py-1 py-[2px]"
                            onChange={(e) =>
                              handleFeatureChange("title", e.target.value)
                            }
                          />
                          <RichTextEditor
                            type={"richtext"}
                            key={"points"}
                            value={points}
                            className="min-h-[200px]"
                            onChange={(e) => setPoints(e)}
                          />
                        </div>

                        <div className="flex w-full items-center justify-between mt-4">
                          <Button
                            className="md:py-1 py-1 md:px-5 px-3 btn-txt md:rounded-[8px] rounded-[4px] font-medium  border-2 border-[#3B82F6]"
                            onClick={closeFeatureModal}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="md:py-1 py-1 md:px-5 px-3 btn-txt md:rounded-[8px] rounded-[4px] font-medium  border-2 bg-[#3B82F6] text-white"
                            onClick={addFeatures}
                          >
                            Save Feature
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  )}

                  <div className="flex w-full items-center justify-between  mt-4">
                    <Button
                      className="md:py-1 py-1 md:px-5 px-3 btn-txt md:rounded-[8px] rounded-[4px]font-medium  border-2 border-[#3B82F6]"
                      onClick={() => CloseModel()}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="md:py-1 py-1 md:px-5 px-3 btn-txt md:rounded-[8px] rounded-[4px]font-medium  border-2 bg-[#3B82F6] text-white"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
            <div>
              <p className="font-medium md:text-[20px]  text-[16px] ">
                Explore Our Packages
              </p>
              <div className="flex mb-4 gap-3 mt-4">
                {Object.entries(scopeLabels).map(([scope, { label, icon }]) => (
                  <Button
                    key={scope}
                    onClick={() => setSelectedScope(scope)}
                    className={`flex items-center btn-txt md:gap-2 gap-1 md:px-4 px-2 md:py-1 py-1  rounded-md font-medium border transition ${
                      selectedScope === scope
                        ? "bg-[#5297FF] text-white border-[#5297FF]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {icon}
                    {label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-col w-full">
                {packages.length > 0 ? (
                  <div className="md:space-y-4 space-y-2 w-full mt-4 mx-auto">
                    {packages?.map((pkg) => {
                      return (
                        <div
                          key={pkg.name}
                          className={`block border px-3 py-4 border-gray-300 md:max-w-[55%] w-full max-w-full rounded-lg transition cursor-pointer `}
                        >
                          <div className="flex items-start justify-between w-full md:text-sm text-[12px]">
                            <div className="font-medium text-gray-800 text-left space-y-1">
                              <p>{pkg?.name}</p>
                              <p
                                onClick={() => {
                                  setOpenModal(true);
                                  setSelectedPackage(pkg);
                                }}
                                className="text-[#3586FF]  font-medium cursor-pointer"
                              >
                                View Details
                              </p>
                            </div>

                            <div className="flex flex-col md:items-end items-start text-right gap-1">
                              <p className="text-[#3586FF]  font-medium">
                                {pkg?.ratePerSqft}/sqft (Incl. GST)
                              </p>
                              <div className="flex gap-2">
                                <CustomTooltip
                                  label="Access Restricted Contact Admin"
                                  position="bottom"
                                  tooltipBg="bg-black/60 backdrop-blur-md"
                                  tooltipTextColor="text-white py-2 px-4 font-medium"
                                  labelCls="text-[10px] font-medium"
                                  showTooltip={
                                    !hasPermission("package", "edit")
                                  }
                                >
                                  <Button
                                    onClick={() => {
                                      handleEdit(pkg);
                                    }}
                                    disabled={!hasPermission("package", "edit")}
                                    className="text-[#3586FF]  text-[12px]"
                                  >
                                    <MdEdit className="text-[#3586FF]  text-xl" />
                                  </Button>
                                </CustomTooltip>
                                <CustomTooltip
                                  label="Access Restricted Contact Admin"
                                  position="bottom"
                                  tooltipBg="bg-black/60 backdrop-blur-md"
                                  tooltipTextColor="text-white py-2 px-4 font-medium"
                                  labelCls="text-[10px] font-medium"
                                  showTooltip={
                                    !hasPermission("package", "delete")
                                  }
                                >
                                  <Button
                                    onClick={() => {
                                      setOpenDeleteModal(true);
                                      setSelectedPackageToDelete(pkg);
                                    }}
                                    disabled={
                                      !hasPermission("package", "delete")
                                    }
                                    className="text-red-500 text-[12px]"
                                  >
                                    <MdDelete className="text-red-500 text-xl" />
                                  </Button>
                                </CustomTooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center font-medium md:text-[16px] text-[12px]">
                    {!selectedBranchId
                      ? "Please select a Branch"
                      : "No packages found"}
                  </p>
                )}
              </div>

              <div className="md:mt-0 mt-[30px]">
                {selectedPackage && OpenModal && (
                  <Modal
                    isOpen={OpenModal}
                    closeModal={() => setOpenModal(false)}
                    className="md:max-w-[780px]  md:min-h-[640px] min-h-[500px]  "
                    rootCls="flex items-center justify-center z-[9999]"
                  >
                    <div className="md:p-6 p-2 bg-gray-100 md:rounded-[8px] rounded-sm shadow-custom ">
                      <div className="relative bg-[#5297ff] text-white md:p-8 p-3 text-center md:rounded-t-[16px] rounded-t-md">
                        <h2 className="md:text-4xl  text-xl font-Gordiata-Bold tracking-wide">
                          {selectedPackage.name} Package
                        </h2>
                        <p className="md:text-lg text-[16px] font-medium mt-1">
                          {selectedPackage.ratePerSqft} /sqft (Incl. GST)
                        </p>

                        <div className="absolute inset-0 bg-white opacity-10 blur-lg"></div>
                      </div>

                      <div className="mt-4 md:px-4 px-2 md:py-3 py-1 bg-white rounded-[16px] shadow-custom border-l-4 border-[#5297ff]">
                        <h3 className="md:text-lg  text-[16px] font-medium text-gray-700">
                          What’s Included?
                        </h3>
                        <p className="text-gray-600 md:text-[16px] text-[12px] font-medium mt-1">
                          {selectedPackage.services}
                        </p>
                      </div>

                      <div className="mt-4 space-y-3 px-4 py-3 bg-white rounded-[8px] shadow-custom">
                        <h3 className="md:text-lg text-[14px] font-medium text-gray-700">
                          {" "}
                          Features:
                        </h3>

                        <ul className="mt-3 list-disc pl-5 space-y-2 font-regular text-gray-700 md:text-sm text-[10px]">
                          <div className="grid grid-cols-2 gap-2">
                            {selectedPackage.features.map((feature, fIndex) => (
                              <div key={fIndex}>
                                <h3 className="md:font-medium font-regular md:text-[18px] md:mb-4 mb-6 text-[12px] text-white bg-blue-600 px-2 py-1 mb md:rounded-[8px] rounded-md">
                                  {feature.title}
                                </h3>

                                {feature.points.map((point, Index) => (
                                  <li key={Index}>{point}</li>
                                ))}
                              </div>
                            ))}
                          </div>
                        </ul>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
              {selectedPackageToDelete && OpenDeleteModal && (
                <Modal
                  isOpen={OpenDeleteModal}
                  closeModal={() => setOpenDeleteModal(false)}
                  title=""
                  className="md:max-w-[500px] max-w-[330px]"
                  rootCls="flex items-center justify-center z-[9999]"
                  isCloseRequired={false}
                >
                  <div className="md:p-6 p-3 flex flex-col gap-3 z-20 ">
                    <div className="flex justify-between items-center md:mb-4 mb-2">
                      <h3 className="md:text-[20px] text-center w-full text-[14px]  font-medium text-gray-900">
                        Confirm Deletion
                      </h3>
                    </div>
                    <p className="md:text-sm text-center text-[12px] text-gray-500 mb-4">
                      Are you sure you want to delete this Package? This action
                      cannot be undone.
                    </p>
                    <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
                      <Button
                        className=" md:py-1 py-1 md:px-5 px-3 btn-txt md:rounded-[8px] rounded-[4px]border-2 bg-gray-100 hover:bg-gray-200  font-medium text-gray-700"
                        onClick={() => setOpenDeleteModal(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>

                      <Button
                        className=" md:py-1 py-1 md:px-5 px-3 btn-txt font-medium md:rounded-[8px] rounded-[4px]  border-2 bg-red-600 text-white"
                        onClick={() => {
                          handleDelete(selectedPackageToDelete.id);
                        }}
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
