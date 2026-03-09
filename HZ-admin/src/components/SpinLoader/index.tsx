import React from "react";

const SpinLoader = () => {
  return (
    <>
      <div className="flex items-center justify-center min-h-full h-screen  ">
        <div
          className="relative w-[44px] h-[44px] animate-spinner [transform-style:preserve-3d]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33] [transform:translateZ(-22px)_rotateY(180deg)] "></div>
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33]  [transform:rotateY(-270deg)_translateX(50%)] [transform-origin:top_right] "></div>
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33] [transform:rotateY(270deg)_translateX(-50%)] [transform-origin:center_left]"></div>
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33] [transform:rotateX(90deg)_translateY(-50%)] [transform-origin:top_center] "></div>
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33] [transform:rotateX(-90deg)_translateY(50%)] [transform-origin:bottom_center]"></div>
          <div className="absolute w-full h-full border-2 border-[#5297ff] bg-[#004dff33] [transform:translateZ(22px)]"></div>
        </div>
      </div>
    </>
  );
};

export default SpinLoader;
