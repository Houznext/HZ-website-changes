import Button from "@/src/common/Button";
import usePostPropertyStore, {
  propertyInitialState,
  PropertyStore,
} from "@/src/stores/postproperty";
import BasicDetails from "./BasicDetails";
import LocationDetails from "./LocationDetails";
import PropertyDetails from "./PropertyDetails/PropertyDetails";
import UploadImage from "./UploadMedia";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { useState, useMemo, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

import {
  CommercialPropertyTypeEnum,
  ConstructionStatusEnum,
  LookingType,
  PlotAgriculturePosessionTypeEnum,
  propertyTypeEnum,
  PurposeType,
} from "./PropertyDetails/PropertyHelpers";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import Loader from "@/src/components/SpinLoader";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { FaCalendarAlt } from "react-icons/fa";
import { useSession } from "next-auth/react";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
enum BrokerageModel {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  PER_SQFT = "PER_SQFT",
  PER_SQYD = "PER_SQYD",
  PER_ACRE = "PER_ACRE",
}
enum ReferAndEarnStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}
const brokerageModelOptions = Object.values(BrokerageModel).map((value) => ({
  label: value.replace(/_/g, " "),
  value,
}));

export const initialErrorState = {
  basicDetails: {},
  locationDetails: {},
  propertyDetails: {
    residentialAttributes: {},
    commercialAttributes: {},
    plotAttributes: {},
    constructionStatus: {},
    furnishing: {},
    pricingDetails: {},
    facilities: {},
  },
};

const PropertyForm = ({
  isEdit,
  isView,
  user,
  handleDrawerClose,
  setProperties,
}: {
  isEdit?: boolean;
  isView?: boolean;
  user: any;
  handleDrawerClose?: any;
  setProperties?: any;
}) => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const [errors, setErrors] = useState<{ [key: string]: any }>(
    initialErrorState
  );

  const [OpenReferModal, setOpenReferModal] = useState(false);
  const [referAndEarn, setReferAndEarn] = useState(false);
  const [editingAgreementId, setEditingAgreementId] = useState<number | null>(
    null
  );
