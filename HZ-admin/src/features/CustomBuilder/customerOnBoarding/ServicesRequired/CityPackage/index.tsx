import Button from "@/src/common/Button";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Loader from "@/src/common/Loader";
import Modal from "@/src/common/Modal";
import SearchComponent from "@/src/common/SearchSelect";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CityPackage = ({ handleSave }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [OpenModal, setOpenModal] = useState(false);

  const { customerOnboarding, updateServicesRequired, custom_builder_id } =
    useCustomBuilderStore();

  const { servicesRequired, addressDetails, propertyInformation } =
    customerOnboarding;
  const router = useRouter();
  const { package: packageDetails } = servicesRequired;

  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
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
  const fetchDetails = async () => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}`,
        {},
        true
      );
      const data = response.body;

      if (data?.branchId) {
        setSelectedBranchId(data.branchId);

        fetchPackages(
          data.branchId,
          data?.propertyInformation?.construction_scope?.toLowerCase()
        );
      }
    } catch (err) {
      toast.error("Failed to fetch details");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (custom_builder_id) {
      fetchDetails();
    }
  }, [custom_builder_id]);

  const fetchPackages = async (
    selectedBranchId: number | string,
    constructionScope: string
  ) => {
    if (!selectedBranchId || !constructionScope) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.packages}/branch/${selectedBranchId}/scope/${constructionScope}`
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

  const handleSelectPackage = (packageData: any) => {
    updateServicesRequired({
      package: {
        packageSelected: packageData.name,
        branchId: selectedBranchId,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Loader />
      </div>
    );
  }
  return (
    <>
      <div className="md:space-y-4 space-y-2">
        <div className="flex items-end justify-end">
          <Button
            className="bg-[#5297ff] font-medium  text-white btn-txt md:px-5 px-3 md:py-1 py-1 rounded-[4px] md:rounded-[8px] "
            onClick={() => router.push("/custom-builder/packages")}
          >
            Add Package
          </Button>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-3 gap-1 md:mb-4 mb-2  md:max-w-[70%] max-w-full md:px-4 px-0">
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
              const branchId = option.value;

              setSelectedBranchId(branchId);

              fetchPackages(
                branchId,
                propertyInformation?.construction_scope?.toLowerCase()
              );
            }}
            rootClassName="w-full"
          />
        </div>
      </div>

      <div className="md:mt-[20px] mt-[10px] md:px-4 px-0">
        <p className="font-medium md:text-[16px]  text-[14px] ">
          Which package u want to pick ?
        </p>
        <div className="flex flex-col w-full">
          {packages.length > 0 ? (
            <div className="md:space-y-4 space-y-2 w-full mt-4 mx-auto">
              {packages.map((pkg) => (
                <label
                  key={pkg.name}
                  className="block border px-3 py-4 border-gray-300 md:max-w-[55%] w-full max-w-full rounded-lg transition cursor-pointer"
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="package"
                      value={pkg.name}
                      checked={packageDetails?.packageSelected === pkg.name}
                      onChange={() => handleSelectPackage(pkg)}
                      className="mt-1.5 w-4 h-4 text-[#3586FF]  focus:ring-[#5297ff]"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between w-full md:text-sm text-[12px]">
                        <div className="font-medium text-gray-800 text-left space-y-1">
                          <p>{pkg.name}</p>
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
                            {pkg.ratePerSqft}/sqft (Incl. GST)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-center font-medium md:text-[16px] text-[12px]">
              {!selectedBranchId
                ? "Please select a Branch"
                : "No packages found"}
            </p>
          )}

          <div className="flex items-center justify-end mt-4">
            <Button
              onClick={handleSave}
              className="md:px-5 md:py-1 px-3 py-2 font-medium btn-txt bg-[#3B82F6] text-white rounded-[6px]"
            >
              Save service
            </Button>
          </div>
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
                    {selectedPackage?.name} Package
                  </h2>
                  <p className="md:text-lg text-[16px] font-medium mt-1">
                    {selectedPackage?.ratePerSqft} /sqft (Incl. GST)
                  </p>

                  <div className="absolute inset-0 bg-white opacity-10 blur-lg"></div>
                </div>

                <div className="mt-4 md:px-4 px-2 md:py-3 py-1 bg-white rounded-[16px] shadow-custom border-l-4 border-[#5297ff]">
                  <h3 className="md:text-lg  text-[16px] font-medium text-gray-700">
                    What’s Included?
                  </h3>
                  <p className="text-gray-600 md:text-[16px] text-[12px] font-medium mt-1">
                    {selectedPackage?.services}
                  </p>
                </div>

                <div className="mt-4 space-y-3 px-4 py-3 bg-white rounded-[8px] shadow-custom">
                  <h3 className="md:text-lg text-[14px] font-medium text-gray-700">
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
      </div>
    </>
  );
};

export default CityPackage;
