import React from 'react';
import { ImProfile } from 'react-icons/im';
import { RiLockPasswordFill } from 'react-icons/ri';
import { IoArrowForwardSharp } from 'react-icons/io5';
import { MdKeyboardArrowRight } from 'react-icons/md';

interface IProfileProps {
  title: string;
  subdesc: string;
  handleClick?: () => void;
}

const Profilecard = (props: IProfileProps) => {
  const { title, subdesc, handleClick } = props;
  return (
    <div className="relative rounded-[10px] min-w-[430px] bg-white flex md:flex-col gap-7 p-[40px] shadow-custom-card">
      <div className="flex flex-row justify-between items-center">
        <div className="p-5  rounded-[50%] bg-[#a0bee9]">
          {title == 'Profile Details' ? (
            <ImProfile size={40} />
          ) : (
            <RiLockPasswordFill size={40} />
          )}
        </div>
        <div>
          <MdKeyboardArrowRight size={28} onClick={handleClick} />
        </div>
      </div>
      <div>
        <p className="font-medium font-[20px] ">{title}</p>
        <p className="font-regular text-[#7B7C83]"> {subdesc}</p>
      </div>
    </div>
  );
};
export default Profilecard;