const isReferAndEarnEnabled = usePostPropertyStore(
  (s) => s.isReferAndEarnEnabled
);
const setReferAndEarnData = usePostPropertyStore((s) => s.setReferAndEarnData);
  const [referralData, setReferralData] = useState<any>({
    propertyId: "",
    brokerageModel: BrokerageModel.PERCENTAGE,
    brokerageValue: undefined,
    referrerValue: undefined,
    minBrokerageAmount: undefined,
    referrerSharePercent: undefined,
    referrerMaxCredits: undefined,
    hideOwnerContactFromPublic: true,
    effectiveFrom: undefined,
    effectiveTo: undefined,
    notes: "",
  });
  const [agreements, setAgreements] = useState<any[]>([]);
  const [editingAgreement, setEditingAgreement] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    console.log("yser", user.id);
    try {
      const payload = {
        // postedByUserId: user.id,
         adminUserId: user.id,
        ...property,
        basicDetails: {
          ...property.basicDetails,
          name: "Test",
          phone: 0,
        },
      };
      const lookingType = payload.basicDetails?.lookingType;

    // ✅ FLAT SHARE: remove residentialAttributes completely (or set null)
    if (lookingType === "Flat Share") {
      if (payload.propertyDetails?.residentialAttributes) {
        const ra = payload.propertyDetails.residentialAttributes;
        // if empty, remove
        if (!ra.bhk && !ra.facing) payload.propertyDetails.residentialAttributes = null;
      }

      // ✅ Ensure booleans exist
      payload.propertyDetails.flatshareAttributes = {
        ...payload.propertyDetails.flatshareAttributes,
        parking2w: !!payload.propertyDetails.flatshareAttributes?.parking2w,
        parking4w: !!payload.propertyDetails.flatshareAttributes?.parking4w,
      };
    }

    // ✅ Don’t send furnishing if furnishedType is empty
    // if (!payload.propertyDetails?.furnishing?.furnishedType) {
    //   payload.propertyDetails.furnishing = null;
    // }

    // // ✅ Don’t send constructionStatus if status is empty
    // if (!payload.propertyDetails?.constructionStatus?.status) {
    //   payload.propertyDetails.constructionStatus = null;
    // }

      const res = await apiClient.post(
        `${apiClient.URLS.property}/admin`,
        payload,
        true
      );
      setProperties((prev: any) => [res.body, ...prev]);
      setProperty(propertyInitialState);
      toast.success("Property saved successfully");
      setLoading(false);
      handleDrawerClose();
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
      console.log(error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...property,
        basicDetails: {
          ...property.basicDetails,
          name: "Test",
          phone: 0,
        },
        updatedBy: String(user?.id),
      };
      const res = await apiClient.patch(
        `${apiClient.URLS.property}/admin/${property.propertyId}`,
        payload,
        true
      );

      setProperties((prev: any) => {
        return prev.map((item: any) => {
          if (item.propertyId === property.propertyId) {
            return res.body;
          }
          return item;
        });
      });
      setProperty(propertyInitialState);
      setLoading(false);
      toast.success("Your property updated successfully");
      handleDrawerClose();
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
      console.log(error);
    }
  };
  const validations = () => {
    // clear errors
    setErrors((prev) => initialErrorState);

    // I have cleared the errors above and validating the form again, but will be state get rest and validation will be done again or not

    if (!property.basicDetails.email) {
      setErrors((prev) => ({
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          email: "Email is required",
        },
      }));
    }

    if (!property.basicDetails.lookingType) {
      setErrors((prev) => ({
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          lookingType: "Looking type is required",
        },
      }));
    }

    if (!property.basicDetails.ownerType) {
      setErrors((prev) => ({
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          ownerType: "Owner type is required",
        },
      }));
    }

    if (!property.basicDetails.purpose) {
      setErrors((prev) => ({
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          purpose: "Purpose is required",
        },
      }));
    }

    if (!property.locationDetails.city) {
      setErrors((prev) => ({
        ...prev,
        locationDetails: {
          ...prev.locationDetails,
          city: "City is required",
        },
      }));
    }

    if (!property.locationDetails.locality) {
      setErrors((prev) => ({
        ...prev,
        locationDetails: {
          ...prev.locationDetails,
          locality: "Locality is required",
        },
      }));
    }

    if (
      !property.propertyDetails.propertyName ||
      property.propertyDetails.propertyName.trim() === ""
    ) {
      setErrors((prev) => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          propertyName: "Property name is required",
        },
      }));
    }

    if (!property.propertyDetails.propertyType) {
      setErrors((prev) => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          propertyType: "Property type is required",
        },
      }));
    }

    if (
      !property.propertyDetails.description ||
      property.propertyDetails.description.trim() === ""
    ) {
      setErrors((prev) => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          description: "Description is required",
        },
      }));
    }

    // residential validations
    if (property.basicDetails.purpose === PurposeType.Residential) {
      if (
        property.propertyDetails?.propertyType === propertyTypeEnum.Plot ||
        property.propertyDetails?.propertyType ===
          propertyTypeEnum.AgriculturalLand
      ) {
        if (!property.propertyDetails?.plotAttributes?.facing) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                facing: "Facing is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.plotAttributes?.plotArea?.size ||
          property.propertyDetails?.plotAttributes?.plotArea?.size === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                plotArea: "Plot area is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.plotAttributes?.length?.size ||
          property.propertyDetails?.plotAttributes?.length?.size === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                length: "Plot Length is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.plotAttributes?.width?.size ||
          property.propertyDetails?.plotAttributes?.width?.size === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                width: "Plot width is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.plotAttributes?.widthFacingRoad?.size ||
          property.propertyDetails?.plotAttributes?.widthFacingRoad?.size === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                widthFacingRoad: "Width facing road is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.plotAttributes?.possessionStatus) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                possessionStatus: "Possession status is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.plotAttributes?.possessionStatus ===
          PlotAgriculturePosessionTypeEnum.InFuture
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                possessionDate:
                  "Possession date is required for future possession property",
              },
            },
          }));
        }

        if (!property.propertyDetails?.plotAttributes?.transactionType) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              plotAttributes: {
                ...prev.propertyDetails.plotAttributes,
                transactionType: "Transaction type is required",
              },
            },
          }));
        }
      } else {
        if (!property.propertyDetails?.residentialAttributes?.bhk) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                bhk: "BHK is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.residentialAttributes?.facing) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                facing: "Facing is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.residentialAttributes?.floorArea?.size ||
          property.propertyDetails?.residentialAttributes?.floorArea?.size === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                floorArea: "Floor area is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.residentialAttributes?.buildupArea?.size ||
          property.propertyDetails?.residentialAttributes?.buildupArea?.size ===
            0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                buildupArea: "Buildup area is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.residentialAttributes?.floorArea?.size <
          property.propertyDetails?.residentialAttributes?.buildupArea?.size
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                floorArea: "Floor area should be greater than buildup area",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.residentialAttributes?.bathrooms ||
          property.propertyDetails?.residentialAttributes?.bathrooms === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                bathrooms: "Bathrooms is required",
              },
            },
          }));
        }

        if (property.propertyDetails?.residentialAttributes?.bathrooms > 5) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                bathrooms: "Bathrooms cannot be greater than 5",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.residentialAttributes?.balcony ||
          property.propertyDetails?.residentialAttributes?.balcony === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                balcony: "Balcony is required",
              },
            },
          }));
        }

        if (property.propertyDetails?.residentialAttributes?.balcony > 2) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                balcony: "Balcony cannot be greater than 2",
              },
            },
          }));
        }

        if (!property.propertyDetails?.residentialAttributes?.totalFloors) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                totalFloors: "Total floors is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.residentialAttributes?.currentFloor) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                currentFloor: "Current floor is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.residentialAttributes?.currentFloor >
          property.propertyDetails?.residentialAttributes?.totalFloors
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                currentFloor:
                  "Current floor cannot be greater than total floors",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.residentialAttributes?.parking2w === null ||
          property.propertyDetails?.residentialAttributes?.parking4w === null
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              residentialAttributes: {
                ...prev.propertyDetails.residentialAttributes,
                parking2w: "Parking is required",
              },
            },
          }));
        }

        // proeprty construction validations
        if (!property.propertyDetails?.constructionStatus?.status) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              constructionStatus: {
                ...prev.propertyDetails.constructionStatus,
                status: "Construction status is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.constructionStatus?.status ===
            ConstructionStatusEnum.UnderConstruction &&
          !property.propertyDetails?.constructionStatus?.possessionBy
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              constructionStatus: {
                ...prev.propertyDetails.constructionStatus,
                possessionBy: "Possession by is required",
              },
            },
          }));
        } else {
          if (!property.propertyDetails?.constructionStatus?.ageOfProperty) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                constructionStatus: {
                  ...prev.propertyDetails.constructionStatus,
                  ageOfProperty: "Age of property is required",
                },
              },
            }));
          }

          if (!property.propertyDetails?.constructionStatus?.possessionYears) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                constructionStatus: {
                  ...prev.propertyDetails.constructionStatus,
                  possessionYears: "Possession years is required",
                },
              },
            }));
          }

          if (
            property.propertyDetails?.constructionStatus?.possessionYears >
            property.propertyDetails?.constructionStatus?.ageOfProperty
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                constructionStatus: {
                  ...prev.propertyDetails.constructionStatus,
                  possessionYears:
                    "Possession years cannot be greater than age of property",
                },
              },
            }));
          }
        }

        // property furnishing validations
        if (!property.propertyDetails?.furnishing?.furnishedType) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              furnishing: {
                ...prev.propertyDetails.furnishing,
                furnishedType: "Furnished type is required",
              },
            },
          }));
        }

        // pricing validations
        if (property.basicDetails.lookingType === LookingType.Sell) {
          if (
            !property.propertyDetails?.pricingDetails?.expectedPrice ||
            property.propertyDetails?.pricingDetails?.expectedPrice === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  expectedPrice: "Expected price is required",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.advanceAmount ||
            property.propertyDetails?.pricingDetails?.advanceAmount === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  advanceAmount: "Advance amount is required",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.pricePerSqft ||
            property.propertyDetails?.pricingDetails?.pricePerSqft === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  pricePerSqft: "Price per sqft is required (in rupees)",
                },
              },
            }));
          }

          if (property.propertyDetails?.pricingDetails?.isNegotiable === null) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  isNegotiable: "Select if price is negotiable",
                },
              },
            }));
          }

          // If the price is negotiable
          if (property.propertyDetails?.pricingDetails?.isNegotiable) {
            if (
              !property.propertyDetails?.pricingDetails?.minPriceOffer ||
              property.propertyDetails?.pricingDetails?.minPriceOffer === 0
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    minPriceOffer: "Min price offer is required (in rupees)",
                  },
                },
              }));
            }

            if (
              !property.propertyDetails?.pricingDetails?.maxPriceOffer ||
              property.propertyDetails?.pricingDetails?.maxPriceOffer === 0
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    maxPriceOffer: "Max price offer is required (in rupees)",
                  },
                },
              }));
            }

            if (
              property.propertyDetails?.pricingDetails?.minPriceOffer >
              property.propertyDetails?.pricingDetails?.maxPriceOffer
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    minPriceOffer:
                      "Min price offer cannot be greater than max price offer",
                  },
                },
              }));
            }
          }
        }

        if (property.basicDetails.lookingType === LookingType.Rent) {
          if (
            !property.propertyDetails?.pricingDetails?.monthlyRent ||
            property.propertyDetails?.pricingDetails?.monthlyRent === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  monthlyRent: "Monthly rent is required (in rupees)",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.securityDeposit ||
            property.propertyDetails?.pricingDetails?.securityDeposit === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  securityDeposit: "Security deposit is required (in rupees)",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.maintenanceCharges ||
            property.propertyDetails?.pricingDetails?.maintenanceCharges === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  maintenanceCharges:
                    "Maintenance charges is required (in rupees)",
                },
              },
            }));
          }

          if (property.propertyDetails?.pricingDetails?.isNegotiable === null) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  isNegotiable: "Select if price is negotiable",
                },
              },
            }));
          }

          // If the price is negotiable
          if (property.propertyDetails?.pricingDetails?.isNegotiable) {
            if (
              !property.propertyDetails?.pricingDetails?.minPriceOffer ||
              property.propertyDetails?.pricingDetails?.minPriceOffer === 0
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    minPriceOffer: "Min price offer is required (in rupees)",
                  },
                },
              }));
            }

            if (
              !property.propertyDetails?.pricingDetails?.maxPriceOffer ||
              property.propertyDetails?.pricingDetails?.maxPriceOffer === 0
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    maxPriceOffer: "Max price offer is required (in rupees)",
                  },
                },
              }));
            }

            if (
              property.propertyDetails?.pricingDetails?.minPriceOffer >
              property.propertyDetails?.pricingDetails?.maxPriceOffer
            ) {
              setErrors((prev) => ({
                ...prev,
                propertyDetails: {
                  ...prev.propertyDetails,
                  pricingDetails: {
                    ...prev.propertyDetails.pricingDetails,
                    minPriceOffer:
                      "Min price offer cannot be greater than max price offer",
                  },
                },
              }));
            }
          }
        }
      }
    } else {
      // commercial validations
      if (
        property.propertyDetails?.commercialAttributes?.suitableFor ||
        property.propertyDetails?.commercialAttributes?.suitableFor.length === 0
      ) {
        setErrors((prev) => ({
          ...prev,
          propertyDetails: {
            ...prev.propertyDetails,
            commercialAttributes: {
              ...prev.propertyDetails.commercialAttributes,
              suitableFor:
                "Select atleast one place your property is suitable for",
            },
          },
        }));
      }

      if (!property.propertyDetails?.commercialAttributes?.ownership) {
        setErrors((prev) => ({
          ...prev,
          propertyDetails: {
            ...prev.propertyDetails,
            commercialAttributes: {
              ...prev.propertyDetails.commercialAttributes,
              ownership: "Ownership type is required",
            },
          },
        }));
      }

      if (
        property.propertyDetails.propertyType !==
        CommercialPropertyTypeEnum.PLOT
      ) {
        if (!property.propertyDetails?.commercialAttributes?.locationHub) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                locationHub: "Location hub is required",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.commercialAttributes?.builtUpArea?.size ||
          property.propertyDetails?.commercialAttributes?.builtUpArea?.size ===
            0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                builtUpAreaSqft: "Built up area is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.commercialAttributes?.totalFloors) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                totalFloors: "Total floors is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.commercialAttributes?.currentFloor) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                currentFloor: "Current floor is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.commercialAttributes?.currentFloor >
          property.propertyDetails?.commercialAttributes?.totalFloors
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                currentFloor:
                  "Current floor cannot be greater than total floors",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.commercialAttributes?.twoWheelerParking ===
            null ||
          !property.propertyDetails?.commercialAttributes
            ?.fourWheelerParking === null
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                parking2w: "Parking is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.commercialAttributes?.staircases) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                staircases: "No of Staircases is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.commercialAttributes?.passengerLifts) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              commercialAttributes: {
                ...prev.propertyDetails.commercialAttributes,
                passengerLifts: "No of Passenger Lifts is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.commercialAttributes?.suitableFor &&
          property.propertyDetails?.commercialAttributes?.suitableFor.includes(
            CommercialPropertyTypeEnum.SHOW_ROOM
          )
        ) {
          if (
            !property.propertyDetails?.commercialAttributes?.entranceAreaHeight
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                commercialAttributes: {
                  ...prev.propertyDetails.commercialAttributes,
                  entranceAreaHeight: "Entrance area height is required",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.commercialAttributes?.entranceAreaWidth
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                commercialAttributes: {
                  ...prev.propertyDetails.commercialAttributes,
                  entranceAreaWidth: "Entrance area width is required",
                },
              },
            }));
          }
        }
      }

      if (
        property.propertyDetails.propertyType ===
          CommercialPropertyTypeEnum.SHOW_ROOM ||
        property.propertyDetails.propertyType ===
          CommercialPropertyTypeEnum.OFFICE
      ) {
        if (!property.propertyDetails.facilities.minSeats) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              facilities: {
                ...prev.propertyDetails.facilities,
                minSeats: "Minimum seats is required",
              },
            },
          }));
        }

        if (!property.propertyDetails.facilities.numberOfCabins) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              facilities: {
                ...prev.propertyDetails.facilities,
                numberOfCabins: "Number of cabins is required",
              },
            },
          }));
        }

        if (!property.propertyDetails.facilities.numberOfMeetingRooms) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              facilities: {
                ...prev.propertyDetails.facilities,
                numberOfMeetingRooms: "Number of meeting rooms is required",
              },
            },
          }));
        }

        if (!property.propertyDetails.facilities.numberOfWashrooms) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              facilities: {
                ...prev.propertyDetails.facilities,
                numberOfWashrooms: "Number of washrooms is required",
              },
            },
          }));
        }
      }

      if (property.basicDetails.lookingType === LookingType.Sell) {
        if (!property.propertyDetails?.pricingDetails?.pricePerSqft) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                pricePerSqft: "Price per sqft is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.pricingDetails?.expectedPrice) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                expectedPrice: "Expected price is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.pricingDetails?.advanceAmount) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                advanceAmount: "Advance amount is required",
              },
            },
          }));
        }

        if (property.propertyDetails?.pricingDetails?.isNegotiable === null) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                isNegotiable: "Select if price is negotiable",
              },
            },
          }));
        }

        if (property.propertyDetails?.pricingDetails?.isNegotiable) {
          if (
            !property.propertyDetails?.pricingDetails?.minPriceOffer ||
            property.propertyDetails?.pricingDetails?.minPriceOffer === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  minPriceOffer: "Min price offer is required",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.maxPriceOffer ||
            property.propertyDetails?.pricingDetails?.maxPriceOffer === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  maxPriceOffer: "Max price offer is required",
                },
              },
            }));
          }

          if (
            property.propertyDetails?.pricingDetails?.minPriceOffer >
            property.propertyDetails?.pricingDetails?.maxPriceOffer
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  minPriceOffer:
                    "Min price offer should be less than max price offer",
                },
              },
            }));
          }
        }
      }

      if (property.basicDetails.lookingType === LookingType.Rent) {
        if (
          !property.propertyDetails?.pricingDetails?.monthlyRent ||
          property.propertyDetails?.pricingDetails?.monthlyRent === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                monthlyRent: "Monthly rent is required (in rupees)",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.pricingDetails?.securityDeposit ||
          property.propertyDetails?.pricingDetails?.securityDeposit === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                securityDeposit: "Security deposit is required (in rupees)",
              },
            },
          }));
        }

        if (
          !property.propertyDetails?.pricingDetails?.maintenanceCharges ||
          property.propertyDetails?.pricingDetails?.maintenanceCharges === 0
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                maintenanceCharges:
                  "Maintenance charges is required (in rupees)",
              },
            },
          }));
        }

        if (property.propertyDetails?.pricingDetails?.isNegotiable === null) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              pricingDetails: {
                ...prev.propertyDetails.pricingDetails,
                isNegotiable: "Select if price is negotiable",
              },
            },
          }));
        }

        // If the price is negotiable
        if (property.propertyDetails?.pricingDetails?.isNegotiable) {
          if (
            !property.propertyDetails?.pricingDetails?.minPriceOffer ||
            property.propertyDetails?.pricingDetails?.minPriceOffer === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  minPriceOffer: "Min price offer is required (in rupees)",
                },
              },
            }));
          }

          if (
            !property.propertyDetails?.pricingDetails?.maxPriceOffer ||
            property.propertyDetails?.pricingDetails?.maxPriceOffer === 0
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  maxPriceOffer: "Max price offer is required (in rupees)",
                },
              },
            }));
          }

          if (
            property.propertyDetails?.pricingDetails?.minPriceOffer >
            property.propertyDetails?.pricingDetails?.maxPriceOffer
          ) {
            setErrors((prev) => ({
              ...prev,
              propertyDetails: {
                ...prev.propertyDetails,
                pricingDetails: {
                  ...prev.propertyDetails.pricingDetails,
                  minPriceOffer:
                    "Min price offer cannot be greater than max price offer",
                },
              },
            }));
          }
        }
      }

      if (!property.propertyDetails?.constructionStatus?.status) {
        setErrors((prev) => ({
          ...prev,
          propertyDetails: {
            ...prev.propertyDetails,
            constructionStatus: "Construction status is required",
          },
        }));
      }

      if (
        property.propertyDetails?.constructionStatus?.status ===
          ConstructionStatusEnum.UnderConstruction &&
        !property.propertyDetails?.constructionStatus?.possessionBy
      ) {
        setErrors((prev) => ({
          ...prev,
          propertyDetails: {
            ...prev.propertyDetails,
            constructionStatus: {
              ...prev.propertyDetails.constructionStatus,
              possessionBy: "Possession by is required",
            },
          },
        }));
      } else {
        if (!property.propertyDetails?.constructionStatus?.ageOfProperty) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              constructionStatus: {
                ...prev.propertyDetails.constructionStatus,
                ageOfProperty: "Age of property is required",
              },
            },
          }));
        }

        if (!property.propertyDetails?.constructionStatus?.possessionYears) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              constructionStatus: {
                ...prev.propertyDetails.constructionStatus,
                possessionYears: "Possession years is required",
              },
            },
          }));
        }

        if (
          property.propertyDetails?.constructionStatus?.possessionYears >
          property.propertyDetails?.constructionStatus?.ageOfProperty
        ) {
          setErrors((prev) => ({
            ...prev,
            propertyDetails: {
              ...prev.propertyDetails,
              constructionStatus: {
                ...prev.propertyDetails.constructionStatus,
                possessionYears:
                  "Possession years cannot be greater than age of property",
              },
            },
          }));
        }
      }
    }
  };
  const handleInputChange = (
    name: string,
    value: string | number | boolean | Date | null
  ) => {
    setReferralData((prev) => {
      const next = { ...prev, [name]: value };
      const minBrokerage =
        name === "minBrokerageAmount"
          ? Number(value)
          : Number(prev.minBrokerageAmount);
      const referrerShare =
        name === "referrerSharePercent"
          ? Number(value)
          : Number(prev.referrerSharePercent);
      if (
        !Number.isNaN(minBrokerage) &&
        !Number.isNaN(referrerShare) &&
        minBrokerage >= 0 &&
        referrerShare >= 0
      ) {
        next.referrerValue = Math.round(
          (minBrokerage * referrerShare) / 100
        );
      }
      return next;
    });
  };
  const toInputDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleEditAgreement = (agreement: any) => {
    const minBrokerage = Number(agreement.minBrokerageAmount);
    const referrerShare = Number(agreement.referrerSharePercent);
    const computedReferrerValue =
      !Number.isNaN(minBrokerage) &&
      !Number.isNaN(referrerShare) &&
      minBrokerage >= 0 &&
      referrerShare >= 0
        ? Math.round((minBrokerage * referrerShare) / 100)
        : agreement.referrerValue;
    setReferralData({
      brokerageModel: agreement.brokerageModel,
      brokerageValue: agreement.brokerageValue,
      referrerValue: computedReferrerValue,
      minBrokerageAmount: agreement.minBrokerageAmount,
      referrerSharePercent: agreement.referrerSharePercent,
      referrerMaxCredits: agreement.referrerMaxCredits,
      hideOwnerContactFromPublic: agreement.hideOwnerContactFromPublic,
      effectiveFrom: toInputDate(agreement.effectiveFrom),
      effectiveTo: toInputDate(agreement.effectiveTo),
      notes: agreement.notes,
    });

    setEditingAgreementId(agreement.id);
    setOpenReferModal(true);
  };

  const handleSubmitAgreement = async () => {
    if (!referAndEarn) return;

    if (!referralData.brokerageModel || !referralData.brokerageValue) {
      toast.error("Brokerage model and value are required");
      return;
    }
    if (referralData.brokerageValue <= 0) {
      toast.error("Brokerage value must be greater than 0");
      return;
    }

    if (
      referralData.effectiveFrom &&
      referralData.effectiveTo &&
      referralData.effectiveFrom > referralData.effectiveTo
    ) {
      toast.error("Effective From cannot be after Effective To");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        propertyId: property.propertyId,
        brokerageModel: referralData.brokerageModel,
        brokerageValue: Number(referralData.brokerageValue) || undefined,
        referrerValue: Number(referralData.referrerValue) || undefined,
        minBrokerageAmount:
          Number(referralData.minBrokerageAmount) || undefined,
        referrerSharePercent:
          Number(referralData.referrerSharePercent) || undefined,
        referrerMaxCredits:
          Number(referralData.referrerMaxCredits) || undefined,
        hideOwnerContactFromPublic:
          referralData.hideOwnerContactFromPublic ?? true,
        effectiveFrom: referralData.effectiveFrom
          ? referralData.effectiveFrom
          : undefined,
        effectiveTo: referralData.effectiveTo
          ? referralData.effectiveTo
          : undefined,
        notes: referralData.notes?.trim() || undefined,

        approvedByUserId: (user as any)?.id,
      };

      let res;

      if (editingAgreementId) {
        res = await apiClient.patch(
          `${apiClient.URLS.propertyReferral}/agreements/${editingAgreementId}`,
          payload,
          true
        );

        toast.success("Agreement updated successfully");
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.propertyReferral}/agreement`,
          {
            propertyId: property.propertyId,
            ...payload,
          },
          true
        );

        await apiClient.patch(
          `${apiClient.URLS.propertyReferral}/agreement/${res.body.id}/status`,
          {
            status: "ACTIVE",
            adminUserId: (user as any).id,
          },
          true
        );
        setProperty({
          isReferAndEarnEnabled: true,
          referAndEarnAgreementId: res.body.id,
        });
        usePostPropertyStore
          .getState()
          .setReferAndEarnData({ enabled: true, agreementId: res.body.id });

        toast.success("Agreement created & activated");
      }

      setOpenReferModal(false);
      setEditingAgreementId(null);
      fetchAgreements();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!property) return;

    setReferAndEarn(!!property.isReferAndEarnEnabled);

    setOpenReferModal(false);
  }, [property]);

  const isMinApplicable = (m?: BrokerageModel) =>
    m === BrokerageModel.PERCENTAGE ||
    m === BrokerageModel.PER_SQFT ||
    m === BrokerageModel.PER_SQYD ||
    m === BrokerageModel.PER_ACRE;

  const brokerageValueMeta = (m?: BrokerageModel) => {
    switch (m) {
      case BrokerageModel.FIXED_AMOUNT:
        return {
          label: "Fixed Brokerage Amount (₹)",
          placeholder: "e.g., 200000",
        };
      case BrokerageModel.PERCENTAGE:
        return { label: "Brokerage Percentage (%)", placeholder: "e.g., 2" };
      case BrokerageModel.PER_SQFT:
        return { label: "Brokerage Rate (₹/sqft)", placeholder: "e.g., 50" };
      case BrokerageModel.PER_SQYD:
        return { label: "Brokerage Rate (₹/sqyd)", placeholder: "e.g., 450" };
      case BrokerageModel.PER_ACRE:
        return {
          label: "Brokerage Rate (₹/acre)",
          placeholder: "e.g., 500000",
        };
      default:
        return {
          label: "Brokerage Value",
          placeholder: "Enter brokerage value",
        };
    }
  };
  const model: BrokerageModel | undefined = referralData?.brokerageModel;

  const { label: brokerageLabel, placeholder: brokeragePlaceholder } = useMemo(
    () => brokerageValueMeta(model),
    [model]
  );

  const showMinBrokerage = useMemo(() => isMinApplicable(model), [model]);

  const onClose = () => {
    setOpenReferModal(false);
    if (!referralData.brokerageValue) setReferAndEarn(false);
  };
  const fetchAgreements = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.propertyReferral}/agreements/property/${property.propertyId}`,
        {},
        true
      );

      if (res.status === 200) {
        setAgreements(res.body || []);
      }
    } catch (e) {
      console.error("Failed to fetch agreements", e);
    }
  };
  const handleDeleteAgreement = async (agreementId: string) => {
    try {
      await apiClient.delete(
        `${
          apiClient.URLS.propertyReferral
        }/agreements/${agreementId}?adminUserId=${(user as any).id}`,
        {},
        true
      );

      toast.success("Agreement deleted successfully");
      fetchAgreements();
    } catch (error) {
      toast.error("Failed to delete agreement");
    }
  };

  useEffect(() => {
    if (isEdit && property?.propertyId) {
      fetchAgreements();
    }
  }, [isEdit, property?.propertyId]);
  const referAndEarnStatuses = Object.values(ReferAndEarnStatus);

  const handleStepUpdate = async (lead: any, status: ReferAndEarnStatus) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.propertyReferral}/agreement/${lead.id}/status`,
        {
          adminUserId: (user as any)?.id,
          status,
        },
        true
      );

      if (res.status === 200) {
        toast.success("Status updated successfully");
        fetchAgreements();
      }
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Something went wrong");
    }
  };

  const getAgreementDisplay = (item: any) => {
    const meta = brokerageValueMeta(item?.brokerageModel);

    const valueText = (() => {
      const v = item?.brokerageValue;
      if (v === null || v === undefined || v === "") return "-";

      switch (item?.brokerageModel) {
        case BrokerageModel.FIXED_AMOUNT:
          return `₹${Number(v).toLocaleString("en-IN")}`;
        case BrokerageModel.PERCENTAGE:
          return `${Number(v)}%`;
        case BrokerageModel.PER_SQFT:
          return `₹${Number(v).toLocaleString("en-IN")}/sqft`;
        case BrokerageModel.PER_SQYD:
          return `₹${Number(v).toLocaleString("en-IN")}/sqyd`;
        case BrokerageModel.PER_ACRE:
          return `₹${Number(v).toLocaleString("en-IN")}/acre`;
        default:
          return String(v);
      }
    })();

    const minText =
      isMinApplicable(item?.brokerageModel) && item?.minBrokerageAmount != null
        ? `₹${Number(item.minBrokerageAmount).toLocaleString("en-IN")}`
        : "-";

    const refShareText =
      item?.referrerSharePercent != null
        ? `${item.referrerSharePercent}%`
        : "-";

    const maxCreditsText =
      item?.referrerMaxCredits != null
        ? `₹${Number(item.referrerMaxCredits).toLocaleString("en-IN")}`
        : "-";

    return {
      model: item?.brokerageModel ?? "-",
      valueLabel: meta.label,
      valueText,
      showMin: isMinApplicable(item?.brokerageModel),
      minText,
      refShareText,
      maxCreditsText,
      notes: item?.notes ?? "-",
      hideOwner: item?.hideOwnerContactFromPublic ? "Yes" : "No",
    };
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-10 relative">
      {isView && <div className="absolute inset-0 z-[55] bg-transparent"></div>}

      {/* Page Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="heading-text">Property Details</h1>
      </div>

      {/* Basic Details Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
          <h2 className="sub-heading text-[#3586FF] font-semibold">
            Basic Details
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <BasicDetails errors={errors} setErrors={setErrors} />
        </div>
      </section>

      {/* Location Details Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
          <h2 className="sub-heading text-[#3586FF] font-semibold">
            Location Details
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <LocationDetails errors={errors} setErrors={setErrors} />
        </div>
      </section>

      {/* Property Details Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
          <h2 className="sub-heading text-[#3586FF] font-semibold">
            Property Details
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <PropertyDetails errors={errors} setErrors={setErrors} />
        </div>
      </section>

      {/* Media Upload Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
          <h2 className="sub-heading text-[#3586FF] font-semibold">
            Photos & Videos
          </h2>
        </div>
        <div className="p-4 md:p-6">
          <UploadImage />
        </div>
      </section>
      {/* Refer & Earn Section */}
      {isEdit && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
            <h2 className="sub-heading text-[#3586FF] font-semibold">
              Refer & Earn Settings
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <SelectBtnGrp
              label="Enable Refer & Earn"
              options={["Yes", "No"]}
              btnClass="btn-text rounded-lg px-5 py-2 shadow-sm border-gray-200 hover:border-[#3586FF] transition-all"
              labelCls="label-text text-gray-700"
              className="flex gap-3"
              defaultValue={referAndEarn ? "Yes" : "No"}
              onSelectChange={(value) => {
                const enabled = value === "Yes";

                setReferAndEarn(enabled);

                if (enabled) {
                  setOpenReferModal(true);
                } else {
                  setOpenReferModal(false);
                  setReferralData((prev) => ({
                    ...prev,
                    brokerageValue: undefined,
                    minBrokerageAmount: undefined,
                    referrerSharePercent: undefined,
                    referrerMaxCredits: undefined,
                    effectiveFrom: undefined,
                    effectiveTo: undefined,
                    notes: "",
                  }));
                }
              }}
            />
          </div>
        </section>
      )}
      <div className="flex items-center justify-center w-full">
        <Modal
          isOpen={OpenReferModal}
          closeModal={onClose}
          title="Refer & Earn Agreement"
          isCloseRequired={false}
          titleCls="font-medium uppercase md:text-[18px] text-[12px] text-center text-[#5297FF]"
          className="md:max-w-[800px] max-w-[300px] "
          rootCls="z-[99999]"
        >
          {referAndEarn && (
            <div className="mt-4 border border-[#E5E5E5] rounded-[8px] md:p-4 p-2 grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2">
              <div className="flex flex-col gap-1">
                <SingleSelect
                  type="single-select"
                  label="Brokerage Model"
                  name="brokerageModel"
                  options={brokerageModelOptions}
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  buttonCls="border-none"
                  rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full  rounded-[4px]"
                  selectedOption={brokerageModelOptions.find(
                    (o: any) => o.value === referralData.brokerageModel
                  )}
                  optionsInterface={{ isObj: true, displayKey: "label" }}
                  handleChange={(name: string, option: any) => {
                    const nextModel = option.value as BrokerageModel;

                    handleInputChange(name, nextModel);

                    if (!isMinApplicable(nextModel)) {
                      handleInputChange("minBrokerageAmount", null);
                    }

                    // handleInputChange("brokerageValue", null);
                  }}
                />
              </div>

              <div className="w-full">
                <CustomInput
                  label={brokerageLabel}
                  type="number"
                  name="brokerageValue"
                  value={referralData.brokerageValue ?? ""}
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  placeholder={brokeragePlaceholder}
                  className="md:px-2 px-1 py-0  rounded-[4px] w-full"
                  rootCls="md:px-2 px-1 md:py-0 py-0"
                  onChange={(e: any) => {
                    const val = Number(e.target.value);

                    if (model === BrokerageModel.PERCENTAGE && val > 100) {
                      handleInputChange("brokerageValue", 100);
                      return;
                    }

                    handleInputChange(e.target.name, val);
                  }}
                />
              </div>

              {showMinBrokerage && (
                <div className="w-full">
                  <CustomInput
                    label="Minimum Brokerage Amount (₹)"
                    type="number"
                    name="minBrokerageAmount"
                    value={referralData.minBrokerageAmount ?? ""}
                    placeholder="e.g., 50000"
                    labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                    className="md:px-3 px-1 py-0  rounded-[4px] w-full"
                    rootCls="w-full"
                    onChange={(e: any) =>
                      handleInputChange(e.target.name, Number(e.target.value))
                    }
                  />
                </div>
              )}
              

              <div className="w-full">
                <CustomInput
                  label="Referrer Share (%)"
                  type="number"
                  name="referrerSharePercent"
                  value={referralData.referrerSharePercent ?? ""}
                  placeholder="e.g., 65"
                  className="md:px-2 px-1 py-0  rounded-[4px] w-full"
                  rootCls="w-full"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  onChange={(e: any) =>
                    handleInputChange(e.target.name, Number(e.target.value))
                  }
                />
              </div>

              <div className="w-full">
                <CustomInput
                  label="Referrer Value"
                  type="number"
                  name="referrerValue"
                  value={referralData.referrerValue ?? ""}
                  labelCls="font-medium label-text leading-[22.8px] text-gray-600"
                  placeholder="Min. Brokerage × Referrer Share %"
                  className="md:px-2 px-1 py-0 rounded-[4px] w-full bg-gray-200 text-gray-700 placeholder:text-gray-500"
                  rootCls="md:px-2 px-1 md:py-0 py-0"
                  outerInptCls="w-full flex gap-2 bg-gray-200 items-center border-2 border-gray-400 rounded-xl px-4 py-2"
                  readOnly
                />
              </div>

              {/* Effective From */}
              <div className="w-full">
                <CustomDate
                  label="Effective From"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  name="effectiveFrom"
                  rootCls="w-full"
                  className="w-full text-[12px] py-[0px] rounded-[8px] border border-[#C7C6C6]"
                  value={referralData.effectiveFrom}
                  onChange={(e: any) =>
                    handleInputChange(e.target.name!, e.target.value)
                  }
                  rightIcon={<FaCalendarAlt />}
                />
              </div>

              <div className="w-full">
                <CustomDate
                  label="Effective To"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  name="effectiveTo"
                  rootCls="w-full"
                  value={referralData.effectiveTo}
                  onChange={(e: any) =>
                    handleInputChange(e.target.name!, e.target.value)
                  }
                  className="w-full text-[12px] py-[0px] rounded-[8px] border border-[#C7C6C6]"
                  rightIcon={<FaCalendarAlt />}
                />
              </div>

              <div className="w-full">
                <CustomInput
                  label="Referrer Max Credits (₹)"
                  type="number"
                  name="referrerMaxCredits"
                  value={referralData.referrerMaxCredits ?? ""}
                  placeholder="e.g., 130000"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  className="md:px-2 px-1 py-0  rounded-[4px] w-full"
                  rootCls="w-full"
                  onChange={(e: any) =>
                    handleInputChange(e.target.name, Number(e.target.value))
                  }
                />
              </div>

              <div className="w-full">
                <CustomInput
                  label="Notes"
                  type="textarea"
                  value={referralData.notes ?? ""}
                  placeholder="Owner agreed for refer & earn model"
                  labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                  className="md:px-2 px-1 py-0  rounded-[4px] w-full"
                  rootCls="w-full"
                  onChange={(e: any) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  name="notes"
                />
              </div>

              <CheckboxInput
                label="Hide Owner Contact From Public"
                name="hideOwnerContactFromPublic"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                checked={!!referralData.hideOwnerContactFromPublic}
                onChange={(checked: boolean) =>
                  handleInputChange("hideOwnerContactFromPublic", checked)
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-3 md:mt-6 mt-3">
            <Button
              className="bg-gray-300 text-white md:px-6 px-3 md:py-2 py-1 btn-txt font-medium rounded"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              className="bg-[#5297ff] text-white md:px-6 px-3 md:py-2 py-1 btn-txt font-medium rounded"
              disabled={loading}
              onClick={handleSubmitAgreement}
            >
              {loading ? "Saving..." : "Save Agreement"}
            </Button>
          </div>
        </Modal>
      </div>

      {/* Agreements Table */}
      {agreements.length > 0 && (
        <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-4 border-b border-gray-100">
            <h2 className="sub-heading text-[#3586FF] font-semibold">
              Referral Agreements
            </h2>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Model</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Value</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Min Brokerage</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Referrer Share</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Referrer Value</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Max Credits</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Effective From</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Effective To</th>
                  <th className="px-4 py-3 text-left label-text text-gray-600 font-semibold">Status</th>
                  <th className="px-4 py-3 text-center label-text text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agreements.map((item) => {
                  const d = getAgreementDisplay(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 sublabel-text text-gray-700">{d.model}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="sublabel-text text-gray-400">{d.valueLabel}</span>
                          <span className="sublabel-text text-gray-700 font-medium">{d.valueText}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">{d.minText}</td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">{d.refShareText}</td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">{item.referrerValue}</td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">{d.maxCreditsText}</td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">
                        {item.effectiveFrom
                          ? new Date(item.effectiveFrom).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 sublabel-text text-gray-700">
                        {item.effectiveTo
                          ? new Date(item.effectiveTo).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStepUpdate(item, e.target.value as ReferAndEarnStatus)
                          }
                          className="border border-gray-200 rounded-lg px-3 py-1.5 sublabel-text font-medium focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
                        >
                          {referAndEarnStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            className="bg-[#3586FF] hover:bg-[#2563eb] text-white p-2 rounded-lg transition-all"
                            onClick={() => handleEditAgreement(item)}
                          >
                            <FaEdit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                            onClick={() => handleDeleteAgreement(item.id)}
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      {!isView && (
        <div className="flex flex-row justify-between items-center pt-4 border-t border-gray-100 mt-2">
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 btn-text font-semibold py-3 px-8 rounded-lg transition-all"
            onClick={() => {
              handleDrawerClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isEdit ? handleUpdate : handleSubmit}
            className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {isEdit ? "Update Property" : "Save Property"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;
