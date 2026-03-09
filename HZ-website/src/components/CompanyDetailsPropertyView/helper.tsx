import {
  FaSwimmer,
  FaTree,
  FaParking,
  FaCouch,
  FaTableTennis,
  FaChessBoard,
  FaLeaf,
} from "react-icons/fa";
import {
  MdFireExtinguisher,
  MdFitnessCenter,
  MdElectricBolt,
  MdOutlineSecurity,
  MdStreetview,
  MdChildFriendly,
  MdElevator,
  MdOutlineWaterDrop,
  MdSolarPower,
  MdVideoCameraFront,
  MdOutlineRoom,
  MdPhoneInTalk,
  MdAtm,
  MdStorefront,
  MdBadge,
  MdLocalTaxi,
  MdTheaters,
  MdBusinessCenter,
  MdWorkOutline,
  MdContentCut,
  MdChildCare,
} from "react-icons/md";
import {
  GiCricketBat,
  GiTennisCourt,
  GiBasketballBasket,
  GiCctvCamera,
  GiWaterDrop,
  GiDrippingBlade,
  GiBarrier,
  GiLotus,
  GiRollerSkate,
  GiMountainClimbing,
  GiGolfFlag,
  GiTheater,
  GiPartyPopper,
  GiBarbecue,
} from "react-icons/gi";

import {
  BiBuildingHouse,
  BiRestaurant,
  BiLibrary,
  BiRecycle,
} from "react-icons/bi";
import { IoMdCafe } from "react-icons/io";
import { HiOutlineLightBulb } from "react-icons/hi";
import { RiFootprintLine, RiRoadMapLine, RiBikeLine } from "react-icons/ri";

interface Amenity {
  name: string;
  icon: React.ReactNode;
}

export const amenitiesData: Amenity[] = [
  { name: "Cricket Pitch", icon: <GiCricketBat /> },
  { name: "Tennis Court", icon: <GiTennisCourt /> },
  { name: "Badminton Court", icon: <GiTennisCourt /> },
  { name: "Basketball Court", icon: <GiBasketballBasket /> },
  { name: "Table Tennis", icon: <FaTableTennis /> },
  { name: "Billiards/Snooker Table", icon: <FaTableTennis /> },
  { name: "Carrom", icon: <FaTableTennis /> },
  { name: "Chess Board", icon: <FaChessBoard /> },
  { name: "Jogging Track", icon: <MdStreetview /> },
  { name: "Gymnasium", icon: <MdFitnessCenter /> },
  { name: "Swimming Pool", icon: <FaSwimmer /> },
  { name: "Kids’ Splash Pool", icon: <FaSwimmer /> },
  { name: "Yoga & Meditation Area", icon: <GiLotus /> },
  { name: "Indoor Games", icon: <FaCouch /> },
  { name: "Skating Rink", icon: <GiRollerSkate /> },
  { name: "Rock Climbing Wall", icon: <GiMountainClimbing /> },
  { name: "Mini Golf Course", icon: <GiGolfFlag /> },

  { name: "Club House", icon: <BiBuildingHouse /> },
  { name: "Multipurpose Hall", icon: <BiBuildingHouse /> },
  { name: "Amphitheater", icon: <GiTheater /> },
  { name: "Mini Theater", icon: <MdTheaters /> },
  { name: "Party Lawn", icon: <GiPartyPopper /> },
  { name: "BBQ / Grill Zone", icon: <GiBarbecue /> },
  { name: "Cafeteria", icon: <IoMdCafe /> },
  { name: "Restaurant", icon: <BiRestaurant /> },
  { name: "Library", icon: <BiLibrary /> },
  { name: "Business Center", icon: <MdBusinessCenter /> },
  { name: "Co-working Space", icon: <MdWorkOutline /> },
  { name: "Salon", icon: <MdContentCut /> },

 
  { name: "Children’s Play Area", icon: <MdChildFriendly /> },
  { name: "Senior Citizen Sitout", icon: <MdChildFriendly /> },
  { name: "Creche / Daycare", icon: <MdChildCare /> },

  { name: "24x7 CCTV Surveillance", icon: <GiCctvCamera /> },
  { name: "Fire Alarm", icon: <MdFireExtinguisher /> },
  { name: "Fire Fighting System", icon: <MdFireExtinguisher /> },
  { name: "Gated Community", icon: <MdOutlineSecurity /> },
  { name: "24x7 Security", icon: <MdOutlineSecurity /> },
  { name: "Video Door Phone", icon: <MdVideoCameraFront /> },
  { name: "Guard Room", icon: <MdOutlineRoom /> },

  { name: "Rainwater Harvesting", icon: <GiWaterDrop /> },
  { name: "Sewage Treatment Plant", icon: <FaLeaf /> },
  { name: "Water Conservation", icon: <GiWaterDrop /> },
  { name: "Energy Management", icon: <MdElectricBolt /> },
  { name: "Solar Powered Lighting", icon: <MdSolarPower /> },
  { name: "Organic Waste Converter", icon: <RiRoadMapLine /> },
  { name: "Green Roof / Terrace Garden", icon: <FaTree /> },
  { name: "Landscaping & Trees", icon: <FaTree /> },

  { name: "Car Parking", icon: <FaParking /> },
  { name: "Open Parking", icon: <FaParking /> },
  { name: "Closed Car Parking", icon: <FaParking /> },
  { name: "Valet Parking", icon: <FaParking /> },
  { name: "Electric Vehicle Charging", icon: <MdElectricBolt /> },
  { name: "Cycle Stand / Bicycle Track", icon: <RiBikeLine /> },

  { name: "Internal Roads & Footpaths", icon: <RiRoadMapLine /> },
  { name: "Storm Water Drains", icon: <GiDrippingBlade /> },
  { name: "Paved Compound", icon: <RiRoadMapLine /> },
  { name: "Street Lighting", icon: <HiOutlineLightBulb /> },
  { name: "Lift(s)", icon: <MdElevator /> },
  { name: "Intercom Facility", icon: <MdPhoneInTalk /> },
  { name: "Electrical Meter Room", icon: <MdElectricBolt /> },

  { name: "24x7 Water Supply", icon: <MdOutlineWaterDrop /> },
  { name: "Solid Waste Management", icon: <BiRecycle /> },
  { name: "Garbage Disposal", icon: <BiRecycle /> },
  { name: "ATM / Banking Facility", icon: <MdAtm /> },
  { name: "Convenience Store / Retail", icon: <MdStorefront /> },

  { name: "Sun Deck", icon: <HiOutlineLightBulb /> },
  { name: "Boom Barrier Gate", icon: <GiBarrier /> },
  { name: "Visitor Management System", icon: <MdBadge /> },
  { name: "Pickup & Drop-off Zone", icon: <MdLocalTaxi /> },
];
