import { uploadFile, deleteFile } from '@/utils/uploadFile';
import Image from "next/image";
import React, {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import Loader from "@/components/Loader";
import { MdDelete } from "react-icons/md";
import { AiOutlineCloudUpload } from "react-icons/ai";

export interface FileInputProps {
  label?: string;
  type: "file";
  labelCls?: string;
  sublabel?: string;
  sublabelClass?: string;
  className?: string;
  name?: string;
  errorMessage?: string;
  required?: React.ReactNode;
  requiredClass?: string;
  errorTextClass?: string;
  onFileChange?: (url: string[]) => void;
  folderName?: string;
  initialFileUrl?: string[];
}

const ImageFileUploader = ({
  label,
  labelCls,
  sublabel,
  sublabelClass,
  className,
  errorMessage,
  errorTextClass,
  required,
  requiredClass,
  name = "file-input",
  folderName,
  initialFileUrl,
  onFileChange,
}: FileInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFileUrl) {
      setSelectedFile(null);
      setImagePreview(initialFileUrl);
    }
  }, [initialFileUrl]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const processFileUpload = async (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);

    try {
      setUploading(true);
      setUploadProgress(0);
      const uploadedURL = await uploadFile(file, folderName);
      if (uploadedURL) {
        setImagePreview((prev) => [...prev, uploadedURL]);
        onFileChange?.([...imagePreview, uploadedURL]);
      } else {
        throw new Error("File upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (index: number) => {
    if (!imagePreview) return;
    try {
      setUploading(true);
      const filePath = imagePreview[index].split("/").pop();
      if (filePath) {
        const success = await deleteFile(`${folderName}/${filePath}`);
        if (success) {
          resetFileInput(index);
        } else {
          throw new Error("Failed to delete file.");
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file.");
    } finally {
      setUploading(false);
    }
  };

  const resetFileInput = (index: number) => {
    setSelectedFile(null);
    onFileChange?.(imagePreview?.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setFileName("No file chosen");
    inputRef.current && (inputRef.current.value = "");
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label
          className={twMerge(
            "block text-sm font-medium text-gray-700",
            labelCls
          )}
        >
          {label}
          {required && (
            <span className={twMerge("text-red-400", requiredClass)}>
              {" "}
              {required}
            </span>
          )}
        </label>
      )}
      {sublabel && (
        <p className={twMerge("text-sm text-gray-500", sublabelClass)}>
          {sublabel}
        </p>
      )}

      {/* Drag & Drop Area */}
      <label
        htmlFor={name}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        {uploading ? (
          <div className="w-full justify-center items-center">
            <Loader />
            <div className="w-[80%] bg-gray-300 h-2 mt-4 rounded-full overflow-hidden">
              <div
                className="bg-[#3586FF] h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <AiOutlineCloudUpload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600 font-regular">
              Drag & Drop or Click to Upload
            </p>
            <p className="text-xs text-gray-400 font-Gordita-Light">PNG, JPG, JPEG (Max: 5MB)</p>
          </div>
        )}
        <input
          className="hidden"
          id={name}
          name={name}
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
        />
      </label>

      {imagePreview?.length !== 0 && (
        <>
          <div className="flex w-full items-center flex-wrap gap-[20px] mt-3">
            {imagePreview?.map((image, index) => (
              <div className="w-[50px] h-[50px]  md:w-[90px] md:h-[90px] relative rounded-[8px] overflow-hidden">
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  className="object-cover absolute w-full rounded-[8px]"
                />
                <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-slate-500 bg-opacity-50  ">
                  <MdDelete
                    onClick={() => handleDeleteFile(index)}
                    className="cursor-pointer w-6 h-6 text-black"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className={twMerge("mt-2 text-sm text-red-600", errorTextClass)}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageFileUploader;
