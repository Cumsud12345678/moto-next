import { Menu } from "@/types/menu";
import { CircleQuestion, Envelope, Flag, Handset } from "@gravity-ui/icons";
import {AntennaSignal} from '@gravity-ui/icons';
import {Wrench} from '@gravity-ui/icons';

export const menuNavs: Menu[] = [
  {
    title: 'Ehtiyyat hissələri',
    icon: Wrench,
    url: '/groups',
    content: 'Çox yaxında...'
  },
  {
    title: 'Elan qrupları',
    icon: AntennaSignal,
    url: '/groups'
  },
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