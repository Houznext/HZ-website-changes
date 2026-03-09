import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Delete } from '@mui/icons-material';
import Image from 'next/image'
import { deleteFile, uploadFile } from '@/utils/uploadFile';
import Button from '@/common/Button';

export interface ImageUploaderProps {
    label?: string;
    labelCls?: string;
    outerCls?: string;
    buttonCls?: string;
    onFilesChange: (fileUrls: string[]) => void;
    maxFiles?: number;
    maxFileSize?: number;
    acceptedFormats?: string[];
    required?: boolean;
    errorMsg?: string;
    errorCls?: string;
    initialImageUrls?: any;
    initialUrls?: string[];
    type?: string;
    name?: string;
    folderName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    label,
    labelCls,
    outerCls,
    buttonCls,
    onFilesChange,
    maxFiles = 5,
    maxFileSize = 10,
    acceptedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic', 'application/pdf'],
    required,
    errorMsg,
    errorCls,
    initialUrls = [],
    folderName
}) => {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>(initialUrls);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);


    useEffect(() => {
        setPreviewUrls(initialUrls);
    }, []);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFiles = async (files: File[]) => {
        const validFiles = files.filter((file) => {
            if (!acceptedFormats.includes(file.type)) {
                setError(`Invalid file type: ${file.type}`);
                return false;
            }
            if (file.size > maxFileSize * 1024 * 1024) {
                setError(`File size exceeds ${maxFileSize}MB limit: ${file.name}`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;
        setError(null);
        setUploading(true);
        setUploadProgress(0);
        const uploadResults: string[] = [];

        for (const file of validFiles) {
            const fileURL = await uploadFile(file, folderName, undefined, undefined, (progress) => {
                setUploadProgress(progress);
            });
            if (fileURL) {
                uploadResults.push(fileURL);
            }
        }
        const newUrls = [...previewUrls, ...uploadResults].slice(0, maxFiles);
        setPreviewUrls(newUrls);
        onFilesChange(newUrls);
        setUploading(false);
        setUploadProgress(0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };


    const removeFile = async (index: number) => {
        const fileUrl = previewUrls[index];
        const success = await deleteFile(fileUrl);
        if (success) {
            const updatedUrls = [...previewUrls];
            updatedUrls.splice(index, 1);
            setPreviewUrls(updatedUrls);
            onFilesChange(updatedUrls);
        }
    };

    return (
        <div
            className={twMerge('w-full max-w-lg p-4 border-2 border-dashed border-gray-300 rounded-md', outerCls)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            {label && (
                <label className={twMerge('text-gray-700 text-base mb-2 block', labelCls)}>
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}

            <div
                className={twMerge(
                    'relative flex flex-col items-center justify-center p-4 text-center transition duration-200',
                    dragging ? 'bg-blue-100 border-blue-300' : 'bg-gray-50',
                )}
            >
                <p className="text-[#3586FF] label-text font-medium">Drag and drop your photos here</p>
                <p className="text-gray-500 sublabel-text">
                    Up to {maxFiles} photos • Max size {maxFileSize}MB • Formats: {acceptedFormats.join(', ')}
                </p>

                <input
                    type="file"
                    accept={acceptedFormats.join(',')}
                    multiple
                    onChange={handleInputChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="mt-4">
                    <Button
                        type="button"
                        className={twMerge('px-4 py-2 bg-[#3586FF] !font-medium text-[10px] md:text-[12px] text-white rounded-md', buttonCls)}
                    >
                        Upload Photos Now
                    </Button>
                </div>
                {uploading && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-[#3586FF] h-3 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 flex gap-4 overflow-x-auto">
                {previewUrls?.map((url, index) => (
                    <div key={index} className="relative min-w-[100px] h-[100px]">
                        <Image
                            src={url}
                            alt={`preview-${index}`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 w-[10px] bg-gray-400 hover:bg-red-400 text-white rounded-md h-[20px] flex items-center justify-center"
                        >
                            <Delete />
                        </Button>
                    </div>
                ))}
            </div>

            {(error || errorMsg) && (
                <p className={twMerge('text-red-500 text-xs mt-2', errorCls)}>
                    {error || errorMsg}
                </p>
            )}
        </div>
    );
};

export default ImageUploader;
