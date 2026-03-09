import React from 'react';
import Image from 'next/image';
const OurProducts = () => {
  return (
    <div>
      <p className="my-[20px] md:my-[50px] text-center font-medium uppercase text-[28px] leading-[44.17px] text-[#000000]">
        Discover Our Two Premium Services at DreamCasa
      </p>
      <div className="shadow-md mb-8 border-t md:px-[85px] py-[10px] md:py-[40px] grid grid-cols-1 md:grid-cols-2 gap-[35px] md:gap-[70px]">
        <div className="flex flex-col items-center">
          <Image
            src="/home/custom-builder.png"
            alt=""
            width={256}
            height={198}
          />
          <p
            style={{
              backgroundImage:
                'linear-gradient(90deg, #3586FF 30.48%, #212227 100%)',
              color: 'transparent',
              backgroundClip: 'text',
            }}
            className="text-[24px] leading-[34.1px] Gordita-Medium mt-[16px] mb-[24px]"
          >
            Custom Builder
          </p>
          <p className="text-center text-[#7B7C83] text-base leading-[28px]">
            At DreamCasa, our Custom Builder service empowers you to create a
            home that truly reflects your unique style and preferences. With an
            array of customizable options, we make it easy for you to design the
            perfect living space. From selecting materials to choosing the
            finest details, our expert team is here to guide you every step of
            the way, ensuring your dream home becomes a reality.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/home/invest-in-land.png"
            alt=""
            width={256}
            height={198}
          />
          <p
            style={{
              backgroundImage:
                'linear-gradient(90deg, #3586FF 30.48%, #212227 100%)',
              color: 'transparent',
              backgroundClip: 'text',
            }}
            className="text-[24px] leading-[34.1px] font-medium mt-[16px] mb-[24px]"
          >
            Invest In Land
          </p>
          <p className="text-center text-[#7B7C83] text-base leading-[28px]">
            Secure your future with DreamCasa's land investment opportunities.
            Whether you're looking to build your dream home or expand your
            portfolio, our carefully selected plots offer both value and
            potential. Our team provides expert guidance to help you make
            informed decisions, ensuring your investment grows in the years to
            come.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurProducts;
