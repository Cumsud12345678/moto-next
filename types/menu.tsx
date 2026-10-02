import { ComponentType, SVGProps } from "react";

export interface Menu {
  title: string,
  icon: ComponentType<SVGProps<SVGSVGElement>>,
  url?: string,
  active: boolean,
  content?: string,
  toastMessage?: string
}