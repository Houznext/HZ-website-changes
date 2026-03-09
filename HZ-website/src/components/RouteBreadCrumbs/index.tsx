import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { getLabelForPath } from "@/utils/helpers";
import Link from "next/link";
import clsx from "clsx";
import { FaChevronRight } from "react-icons/fa6";

//renders in clientside only
export const RoutebreadCrumbs = () => {
  const currentRouter = useRouter();
  const generatedBreadCrumbs = useMemo(() => {
    if (currentRouter && currentRouter.isReady) {
      const getPaths = currentRouter.asPath.split("/");
      const tempBreadCrumbs = getPaths.map((path, index) => {
        const pathName = getLabelForPath(path);

        const currHref = getPaths.slice(0, index + 1).join("/");
        if (pathName.trim().length > 0) {
          return {
            label: pathName,
            href: currHref.trim() || "/",
          };
        } else {
          return null;
        }
      });
      const filteredBreadCrumbs = tempBreadCrumbs.filter((x) => !!x);
      return filteredBreadCrumbs;
    } else {
      return [];
    }
  }, [currentRouter, currentRouter.isReady]);

  return (
    <div className="inline-flex items-center justify-center flex-wrap">
      {generatedBreadCrumbs.map((breadCrumb, index) => {
        if (breadCrumb) {
          return (
            <div
              key={`${breadCrumb.href}-${breadCrumb.label}-${index}`}
              className="flex items-center"
            >
              <Link
                className={clsx({
                  "inline-block md:text-[18px] text-base font-medium":
                    true,
                  "pointer-events-none cursor-default text-[#3586FF]":
                    index === generatedBreadCrumbs.length - 1,
                  "text-[#000000] hover:text-[#3586FF]":
                    index !== generatedBreadCrumbs.length - 1,
                })}
                href={breadCrumb.href}
              >
                {breadCrumb.label}
              </Link>
              {index !== generatedBreadCrumbs.length - 1 ? (
                <FaChevronRight className="md:mx-3 mx-2 text-xs" />
              ) : null}
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};
