import Button from '@/common/Button';
import CustomInput from '@/common/FormElements/CustomInput';
import Modal from '@/common/Modal';
import { BackArrow } from '@/components/PublicPostProperty/PropIcons';
import { duration } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { set } from 'zod';
import Table from './ListTable';
import apiClient from '@/utils/apiClient';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

const ApplyCareerView = () => {
    const [formValues, setFormValues] = useState<any>({
        name: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        github: '',
        resume: '',
        qualifications: [],
        workExperience: []
    });
    const [isQualification, setIsQualification] = useState<boolean>(false)
    const [isWorkExperience, setIsWorkExperience] = useState<boolean>(false)
    const [jobId, setJobid] = useState<number | any>(null)
    const router = useRouter()


    useEffect(() => {
        if (router.isReady) {
            const { id } = router.query;
            setJobid(id);
        }
    }, [router.isReady, router.query]);

    const [errors, setErrors] = useState<any>({});
    const [newQualification, setNewQualification] = useState<any>({
        degree: '',
        institute: '',
        yearOfCompletion: ''
    })
    const [newWorkExperience, setNewWorkExperience] = useState<any>({
        company: '',
        role: '',
        duration: '',
        description: ''
    })
    const handleQualificationChange = (name: string, value: string) => {
        setNewQualification((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };
    const handleWorkExperienceChange = (name: string, value: string) => {
        setNewWorkExperience((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };


    const addQualification = () => {
        if (newQualification.degree && newQualification.institute && newQualification.yearOfCompletion) {
            setFormValues((prev: any) => ({
                ...prev,
                qualifications: [...prev.qualifications, newQualification]
            }));
            setNewQualification({
                degree: '',
                institute: '',
                yearOfCompletion: ''
            })
            setIsQualification(false)
        }
        else {
            setErrors((prev: any) => ({
                ...prev,
                qualifications: 'All fields are required'
            }))
        }
    }

    const addWorkExperience = () => {
        if (newWorkExperience.company && newWorkExperience.role && newWorkExperience.duration && newWorkExperience.description) {
            setFormValues((prev: any) => ({
                ...prev,
                workExperience: [...prev.workExperience, newWorkExperience]
            }));
            setNewWorkExperience({
                company: '',
                role: '',
                duration: '',
                description: ''
            })
            setIsWorkExperience(false)
        }
        else {
            setErrors((prev: any) => ({
                ...prev,
                workExperience: 'All fields are required'
            }))
        }
    }

    const handleChange = (name: string, value: any) => {
        setFormValues((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleQualificationEdit = (index: number) => {
        const qualificationToEdit = formValues.qualifications[index];
        setNewQualification(qualificationToEdit);
        setIsQualification(true);
    };

    const handleQualificationDelete = (index: number) => {
        setFormValues((prev: any) => ({
            ...prev,
            qualifications: prev.qualifications.filter((_: any, i: number) => i !== index),
        }));
    };


    const handleWorkExperienceEdit = (index: number) => {
        const workExperienceToEdit = formValues.workExperience[index];
        setNewWorkExperience(workExperienceToEdit);
        setIsWorkExperience(true);
    };

    const handleWorkExperienceDelete = (index: number) => {
        setFormValues((prev: any) => ({
            ...prev,
            workExperience: prev.workExperience.filter((_: any, i: number) => i !== index),
        }));
    };

    const qualificationColumns = [
        { label: 'Degree', key: 'degree' },
        { label: 'Institute', key: 'institute' },
        { label: 'Year of Completion', key: 'yearOfCompletion' },
    ];

    const workExperienceColumns = [
        { label: 'Company', key: 'company' },
        { label: 'Role', key: 'role' },
        { label: 'Duration', key: 'duration' },
        { label: 'Description', key: 'description' },
    ];
    const validateForm = () => {
        const errors: any = {};
        if (!formValues.name) {
            errors.name = 'Name is required';
        }
        if (!formValues?.email) {
            errors.email = 'Email is required';
        }
        if (!formValues?.phone) {
            errors.phone = 'Phone is required';
        }
        if (!formValues?.address) {
            errors.address = 'Address is required';
        }
        if (!formValues?.linkedin) {
            errors.linkedin = 'LinkedIn is required';
        }
        if (!formValues?.github) {
            errors.github = 'GitHub is required';
        }
        if (!formValues?.resume) {
            errors.resume = 'Resume is required';
        }
        if (formValues?.qualifications?.length > 0) {
            errors.qualifications = 'Qualifications are required';
        }
        if (formValues?.workExperience?.length > 0) {
            errors.workExperience = 'Qualifications are required';
        }

        setErrors(errors);
        return Object.keys(errors).length === 0 ? true : false;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        if (jobId) {
            return;
        }
        try {
            const response = await apiClient.post(`${apiClient.URLS.apply}/${jobId}/apply`, { ...formValues })
            if (response.status === 201) {
                toast.success("Application submitted successfully")
            }
        }
        catch (e) {
            toast.error("Application submitted successfully")
            console.log("error while posting", e)
        }
    };
    return (
        <div className='mx-auto w-full p-5'>
            <div className='flex items-center gap-2 cursor-pointer'>
                <BackArrow />
                <p className='font-medium text-[16px]' onClick={() => router.back()}>Back</p>
            </div>
            <div className='max-w-[820px] rounded-lg mx-auto px-10 py-4 shadow-xl'>
                <div className="">
                    <h1 className="text-[24px] font-medium mb-4">Apply for Job</h1>
                    <h2 className="text-[#7f8793] mb-6">
                        To apply for this job, email your resume at hiring@onecasa.in
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-3 w-full">
                            <CustomInput
                                name="name"
                                label="Full Name"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('name', e.target.value)}
                                type="text"
                                value={formValues.name}
                                errorMsg={errors?.name}
                            />

                            <CustomInput
                                name="email"
                                label="Email"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('email', e.target.value)}
                                type="email"
                                value={formValues.email}
                                errorMsg={errors?.email}
                            />

                            <CustomInput
                                name="phone"
                                label="Phone"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('phone', e.target.value)}
                                type="text"
                                value={formValues.phone}
                                errorMsg={errors?.phone}
                            />

                            <CustomInput
                                name="address"
                                label="Address"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('address', e.target.value)}
                                type="text"
                                value={formValues.address}
                                errorMsg={errors?.address}
                            />

                            <CustomInput
                                name="linkedin"
                                label="LinkedIn Profile"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('linkedin', e.target.value)}
                                type="text"
                                value={formValues.linkedin}
                                errorMsg={errors?.linkedin}
                            />

                            <CustomInput
                                name="github"
                                label="GitHub Profile"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('github', e.target.value)}
                                type="text"
                                value={formValues.github}
                                errorMsg={errors?.github}
                            />
                            <CustomInput
                                name="resume"
                                label="Resume URL"
                                labelCls="text-[16px] font-medium"
                                className="p-[6px]"
                                onChange={(e) => handleChange('resume', e.target.value)}
                                type="text"
                                value={formValues.resume}
                                errorMsg={errors?.resume}
                            />

                            <div className='flex flex-col w-full my-3'>
                                <div className='flex flex-row w-full justify-between mb-4'>
                                    <p className="text-[16px] font-medium mb-2">Qualifications</p>
                                    <Button className='bg-[#3B82F6] text-white py-1 px-4 rounded-md' onClick={() => { setIsQualification(true) }}>
                                        <span className="text-[16px] font-regular">+ add</span>
                                    </Button>
                                </div>
                                {formValues.qualifications?.length > 0 && <div>
                                    <Table
                                        columns={qualificationColumns}
                                        data={formValues.qualifications}
                                        onEdit={handleQualificationEdit}
                                        onDelete={handleQualificationDelete}
                                    />
                                </div>}
                                {errors?.qualifications && <p>{errors?.qualifications}</p>}
                            </div>
                            <div className='flex flex-col w-full my-3'>
                                <div className='flex flex-row w-full justify-between mb-4' >
                                    <p className="text-[16px] font-medium mb-2">Work Experience</p>
                                    <Button className='bg-[#3B82F6] text-white py-1 px-4 rounded-md' onClick={() => { setIsWorkExperience(true) }} >
                                        <span className="text-[16px] font-regular">+  add</span>
                                    </Button>
                                </div>
                                {formValues.workExperience.length > 0 &&
                                    <div>
                                        <Table
                                            columns={workExperienceColumns}
                                            data={formValues.workExperience}
                                            onEdit={handleWorkExperienceEdit}
                                            onDelete={handleWorkExperienceDelete}
                                        />
                                    </div>}
                                {errors?.workExperience && <p>{errors?.workExperience}</p>}
                            </div>

                            <div className="flex flex-row gap-6">
                            </div>

                            <div className="mt-6">
                                <Button type="submit" className=" w-full py-3 text-white rounded-md bg-[#3B82F6]" >
                                    Apply Now
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Modal isOpen={isQualification} closeModal={() => setIsQualification(false)} className='flex flex-col max-w-[600px] mx-auto'>
                <div className='flex flex-col mx-auto justify-center items-center'>
                    <h2 className="text-[24px] font-medium mb-4">Qualification</h2>
                    <CustomInput
                        name="degree"
                        label="Degree"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleQualificationChange('degree', e.target.value)}
                        type="text"
                        value={newQualification.degree}
                        errorMsg={errors?.qualification}
                    />

                    <CustomInput
                        name="institute"
                        label="Institute"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleQualificationChange('institute', e.target.value)}
                        type="text"
                        value={newQualification.institute}
                        errorMsg={errors?.qualification}
                    />
                    <CustomInput
                        name="yearOfCompletion"
                        label="Year of Completion"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleQualificationChange('yearOfCompletion', e.target.value)}
                        type="text"
                        value={newQualification.yearOfCompletion}
                        errorMsg={errors?.qualification}
                    />
                    {errors?.qualification && <p className='text-red-500 font-medium'>{errors.qualification}</p>}
                    <Button
                        className="mt-4 w-full py-3 text-white rounded-md bg-[#3B82F6]"
                        onClick={addQualification}
                    >
                        Add Qualification
                    </Button>
                </div>
            </Modal>
            <Modal
                isOpen={isWorkExperience}
                closeModal={() => setIsWorkExperience(false)}
                className='flex flex-col max-w-[600px] '
            >
                <div className='flex flex-col '>
                    <h2 className="text-[24px] font-medium mb-4">Add Work Experience</h2>
                    <CustomInput
                        name="company"
                        label="Company"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleWorkExperienceChange('company', e.target.value)}
                        type="text"
                        value={newWorkExperience.company}
                    />
                    <CustomInput
                        name="role"
                        label="Role"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleWorkExperienceChange('role', e.target.value)}
                        type="text"
                        value={newWorkExperience.role}
                    />
                    <CustomInput
                        name="duration"
                        label="Duration"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleWorkExperienceChange('duration', e.target.value)}
                        type="text"
                        value={newWorkExperience.duration}
                    />
                    <CustomInput
                        name="description"
                        label="Description"
                        labelCls="text-[16px] font-medium"
                        className="p-[6px]"
                        onChange={(e) => handleWorkExperienceChange('description', e.target.value)}
                        type="text"
                        value={newWorkExperience.description}
                    />
                    {errors?.workExperience && <p className='text-red-500 font-medium'>{errors.workExperience}</p>}
                    <Button
                        className="mt-4 w-full py-3 text-white rounded-md bg-[#3B82F6]"
                        onClick={addWorkExperience}
                    >
                        Add Work Experience
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default ApplyCareerView



