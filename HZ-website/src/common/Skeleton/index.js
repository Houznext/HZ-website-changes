import React from "react";

const SectionSkeleton = ({ type }) => {
  switch (type) {
    case "specialOffers":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full justify-center">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex flex-col justify-between bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[220px]"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-md mb-4" />

              <div className="h-5 bg-gray-300 rounded w-3/4 mb-3" />

              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>

              <div className="h-4 bg-gray-300 rounded w-1/3" />
            </div>
          ))}
        </div>
      );
    case "inHouseServices":
      return (
        <div className="min-h-[380px] flex flex-wrap items-center justify-center md:gap-x-[30px] gap-x-3 gap-y-[30px]">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse md:max-w-[170px] md:h-[166px] md:p-[6px] p-[3px] rounded-[6px] bg-[#f3f4f6] shadow-custom flex flex-col items-center w-[100px] sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/7 gap-y-[16px]"
            >
              <div className="mx-auto md:h-[80px] md:w-[80px] w-[30px] h-[30px] bg-gray-300 rounded-full mt-[10px]"></div>
              <div className="max-w-[125px] min-h-[38px] xl:mt-[30px] mt-[10px]">
                <div className="h-[12px] bg-gray-300 rounded w-[80px] mb-1 mx-auto"></div>
                <div className="h-[12px] bg-gray-300 rounded w-[50px] mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      );
    case "constructionProgress":
      return "";
    case "propertiesList":
      return (
        <div className="grid grid-cols-2  md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-5 gap-3 mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="p-4 md:p-6 border shadow-md  border-[#DBDBDB] rounded-md "
            >
              <div className="md:h-[197px] h-[100px]  md:w-full w-full relative md:mb-4 mb-2 bg-gray-300 animate-pulse rounded-md" />

              <h3 className="font-medium md:text-[20px] text-[12px] md:leading-[28.5px] leading-[22.8px] bg-gray-300 animate-pulse h-5 w-3/4 mb-2" />

              <div className="flex items-center gap-1 mb-2">
                <div className="bg-gray-300 animate-pulse rounded-full h-3 w-3" />
                <span className="bg-gray-300 animate-pulse h-4 w-2/4 rounded"></span>
              </div>

              <div className="border border-[#E9E9E9] md:my-4 my-2"></div>

              <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-2 lg:gap-x-4 md:gap-x-3 gap-x-1">
                <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5">
                  <div className="bg-gray-300 animate-pulse rounded-full h-4 w-4" />
                  <span className="bg-gray-300 animate-pulse h-4 w-3/4 rounded" />
                </div>
                <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                  <div className="bg-gray-300 animate-pulse rounded-full h-4 w-4" />
                  <span className="bg-gray-300 animate-pulse h-4 w-3/4 rounded" />
                </div>
                <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                  <div className="bg-gray-300 animate-pulse rounded-full h-4 w-4" />
                  <span className="bg-gray-300 animate-pulse h-4 w-3/4 rounded" />
                </div>
              </div>

              <div className="mt-4 h-10 bg-gray-300 rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      );

    case "insideAndTools":
      return (
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-[20px] gap-[14px] place-content-center">
            {[...Array(4)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                style={{
                  background:
                    "linear-gradient(180deg, #D3E5FF 0%, #FEFEFE 100%)",
                }}
                className="rounded border border-[#3586FF] flex flex-col items-center md:px-[27px] md:py-[24px] md:max-w-[333px] max-w-[158px] px-[22px] py-[14px] animate-pulse"
              >
                <div className="md:block hidden w-[300px] h-[170px] bg-[#bcd7ff] rounded" />
                <div className="block md:hidden w-[100px] h-[87px] bg-[#bcd7ff] rounded" />
                <div className="text-center w-[80%] h-[28px] md:mt-4 mt-2 md:mb-5 mb-3 bg-[#a3caff] rounded" />
                <div className="w-full h-[56px] bg-[#d1e4ff] rounded md:mb-10 mb-5" />
                <div className="flex flex-1 items-end md:gap-2 gap-1 justify-self-end">
                  <div className="w-[100px] h-[20px] bg-[#bcd7ff] rounded" />
                  <div className="w-[20px] h-[20px] bg-[#bcd7ff] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "propertiesSkeleton":
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-2 gap-3 mx-auto lg:max-w-[1336px] md:max-w-[720px] max-w-[390px] w-full md:mt-16 mt-10 md:pl-0 pl-2">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative md:min-h-[342px] min-h-[240px] min-w-[140px] max-w-[160px] md:max-w-[342px] md:min-w-[312px] animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 shadow-md rounded-[10px] overflow-hidden"
                >
                  <div className="absolute inset-0 z-10 bg-gray-300 bg-opacity-50 rounded-[10px]" />

                  <div className="absolute inset-0 z-20 flex flex-col justify-start items-start md:p-4 p-3 space-y-2">
                    <div className="w-3/4 h-5 md:h-6 bg-gray-400 bg-opacity-60 rounded" />
                    <div className="w-1/2 h-4 md:h-5 bg-gray-400 bg-opacity-60 rounded" />
                    <div className="w-1/3 h-3 bg-gray-400 bg-opacity-60 rounded" />
                  </div>
                </div>
              ))}
          </div>
        </>
      );
    case "popularBuildersSkeleton":
      return (
        <>
          <div className="flex flex-col md:flex-row gap-7 items-center justify-center">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex bg-white gap-6 items-center rounded-[8px] shadow-custom max-w-[460px] min-h-[180px] px-[24px] py-[48px] animate-pulse"
                >
                  <div className="h-[80px] w-[400px] rounded-full bg-gray-300" />

                  <div className="flex flex-col gap-3 w-full">
                    <div className="h-[20px] md:w-[70%] w-[60%] bg-gray-300 rounded" />
                    <div className="h-[16px] md:w-[50%] w-[40%] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
          </div>
        </>
      );

    case "popularIndianCitiesSkeleton":
      return (
        <>
          <div className="flex flex-wrap md:gap-7 gap-4 justify-center">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="w-[calc(39.33%-1.75rem)] min-w-[150px] md:w-[calc(20%-1.75rem)]"
                >
                  <div className="flex relative flex-row justify-center items-center md:gap-5 gap-2 animate-pulse">
                    {/* Image placeholder */}
                    <div className="md:h-[132px] h-[90px] md:w-[142px] w-[110px] rounded-[10px] bg-gray-300 shadow-custom" />

                    {/* Text placeholder */}
                    <div className="flex flex-col space-y-2">
                      <div className="md:h-[16px] h-[12px] bg-gray-300 rounded w-[80px]" />
                      <div className="md:h-[14px] h-[10px] bg-gray-200 rounded w-[60px]" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      );

    case "propertyDetailsPage":
      return (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3 space-y-6">
              <div className="h-8 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-[300px] bg-gray-300 rounded-lg" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-md" />
                ))}
              </div>
              <div className="h-10 bg-gray-300 rounded w-full" />
              <div className="h-6 bg-gray-300 w-1/3 rounded" />
              <div className="h-40 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-300 w-1/4 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-300 w-1/4 rounded" />
              <div className="h-40 bg-gray-200 rounded" />
            </div>
            <div className="lg:w-1/3 h-full bg-gray-200 rounded-lg p-4" />
          </div>
        </div>
      );
    case "companyProjectDetail":
      return (
        <div className="w-full relative px-4 flex flex-col gap-4 py-4 max-w-[1340px] mx-auto bg-gray-100 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2" />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-[300px] bg-gray-300 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-md" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-28 bg-gray-200 rounded-lg" />
                ))}
              </div>
              <div className="h-6 bg-gray-300 w-1/4 rounded" />
              <div className="h-48 bg-gray-200 rounded-lg" />
              <div className="h-6 bg-gray-300 w-1/4 rounded" />
              <div className="h-48 bg-gray-200 rounded-lg" />
              <div className="h-6 bg-gray-300 w-1/4 rounded" />
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
            <div className="md:w-[35%] w-full h-[500px] bg-white shadow-md rounded-lg" />
          </div>
        </div>
      );
    case "interiorMarket":
      return (
        <div className="flex justify-center items-center py-8">
          <div className="max-w-[1140px] w-full px-4 mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[30px] gap-y-16">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[8px] md:rounded-lg shadow-custom px-4 md:px-[16px] py-6 md:py-8 border border-[#DEE8F3] flex flex-col items-center max-w-[249px] min-h-[347px] mx-auto gap-y-4 md:gap-y-[12px] animate-pulse"
                >
                  <div className="hidden md:block w-[160px] h-[180px] bg-gray-200 rounded"></div>
                  <div className="md:hidden bg-white w-[70px] h-[70px] border border-[#EBEBEB] shadow-custom rounded-full flex items-center justify-center -mt-[35px]">
                    <div className="w-[55px] h-[43px] bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-[120px] bg-gray-300 rounded"></div>
                  <div className="hidden md:block w-[200px] h-[80px] bg-gray-200 rounded mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "tiredOfMultipleOptionsSkeleton":
      return (
        <div className="flex mx-auto shadow-custom w-[80%] animate-pulse mb-6">
          <div className="relative w-[50%] md:h-[425px] h-[270px] md:block hidden">
            <div className="absolute w-full h-full bg-gray-200 rounded-[4px]"></div>
          </div>

          <div className="md:pl-5 pl-0 md:py-6 py-3 flex flex-col justify-between items-center bg-white rounded-[16px] w-full max-w-lg mx-auto md:h-[320px] h-[220px]">
            <div className="flex items-center justify-center">
              <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] bg-gray-200 rounded-[8px]"></div>
            </div>

            <div className="flex flex-col md:gap-y-4 gap-y-2 w-full text-center md:px-5 px-3 md:pb-[10px] pb-[5px]">
              <div className="h-4 md:h-5 bg-gray-300 w-3/5 mx-auto rounded"></div>
              <div className="h-3 md:h-4 bg-gray-200 w-4/5 mx-auto rounded mt-1"></div>
              <div className="h-3 md:h-4 bg-gray-200 w-3/4 mx-auto rounded"></div>
            </div>
            <div className="bg-gray-300 w-[120px] md:w-[160px] h-[36px] md:h-[44px] rounded-[4px] md:rounded-[8px] mt-3"></div>
          </div>
        </div>
      );
    case "listSectionSkeleton":
      return (
        <div className="md:flex flex-wrap gap-y-10 gap-x-8 items-center justify-center hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 animate-pulse"
            >
              <div className="w-[280px] h-[200px] bg-gray-300 rounded-xl" />

              <div className="w-[120px] h-[20px] bg-gray-300 rounded-md" />
            </div>
          ))}
        </div>
      );
    case "testimonialsSectionskeleton":
      return (
        <div className="hidden md:grid grid-cols-1 gap-y-12 lg:gap-x-3 lg:gap-y-3 place-content-center place-items-center md:place-content-between md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="max-w-[333px] rounded-lg bg-[#FFFFFF] relative px-4 pt-11 pb-4"
            >
              <div className="absolute w-[60px] h-[60px] bg-gray-300 rounded-full top-0 translate-y-[-50%] left-[50%] translate-x-[-50%]" />

              <div className="h-[24px] bg-gray-300 rounded-md mx-auto w-[120px] mb-4 mt-4" />

              <div className="space-y-2">
                <div className="h-[16px] bg-gray-300 rounded-md w-full" />
                <div className="h-[16px] bg-gray-300 rounded-md w-[80%]" />
                <div className="h-[16px] bg-gray-300 rounded-md w-[90%]" />
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <div
                    key={starIndex}
                    className="w-[16px] h-[16px] bg-gray-300 rounded-md"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default SectionSkeleton;
