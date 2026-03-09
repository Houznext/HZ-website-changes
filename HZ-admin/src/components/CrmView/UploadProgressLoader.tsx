"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineHome, HiOutlineTruck } from "react-icons/hi";
import { GiSofa, GiPaintRoller, GiSolarPower } from "react-icons/gi";
import { motion ,useAnimation} from "framer-motion";

interface UploadProgressLoaderProps {
  progress: number;
}

const icons = [
  {
    id: 1,
    icon: <HiOutlineHome className="w-6 h-6" />,
    label: "Real Estate",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: 2,
    icon: <GiSofa className="w-6 h-6" />,
    label: "Interiors",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: 3,
    icon: <GiPaintRoller className="w-6 h-6" />,
    label: "Painting",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 4,
    icon: <GiSolarPower className="w-6 h-6" />,
    label: "Solar",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 5,
    icon: <HiOutlineTruck className="w-6 h-6" />,
    label: "Packers",
    color: "from-green-400 to-emerald-500",
  },
];

const UploadProgressLoader: React.FC<UploadProgressLoaderProps> = ({
  progress,
}) => {
  const [orbitStarted, setOrbitStarted] = useState(false);
  const radius = 80;

  useEffect(() => {
  if (progress >= 40) {
    setOrbitStarted(true);
  }
}, [progress]);
 
  // const controls = useAnimation();
 

  // useEffect(() => {
  //   if (progress >= 40) {
  //     setOrbitStarted(true);
  //     controls.start({ rotate: 360, transition: { duration: 15, repeat: Infinity, ease: "linear" } });
  //   } else {
  //     controls.stop();
  //   }
  // }, [progress, controls]);


  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-8 p-6   ">
      <motion.div
        className="absolute w-64 h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-2xl opacity-60"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />

              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-gradient-to-r from-[#5297ff] to-purple-600 drop-shadow-sm"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (progress / 100) * 251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (progress / 100) * 251.2 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={progress}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
              >
                {progress}%
              </motion.span>
            </div>
          </div>

          {icons.map((item, index) => {
            const angle = (index / icons.length) * 2 * Math.PI;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={item.id}
                className="absolute flex flex-col items-center"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    repeat: Infinity,
                    duration: 10,
                    ease: "linear",
                    delay: index * 0.1,
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  },
                }}
                style={{
                  transformOrigin: "center",
                }}
              >
                <motion.div
                  className={`p-3 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center bg-gradient-to-br ${item.color} shadow-md hover:shadow-lg transition-all duration-300`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    x,
                    y,
                  }}
                >
                  <div className="text-white filter drop-shadow-sm">
                    {item.icon}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div> */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200"
            animate={orbitStarted ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-[#3586FF]  drop-shadow-sm"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (progress / 100) * 251.2}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={progress}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-gray-700"
              >
                {progress}%
              </motion.span>
            </div>
          </div>

          {icons.map((item, index) => {
            const angle = (index / icons.length) * 2 * Math.PI;
            const targetX = Math.cos(angle) * radius;
            const targetY = Math.sin(angle) * radius;

            return (
              <motion.div
                key={item.id}
                className="absolute flex flex-col items-center"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={
                  orbitStarted
                    ? {
                        x: targetX,
                        y: targetY,
                        opacity: 1,
                        rotate: [0, 360],
                      }
                    : { x: 0, y: 0, opacity: 0.5 }
                }
               transition={{
  x: { duration: 0.5, ease: "easeOut" },
  y: { duration: 0.5, ease: "easeOut" },
  rotate: {
    repeat: Infinity,
    duration: 4,
    ease: "linear",
    delay: index * 0.05,
  },
}}

              >
                <motion.div
                  className={`p-3 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center bg-gradient-to-br ${item.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-white">{item.icon}</div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
         {/* <div className="relative w-48 h-48 flex items-center justify-center">
        
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200"
            animate={orbitStarted ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

         
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-[#3586FF]  drop-shadow-sm"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (progress / 100) * 251.2}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </svg>

           
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={progress}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-gray-700"
              >
                {progress}%
              </motion.span>
            </div>
          </div>

          
          <motion.div
            className="absolute w-full h-full flex items-center justify-center"
            animate={controls}
          >
            {icons.map((item, index) => {
              const angle = (index / icons.length) * 2 * Math.PI;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.div
                  key={item.id}
                  className="absolute flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    orbitStarted
                      ? { x, y, opacity: 1, scale: [1, 1.1, 1] }
                      : { x: 0, y: 0, opacity: 0.5, scale: 0.9 }
                  }
                  transition={{
                    x: { duration: 1, ease: "easeOut" },
                    y: { duration: 1, ease: "easeOut" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
                  }}
                >
                  <motion.div
                    className={`p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center bg-gradient-to-br ${item.color}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3,
                    }}
                  >
                    <div className="text-white drop-shadow-sm">{item.icon}</div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div> */}
        

        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] md:text-[14px] font-medium text-gray-600"
            >
              Uploading your files...
            </motion.span>
            <motion.span
              key={progress}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"
            >
              {progress}%
            </motion.span>
          </div>

          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-3 rounded-full bg-[#5297ff] shadow-sm relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>

            <div className="flex justify-between mt-2">
              {[0, 25, 50, 75, 100].map((point) => (
                <motion.div
                  key={point}
                  className={`w-2 h-2 font-bold rounded-full ${
                    progress >= point ? "bg-[#5297ff]" : "bg-gray-300"
                  }`}
                  animate={{
                    scale: progress >= point ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <motion.p
              className="text-[10px] md:text-[12px] text-gray-500 font-medium"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {progress < 100
                ? "Processing your data..."
                : "Complete! Redirecting..."}
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200 rounded-full"
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: "80%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UploadProgressLoader;
