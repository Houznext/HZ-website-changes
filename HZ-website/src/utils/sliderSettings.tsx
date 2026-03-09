import { ChevronLeft, ChevronRight } from "@mui/icons-material";



export const CustomArrow = ({ className, onClick, direction }: any) => {
    return (
        <button
            className={`absolute z-10 top-1/2 transform -translate-y-1/2 ${direction === "prev" ? "-left-4" : "-right-4"
                } w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors pr-5 ${className}`}
            onClick={onClick}
        >
            {direction === "prev" ? (
                <ChevronLeft className=" text-center text-gray-600" />
            ) : (
                <ChevronRight className=" text-gray-600" />
            )}
        </button>
    );
};
const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
    customPaging: (i: number) => (
        <div
            style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "white",
                transition: "all 0.3s ease-in-out",
                margin: "-10px 4px",
                display: "inline-block",
            }}
        />
    ),
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            },
        },
    ],
};

export default sliderSettings;

