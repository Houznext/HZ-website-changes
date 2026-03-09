import Button from "@/common/Button";
import { useSolarCalculatorStore } from "@/store/solar-calculator";
import { getKW, getKWData, calculateROI } from "@/utils/solar/solar-data";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

export interface SolarData {
  kilowatt: number;
  projectCost: number;
  consumerShare: number;
  rooftopArea: {
    squareFeet: number;
    squareMeters: number;
  };
  electricityGeneration: {
    daily: number;
    yearly: number;
  };
  financialSavings: {
    daily: number;
  };
  subsidy: {
    amount: number;
  };
}

interface SolarMetrics extends SolarData {
  monthlyBill: {
    current: number;
    withSolar: number;
  };
  annualReturns: number;
}

const CalculationResultView = () => {
  const [value, setValue] = useState(1);
  const setOpenModal = useSolarCalculatorStore((state) => state.setOpenModal);
  const monthlyBill = useSolarCalculatorStore((state) => state.monthlyBill);
  const setMonthlyBill = useSolarCalculatorStore(
    (state) => state.setMonthlyBill
  );
  const router = useRouter();
  const [solarMetrics, setSolarMetrics] = useState<SolarMetrics>({
    kilowatt: 0,
    monthlyBill: {
      current: 0,
      withSolar: 0,
    },
    projectCost: 0,
    consumerShare: 0,
    rooftopArea: {
      squareFeet: 0,
      squareMeters: 0,
    },
    electricityGeneration: {
      daily: 0,
      yearly: 0,
    },
    financialSavings: {
      daily: 0,
    },
    subsidy: {
      amount: 0,
    },
    annualReturns: 17.5,
  });

  const calculateMetrics = () => {
    if (monthlyBill > 0) {
      const kw = getKW(monthlyBill);
      const kwData = getKWData(kw as number);
      const ROI = calculateROI(kw as number);

      setSolarMetrics({
        ...kwData,
        monthlyBill: {
          current: monthlyBill,
          withSolar: 0,
        },
        annualReturns: ROI?.annualROI ?? 0,
      } as SolarMetrics);
      setValue(kw as number);
      setMonthlyBill(0);
    } else {
      const kwData = getKWData(value);
      const ROI = calculateROI(value);

      setSolarMetrics((prev) => {
        return {
          ...kwData,
          monthlyBill: {
            current: prev.monthlyBill.current,
            withSolar: 0,
          },
          annualReturns: ROI?.annualROI ?? 0,
        } as SolarMetrics;
      });
    }
  };

  useEffect(() => {
    calculateMetrics();
  }, [monthlyBill, value]);

  return (
    <div className="w-full relative px-4 md:py-16 py-4 sm:px-6 lg:px-8">
      <div className="relative md:h-[260px] h-[170px] mb-4 rounded-md overflow-hidden">
        <Image
          src="/solar/images/background.jpg"
          alt="solar-calculator"
          layout="fill"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
          <h1 className="font-bold text-white text-[20px] md:text-[30px] leading-snug">
            Go Green with <span className="text-[#F8D147]">Solar Power</span>
          </h1>
          <p className="text-white/90 text-[12px] md:text-[14px] mt-2 max-w-xl">
            Calculate your savings and reduce your carbon footprint with our
            smart solar estimator.
          </p>
        </div>
      </div>

      <div className="max-md:max-w-[350px] bg-white max-w-[80%] mx-auto md:px-10 md:py-10  rounded-md w-full flex flex-col items-center">
        <div className="flex flex-col items-center w-full md:mb-16 mb-2 md:gap-4 gap-2">
          <h1 className="font-bold text-[24px] text-[#3586FF]">
            Solar calculator
          </h1>
          <h2 className="text-black font-medium md:text-[20px] text-[12px] text-center">
            The Recommended capacity for Solar Plant as per your inputs is:{" "}
            <span className="font-bold text-[#F8D147]">
              {value.toFixed(2)} KW
            </span>

          </h2>
        </div>
        {/* Slider */}
        <div className="w-full max-w-7xl md:mt-10 mt-2">
          <div className="relative">
            <input
              type="range"
              min={1}
              max={10}
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              className="w-full h-2  bg-transparent cursor-pointer z-30
            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-[#B8D4FF] [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:z-30
            [&::-webkit-slider-thumb]:bg-white  [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:shadow-lg
            [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-800 [&::-moz-range-track]:rounded-full
            [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
            />

            {/* Progress Bar */}
            <div
              className="absolute top-[10px] left-0 h-2 bg-[#3B82F6] rounded-full pointer-events-none z-10"
              style={{ width: `${((value - 1) / 9) * 100}%` }}
            />

            {/* White Dots */}
            <div className="absolute top-[10px] left-0 w-full flex justify-between px-[1px] z-20">
              {[...Array(10)].map((_, i) => (
                <div
                  onClick={() => setValue(i + 1)}
                  key={i}
                  className={`w-2 h-2 rounded-full cursor-pointer ${value > i ? "bg-[#3B82F6]" : "bg-white"
                    }`}
                />
              ))}
            </div>
          </div>
          {/* Numbers */}
          <div className="flex justify-between mt-[12px] px-1">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={`md:text-[20px] text-[14px] font-medium ${value === i + 1 ? "text-[#3586FF]" : "text-[#9BA2AD]"
                  }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <p className="md:text-[16px] text-[12px] font-medium md:mt-[42px] mt-[20px] text-center">
            Move slider to select appropriate plant size as per available.
          </p>
        </div>
        <div className="mt-6 md:mb-4 w-full max-w-3xl bg-[#EAF4FF] md:p-4 p-2 rounded-lg shadow-sm text-center">
          <h3 className="text-[#3586FF] font-bold md:text-lg text-[14px]">
            💡 You save
            <span className="text-yellow-400 mx-2">
              ₹{(solarMetrics.financialSavings.daily * 365).toFixed(2)}
            </span>
            every year!
          </h3>
          <p className="md:text-sm text-[10px] text-gray-700 mt-1">
            That's about
            <span className="font-bold text-[#3586FF] mx-2">
              {Math.round(
                solarMetrics.projectCost /
                (solarMetrics.financialSavings.daily * 365)
              )} years
            </span>
            to break even.
          </p>
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-[40px] max-w-7xl mx-auto mt-[40px]  px-5 py-6 rounded-md !bg-black/10 backdrop-blur-xl ">
          {/* Monthly Bill Card */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] max-md:max-h-[90px] border-[#64A2FF] md:p-6 p-1 shadow-md">
            <h2 className="text-black font-medium md:text-[16px] text-[12px] md:mb-[50px] mb-3 text-center">
              Your Monthly Bill
            </h2>

            <div className="flex justify-between items-start">
              {/* Current Bill */}
              <div className="flex items-start gap-2">
                <div className="relative w-[9px] md:h-[40px] h-[20px] bg-[#D0D2D3] rounded-full overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-[#4B97E0] rounded-full" />
                </div>
                <div className="flex flex-row items-start gap-1  mb-1">
                  <Image
                    src="/solar/icons/Energy.png"
                    width={24}
                    height={24}
                    alt="Current Bill"
                    className=""
                  />
                  <div className="flex flex-col justify-start items-start gap-[2px]">
                    <p className="font-Gordita-Light md:text-[13px]  text-[8px] text-black">
                      Current Bill
                    </p>
                    <p className="font-medium md:text-[13px] text-yell text-[10px]">
                      {solarMetrics.monthlyBill.current}
                    </p>
                  </div>
                </div>
              </div>

              {/* With Solar */}
              <div className="flex items-start gap-2">
                <div className="relative w-[9px] md:h-[40px] h-[20px] bg-[#D0D2D3] rounded-full overflow-hidden"></div>
                <div className="flex flex-row items-start gap-1  mb-1">
                  <Image
                    src="/solar/icons/Sun.png"
                    width={24}
                    height={24}
                    alt="With Solar"
                    className=""
                  />
                  <div className="flex flex-col justify-start items-start gap-[2px]">
                    <p className="font-Gordita-Light md:text-[13px]  text-[10px] text-black">
                      With solar
                    </p>
                    <p className="font-medium md:text-[13px]  text-[10px]">
                      ₹0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Project Cost */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] max-md:max-h-[90px] border-[#64A2FF] md:p-6 p-1 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] md:mb-[32px] mb-[10px] text-center">
              Estimated Project Cost
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/cost-calculator.png"
                  fill
                  alt=" Estimated Project Cost"
                  className="text-white"
                />
              </div>
              <span className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                ₹{solarMetrics.projectCost}
              </span>
            </div>
          </div>

          {/* Subsidy */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] max-md:max-h-[90px] border-[#64A2FF] md:p-6 p-2 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] md:mb-[32px] mb-[10px] text-center">
              Govt. subsidy
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/subsidy.png"
                  fill
                  alt="Emission Savings"
                  className="text-white "
                />
              </div>
              <p className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                ₹{solarMetrics.subsidy.amount}
              </p>
            </div>
          </div>

          {/* Estimated Consumer Share */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] max-md:max-h-[90px] border-[#64A2FF] md:p-6 p-1 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] md:mb-[32px] mb-[10px] text-center">
              Estimated Consumer Share
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/consumer.png"
                  fill
                  alt="Estimated Consumer Share"
                  className="text-white"
                />
              </div>
              <span className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                ₹{solarMetrics.consumerShare}
              </span>
            </div>
          </div>

          {/* Electricity Generation */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] border-[#64A2FF] md:p-6 p-2 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] mb-[31px] text-center">
              Electricity Generation
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/energy-generation.png"
                  fill
                  alt="Electricity Generation"
                  className="text-white"
                />
              </div>
              <div className="text-right ">
                <div className="text-[#3586FF] md:text-[16px] text-[12px] font-medium">
                  {solarMetrics.electricityGeneration.daily}kwh/Day
                </div>
                <div className="text-[#3586FF] md:text-[16px] text-[12px] font-medium">
                  {solarMetrics.electricityGeneration.yearly}kWh/year
                </div>
              </div>
            </div>
          </div>

          {/* Rooftop Area */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] border-[#64A2FF] md:p-6 p-2 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px]  md:mb-[32px] mb-[10px] text-center">
              Rooftop Area
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/rooftop.png"
                  fill
                  alt="Rooftop Area"
                  className="text-white"
                />
              </div>
              <div className="text-right">
                <div className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                  {solarMetrics.rooftopArea.squareFeet}Sq.Feet
                </div>
                <div className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                  {solarMetrics.rooftopArea.squareMeters}q.m
                </div>
              </div>
            </div>
          </div>

          {/* Financial Savings */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] border-[#64A2FF] md:p-6 p-2 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] md:mb-[32px] mb-[10px] text-center">
              Financial Savings
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/financial-savings.png"
                  fill
                  alt="Financial Savings"
                  className="text-white"
                />
              </div>
              <span className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                ₹{solarMetrics.financialSavings.daily}/day
              </span>
            </div>
          </div>

          {/* Annual Returns */}
          <div className="bg-white rounded-[8px] border-t-[8px] md:h-[183px] border-[#64A2FF] md:p-6 p-2 shadow-md">
            <h3 className="text-black font-medium md:text-[16px] text-[12px] mb-4 text-center">
              Annual Returns on your Investment
            </h3>
            <div className="flex items-center justify-between">
              <div className="md:w-[80px] md:h-[80px] w-[30px] h-[30px] relative">
                <Image
                  src="/solar/icons/roi.png"
                  fill
                  alt="Annual Returns on your Investment"
                  className="text-white"
                />
              </div>

              <span className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
                {solarMetrics.annualReturns}%
              </span>
            </div>
          </div>
        </div>
        <Button
          className="rounded-[8px] bg-[#3586FF]  md:text-[16px] text-[12px] font-medium md:h-[55px] py-2 w-full max-w-[356px] text-gray-100 md:mt-[80px] mt-[20px]  md:mb-[100px] mb-[40px]"
          onClick={() => {
            router.push("/solar");
            setOpenModal(true);
          }}
        >
          Calculate Again
        </Button>
        <div className="w-full flex flex-col items-center md:gap-[48px] gap-[20px] md:mb-[80px] mb-[20px]">
          <h1 className="font-bold md:text-[24px] text-[16px] text-[#3E6196]">
            Bank partners
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-5">
            <div className="w-[180px] md:w-[250px] lg:w-[300px]">
              <Image
                src="/solar/images/bank-partners/axis.png"
                alt="Axis bank"
                width={300}
                height={80}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="w-[180px] md:w-[250px] lg:w-[300px]">
              <Image
                src="/solar/images/bank-partners/icici.png"
                alt="ICICI bank"
                width={300}
                height={80}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="w-[180px] md:w-[250px] lg:w-[300px]">
              <Image
                src="/solar/images/bank-partners/union.png"
                alt="Union bank"
                width={300}
                height={80}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationResultView;

// Solar ROI calculation
