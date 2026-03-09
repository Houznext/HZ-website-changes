import React, { useState } from "react";
import usePostPropertyStore, { MediaDetails } from "@/store/postproperty";
import ImageUploader from "@/common/FormElements/DragImageInput";

const UploadImage = () => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const [uploadedFiles, setUploadedFiles] = useState<(File | string)[]>(
    property.mediaDetails?.propertyImages || []
  );
  const setProperty = usePostPropertyStore((state) => state.setProperty);

  const handleImageUpload = (uploadedUrls: string[]) => {
    setUploadedFiles(uploadedUrls);
    updatePropertyState("propertyImages", uploadedUrls);
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

  return (
    <div>
      <p className="label-text  text-gray-500  font-medium md:mb-2 mb-1">
        Add one video and Photos of the Property
      </p>
      <div>
        <ImageUploader
          label="Upload Photos"
          folderName="propertyImages"
          labelCls="md:text-[12px] text-[10px] font-medium text-black "
          onFilesChange={handleImageUpload}
          maxFiles={5}
          maxFileSize={10}
          acceptedFormats={["image/png", "image/jpg", "image/jpeg"]}
          errorMsg={
            uploadedFiles?.length === 0
              ? "Please upload at least one image."
              : ""
          }
          outerCls="border-[#3586FF]"
          initialUrls={uploadedFiles.filter(
            (file): file is string => typeof file === "string"
          )}
          buttonCls="bg-[#3586FF]"
          required
        />
      </div>
    </div>
  );
};

export default UploadImage;
