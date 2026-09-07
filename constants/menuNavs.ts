import { Menu } from "@/types/menu";
import { CircleQuestion, Envelope, Flag, Handset } from "@gravity-ui/icons";


export const menuNavs: Menu[] = [
  {
    title: 'Məxfilik siyasəti',
    icon: Flag,
    url: '/privacy'
  },
  {
    title: 'Haqqımızda',
    icon: CircleQuestion,
    url: '/about'
  },
  {
    title: 'Telefon',
    icon: Handset,
    url: 'tel:+994519478134',
    content: '+994519478134'
  },
  {
    title: 'E-poçt ünvanı',
    icon: Envelope,
    url: 'mailto:isayevcumu@gmail.com',
    content: 'isayevcumu@gmail.com'
  },
]