import Button from "@/src/common/Button";
import { useRouter } from "next/router";
import { BiRupee } from "react-icons/bi";
import { FaRegEnvelope } from "react-icons/fa";
import { LuCalendar, LuMapPin, LuPhone, LuUser } from "react-icons/lu";
import { CEcardProps } from "..";
import Modal from "@/src/common/Modal";
import { useState } from "react";
import { FiCopy, FiDownload } from "react-icons/fi";
import toast, { LoaderIcon } from "react-hot-toast";
import { HiBadgeCheck } from "react-icons/hi";
import { FaCouch } from "react-icons/fa";
import { Discount } from "@mui/icons-material";
import apiClient from "@/src/utils/apiClient";
import { CopyIcon } from "lucide-react";

const CostEstimationCard = ({ key, data, onDuplicate, activeTab }: CEcardProps) => {
    const router = useRouter();
    const [duplicateModal, setDuplicateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleDuplicate = () => setDuplicateModal(true);

    const handleConfirm = async (dataToDup: any) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await onDuplicate(dataToDup);
            setDuplicateModal(false);
        } catch (err) {
            toast.error("Failed to duplicate");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div
            className="w-full bg-white border border-[rgba(0,0,0,0.08)] hover:border-[#1D4E7A] transition-colors rounded-[12px] mb-[14px] overflow-hidden"
            key={key}
        >
            <div className="flex flex-col md:flex-row">
                {/* LEFT: Image gallery panel */}
                <div className="w-full md:w-[200px] flex-shrink-0 border-r border-[rgba(0,0,0,0.06)] bg-[#F3F4F6]">
                    <div className="w-full h-[130px] relative">
                        <img
                            className="absolute inset-0 w-full h-full object-cover"
                            src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                            alt="Property"
                        />
                    </div>
                    <div className="px-[3px] py-[3px] flex gap-[3px] bg-[#E5E7EB]">
                        <div className="relative flex-1 h-[44px] overflow-hidden rounded-[4px]">
                            <img
                                className="absolute inset-0 w-full h-full object-cover"
                                src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                                alt="Thumb 1"
                            />
                        </div>
                        <div className="relative flex-1 h-[44px] overflow-hidden rounded-[4px]">
                            <img
                                className="absolute inset-0 w-full h-full object-cover"
                                src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                                alt="Thumb 2"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-[10px] rounded-[20px] mx-[6px] my-[6px]">
                                +2 photos
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Card body */}
                <div className="flex-1 px-[18px] py-[18px] md:py-[18px]">
                    {/* Row 1: Name | Email | Phone | Location | BHK */}
                    <div className="grid gap-3 md:grid-cols-5 grid-cols-2">
                        <InfoKV icon={<LuUser className="h-4 w-4 text-[#6B7280]" />} label="Name">
                            <span className="text-[13px] font-medium text-[#111827]">
                                {data?.firstname} {data?.lastname}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<FaRegEnvelope className="h-4 w-4 text-[#6B7280]" />} label="Email">
                            <span className="text-[12px] font-medium text-[#111827] break-all">
                                {data?.email}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<LuPhone className="h-4 w-4 text-[#6B7280]" />} label="Phone">
                            <span className="text-[13px] font-medium text-[#111827]">
                                {data?.phone}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<LuMapPin className="h-4 w-4 text-[#6B7280]" />} label="Location">
                            <span className="text-[13px] font-medium text-[#111827]">
                                {data?.location?.city}, {data?.location?.state}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<FaCouch className="h-4 w-4 text-[#6B7280]" />} label="BHK">
                            <span className="text-[13px] font-medium text-[#111827]">
                                {data?.bhk}
                            </span>
                        </InfoKV>
                    </div>

                    <div className="mt-3 border-t border-[rgba(0,0,0,0.07)]" />

                    {/* Row 2: Date | Total | Discount | Designed By | Status */}
                    <div className="mt-3 grid gap-3 md:grid-cols-5 grid-cols-2">
                        <InfoKV icon={<LuCalendar className="h-4 w-4 text-[#6B7280]" />} label="Date">
                            <span className="text-[13px] font-medium text-[#111827]">
                                {new Date(data?.date).toDateString()}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<BiRupee className="h-4 w-4 text-[#1D4E7A]" />} label="Total">
                            <span className="text-[15px] font-medium text-[#1D4E7A]">
                                ₹
                                {(
                                    (Number(data?.subTotal) || 0) -
                                    (Number(data?.discount) || 0)
                                ).toLocaleString("en-IN")}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<Discount className="h-4 w-4 text-[#6B7280]" />} label="Discount">
                            <span className="text-[13px] font-medium text-[#111827]">
                                ₹{(Number(data?.discount) || 0).toLocaleString("en-IN")}
                            </span>
                        </InfoKV>

                        <InfoKV icon={<BiRupee className="h-4 w-4 text-[#1D9E75]" />} label="Designed By">
                            <span className="flex items-center gap-1 text-[13px] font-medium text-[#1D9E75]">
                                <HiBadgeCheck className="text-[#1D9E75] text-lg" />{" "}
                                {data?.designerName || "N/A"}
                            </span>
                        </InfoKV>

                        <InfoKV
                            icon={null}
                            label="Status"
                        >
                            <span className="inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[11px] font-medium bg-[#EAF3DE] text-[#3B6D11]">
                                Active
                            </span>
                        </InfoKV>
                    </div>

                    {/* Footer actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-2">
                            <Button
                                className="inline-flex items-center px-4 py-[6px] rounded-[6px] text-[12px] font-medium bg-[#1D4E7A] text-white"
                                onClick={() => router.push(`/cost-estimator/${activeTab}/${data.id}`)}
                            >
                                View Details
                            </Button>

                            <Button
                                className="inline-flex items-center px-4 py-[6px] rounded-[6px] text-[12px] font-medium border border-[#1D4E7A] text-[#1D4E7A] bg-white"
                                onClick={handleDuplicate}
                            >
                                Duplicate
                            </Button>
                        </div>
                    </div>

                    {/* Duplicate Modal */}
                    <Modal
                        isOpen={duplicateModal}
                        closeModal={() => setDuplicateModal(false)}
                        title=""
                        className="md:max-w-[400px] max-w-[330px] rounded-[6px]"
                        rootCls="flex items-center border justify-center z-[9999]"
                        isCloseRequired={false}
                    >
                        <div className="md:p-4 p-3 flex flex-col  z-20">
                            <div className="flex gap-2 items-center mb-2">
                                <h3 className="md:text-[20px] text-center mx-auto w-full text-[16px] font-bold text-[#3586FF] ">
                                    Confirm Duplication
                                </h3>
                            </div>
                            <p className="text-center md:text-[12px] text-[10px] text-gray-500 md:mb-2 mb-1">
                                Are you sure you want to duplicate this estimation? This will create a new estimation with the same details.
                            </p>
                            <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
                                <Button
                                    className="md:py-1 py-[2px] md:px-[22px] px-[14px] label-text rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
                                    onClick={() => setDuplicateModal(false)}
                                    size="sm"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    className="md:py-1 py-[2px] md:px-[22px] px-[14px] font-medium label-text rounded-md border-2 bg-[#5297ff] text-white flex items-center justify-center gap-2"
                                    onClick={() => handleConfirm(data)}
                                    size="sm"
                                    disabled={isLoading}
                                >
                                    {isLoading && <LoaderIcon />}
                                    {isLoading ? "Duplicating..." : "Continue"}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default CostEstimationCard;

/* ---- tiny helper for label/value block ---- */
const InfoKV = ({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1">
        <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <div className="text-[#111827] break-all">
            {children}
        </div>
    </div>
);
