import ImageUploader from '@/src/common/DragImageInput'
import { useCompanyPropertyStore } from '@/src/stores/companyproperty';
import React from 'react'

const CompanyMedia = () => {
    const { projects, projectDetails, selectedProjectIndex, updateProject, setProjectDetails } = useCompanyPropertyStore();
    const project = selectedProjectIndex !== null ? projects[selectedProjectIndex] : projectDetails;

    const handleImageUpload = (uploadedUrls: string[]) => {
        if (selectedProjectIndex === null) {
            setProjectDetails({
                ...projectDetails,
                mediaDetails: {
                    propertyImages: uploadedUrls,
                    propertyVideo: [],
                },
            });
        }
        else {
            updateProject(selectedProjectIndex, {
                ...projects[selectedProjectIndex],
                mediaDetails: {
                    propertyImages: uploadedUrls,
                    propertyVideo: [],
                },
            });
        }
    }

    return (
        <div>
            <p className="md:text-[18px] text-[16px]  font-medium mb-3 text-[#3586FF] ">
                Add one video and Photos of the Property
            </p>
            <div>
                <ImageUploader
                    label="Upload Photos"
                    labelCls="md:text-[16px] text-[12px] font-medium"
                    onFilesChange={handleImageUpload}
                    maxFiles={5}
                    maxFileSize={10}
                    acceptedFormats={['image/png', 'image/jpg', 'image/jpeg']}
                    errorMsg={project?.mediaDetails?.propertyImages?.length === 0 ? 'Please upload at least one image.' : ''}
                    outerCls="border-[#5297ff]"
                     folderName='company-project/property'
                    initialUrls={project?.mediaDetails?.propertyImages.filter((file): file is string => typeof file === 'string')}
                    buttonCls="bg-[#5297ff]"
                    required
                />
            </div>
        </div>
    )
}
export default CompanyMedia