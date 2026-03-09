import { useRouter } from "next/router";
import React from 'react'
import { MdArrowBack } from 'react-icons/md';

import { FiArrowLeft } from 'react-icons/fi';
import Button from '@/common/Button';

const BackRoute = () => {
    const router = useRouter();
    return (
        <Button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 w-fit text-gray-700 hover:text-[#3586FF] transition"
        >
            <span className="inline-flex md:h-8 md:w-8 h-5 w-5 items-center justify-center rounded-sm border border-gray-300 group-hover:border-[#3586FF]">
                <FiArrowLeft />
            </span>
            <span className="font-medium text-[14px] md:text-[16px]">
                Back
            </span>
        </Button>
    )
}

export default BackRoute