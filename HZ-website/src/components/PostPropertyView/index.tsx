import React from "react";
import LoginBanner from "./LoginBanner";
import BasicInfo from "../PublicPostProperty/BasicInfo";

const PostPropertyView = () => {
  return (
    <div className="flex md:flex-row flex-col-reverse md:w-[100%] w-full">
      <div className="md:w-[50%] w-full ">
        <LoginBanner />
      </div>
      <div className="md:w-[50%] w-full bg-[#D7E7FF] md:px-[60px]  md:relative md:py-[92px]">
        <BasicInfo />
      </div>
    </div>
  );
};

export default PostPropertyView;
