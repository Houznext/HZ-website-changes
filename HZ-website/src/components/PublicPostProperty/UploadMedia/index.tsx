import ImageUploader from "@/common/FormElements/DragImageInput";
import React, { useEffect, useState } from "react";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Modal from "@/common/Modal";
import usePostPropertyStore, { MediaDetails } from "@/store/postproperty";
import { CgSpinner } from "react-icons/cg";
import Loader from "@/components/Loader";
import { CheckCircle2, Eye, Home } from "lucide-react";

const UploadImage = ({ handleNext }: any) => {
  const [uploadedFiles, setUploadedFiles] = useState<(File | string)[]>([]);
  const propertyId = usePostPropertyStore((state) => state.propertyId);
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const property = usePostPropertyStore((state) => state.getProperty());
  const mediaDetails = usePostPropertyStore((state) => state.mediaDetails);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [suceessModal, setSuccessModal] = useState(false);

  //have some issues in the remove image function needs to fix it

  const handleContinueBrowsing = () => {
    router.push("/");
  };
  const handleViewProperty = () => {
    router.push(`/properties`);
  };

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setSuccessModal(false);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  const renderSuccessModal = () => {
    return (
      <Modal
        closeModal={() => setSuccessModal(false)}
        isOpen={suceessModal}
        className="max-w-[440px] rounded-2xl overflow-hidden p-0"
        isCloseRequired={false}
      >
        <div className="relative">
          {/* Top gradient banner */}
          <div className="h-[120px] bg-gradient-to-br from-[#3586FF] via-[#5a9fff] to-[#82b8ff] flex items-center justify-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute top-4 right-12 w-8 h-8 rounded-full bg-white/15" />

            {/* Icon badge */}
            <div className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-[#3586FF]" strokeWidth={2.2} />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 pt-6 pb-8 text-center">
            <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-1.5">
              Property Posted Successfully!
            </h1>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-7">
              Your property is now live and visible to thousands of potential buyers. We'll notify you when someone shows interest.
            </p>

            <div className="flex flex-col gap-2.5">
              <Button
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[14px] font-semibold bg-[#3586FF] hover:bg-[#2d75e6] text-white rounded-xl transition-all shadow-sm shadow-blue-200"
                onClick={handleViewProperty}
              >
                <Eye className="w-4 h-4" />
                View Property
              </Button>
              <Button
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[14px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-all"
                onClick={handleContinueBrowsing}
              >
                <Home className="w-4 h-4" />
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one image before posting.");
      return;
    }
    setLoading(true);
    const imagesToUpload = uploadedFiles.filter(
      (file): file is string => typeof file === "string"
    );
    try {
      const response = await apiClient.patch(
        `${apiClient.URLS.property}/media-details/${propertyId}`,
        {
          mediaDetails: {
            propertyImages: property.mediaDetails?.propertyImages,
            propertyVideo: property.mediaDetails?.propertyVideo,
          },
        },
        true
      );
      if (response.status === 200) {
        toast.success("Media uploaded successfully");
        setSuccessModal(true);
      }

      console.log("propimages", imagesToUpload);
    } catch (error) {
      console.error("Error occurred in media property update:", error);
      toast.error("Failed to submit media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: string[]) => {
    setUploadedFiles(files);
    updatePropertyState("propertyImages", files);
  };

  const updatePropertyState = (key: keyof MediaDetails, value: any) => {
    const updatedProperty = {
      ...property,
      mediaDetails: {
        propertyImages: value,
        propertyVideo: [],
      },
    };

    setProperty(updatedProperty);
  };

  if (suceessModal) {
    return renderSuccessModal();
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-[520px]">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-[#3586FF] mb-1">Videos & Photos</h1>
      <p className="text-sm text-slate-500 mb-5">
        Add photos to showcase your property
      </p>

      {/* Image Uploader */}
      <ImageUploader
        label="Upload Photos"
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
        onFilesChange={handleImageUpload}
        maxFiles={5}
        folderName="propertyImages"
        maxFileSize={10}
        acceptedFormats={["image/png", "image/jpg", "image/jpeg"]}
        errorMsg={
          uploadedFiles?.length === 0
            ? "Please upload at least one image."
            : ""
        }
        outerCls="border-[#3586FF] border-dashed"
        initialUrls={uploadedFiles.filter(
          (file): file is string => typeof file === "string"
        )}
        buttonCls="bg-[#3586FF] hover:bg-[#2d75e6]"
        required
      />

      {/* Tip */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mt-4">
        <GppMaybeIcon className="text-amber-500 text-lg flex-shrink-0" />
        <p className="text-[12px] text-amber-700">
          Properties with photos get 5x more views from potential buyers
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <Button
          disabled={uploadedFiles?.length === 0}
          className={`w-full py-2.5 rounded-lg text-[14px] md:text-[15px] font-medium transition-colors duration-200 ${
            uploadedFiles?.length === 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#3586FF] hover:bg-[#2d75e6] text-white"
          }`}
          onClick={handleSubmit}
        >
          {loading ? <CgSpinner className="animate-spin" /> : "Post Your Property"}
        </Button>
      </div>
    </div>
  );
};

export default UploadImage;
