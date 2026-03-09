import React, { useMemo, useState } from "react";
import clsx from "clsx";

type AmenityIcon = React.ReactNode;
type AmenityMapItem = { name: string; icon?: AmenityIcon };

interface AmenitiesListProps {
    amenities?: string[];
    data?: { ProjectAmenities?: string[] };
    amenitiesData: AmenityMapItem[];
    limit?: number;
    className?: string;
    collapsible?: boolean;
}

const AmenitiesList: React.FC<AmenitiesListProps> = ({
    amenities,
    data,
    amenitiesData,
    limit = 8,
    className,
    collapsible = true,
}) => {
    const list = useMemo(
        () => amenities ?? data?.ProjectAmenities ?? [],
        [amenities, data?.ProjectAmenities]
    );

    const [showAll, setShowAll] = useState(false);
    const hiddenCount = Math.max(0, list.length - limit);
    const visible = showAll ? list : list.slice(0, limit);

    if (!list || list.length === 0) return null;

    return (
        <div className={clsx("flex flex-wrap items-center justify-start md:gap-4 gap-2 mt-2", className)}>
            {visible.map((amenity, idx) => {
                const matchingAmenity = amenitiesData.find(a => a.name === amenity);
                return (
                    <div
                        key={`${amenity}-${idx}`}
                        title={amenity}
                        className="bg-white w-[65px] h-[65px] md:w-[90px] md:h-[90px] px-2 py-2 rounded-md shadow-custom flex flex-col items-center justify-center text-center"
                    >
                        {matchingAmenity?.icon && (
                            <p className="md:text-xl text-[12px] text-[#3586FF]">{matchingAmenity.icon}</p>
                        )}
                        <p className="text-gray-800 md:text-[12px] text-[10px] font-medium break-words">
                            {amenity.length > 14 ? amenity.slice(0, 12) + "…" : amenity}
                        </p>
                    </div>
                );
            })}

            {hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setShowAll(prev => (collapsible ? !prev : true))}
                    className="bg-gray-100 w-[65px] h-[65px] md:w-[90px] md:h-[90px] rounded-md flex items-center justify-center text-[#3586FF] font-medium md:text-[12px] text-[10px]"
                    aria-expanded={showAll}
                    aria-label={showAll ? "Show less amenities" : `Show ${hiddenCount} more amenities`}
                    title={showAll ? "Show less" : `+${hiddenCount} more`}
                >
                    {showAll && collapsible ? "Show less" : `+${hiddenCount} more`}
                </button>
            )}
        </div>
    );
};

export default AmenitiesList;
