import { DashboardTable } from '@/common/DashBoardTable'
import Drawer from '@/common/Drawer';
import CustomForm, { ICustomFormProps } from '@/common/FormElements';
import apiClient from '@/utils/apiClient';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FaBloggerB } from 'react-icons/fa';
import Image from 'next/image'

export interface TableColumn {
    label: string;
    key: string;
    status: boolean;
}

const DashboardView = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [blog, setBlog] = useState<any>({
        title: '',
        previewDescription: '',
        thumbnailImageUrl: '',
        CoverImageUrl: '',
        externalResourceLink: '',
        content: '',
        blogStatus: 'Regular',
        blogType: 'General',
    });
    const [updateBlogId, setUpdateBlogId] = useState<number | string | null | undefined>(undefined);
    const [allBlogs, setAllBlogs] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);
    const [blogFilters, setBlogFilters] = useState<any>({
        blogType: '',
        search: '',
    });
    const [originalBlog, setOriginalBlog] = useState<any>(null);
    const TableColumns: TableColumn[] = [
        { label: "Title", key: "title", status: true },
        { label: "Blog Status", key: "blogStatus", status: true },
        { label: "Blog Type", key: "blogType", status: true },
        { label: "Preview Description", key: "previewDescription", status: true },
    ];

    const handleFormChange = (name: string, value: any) => {
        setBlog((currProp: any) => {
            return { ...currProp, [name]: value };
        });
    };

    const isBlogDataChanged = (original: any, current: any) => {
        return JSON.stringify(original) !== JSON.stringify(current);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (updateBlogId && !isBlogDataChanged(originalBlog, blog)) {
            console.log('No changes detected, skipping patch API call.');
            setOpenModal(false);
            return;
        }

        try {
            let res: any;
            if (!updateBlogId) {
                res = await apiClient.post(apiClient.URLS.blogs, { ...blog });
            } else {
                res = await apiClient.patch(`${apiClient.URLS.blogs}/${updateBlogId}`, {
                    id: updateBlogId,
                    ...blog,
                });
            }
            if (res) {
                await fetchBlogs();
                setOpenModal(false);
                setUpdateBlogId(undefined);
            }
        } catch (e) {
            console.log('Error during form submission: ', e);
        }
    };

    const handleReset = (e: any) => {
        e.preventDefault();
        setBlog({
            title: '',
            previewDescription: '',
            thumbnailImageUrl: '',
            CoverImageUrl: '',
            externalResourceLink: '',
            content: '',
            blogStatus: 'Regular',
            blogType: 'General',
        });
        setUpdateBlogId(undefined);
    };

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(apiClient.URLS.blogs, {
                blogType: blogFilters?.blogType || '',
            });

            if (res?.body.length > 0 && Array.isArray(res?.body)) {
                setAllBlogs(res.body);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch blogs: ', error);
            setLoading(false);
        }
    }, [blogFilters]);

    const handleEditRow = async (row: any) => {
        const id = row.id;

        const rowId = allBlogs[id]?.id;
        if (!rowId) {
            console.log("Blog ID not found");
            return;
        }

        setOpenModal(true);
        try {
            const res = await apiClient.get(`${apiClient.URLS.blogs}/${rowId},`,

            );
            console.log('Blog details: ', res.body);
            if (res?.body) {
                const blogData = {
                    title: res.body.title,
                    previewDescription: res.body.previewDescription,
                    thumbnailImageUrl: res.body.thumbnailImageUrl,
                    CoverImageUrl: res.body.CoverImageUrl,
                    externalResourceLink: res.body.externalResourceLink,
                    content: res.body.content,
                    blogStatus: res.body.blogStatus,
                    blogType: res.body.blogType,
                };

                setBlog(blogData);
                setOriginalBlog(blogData);
                setUpdateBlogId(allBlogs[row.id]?.id);
                setOpenModal(true);
            }
        } catch (error) {
            console.error('Failed to fetch blog details', error);
        }
    };


    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs, blogFilters]);

    const customFormDataProps: ICustomFormProps = {
        rootCls: 'mb-14',
        heading: (
            <div className="flex gap-3 items-center">
                <>Add Blog</>
                <FaBloggerB className="text-[20px]" />
            </div>
        ),
        headingCls: 'text-gray-700 text-xl md:text-2xl md:pl-10 font-bold',
        subHeadingCls: 'text-red-500 font-Gordita-Light text-[12px] md:pl-10',
        subHeading: 'All are required fields',
        inputArr: [
            {
                name: 'title',
                id: 'title',
                placeholder: 'Enter title',
                value: blog.title,
                label: 'Title',
                type: 'text',
                onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
            },
            {
                name: 'externalResourceLink',
                label: 'External resource link',
                id: 'externalResourceLink',
                placeholder: 'Add any external source link for reference',
                value: blog.externalResourceLink,
                type: 'text',
                onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
            },
            {
                name: 'previewDescription',
                id: 'previewDescription',
                label: 'Description preview',
                placeholder: 'Enter description preview',
                rootCls: 'col-span-2',
                value: blog.previewDescription,
                note: 'Please add only less than 25 words of description',
                type: 'textarea',
                onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
            },
            {
                name: 'thumbnailImageUrl',
                label: 'Thumbnail Image URL',
                type: 'file',
                // onFileChange: (e: any) => handleUpload(e, 'thumbnailImageUrl'),
            },
            {
                name: 'CoverImageUrl',
                label: 'Cover Image URL',
                type: 'file',
                // onFileChange: (e: any) => handleUpload(e, 'CoverImageUrl'),
            },
            {
                name: 'blogStatus',
                label: 'Blog status',
                selectedOption: blog.blogStatus,
                type: 'single-select',
                handleChange: handleFormChange,
                optionsInterface: { isObj: false },
                options: ['Trending', 'Featured', 'Regular'],
            },
            {
                name: 'blogType',
                label: 'Blog type',
                selectedOption: blog.blogType,
                type: 'single-select',
                handleChange: handleFormChange,
                optionsInterface: { isObj: false },
                options: [
                    'Furniture', 'Interiors', 'Resedential construction', 'Construction for business',
                    'General', 'Custom builder', 'Paints', 'Electronics', 'VaastuConsultation', 'CivilEngineering'
                ],
            },
            {
                name: 'content',
                label: 'Content',
                type: 'richtext',
                rootCls: 'col-span-full',
                className: 'min-h-[220px]',
                placeholder: 'Add content',
                value: blog.content,
                onChange: (value: any) => handleFormChange('content', value || ''),
            },
        ],
        inputCls: 'md:grid-cols-2 gap-x-16 md:px-10',
        btns: [
            <button
                key={'cancelButton'}
                className="text-slate-700 px-3 py-2 rounded-md bg-slate-100 mr-3 border border-slate-700"
                type="button"
                onClick={handleReset}
            >
                Cancel
            </button>,
            <button
                key={'submitbutton'}
                className="text-slate-100 px-3 py-2 rounded-md bg-slate-700 mr-3"
                type="button"
                onClick={handleSubmit}
            >
                Submit
            </button>,
        ],
        btnsCls: 'mt-10 md:px-10',
    };

    const formData = useMemo(() => {
        const { ref, ...otherFormDataProps } = customFormDataProps || {} as any;
        return otherFormDataProps;
    }, [customFormDataProps]);

    const handleAddData = () => {
        setOpenModal(true);
    }

    return (
        <div className='min-w-full'>
            <DashboardTable
                TableColumns={TableColumns}
                data={allBlogs}
                customFormDataProps={customFormDataProps}
                handleAddData={handleAddData}
                handleEditRow={handleEditRow}
            />
            {openModal && (
                <Drawer
                    open={openModal}
                    handleDrawerToggle={() => setOpenModal(false)}
                    closeIconCls="text-black"
                    openVariant="right"
                    panelCls=" w-[90%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl"
                    overLayCls="bg-gray-700 bg-opacity-40"
                >
                    {loading && (
                        <div className="inset-0 z-[9999] backdrop-blur-[0.5px] fixed bg-white bg-opacity-50 flex justify-center items-center cursor-wait">
                            <Image
                                src={`/icons/loader.svg`}
                                alt="Loading"
                                width={100}
                                height={100}
                            />
                        </div>
                    )}
                    <CustomForm {...formData} />
                </Drawer>
            )}
        </div>
    )
}

export default DashboardView;
