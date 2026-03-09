import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Switch from '@/common/SwitchButton'; ``
import { SettingColorIcon } from '../Icons';
import Modal from '@/common/Modal';
import Button from '@/common/Button';
import { IoMdEye } from 'react-icons/io';
import CustomInput from '@/common/FormElements/CustomInput';
import toast from 'react-hot-toast';
import apiClient from '@/utils/apiClient';
import { useSession } from 'next-auth/react';
import {
    FaHome, FaBlogger, FaQuoteRight, FaBoxOpen, FaMapMarkedAlt,
    FaHardHat, FaCalculator, FaShoppingCart, FaHeart, FaProjectDiagram, FaBuilding
} from 'react-icons/fa';
import { useAuthUser } from '@/utils/useAuthUser';

const iconMap: Record<string, JSX.Element> = {
    properties: <FaHome />,
    blogsCreated: <FaBlogger />,
    testimonials: <FaQuoteRight />,
    orders: <FaBoxOpen />,
    addresses: <FaMapMarkedAlt />,
    customBuilders: <FaHardHat />,
    costEstimators: <FaCalculator />,
    hasCart: <FaShoppingCart />,
    hasWishlist: <FaHeart />,
    hasProject: <FaProjectDiagram />,
    hasCompany: <FaBuilding />,
};

const labelMap: Record<string, string> = {
    properties: 'Properties',
    blogsCreated: 'Blogs Created',
    testimonials: 'Testimonials',
    orders: 'Orders',
    addresses: 'Addresses',
    customBuilders: 'Custom Builders',
    costEstimators: 'Cost Estimators',
    hasCart: 'Has Cart',
    hasWishlist: 'Has Wishlist',
    hasProject: 'Has Project',
    hasCompany: 'Has Company',
};

