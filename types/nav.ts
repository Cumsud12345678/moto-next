import { ComponentType, SVGProps } from "react";

export interface Nav {
  text: string,
  icon: ComponentType<SVGProps<SVGSVGElement>>,
  path: string,
  special?: boolean
}