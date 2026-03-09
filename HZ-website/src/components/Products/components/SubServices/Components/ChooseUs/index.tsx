import React from 'react'
import Image from 'next/image'
import { FaCheckCircle } from 'react-icons/fa'
import AffordableIcon, {  CertifiedIcon, QualityIcon, VerifiedIcon } from '@/components/Products/components/SubServices/Components/ServiceIcons'

const ChooseUs = () => {
    const features = [
        {
            title: 'Affordable Pricing',
            description: 'We offer competitive pricing without compromising on the quality of service.',
            icon: <AffordableIcon />
        },
        {
            title: 'Verified Professionals',
            description: 'Our team consists of certified and experienced plumbers who guarantee top-notch service.',
            icon: <VerifiedIcon />
        },
        {
            title: 'Quality Improvement',
            description: 'We use the latest tools and techniques to ensure long-lasting plumbing solutions.',
            icon: <QualityIcon />
        },
        {
            title: '100% Certified',
            description: 'All our plumbers are licensed and insured, giving you peace of mind for all your plumbing needs.',
            icon: <CertifiedIcon />
        }
    ]

    return (
        <div>
            <div className='w-full relative md:h-[500px] bg-black bg-opacity-[0.7]'>
                <Image src="/images/custombuilder/subservices/plumbing/choose-bg.png" alt="" fill={true} className='absolute -z-10' />
                <div className='flex flex-col md:flex-row w-full h-full'>
                    <div className='md:w-[50%] px-11 py-6'>
                        <p className='text-[#FFFFFF] font-medium md:font-bold text-[24px] md:text-[27px] lg:text-[24px] lg:leading-[44.17px] text-start mb-8'>
                            Why Choose Us
                        </p>
                        <p className='text-[#FFFFFF] font-medium md:font-bold text-[24px] md:text-[27px] lg:text-[32px] lg:leading-[44.17px] text-start mb-8'>
                            Plumbing: Fixing problems one call at a time for plumbing services
                        </p>

                        <div className='flex flex-wrap gap-6'>
                            {features.map((feature, index) => (
                                <div key={index} className='flex items-start gap-3 w-full sm:w-[45%]'>
                                    <div>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <p className='text-[#FFFFFF] font-bold text-[16px]'>{feature.title}</p>
                                        <p className='text-[#FFFFFF] font-regular text-[14px]'>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='w-[50%] h-full relative'>
                        <Image src="/images/custombuilder/subservices/plumbing/choose2.png" alt="" fill={true} objectFit='cover' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChooseUs;
