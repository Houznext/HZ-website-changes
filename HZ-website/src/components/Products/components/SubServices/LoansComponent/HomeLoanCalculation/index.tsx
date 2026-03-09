import Button from "@/common/Button";
import React from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Image from "next/image";
import { useState } from "react";
import Modal from "@/common/Modal";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

export default function HomeLoanCalculation() {
  const [activeButton, setActiveButton] = useState("button1");

  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTenure, setLoanTenure] = useState(10);
  const [interestRate, setInterestRate] = useState(8.9);

  const monthlyInterestRate = interestRate / 12 / 100;
  const totalMonths = loanTenure * 12;


  const emi =
    (loanAmount *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, totalMonths)) /
    (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

  const totalPayableAmount = emi * totalMonths;
  const totalInterestAmount = totalPayableAmount - loanAmount;

  const [Loanamount, setLoanamount] = useState(3000000);
  const [MonthlyIncome, setMonthlyIncome] = useState(100000);
  const [OtherEmi, setOtherEmi] = useState(0);
  const [RateOfinterest, setRateOfInterest] = useState(8.4);
  const [LoanTenure, setloanTenure] = useState(20);
  const tenure = LoanTenure * 12;
  const MonthlyRate = RateOfinterest / (12 * 100);
  const EstimatedEmi =
    (Loanamount * MonthlyRate * Math.pow(1 + MonthlyRate, tenure)) /
    (Math.pow(1 + MonthlyRate, tenure) - 1);
  const MaxEmi = 0.5 * MonthlyIncome - OtherEmi;
  const EligibleLoanAmount =
    (MaxEmi * (Math.pow(1 + MonthlyRate, tenure) - 1)) /
    (MonthlyRate * Math.pow(1 + MonthlyRate, tenure));
  const handleClick = (button: "button1" | "button2"): void => {
    setActiveButton(button);
  };

  // Pie Chart Data
  const data = {
    labels: ["Principal Amount", "Interest Amount"],
    datasets: [
      {
        label: "Loan Breakdown",
        data: [loanAmount, totalInterestAmount],
        backgroundColor: ["#1E90FF", "#FFD700"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };
  const eligibledata = {
    labels: ["Estimated EMI", "Eligible Loan Amount"],
    datasets: [
      {
        label: "Loan Breakdown",
        data: [EstimatedEmi, EligibleLoanAmount],
        backgroundColor: ["#1E90FF", "#FFD700"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-[1640px] min-h-[600px] flex flex-col items-center gap-y-[48px] ">
      <h2 className="max-w-[289px] min-h-[34px] text-[#000000] font-bold text-[24px] leading-[34.2px] text-left mt-[10px]">
        Home Loan Calculation
      </h2>

      <div className=" bg-white  rounded-lg p-6  mx-auto  w-full max-w-[1640px]  ">
        <div className="mx-auto text-center max-w-[451px] min-h-[67px] rounded-[8px]  px-2   ">
          <Button
            onClick={() => handleClick("button1")}
            className={` py-2 px-4  shadow max-w-[161px] min-h-[55px]  md:rounded-[8px] rounded-[4px] ${activeButton === "button1"
              ? "bg-[#3586FF] text-[#FBFBFB]"
              : "bg-[#E7E7E7] text-[#7B7C83]"
              } cursor-pointer  font-regular text-[16px] leading-[22.8px]`}
          >
            EMI Calculation
          </Button>
          <Button
            onClick={() => handleClick("button2")}
            className={` py-2 px-4 ml-4  shadow max-w-[234px] min-h-[55px] rounded-[8px] cursor-pointer  ${activeButton === "button2"
              ? "bg-[#3586FF] text-[#FBFBFB]"
              : "bg-[#E7E7E7] text-[#7B7C83]"
              }  font-regular text-[16px] leading-[22.8px]`}
          >
            Loan Eligibility Calculator
          </Button>
        </div>
        {activeButton === "button1" ? (
          <div className="container mx-auto  flex items-center justify-center py-4 ">
            <div className="  flex items-center  justify-center flex-wrap gap-x-[10px] gap-y-[10px]    py-4  md:max-w-[60%] w-full mx-auto shadow-custom rounded-[6px]">
              <div className=" gap-4 mb-6 flex  flex-wrap items-center mx-auto pl-[20%] w-full">
                <div>
                  <label className="block  mb-2 max-w-[136px] min-h-[29px] font-medium text-[#000000] text-[20px] leading-[28.5px] text-left">
                    Loan Amount
                  </label>
                  <CustomInput
                    type="number"
                    name={""}
                    className="w-full min-h-[35px]  rounded-[4px] text-[#000000] text-[16px] font-regular leading-[22.8px] border-[#979797] border-[1px] px-[5px] placeholder:text-[16px] placeholder:leading-[22.8px] placeholder:text-[#000000] placeholder:font-regular placeholder:max-w-[129px] placeholder:min-h-[23px]"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    placeholder="₹ 10,00,000"
                  />
                </div>
                <div>
                  <label className="block w-[179px] min-h-[29px] font-medium text-[#000000] text-[20px] leading-[28.5px] text-left mb-2">
                    Loan Tenure (Years)
                  </label>
                  <CustomInput
                    type="number"
                    name={""}
                    className=" w-full min-h-[35px]  rounded-[4px] text-[#000000] text-[16px] font-regular leading-[22.8px] border-[#979797] border-[1px] px-[5px] placeholder:text-[16px] placeholder:leading-[22.8px] placeholder:text-[#000000] placeholder:font-regular placeholder:max-w-[129px] placeholder:min-h-[23px]"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    placeholder="10 Yrs"
                  />
                </div>
                <div>
                  <label className="block max-w-[186px] min-h-[29px] font-medium text-[#000000] text-[20px] leading-[28.5px] text-left mb-2">
                    Rate of Interest{" "}
                  </label>
                  <CustomInput
                    type="number"
                    name={""}
                    className="w-full min-h-[35px]  rounded-[4px] text-[#000000] text-[16px] font-regular leading-[22.8px] border-[#979797] border-[1px] px-[5px] placeholder:text-[16px] placeholder:leading-[22.8px] placeholder:text-[#000000] placeholder:font-regular placeholder:max-w-[129px] placeholder:min-h-[23px]"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    placeholder="8.9%"
                  />
                </div>
              </div>

              <div className="lg:w-[40%] md:pl-[10%] pl-[2%] h-[400px]">
                <Pie
                  data={data}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                          boxWidth: 20,

                          padding: 10,
                          font: {
                            size: 14,
                          },
                        },
                      },
                    },
                  }}
                />
              </div>

              <div className=" gap-4 items-center lg:w-[50%] pl-[10%] ">
                <div className="w-full min-h-[152px] flex flex-col gap-y-[32px]">
                  <div className="w-full max-w-[550px] flex items-center justify-between px-6">
                    <div className="flex items-center gap-x-[8px]">
                      <Image
                        src="/images/custombuilder/subservices/Loans/homeloancalculation/emicalculator.png"
                        alt="emicalculator"
                        width={20}
                        height={20}
                        objectFit="cover"
                      />
                      <span className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                        Monthly EMI:
                      </span>
                    </div>
                    <span className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
                      ₹{emi.toFixed(2)}
                    </span>
                  </div>

                  <p className="w-full max-w-[490px] flex items-center justify-between px-6">
                    <span className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                      Principal Amount:
                    </span>
                    <span className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
                      ₹{loanAmount}
                    </span>
                  </p>

                  <p className="w-full max-w-[490px] flex items-center justify-between  px-6">
                    <span className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                      Total Interest:
                    </span>
                    <span className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
                      ₹{totalInterestAmount.toFixed(2)}
                    </span>
                  </p>

                  <p className="w-full max-w-[490px] flex items-center justify-between px-6">
                    <span className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                      Total Amount:
                    </span>
                    <span className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
                      ₹{totalPayableAmount.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto flex items-center justify-center  w-full">
            <div className="flex flex-col items-center w-full md:max-w-[60%] gap-y-6 shadow-custom rounded-[6px] py-4 mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 w-full pl-[10%] mx-auto">
                <div>
                  <label className="block mb-2 max-w-[136px] text-left text-[20px] font-medium text-[#000000]">
                    Loan Amount
                  </label>
                  <CustomInput
                    type="number"
                    name={""}
                    className="w-full min-h-[35px] rounded-[4px] border-[1px] border-[#979797] px-2 text-[16px] text-[#000000]"
                    value={Loanamount}
                    onChange={(e) => setLoanamount(Number(e.target.value))}
                    placeholder="₹ 10,00,000"
                  />
                </div>

                <div>
                  <label className="block mb-2 max-w-[179px] text-left text-[20px] font-medium text-[#000000]">
                    Monthly Income
                  </label>
                  <CustomInput
                    type="number"
                    name={" "}
                    className="w-full min-h-[35px] rounded-[4px] border-[1px] border-[#979797] px-2 text-[16px] text-[#000000]"
                    value={MonthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    placeholder="₹ 30,000"
                  />
                </div>

                <div>
                  <label className="block mb-2 max-w-[179px] text-left text-[20px] font-medium text-[#000000]">
                    Other EMI
                  </label>
                  <CustomInput
                    type="number"
                    name={" "}
                    className="w-full min-h-[35px] rounded-[4px] border-[1px] border-[#979797] px-2 text-[16px] text-[#000000]"
                    value={OtherEmi}
                    onChange={(e) => setOtherEmi(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block mb-2 max-w-[206px] text-left text-[20px] font-medium text-[#000000]">
                    Rate of Interest (P.A)
                  </label>
                  <CustomInput
                    type="number"
                    name={" "}
                    className="w-full min-h-[35px] rounded-[4px] border-[1px] border-[#979797] px-2 text-[16px] text-[#000000]"
                    value={RateOfinterest}
                    onChange={(e) => setRateOfInterest(Number(e.target.value))}
                    placeholder="8.9%"
                  />
                </div>

                <div>
                  <label className="block mb-2 max-w-[179px] text-left text-[20px] font-medium text-[#000000]">
                    Loan Tenure (Years)
                  </label>
                  <CustomInput
                    type="number"
                    name={" "}
                    className="w-full min-h-[35px] rounded-[4px] border-[1px] border-[#979797] px-2 text-[16px] text-[#000000]"
                    value={LoanTenure}
                    onChange={(e) => setloanTenure(Number(e.target.value))}
                    placeholder="10 Yrs"
                  />
                </div>
              </div>
              <div className="flex items-center flex-wrap  gap-x-[10px] gap-y-[12px] w-full max-w-[100%] ">
                <div className="lg:w-[35%] h-[400px] md:pl-[10%] pl-[3%]">
                  <Pie
                    data={eligibledata}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            boxWidth: 20,
                            padding: 10,
                            font: { size: 14 },
                          },
                        },
                      },
                    }}
                  />
                </div>

                <div className="lg:w-[50%]  ml-[5%] ">
                  <div className="flex flex-col gap-y-[16px]">
                    {[
                      {
                        label: "Estimated EMI:",
                        value: EstimatedEmi.toFixed(2),
                      },
                      {
                        label: "Eligible Loan Amount:",
                        value: EligibleLoanAmount.toFixed(2),
                      },
                      {
                        label: "Total Interest:",
                        value: totalInterestAmount.toFixed(2),
                      },
                      {
                        label: "Total Amount:",
                        value: totalPayableAmount.toFixed(2),
                      },
                    ].map((item, index) => (
                      <p
                        key={index}
                        className="flex justify-between w-full px-6"
                      >
                        <span className="text-[#7B7C83] text-[16px] font-regular">
                          {item.label}
                        </span>
                        <span className="text-[#000000] text-[20px] font-medium">
                          ₹{item.value}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
