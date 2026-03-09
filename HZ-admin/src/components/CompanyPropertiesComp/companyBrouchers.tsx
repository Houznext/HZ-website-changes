import React from 'react';
import ImageUploader from '@/src/common/DragImageInput';
import { useCompanyPropertyStore } from '@/src/stores/companyproperty';

const CompanyBrouchers = () => {
    const { projects, projectDetails, selectedProjectIndex, setProjectDetails, updateProject } = useCompanyPropertyStore();

    const project = selectedProjectIndex !== null ? projects[selectedProjectIndex] : projectDetails;

    const handleImageUpload = (uploadedUrls: string[]) => {
        if (selectedProjectIndex === null) {
            setProjectDetails({
                ...projectDetails,
                Brochure: uploadedUrls,
            });
        };

        updateProject(selectedProjectIndex, {
            ...projects[selectedProjectIndex],
            Brochure: uploadedUrls,
        });
    };
    return (
        <div>
            <p className='md:text-[18px] text-[16px] font-medium text-[#3586FF] '>
                Upload Project Brochure
                <span className="text-red-500">*</span>
            </p>
            <div className='w-full  mt-5'>
                <ImageUploader
                    label="Upload Brochures"
                    labelCls="md:text-[16px]  text-[12px] font-medium"
                    onFilesChange={handleImageUpload}
                    maxFiles={5}
                    maxFileSize={10}
                    acceptedFormats={[ 'application/pdf']}
                    outerCls="border-[#5297ff]"
                    buttonCls="bg-[#5297ff]"
                    folderName='company-project/brouchers'
                    initialUrls={project?.Brochure || []}
                    required
                />
            </div>
        </div>
    );
};

export default CompanyBrouchers;
