import React from 'react'
import Image from 'next/image'
const AboutVaastu = () => {
    return (
        <div className='py-10 px-6  flex flex-col md:flex-row gap-16'>
            <div className='flex flex-col gap-4 bg-[#6F8DD2F2] p-12 rounded-[16px]  max-w-[1000px]'>
                <h1 className='text-white font-medium text-[25px]  text-center
                '>
                    What is Vastu Shastra?
                </h1>

                <h2 className='text-white font-regular text-[16px]  text-center leading-9'>
                    Vastu is an alignment of cosmic forces with five key elements (Water, Fire, Earth, Space, and Wind)  of nature. Vastu is a Vedic system of architecture and design from ancient times recorded in various Vastu texts. It consists of rules for designing and constructing buildings in a systematic manner. Vastu has a very basic concept, that every space has a soul of its own and a flow of positive energy would exist around it if that soul is harnessed in the right way.
                </h2>
            </div>
            <div   className='relative'>
                <Image src="/images/custombuilder/subservices/vaastu/aboutvaastu.png" alt="about vaastu" width={390} height={340} />
            </div>

        </div>
    )
}

export default AboutVaastu