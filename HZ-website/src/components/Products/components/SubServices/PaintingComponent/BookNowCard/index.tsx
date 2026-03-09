import { useState } from "react";
import Image from "next/image";
import { BsShieldCheck } from "react-icons/bs";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useRouter } from "next/router";
import { BsCheck, BsHouse } from "react-icons/bs";
import { useServiceCheckout } from "@/store/serviceCheckout";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";

const PaintingServiceCard = () => {
  const [bhk, setBhk] = useState<"1BHK" | "2BHK" | "3BHK" | "4BHK">("2BHK");
  const [sqft, setSqft] = useState(500);
  const [coats, setCoats] = useState(1);
  const [includeCeiling, setIncludeCeiling] = useState(false);
  const [addons, setAddons] = useState<
    { name: string; price: number; selected: boolean }[]
  >([
    { name: "Premium Finish", price: 500, selected: false },
    { name: "Wall Texture", price: 800, selected: false },
  ]);

  const rate = 100;
  const totalPrice =
    sqft * rate * (coats > 1 ? 1 + (coats - 1) * 0.5 : 1) +
    (includeCeiling ? sqft * 0.2 * rate : 0) +
    addons.filter((a) => a.selected).reduce((sum, a) => sum + a.price, 0);

  const setServiceItem = useServiceCheckout((s) => s.setServiceItem);
  const { item } = useServiceCheckout()
  const router = useRouter();

  const handleBookNow = () => {
    const base = sqft * rate;
    const addonsTotal = addons
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + a.price, 0);
    const coatsFactor = coats > 1 ? 1 + (coats - 1) * 0.5 : 1;
    const ceiling = includeCeiling ? Math.round(sqft * 0.2) * rate : 0;

    const lineTotal = Math.round((base + addonsTotal + ceiling) * coatsFactor);

    setServiceItem({
      type: "service",
      serviceKey: "painting",
      title: `Painting (${bhk}, ${sqft} sqft)`,
      config: {
        bhkType: bhk,
        sqft,
        ratePerSqft: rate,
        coats,
        includeCeiling,
        addons: addons.filter((a) => a.selected),
      },
      unitPrice: rate,
      lineTotal,
    });


  };
  console.log(item)

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[16px] md:text-[20px] font-bold md:mb-2 mb-1">
              Professional Painting Service
            </h2>
            <p className="text-blue-100 md:text-[16px] text-[12px] font-medium opacity-90">
              Complete interior painting solution
            </p>
          </div>
          <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-[10px] md:text-[12px] font-medium">
            Popular
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:gap-6 gap-3 md:p-6 p-3">
        <div className="md:w-1/2 flex flex-col md:gap-4 gap-2">
          <div className="relative w-full h-50 md:h-80 rounded-lg overflow-hidden shadow-inner">
            <Image
              src="/images/custombuilder/subservices/painting/aboutus.png"
              alt="Painting Service"
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="bg-white rounded-xl md:p-4 p-2 shadow-inner border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Pricing Breakdown
            </h3>
            <div className="space-y-1 md:text-[14px] text-[10px] text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Rate per sq.ft</span>
                <span>₹{rate}</span>
              </div>
              <div className="flex justify-between">
                <span>BHK / Area</span>
                <span>
                  {bhk} / {sqft} sq.ft
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coats</span>
                <span>{coats}</span>
              </div>
              {includeCeiling && (
                <div className="flex justify-between">
                  <span>Ceiling</span>
                  <span>+20% area</span>
                </div>
              )}
              {addons
                .filter((a) => a.selected)
                .map((addon, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{addon.name}</span>
                    <span>+₹{addon.price}</span>
                  </div>
                ))}
              <div className="border-t pt-2 flex justify-between font-bold text-[12px] md:text-[16px] text-[#3586FF]">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col justify-between md:gap-4 gap-2">
          <div className="grid grid-cols-2 md:gap-4 gap-2 bg-blue-50 md:p-4 p-2 rounded-lg">
            <div className="text-center">
              <div className="text-gray-600 font-medium md:text-[14px] text-[12px] mb-1">
                Select BHK
              </div>
              <select
                value={bhk}
                onChange={(e) =>
                  setBhk(e.target.value as "1BHK" | "2BHK" | "3BHK" | "4BHK")
                }
                className="w-full border border-gray-300 rounded-lg md:text-[14px] text-[12px] text-center py-1 font-regular"
              >
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
              </select>
            </div>

            <div className="text-center">
              <CustomInput
                type="number"
                label="Area (sq.ft)"
                labelCls="text-gray-600 font-medium md:text-[14px] text-[12px] mb-1 py-0"
                rootCls="py-0"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg text-center py-0.5 "
              />
            </div>

            <div className="text-center">
              <CustomInput
                type="number"
                min={1}
                label="Number of Coats"
                labelCls="text-gray-600 font-medium md:text-[14px] text-[12px] mb-1 py-0"
                rootCls="py-0"
                value={coats}
                onChange={(e) => setCoats(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg text-center py-0.5 "
              />
            </div>

            <div className="md:col-span-2 col-span-2">
              <div className="flex items-center justify-between md:p-4 p-2 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                <div className="flex items-center md:gap-3 gap-1">
                  <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BsHouse className="w-4 h-4 text-[#3586FF]" />
                  </div>
                  <div>
                    <div className="font-bold md:text-[16px] text-[12px] text-gray-900">
                      Include Ceiling Painting
                    </div>
                    <div className="text-[10px] md:text-[12px] font-medium text-gray-600">
                      +20% area charge for complete coverage
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCeiling}
                    onChange={(e) => setIncludeCeiling(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            {/* <div className="text-center col-span-2">
              <label className="flex items-center justify-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={includeCeiling}
                  onChange={(e) => setIncludeCeiling(e.target.checked)}
                  className="w-4 h-4"
                />
                Include Ceiling Painting (+20% area)
              </label>
            </div>

            
            <div className="col-span-2">
              <div className="text-gray-600 text-sm mb-1">Add-ons</div>
              <div className="flex flex-col gap-1">
                {addons.map((addon, i) => (
                  <label key={i} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={addon.selected}
                      onChange={() => {
                        const newAddons = [...addons];
                        newAddons[i].selected = !newAddons[i].selected;
                        setAddons(newAddons);
                      }}
                    />
                    {addon.name} (+₹{addon.price})
                  </label>
                ))}
              </div>
            </div> */}
            {/* Addons */}
            {/* Addons */}
            <div className="md:col-span-2 col-span-2">
              <label className="block text-[12px]  md:text-[12px] font-bold text-gray-700 md:mb-3 mb-1">
                Premium Add-ons
              </label>
              <div className="grid grid-cols-1 md:gap-3 gap-1">
                {addons.map((addon, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between md:p-4 p-2 bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer ${addon.selected ? "border-green-500" : "border-gray-200"
                      } hover:border-blue-300`}
                    onClick={() => {
                      const newAddons = [...addons];
                      newAddons[i].selected = !newAddons[i].selected;
                      setAddons(newAddons);
                    }}
                  >
                    <div className="flex items-center md:gap-3 gap-1">
                      <div
                        className={`p-1 rounded-lg border-2 ${addon.selected
                          ? "bg-green-500 border-green-500"
                          : "bg-gray-100 border-gray-300"
                          }`}
                      >
                        {addon.selected ? (
                          <BsCheck className="text-white w-4 h-4" />
                        ) : (
                          <BsCheck className="text-gray-400 w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium md:text-[16px] text-[12px] text-gray-900">
                          {addon.name}
                        </div>
                        <div className="font-regular md:text-[16px] text-[12px] text-gray-600">
                          Enhanced finish and durability
                        </div>
                      </div>
                    </div>
                    <div className="font-medium md:text-[12px] text-[10px] text-[#3586FF]">
                      +₹{addon.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleBookNow}
            className="md:mt-4 mt-2 w-full md:py-3 py-2 md:text-[16px] text-[12px]  font-medium bg-[#3586FF] hover:bg-blue-700 rounded-2xl text-white shadow-lg"
          >
            Book Now
          </Button>

          <div className="flex justify-center items-center md:mt-3 mt-1 space-x-6 font-regular md:text-[12px] text-[8px] text-gray-500">
            <div className="flex items-center gap-1">
              <BsShieldCheck className="text-green-500 w-4 h-4" />
              Quality Guaranteed
            </div>
            <div className="flex items-center gap-1">
              <RiSecurePaymentLine className="text-[#3586FF] w-4 h-4" />
              Secure Booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingServiceCard;
