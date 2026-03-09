import type { Url } from "next/dist/shared/lib/router/router";
import { ReactNode } from "react";
export interface INavItems {
  name: String;
  link?: Url;
  icon?: ReactNode;
  isActive?: boolean;
  subLink?: INavItems[];
  onClick?: () => void;
}
export interface Iproperty {
}