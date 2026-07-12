import {
  Home,
  Warehouse,
} from "@mui/icons-material";
import { LuBike, LuBuilding2 } from "react-icons/lu";
import {
  MdStar,
  MdAttachMoney,
  MdVerified,
  MdWorkspacePremium,
  MdTrendingUp,
  MdPeopleAlt,
} from "react-icons/md";

export const getPropertyIcon = (propertyType: string) => {
  switch (propertyType) {
    case "Apartment":
      return <LuBuilding2 className="md:w-4 w-3 h-3 md:h-4" />;
    case "Villa":
      return <LuBuilding2 className="md:w-4 w-3 h-3 md:h-4" />;
    case "Independent House":
      return <Home className="md:w-4 w-3 h-3 md:h-4" />;
    case "Retail Shop":
      return <Warehouse className="md:w-4 w-3 h-3 md:h-4" />;
    default:
      return <LuBuilding2 className="md:w-4 w-3 h-3 md:h-4" />;
  }
};
export const iconMap: Record<
  string,
  {
    icon: JSX.Element;
    style: string;
    border: string;
  }
> = {
  Featured: {
    icon: <MdStar className="text-amber-500 mr-2" />,
    style: "bg-amber-100 border-amber-200 text-amber-700",
    border: "border-amber-400",
  },
  Sponsored: {
    icon: <MdAttachMoney className="text-emerald-500 mr-2" />,
    style: "bg-emerald-100 border-emerald-200 text-emerald-700",
    border: "border-emerald-400",
  },
  Verified: {
    icon: <MdVerified className="text-sky-600 mr-2" />,
    style: "bg-blue-100 border-blue-200 text-sky-700",
    border: "border-blue-400",
  },
  Premium: {
    icon: <MdWorkspacePremium className="text-violet-600 mr-2" />,
    style: "bg-purple-100 border-purple-200 text-violet-700",
    border: "border-purple-400",
  },
  Top: {
    icon: <MdTrendingUp className="text-pink-500 mr-2" />,
    style: "bg-pink-100 text-pink-700 border-pink-400 ",
    border: "border-pink-400",

  },
};