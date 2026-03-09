import CustomTable from '@/common/CustomTable';
import Drawer from '@/common/Drawer';
import CustomInput from '@/common/FormElements/CustomInput';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { DashboardTable } from '@/common/DashBoardTable';
import CustomForm, { ICustomFormProps } from '@/common/FormElements';
import apiClient from '@/utils/apiClient';

interface TestimonailsInterface {
  name: string;
  content: string;
  userimage?: string;
  rating: number;
  category: string;
  location: string;
}

const TestimonialsView = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [allData, setAllData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<TestimonailsInterface>({
    name: '',
    content: '',
    userimage: '',
    rating: 0,
    category: '',
    location: '',
  });
  const [fileval, setFileVal] = useState<string>('');
  const [updateTestimonialId, setUpdateTestimonialId] = useState<number | string | null | undefined>(undefined);
  const [originalData, setOriginalData] = useState<any>(null);

  const TableColumns = [
    { label: 'Name', key: 'name', status: true },
    { label: 'Content', key: 'content', status: true },
    { label: 'Category', key: 'category', status: true },
  ];

  const handleFormChange = (name: string, value: any) => {
    setTestimonials((currProp: any) => ({ ...currProp, [name]: value }));
  };

  const isDataChanged = (original: any, current: any) => {
    return JSON.stringify(original) !== JSON.stringify(current);
  };

  const handleUpload = async (url: any) => {
    setTestimonials((currProp: any) => ({ ...currProp, userimage: url }));
  };


  const handleReset = () => {
    setTestimonials({
      name: '',
      content: '',
      userimage: '',
      rating: 0,
      category: '',
      location: '',
    });
    setUpdateTestimonialId(undefined);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (updateTestimonialId && !isDataChanged(originalData, testimonials)) {
      console.log('No changes detected, skipping patch API call.');
      setOpenModal(false);
      return;
    }
    try {
      let res: any;
      if (!updateTestimonialId) {
        res = await apiClient.post(apiClient.URLS.testimonials, { ...testimonials });
      } else {
        res = await apiClient.patch(`${apiClient.URLS.testimonials}/${updateTestimonialId}`, {

          ...testimonials,
        });
      }

      if (res) {
        await fetchTestimonials();
        setOpenModal(false);
        setUpdateTestimonialId(undefined);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  const handleEditRow = async (row: any) => {
    const rowId = row.id;
    if (!rowId) return;

    setOpenModal(true);
    try {
      const res = await apiClient.get(`${apiClient.URLS.testimonials}/${rowId}`);
      if (res?.body) {
        const testimonialData =
        {
          name: res?.body?.name,
          content: res?.body?.content,
          userimage: res?.body?.userimage,
          rating: res?.body?.rating,
          category: res?.body?.category,
          location: res?.body?.location,
        };

        setTestimonials(testimonialData);
        setOriginalData(testimonialData);
        setUpdateTestimonialId(rowId);
      }
    } catch (error) {
      console.error('Failed to fetch testimonial details:', error);
    }
  };

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.testimonials,
        {
        }
      );
      if (res?.body && Array.isArray(res.body)) {
        setAllData(res.body);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      setLoading(false);
    }
  }, []);

  const customFormDataProps: ICustomFormProps = {
    rootCls: 'mb-14',

    headingCls: 'text-gray-700 text-xl md:text-2xl pl-10 font-bold',
    subHeadingCls: 'text-red-500 font-Gordita-Light text-[12px] pl-10',
    subHeading: 'All are required fields',
    inputArr: [
      {
        name: 'name',
        id: 'name',
        placeholder: 'Enter name',
        value: testimonials.name,
        label: 'Name',
        type: 'text',
        onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
      },
      {
        name: 'content',
        id: 'content',
        placeholder: 'Enter content',
        value: testimonials.content,
        label: 'Testimonial Content',
        type: 'textarea',
        rootCls: 'col-span-full',
        className: 'min-h-[100px]',
        onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
      },
      {
        name: 'userimage',
        initialFileUrl: testimonials?.userimage,
        label: 'User Image',
        type: 'file',
        onFileChange: (e: any) => handleUpload(e),
      },
      {
        name: 'rating',
        id: 'rating',
        placeholder: 'Enter rating',
        value: testimonials.rating,
        label: 'Rating',
        type: 'number',
        min: 1,
        max: 5,
        onChange: (e: any) => handleFormChange(e?.target?.name ?? '', parseFloat(e?.target?.value) || 0),
      },
      {
        name: 'category',
        id: 'category',
        label: 'Category',
        selectedOption: testimonials.category,
        type: 'single-select',
        handleChange: handleFormChange,
        optionsInterface: { isObj: false },
        options: ['furniture', 'Interiors', 'Residential Construction', 'Construction for Business', 'General'],
      },
      {
        name: 'location',
        id: 'location',
        placeholder: 'Enter location',
        value: testimonials.location,
        label: 'Location',
        type: 'text',
        onChange: (e: any) => handleFormChange(e?.target?.name ?? '', e?.target?.value ?? ''),
      },
    ],
    inputCls: 'grid-cols-2 gap-x-16 px-10',
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
        key={'submitButton'}
        className="text-slate-100 px-3 py-2 rounded-md bg-slate-700 mr-3"
        type="button"
        onClick={handleSubmit}
      >
        Submit
      </button>,
    ],
    btnsCls: 'mt-10 px-10',
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);



  const formData = useMemo(() => {
    const { ref, ...otherFormDataProps } = customFormDataProps;
    return otherFormDataProps;
  }, [customFormDataProps]);

  return (
    <div className="min-w-full">
      <DashboardTable
        TableColumns={TableColumns}
        data={allData}
        handleAddData={() => setOpenModal(true)}
        handleEditRow={handleEditRow}
      />
      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={() => setOpenModal(false)}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[90%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          {loading && (
            <div className="inset-0 z-[9999] backdrop-blur-[0.5px] fixed bg-white bg-opacity-50 flex justify-center items-center cursor-wait">
              <Image src={`/icons/loader.svg`} alt="Loading" width={100} height={100} />
            </div>
          )}
          <CustomForm {...formData} />
        </Drawer>
      )}
    </div>
  );
};

export default TestimonialsView;
