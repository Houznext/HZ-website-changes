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
            className="overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 w-full p-4"
            key={key}
        >
            <div className="flex md:flex-row flex-col gap-x-[48px] gap-y-[24px]">
                {/* Images */}
                <div className="md:w-[20%] w-[100%]">
                    <div className="flex flex-col gap-2">
                        <div className="relative w-full md:h-32 h-24">
                            <img
                                className="absolute w-full h-full object-cover rounded-[8px]"
                                src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                                alt="image 1"
                            />
                        </div>
                        <div className="w-full flex gap-2">
                            <div className="relative w-[50%] md:h-16 h-10 rounded overflow-hidden">
                                <img
                                    className="absolute w-full h-full object-cover rounded-[8px]"
                                    src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                                    alt="image 2"
                                />
                            </div>
                            <div className="relative w-[50%] md:h-16 h-10 rounded overflow-hidden">
                                <img
                                    className="absolute w-full h-full object-cover rounded-[8px]"
                                    src="https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                                    alt="image 3"
                                />
                                <span className="w-full h-full bg-black bg-opacity-40 absolute md:text-[14px] text-[12px] font-medium z-10 flex justify-center items-center text-white">
                                    +2 photos
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="md:w-[70%] w-full flex flex-col md:gap-y-[8px] gap-y-[4px] justify-evenly items-start">
                    <div className="md:col-span-9 grid md:gap-4 gap-2 md:grid-cols-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        <InfoKV icon={<LuUser className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Name">
                            {data?.firstname} {data?.lastname}
                        </InfoKV>

                        <InfoKV icon={<FaRegEnvelope className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Email">
                            {data?.email}
                        </InfoKV>

                        <InfoKV icon={<LuPhone className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Phone">
                            {data?.phone}
                        </InfoKV>

                        <InfoKV icon={<LuMapPin className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Location">
                            {data?.location?.city}, {data?.location?.state}
                        </InfoKV>

                        <InfoKV icon={<FaCouch className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="BHK">
                            {data?.bhk}
                        </InfoKV>

                        <InfoKV icon={<LuCalendar className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Date">
                            {new Date(data?.date).toDateString()}
                        </InfoKV>

                        <InfoKV icon={<BiRupee className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Total">
                            {(Number(data?.subTotal) || 0) - (Number(data?.discount) || 0)}
                        </InfoKV>

                        <InfoKV icon={<Discount className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Discount">
                            {data?.discount}
                        </InfoKV>

                        <InfoKV icon={<BiRupee className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />} label="Designed By">
                            <span className="flex items-center gap-2 text-[#3586FF] ">
                                <HiBadgeCheck className="text-[#3586FF]  text-xl" /> {data?.designerName || "N/A"}
                            </span>
                        </InfoKV>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 flex flex-wrap gap-2 justify-between w-full items-center mt-3">
                        <div className="flex gap-2">
                            <Button
                                className="inline-flex text-[12px] items-center md:px-4 px-2  py-1 border border-transparent md:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                onClick={() => router.push(`/cost-estimator/${activeTab}/${data.id}`)}
                            >
                                View Details
                            </Button>

                            <Button
                                className="inline-flex text-[12px] items-center md:px-4 px-2  py-1 border border-transparent md:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
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
    <div className="md:space-y-2 space-y-1">
        <div className="flex items-center md:gap-2 gap-1 key-text text-gray-500">
            {icon}
            <span className="font-medium key-text">{label}</span>
        </div>
        <p className="key-text font-medium text-gray-900 break-all">{children}</p>
    </div>
);
