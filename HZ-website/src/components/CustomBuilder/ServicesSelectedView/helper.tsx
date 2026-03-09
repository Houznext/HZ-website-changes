import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCity,
  FaMapMarkerAlt,
  FaHome,
  FaBuilding,
  FaRulerCombined,
  FaMap,
  FaCompass,
  FaLayerGroup,
  FaImage,
  FaThList,
  FaWater,
  FaPumpSoap,
  FaTools,
  FaHardHat,
  FaFan,
  FaProjectDiagram,
  FaIndustry,
  FaRegBuilding,
  FaWeightHanging,
  FaCogs,
  FaCubes,
  FaStarHalfAlt,
  FaCube,
  FaWrench,
  FaConciergeBell,
  FaTint,
  FaCouch,
  FaPalette,
  FaVolumeMute,
  FaBaby,
  FaRulerHorizontal,
  FaRulerVertical,
  FaFileAlt
} from "react-icons/fa";
import {
  FiMapPin,
  FiGrid,
  FiInfo,
  FiLayers,
  FiMaximize2,
  FiTool,
} from "react-icons/fi";
import { BiCloset, BiBox, BiGridAlt } from "react-icons/bi";
import {
  GiCementShoes,
  GiBrickWall,
  GiStairs,
  GiHomeGarage,
  GiPerspectiveDiceSixFacesRandom,
  GiTrowel,
  GiPaintRoller,
  GiPaintBrush,
  GiWoodFrame,
  GiEcology,
  GiWoodBeam,
  GiDrill
} from "react-icons/gi";
import { BsBoundingBox, BsTools } from "react-icons/bs";
import {
  MdLocationCity,
  MdPlaylistAdd,
  MdApartment,
  MdStairs,
  MdPhotoLibrary,
  MdNotes,
  MdSpaceDashboard,
  MdMergeType,
  MdStraighten,
  MdHeight,
  MdFactCheck,
  MdSettingsInputComposite,
  MdEngineering,
  MdVerticalAlignBottom,
  MdNoteAlt,
  MdChecklist,
  MdOutlineBalcony,
  MdLinearScale,
  MdOutlineHeight,
  MdElectricalServices,
  MdOutlineCable,
  MdToggleOn,
  MdPower,
  MdLightbulbOutline,
  MdBathtub,
  MdShower,
  MdOutlineApartment,
  MdOutlineDesignServices,
  MdOutlineLight,
  MdRoom,
  MdOutlineWaterDrop,
  MdHealthAndSafety,
  MdFormatPaint,
  MdMeetingRoom,
  MdCropSquare,
  MdInvertColors,
  MdOutlineHomeWork,
  MdAddCircleOutline,
  MdKitchen,
  MdSmartphone,
  MdOutlineStorage,

} from "react-icons/md";

