import { deleteFile, uploadFile } from "@/src/utils/uploadFile";
import React, { ChangeEvent, useEffect, useRef, useState, DragEvent } from "react";
import { twMerge } from "tailwind-merge";
import { FiUploadCloud, FiImage, FiTrash2, FiCheck, FiX } from "react-icons/fi";

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
  onFileChange?: (url: string) => void;
  folderName?: string;
  initialFileUrl?: string;
}

const FileInput = ({
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFileUrl) {
      setSelectedFile(null);
      setImagePreview(initialFileUrl);
      setFileName(initialFileUrl.split("/").pop() || "Uploaded file");
    }
  }, [initialFileUrl]);

  const processFile = async (file: File) => {
    if (uploading) return;
    setError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setUploadProgress(0);

    try {
      setUploading(true);
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const uploadedURL = await uploadFile(file, folderName);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadedURL) {
        setImagePreview(uploadedURL);
        onFileChange?.(uploadedURL);
      } else {
        throw new Error("File upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDeleteFile = async () => {
    if (!imagePreview) return;
    setUploading(true);
    try {
      const success = await deleteFile(imagePreview);
      if (success) {
        resetFileInput();
      } else {
        throw new Error("Failed to delete file.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file.");
    } finally {
      setUploading(false);
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFileName("No file chosen");
    setUploadProgress(0);
    if (inputRef.current) inputRef.current.value = "";
    onFileChange?.("");
  };

  const hasError = !!errorMessage || !!error;

  return (
    <div className={twMerge("w-full", className)}>
      {/* Label + sublabel */}
      {(label || sublabel) && (
        <div className="mb-2">
          {label && (
            <label
              className={twMerge(
                "inline-block text-[13px] font-semibold text-slate-700 tracking-wide",
                labelCls
              )}
            >
              {label}
              {required && (
                <span className={twMerge("text-red-500 ml-0.5", requiredClass)}>
                  *
                </span>
              )}
            </label>
          )}
          {sublabel && (
            <p className={twMerge("text-xs text-slate-500 mt-0.5", sublabelClass)}>
              {sublabel}
            </p>
          )}
        </div>
      )}

      {/* Upload Zone */}
      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={twMerge(
            "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
            "flex flex-col items-center justify-center gap-3 min-h-[140px]",
            isDragOver
              ? "border-blue-400 bg-blue-50 scale-[1.02]"
              : hasError
              ? "border-red-300 bg-red-50/50 hover:border-red-400"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            className="hidden"
            id={name}
            name={name}
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <div className={twMerge(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
            isDragOver ? "bg-blue-100 text-blue-600 scale-110" : "bg-slate-100 text-slate-400"
          )}>
            <FiUploadCloud className="w-6 h-6" />
          </div>

          <div className="text-center">
            <p className="text-[13px] font-medium text-slate-700">
              {isDragOver ? "Drop your image here" : "Drag & drop your image here"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or <span className="text-blue-500 font-medium hover:underline">browse files</span>
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <FiImage className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">PNG, JPG, GIF up to 10MB</span>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Uploading...</p>
                <p className="text-xs text-slate-500 mt-0.5">{uploadProgress}%</p>
              </div>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Section */
        <div className="relative group">
          <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
            {/* Image Preview */}
            <div className="relative h-[120px] w-full bg-slate-100">
              <img
                src={imagePreview}
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              {/* Upload overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span className="text-white text-xs font-medium">Uploading...</span>
                </div>
              )}

              {/* Success indicator */}
              {!uploading && uploadProgress === 100 && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-medium">
                  <FiCheck className="w-3 h-3" />
                  Uploaded
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={uploading}
                  className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-blue-600 transition-all duration-150 shadow-sm"
                  title="Replace image"
                >
                  <FiUploadCloud className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile();
                  }}
                  disabled={uploading}
                  className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-red-500 hover:text-white transition-all duration-150 shadow-sm"
                  title="Remove image"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File info */}
            <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FiImage className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate" title={fileName}>
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteFile}
                  disabled={uploading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden input for replacement */}
          <input
            className="hidden"
            id={`${name}-replace`}
            name={name}
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      )}

      {/* Error messages */}
      {(error || errorMessage) && (
        <div className="flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className={twMerge("text-red-500 text-xs font-medium", errorTextClass)}>
            {error || errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileInput;
