import React, { useEffect, useState } from "react";
import Image from "next/image";
import CustomInput from "@/common/FormElements/CustomInput";
import { RupeesIcon, MonthEmi, TotalIcon } from "../PropertyComp/Icons";
import SingleSelect from "@/common/FormElements/SingleSelect";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

const points = [
  "The total amount that you need to avail for your property. Loan Tenure: You would be required to furnish the desired loan term (in years).",
  "A longer tenure helps in reducing the monthly EMI. Interest Rate: Input interest rate.",
  "The payment schedule also shows the intermediate outstanding balance for each year which will be carried over to the next year.",
];

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PieChartProps {
  principalAmount?: number;
  interestAmount?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  principalAmount = 50,
  interestAmount = 50,
}) => {
  const data = {
    labels: ["Interest Amount", "Principal Amount"],
    datasets: [
      {
        label: "EMI Calculator",
        data: [interestAmount, principalAmount],
        backgroundColor: ["#85A7FF", "#FAC344"],
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const total = tooltipItem.dataset.data.reduce(
              (acc: any, value: any) => acc + value,
              0
            );
            const percentage = ((tooltipItem.raw / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${percentage}%`;
          },
        },
      },
      datalabels: {
        formatter: (value: number, context: any) => {
          const total = context.dataset.data.reduce(
            (acc: number, curr: number) => acc + curr,
            0
          );
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold",
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

interface EmiValues {
  amount: number | null;
  years: number;
  rateofinterest: number | null;
}

const EmiCalView = () => {
  const [emivalue, setEmiValues] = useState<EmiValues>({
    amount: null,
    years: 1,
    rateofinterest: null,
  });
  const [monthlyEmi, setMonthlyEmi] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [principalAmount, setPrincipalAmount] = useState(50); // Initial dummy value
  const [interestAmount, setInterestAmount] = useState(50); // Initial dummy value

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setEmiValues((prevValues) => ({
      ...prevValues,
      [name]: value ? parseFloat(value) : null,
    }));
  };

  const handleYearChange = (name: string, value: { year: number }) => {
    setEmiValues((prevValues) => ({
      ...prevValues,
      [name]: value.year,
    }));
  };

  useEffect(() => {
    const calculateEmi = () => {
      const { amount, years, rateofinterest } = emivalue;
      if (amount && years > 0 && rateofinterest) {
        const monthlyInterestRate = rateofinterest / 12 / 100;
        const numberOfMonths = years * 12;
        const emi =
          (amount *
            monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
          (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
        const totalAmount = emi * numberOfMonths;
        const totalInterest = totalAmount - amount;

        setMonthlyEmi(emi);
        setTotalPayable(totalAmount);
        setPrincipalAmount(amount);
        setInterestAmount(totalInterest);
      } else {
        // Reset to dummy values if input is missing
        setMonthlyEmi(0);
        setTotalPayable(0);
        setPrincipalAmount(50);
        setInterestAmount(50);
      }
    };
    calculateEmi();
  }, [emivalue.amount, emivalue.years, emivalue.rateofinterest]);

  return (
    <div className="px-[24px]">
      <div className="relative flex flex-col items-center mt-20">
        <p className="text-[24px] leading-9 font-medium text-center">
          <span className="text-[#3586FF]">EMI Calculator</span> for your loan
          amount
        </p>
        <div className="relative w-[292px] h-[150px] mt-2">
          <Image
            src="/images/emi_calculator.png"
            alt="EMI Calculator"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex md:flex-row flex-col gap-20 mt-20">
          <div className="px-[24px] py-[16px] border border-1 border-[#E1E8EC] md:min-w-[353px] rounded-[4px]">
            <p className="text-[13px] text-[#7B7C83] font-Gordita-Light">
              Loan Amount
            </p>
            <div className="flex flex-row items-center justify-center">
              <RupeesIcon />
              <CustomInput
                type="number"
                name="amount"
                value={emivalue.amount ?? ""}
                onChange={handleChange}
                outerInptCls="border-none focus:border-none focus:outline-none"
                className="placeholder:text-[14px] leading-[20px] font-regular h-[32px] placeholder:text-[#959595] text-[20px]"
              />
            </div>
          </div>
          <div className="px-[24px] py-[16px] border border-1 border-[#E1E8EC] md:min-w-[353px] rounded-[4px]">
            <p className="text-[13px] text-[#7B7C83] font-Gordita-Light">
              Loan Tenure
            </p>
            <SingleSelect
              type={"single-select"}
              name={"years"}
              handleChange={handleYearChange}
              options={[
                { year: 1 },
                { year: 2 },
                { year: 3 },
                { year: 4 },
                { year: 5 },
                { year: 6 },
              ]}
              selectedOption={{ year: emivalue.years }}
              optionsInterface={{ isObj: true, displayKey: "year" }}
              buttonCls="border-none"
            />
          </div>
          <div className="px-[24px] py-[16px] border border-1 border-[#E1E8EC] md:min-w-[353px] rounded-[4px]">
            <p className="text-[13px] text-[#7B7C83] font-Gordita-Light">
              Rate of Interest
            </p>
            <CustomInput
              type="number"
              name="rateofinterest"
              value={emivalue.rateofinterest ?? ""}
              onChange={handleChange}
              outerInptCls="border-none focus:border-none focus:outline-none px-0"
              className="placeholder:text-[14px] leading-[20px] font-regular h-[32px] placeholder:text-[#959595] text-[20px]"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center my-[72px]">
        <div className="w-[50%] max-h-[500px]">
          <PieChart
            principalAmount={principalAmount}
            interestAmount={interestAmount}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-6 ">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row items-center justify-center gap-2">
              <MonthEmi />
              <p className="text-[#7B7C83] font-[#7B7C83] text-[20px]">
                Monthly EMI
              </p>
            </div>
            <p className="font-medium text-[24px]">
              ₹{monthlyEmi.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row items-center justify-center gap-2">
              <TotalIcon />
              <p className="text-[#7B7C83] font-[#7B7C83] text-[20px]">
                Rate of Interest
              </p>
            </div>
            <p className="font-medium text-[24px]">
              {emivalue.rateofinterest}%
            </p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-[#7B7C83] font-[#7B7C83] text-[20px] text-nowrap">
                Total Payable amount
              </p>
            </div>
            <p className="font-medium text-[24px]">
              ₹{totalPayable.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start">
        <p className="text-[24px] leading-9 font-medium text-start ">
          About EMI Calculator
        </p>
        <p className="text-[16px] leading-[24px] font-regular text-[#666666]">
          Know how a bank provides a deal for their customers
        </p>
        <div className="text-[20px] flex flex-col gap-5 leading-[32px] font-regular text-[#666666] mt-4">
          <p>
            A home loan EMI calculator helps compute the monthly instalments
            that a borrower needs to pay against the total amount availed. Such
            a tool assists you in making an informed decision about the outflow
            towards the home loan every month.
          </p>
          <p>
            To identify your home loan EMI, you need to fill in the following:
            Loan Amount:
          </p>
          <ul>
            {points.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmiCalView;