export const iconMap: { [key: string]: React.ReactNode } = {
  first_name: <FaUser className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  last_name: <FaUser className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  email: <FaEnvelope className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  mobile: <FaPhone className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  city: <FaCity className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  state: (
    <MdLocationCity className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  locality: <FiMapPin className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  pincode: (
    <FaMapMarkerAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  address_line_1: (
    <FaHome className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  length: (
    <FaRulerHorizontal className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  featureBreakDown: (
    <FaProjectDiagram className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  width: (
    <FaRulerVertical className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  address_line_2: (
    <FaHome className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  construction_type: (
    <MdApartment className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  property_type: (
    <FaBuilding className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  construction_scope: (
    <FaLayerGroup className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  total_area: (
    <FaRulerCombined className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  area_unit: <FaCompass className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  adjacent_roads: (
    <FaMap className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  land_facing: (
    <FaCompass className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  total_floors: (
    <FaBuilding className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  gate_side: <FiMapPin className="text-[#3586FF] md:text-[18px] text-[14px]" />,

  staircase_gate: (
    <MdStairs className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  propertyimages: (
    <MdPhotoLibrary className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  additionoptions: (
    <FaThList className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  additional_details: (
    <MdNotes className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  floors: <FiLayers className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  combinationtypes: (
    <MdMergeType className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  additionalrequirement: (
    <MdNoteAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  recommendedDepth: (
    <MdHeight className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  borewellDiameter: (
    <MdStraighten className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  hydroSurvey: <FaWater className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  casingType: (
    <MdSettingsInputComposite className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  drillingtype: (
    <MdEngineering className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  casingDepth: (
    <MdVerticalAlignBottom className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  pumpBrand: (
    <FaPumpSoap className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  additionalRequirement: (
    <MdNoteAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  centringMaterial: (
    <FaTools className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalArea: (
    <FiMaximize2 className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  steelBrand: (
    <FaIndustry className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  isScaffoldingRequired: (
    <FaHardHat className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  cementBrand: (
    <GiCementShoes className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  typeOfWork: (
    <FaLayerGroup className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  brickType: <FaCubes className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  brickQuality: (
    <FaStarHalfAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  cementType: <FaCube className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  plasteringRequired: (
    <GiTrowel className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  plasteringType: (
    <MdChecklist className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  basementRequired: (
    <GiBrickWall className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  basementArea: (
    <GiStairs className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  basementHeight: (
    <MdOutlineHeight className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  railingMaterial: (
    <MdOutlineBalcony className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  railingType: (
    <MdLinearScale className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  structureType: (
    <GiHomeGarage className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  elevationDetails: (
    <GiPerspectiveDiceSixFacesRandom className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  wiringType: (
    <MdOutlineCable className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  wireBrand: (
    <FaIndustry className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  switchBrand: (
    <MdToggleOn className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalPowerPoints: (
    <MdPower className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalLights: (
    <MdLightbulbOutline className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalFans: <FaFan className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  safetyEquipment: (
    <MdHealthAndSafety className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  paintType: (
    <GiPaintRoller className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  paintBrand: (
    <FaIndustry className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  numberOfCoats: (
    <GiPaintBrush className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  surfacePreparation: (
    <BsTools className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  roomCount: (
    <MdMeetingRoom className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  surfaceType: (
    <GiBrickWall className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  finishType: (
    <MdInvertColors className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  flooringMaterial: (
    <FaRegBuilding className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  materialThickness: (
    <FaWeightHanging className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  installationType: (
    <FaCogs className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  isSkirtingRequired: (
    <MdOutlineHomeWork className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  numberOfRooms: (
    <FaHome className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  ceilingMaterial: (
    <MdOutlineApartment className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  ceilingDesign: (
    <MdOutlineDesignServices className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  lightingOptions: (
    <MdOutlineLight className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  ceilingFinish: (
    <MdOutlineLight className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  roomType: <MdRoom />,

  pipeMaterial: (
    <FaWrench className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  pipeBrand: (
    <FaRegBuilding className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  fixtureBrand: (
    <FaTools className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalBathrooms: (
    <MdBathtub className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  indianBathrooms: (
    <MdShower className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  westernBathrooms: (
    <MdBathtub className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  totalKitchens: (
    <FaConciergeBell className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  waterSource: <FaTint className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  pipeThickness: (
    <MdStraighten className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),

  isDrainageRequired: (
    <MdOutlineWaterDrop className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  id: undefined,
  modularKitchen: (
    <MdKitchen className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  wardrobes: <BiCloset className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  cabinetry: <FiTool className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  furnitureDesign: (
    <FaCouch className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  wallPaneling: (
    <GiWoodFrame className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  decorStyle: (
    <FaPalette className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  soundProofing: (
    <FaVolumeMute className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  smartHomeFeatures: (
    <MdSmartphone className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  storageSolutions: (
    <BiBox className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  additionalRequirements: (
    <MdAddCircleOutline className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  furnitureLayout: (
    <BiGridAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  ecoFriendlyMaterials: (
    <GiEcology className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  childPetFriendly: (
    <FaBaby className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  materialPreferences: (
    <MdOutlineStorage className="text-[#3586FF] md:text-[18px] text-[14px]" />
  ),
  bhkType: <FaHome className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  rooms: <MdMeetingRoom className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  plywood: <GiWoodBeam className="text-[#3586FF] md:text-[18px] text-[14px]" />,
  combinationTypes: (
    <FaFileAlt className="text-[#3586FF] md:text-[18px] text-[14px]" />

  ),
  drillingType: (
    <MdMergeType className="text-[#3586FF] md:text-[18px] text-[14px]" />
  )
};
export const filtersdata = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7Days', label: 'Last 7 Days' },
  { id: 'last14Days', label: 'Last 14 Days' },
  { id: 'lastMonth', label: 'Last Month' },
  {
    id: 'custom',
    label: 'Date range',
  },
];

export const axisTickStyle = {
  className: "font-medium text-[10px] md:text-[12px] text-black",
};

export const tooltipStyle = {
  contentStyle: {
    fontFamily: "Gordita-Medium",
    fontSize: "12px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
  },
  labelStyle: {
    fontFamily: "Gordita-Medium",
    fontSize: "12px",
  },
};

export const legendStyle = {
  wrapperStyle: {
    fontFamily: "Gordita-Medium",
    fontSize: "12px",
    paddingTop: "8px",
  },
};