const points = [
    "Your profile and all listed properties will be hidden.",
    "Your saved wishlist and favorite properties will no longer be accessible.",
    "All ongoing orders (e.g., furniture, services) and service requests will be canceled.",
    "Custom Builder projects and quote requests will be closed.",
    "Messages and conversations with agents, builders, or service providers will be closed.",
    "You can still browse OneCasa! but won’t be able to use your dashboard or make new transactions."
];
const DeleteAccount = () => {
    const [step, setStep] = useState(1);
    const [isActive, setDeactivate] = React.useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [usersummary, setUserSummary] = useState<any>();

    const { user, userId, isAuthenticated } = useAuthUser();

    const fetchUserSummary = async (userId: any) => {
        try {
            const response = await apiClient.get(`${apiClient.URLS.delete_account}/${userId}/summary`);
            if (response?.status == 200) {
                toast.success("user summary fetched successfully");
                setUserSummary(response?.body);
            }
        }
        catch (error) {
            toast.error("error occured while fetching user summary");
        }
    }

    const handleDeactivate = async () => {
        if (!reason) return toast.error("Please select a reason before continuing.");
        const payload = {
            reason,
            description
        }
        try {
            const response = await apiClient.post(`${apiClient.URLS.delete_account}/${userId}/deactivate`, { ...payload });
            console.log("responses", response)
            if (response?.status == 200) {
                toast.success("Account deleted successfully");
                closeModal();
            }
        }
        catch (error) {
            toast.error("error occured while deleting account");
        }
    }


    useEffect(() => {
        if (isAuthenticated && userId) {
            fetchUserSummary(userId);
        }
    }, [isAuthenticated, userId]);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const closeModal = () => {
        setDeactivate(false);
        setStep(1);
        setReason('');
        setDescription('');
    };
    const renderModal = () => {
        return (
            <Modal isOpen={isActive} closeModal={closeModal} isCloseRequired={false} className="z-[99999] max-w-[600px] mx-auto md:min-h-[500px] h-full" rootCls={'z-[99999] '}>
                <div className='relative h-full w-full'>
                    {step === 1 && (
                        <div className="p-6 flex flex-col items-center md:gap-20  text-center ">
                            <div className='flex flex-col items-center justify-center space-y-5'>
                                <h2 className="text-[18px] md:text-[22px] font-bold leading-tight">
                                    Are you sure you want to deactivate your OneCasa! account?
                                </h2>
                                <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center">
                                    <IoMdEye size={30} />
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                    By deactivating your OneCasa! account, your profile and all related information will be hidden.
                                    You will lose access to key features such as property listings, orders, custom builder tools, and your dashboard until you choose to reactivate your
                                    account by logging back in.
                                </p>
                            </div>
                            <div className="flex gap-4 md:mt-10 mt-5 flex-row justify-between  w-full md:px-4">
                                <Button
                                    onClick={closeModal}
                                    className="px-5 py-2 border-2 border-[#002A32] hover:bg-gray-400 text-[#002A32] rounded-lg font-medium transition"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="px-5 py-2 bg-[#3B82F6]  text-white rounded-lg font-medium hover:opacity-90 transition"
                                >
                                    Yes, deactivate
                                </Button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="p-6 flex flex-col items-center text-center space-y-5">
                            <h2 className="md:text-[22px] text-[18px] font-bold leading-tight">Are you sure you want to deactivate your OneCasa! account?</h2>
                            <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center">
                                <IoMdEye size={30} />
                            </div>
                            <div>
                                <AssociatedDataSummary usersummary={usersummary} />
                            </div>

                            <div className="text-sm text-gray-600 leading-relaxed max-w-md text-left space-y-2">
                                {points.map((point, index) => (
                                    <div className='flex flex-row gap-2' key={index}>
                                        <span className="mt-[2px] text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.485 1.929a1 1 0 0 1 1.415 1.414l-8 8a1 1 0 0 1-1.415 0l-4-4a1 1 0 1 1 1.415-1.414L6 8.586l7.485-7.485z" />
                                            </svg>
                                        </span>
                                        <p>{point}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 md:mt-10 mt-5 justify-between w-full px-4">
                                <Button onClick={() => setStep(1)} className="px-5 py-2 border-2 border-[#002A32] font-medium md:text-[16px] text-[14px] text-[#002A32] rounded-lg hover:bg-gray-100 transition">
                                    Back
                                </Button>
                                <Button onClick={handleNext} className="px-5 py-2 bg-[#3B82F6] text-white font-medium md:text-[16px] text-[14px] rounded-lg hover:opacity-90 transition">
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="p-6 flex flex-col items-center justify-between md:gap-10  text-center space-y-5">
                            <h2 className="text-[22px] font-bold leading-tight">Why are you deactivating your account?</h2>
                            <p className="text-sm text-gray-600 text-center max-w-[400px]">We’re sorry to see you go. You can reactivate anytime by logging back in.</p>
                            <div className="space-y-4 w-full font-medium text-[12px]">
                                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border p-[10px] border-gray-400 rounded-md">
                                    <option value="">Select reason</option>
                                    <option value="privacy">Privacy concerns</option>
                                    <option value="not-using">No longer using OneCasa</option>
                                    <option value="other">Other</option>
                                </select>

                                <CustomInput
                                    type="text"
                                    label='Enter description'
                                    labelCls="text-[14px] font-Gorita-Medium text-start"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description"
                                    className="w-full border px-2 py-1 border-gray-500 rounded-md" name={''}
                                />
                            </div>
                            <div className="flex gap-4 md:mt-10 mt-5 justify-between w-full px-4">
                                <Button onClick={handleBack} className="px-5 py-2 border-2 border-gray-300 font-medium text-[#002A32] rounded-lg hover:bg-gray-100 transition">
                                    Back
                                </Button>
                                <Button
                                    onClick={handleDeactivate}
                                    className={`px-5 py-2 bg-[#3B82F6] font-medium text-[14px] text-white rounded-[6px] hover:opacity-90 transition`}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        );
    };



    return (
        <>
            <div className="flex flex-col items-center justify-between bg-white h-full gap-6 p-6 max-w-[860px] rounded-md md:mt-10 shadow-custom">
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#F0F2F4] p-4 rounded-full">
                        <SettingColorIcon />
                    </div>
                    <h2 className="md:text-[24px] text-[18px] font-medium">Account settings</h2>
                    <p className="md:text-[16px] text-[14px] text-[#7B7C83] text-center">
                        This is where you can manage the setting of your profile.
                    </p>
                </div>

                <div className="w-full max-w-md space-y-6 mt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[16px] font-semibold">Deactivate account</h3>
                            <p className="text-[14px] text-[#7B7C83]">Hide your profile from the public</p>
                        </div>
                        <Switch
                            checked={isActive}
                            onChange={() => setDeactivate(!isActive)}
                            activeColor="#0398fc"
                            inactiveColor="#D1D5DB"
                            knobColor="#ffffff"
                            className="shadow-md"
                        />
                    </div>
                    <hr className="border-t border-[#E0E0E0]" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[16px] font-semibold">Delete account</h3>
                            <p className="text-[14px] text-[#7B7C83]">Completely delete your account information</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Trash2 className="w-5 h-5 text-[#002A32]" />
                        </button>
                    </div>
                </div>
            </div>
            <div>
                {renderModal()}
            </div>
        </>
    );
};

export default DeleteAccount;




const AssociatedDataSummary = ({ usersummary }: any) => {
    const data = usersummary?.associatedData;

    return (
        <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Account Summary</h3>

            <div className="grid gap-2 mb-3">
                {data && Object.entries(data).map(([key, value]: any) =>
                    (typeof value === 'boolean' ? value : value > 0) ? (
                        <div key={key} className="flex items-center justify-center font-medium gap-2 text-sm text-gray-700">
                            {iconMap[key]}
                            <span>
                                {labelMap[key]}
                                {typeof value === 'number' ? `: ${value}` : ''}
                            </span>
                        </div>
                    ) : null
                )}
            </div>

            {data?.properties > 0 && (
                <p className="text-xs text-gray-500">
                    You have <span className="font-medium">{data?.properties}</span> active {data?.properties > 1 ? 'properties' : 'property'}.
                    Deleting your account will remove all listed properties.
                </p>
            )}
        </div>
    );
};

