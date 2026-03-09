import React from 'react'
import { BsHouseCheckFill } from 'react-icons/bs'
import { FaMobileAlt, FaUserCheck } from 'react-icons/fa'



const PropertyStepsBox = () => {
    return (
        <div>
            <div className='w-[380px] p-[24px] border border-[#D1D1D1] h-fit rounded-lg font-sans'>
                <p className='text-[#000000] mb-[40px]'>How to <span className='font-medium'>SELL / RENT</span> your Property in few steps?</p>
                <div className='flex items-center gap-2 mb-4'>
                    <FaUserCheck />
                    <div>
                        <p className='font-medium'>Create Account</p>
                        <p className='text-[#7B7C83] text-[13px]'>Get registered your personal details</p>
                    </div>
                </div>
                <div className='flex items-center gap-2 mb-4'>
                    <FaMobileAlt />
                    <div>
                        <p className='font-[500]'>Verify mobile</p>
                        <p className='text-[#7B7C83] text-[13px]'>Verify Mobile to receive buyer’s call</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <BsHouseCheckFill />
                    <div>
                        <p className='font-[500]'>Property Details</p>
                        <p className='text-[#7B7C83] text-[13px]'>Add the all property details</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyStepsBox