import { Info } from "@mui/icons-material";
import React from "react";

interface IPriceBreakdownTooltipProps {
  packageData: any;
  formData: any;
  estimatedCost: number;
}

const PriceBreakdownTooltip = ({
  packageData,
  formData,
  estimatedCost,
}: IPriceBreakdownTooltipProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const builtUpCost = formData.builtupArea * packageData.sqftPrice;
  const carParkingCost = formData.carParking * 130 * packageData.carParkingCost;
  const balconyCost = formData.balcony * packageData.carParkingCost;

  return (
    <div className="relative group text-nowrap">
      <Info className="inline-block ml-2 text-gray-500 cursor-pointer" />
      <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 rounded-md shadow-lg w-auto left-0 mt-2">
        <h3 className="font-bold mb-2 bg-[#3586FF] text-white p-4">
          {packageData.title} - {formatCurrency(packageData.sqftPrice)}/sq.ft
          (Incl. GST)
        </h3>
        <div className="space-y-2 p-4 text-sm">
          <div className="flex justify-between">
            <div className="flex flex-col items-start">
              <p className="font-semibold">Built Up Cost</p>
              <p>
                {formData.builtupArea} sq.ft &nbsp;*&nbsp;
                {formatCurrency(packageData.sqftPrice)}/sq.ft
              </p>
            </div>
            <p className="font-bold">{formatCurrency(builtUpCost)}</p>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col items-start">
              <p className="font-semibold">Car Parking Cost </p>
              <p>
                {formData.carParking} &nbsp;*&nbsp;130 sq.ft &nbsp;*&nbsp;
                {formatCurrency(packageData.carParkingCost)}/sq.ft
              </p>
            </div>

            <p className="font-bold">{formatCurrency(carParkingCost)}</p>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col items-start">
              <p className="font-semibold">Balcony & Utility Cost</p>
              <p>
                {formData.balcony} sq.ft &nbsp;*&nbsp;
                {formatCurrency(packageData.carParkingCost)}/sq.ft
              </p>
            </div>
            <p className="font-bold">{formatCurrency(balconyCost)}</p>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between">
            <p className="font-semibold">Total Cost</p>
            <p className="font-bold">{formatCurrency(estimatedCost)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdownTooltip;
