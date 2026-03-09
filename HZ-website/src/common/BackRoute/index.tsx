import { useRouter } from "next/router";
import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import Button from '../Button';

const BackRoute = () => {
    const router = useRouter();
    
    return (
        <Button
            onClick={() => router.back()}
            className="
                group flex items-center gap-2 px-3 py-2 rounded-lg
                text-gray-600 hover:text-[#3586FF] 
                hover:bg-blue-50 active:bg-blue-100
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1
            "
        >
            <MdArrowBack className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="font-medium text-[13px] md:text-[15px]">Back</span>
        </Button>
    );
};

export default BackRoute;