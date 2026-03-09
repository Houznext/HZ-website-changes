
import Button from '@/common/Button';
import CustomInput from '@/common/FormElements/CustomInput';
import Image from 'next/image';
import { useState } from 'react';

const ContactSellerForm = ({ company }: any) => {
    const [isAgent, setIsAgent] = useState<boolean | null>(null);
    const [agreed, setAgreed] = useState(true);
    const [loanInterest, setLoanInterest] = useState(false);
    return (
        <div className="bg-white shadow-md rounded-md p-4 w-full max-w-md">
            <p className="text-[16px] font-semibold mb-2">Contact Seller</p>

            <div className="flex items-center gap-2 mb-2">
                <Image src="/path-to-your-logo.png" alt="Logo" width={40} height={40} />
                <div>
                    <p className="text-[14px] font-medium">{company?.companyName}</p>
                    <p className="text-sm text-gray-500">{company?.RERAId}</p>
                    <p className="text-sm font-bold">+91 91957.....</p>
                </div>
            </div>

            <p className="text-[14px] font-medium mb-2">Please share your contact</p>

            <div className='flex flex-col gap-3'>
                <CustomInput
                    name="name"
                    label="Name"
                    labelCls='text-[14px] font-medium mb-2'
                    className="px-2 py-1"
                    placeholder="Enter your name"
                    type="text"
                />

                <CustomInput
                    name="phone"
                    label="Phone"
                    labelCls='text-[14px] font-medium mb-2'
                    className="px-2 py-1"
                    placeholder="Enter phone number"
                    type="number"
                    prefix="+91"
                />

                <CustomInput
                    name="email"
                    label="Email"
                    labelCls='text-[14px] font-medium mb-2'
                    className="px-2 py-1"
                    placeholder="Enter your email"
                    type="email"
                />
            </div>

            <p className="text-[14px] mb-2 font-medium">
                Are you a Real Estate Agent? <span className="text-red-500">*</span>
            </p>
            <div className="flex gap-4 mb-4">
                <Button
                    className={`px-4 py-2 rounded ${isAgent === true ? 'bg-[#3586FF] text-white' : 'bg-gray-100'}`}
                    onClick={() => setIsAgent(true)}
                >
                    Yes
                </Button>
                <Button
                    className={`px-4 py-2 rounded ${isAgent === false ? 'bg-[#3586FF] text-white' : 'bg-gray-100'}`}
                    onClick={() => setIsAgent(false)}
                >
                    No
                </Button>
            </div>

            <div className="flex items-start gap-2 mb-2">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    className="mt-1 rounded-[4px] w-5 h-5"
                />
                <label className="text-sm text-gray-500">
                    I agree to be contacted by Housing and agents via WhatsApp, SMS, phone, email etc
                </label>
            </div>

            <div className="flex items-start gap-2 mb-4">
                <input
                    type="checkbox"
                    checked={loanInterest}
                    onChange={() => setLoanInterest(!loanInterest)}
                    className="mt-1"
                />
                <label className="text-sm">I am interested in Home Loans</label>
            </div>

            <Button className="w-full  bg-[#3586FF] text-white md:py-[6px] py-1 rounded-md text-center">
                Get Contact Details
            </Button>
        </div>
    );
};

export default ContactSellerForm;
