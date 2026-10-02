import { Nav } from '@/types/nav';
import {HouseFill} from '@gravity-ui/icons';
import {Heart} from '@gravity-ui/icons';
import {Plus} from '@gravity-ui/icons';
import {PersonFill} from '@gravity-ui/icons';

export const navs: Nav[] = [
  {
    text: "Ana səhifə",
    icon: HouseFill,
    path: '/'
  },
  {
    text: "Seçilmişlər",
    icon: Heart,
    path: '/bookmarks'
  },
  {
    text: "Əlavə et",
    icon: Plus,
    path: '/new',
    special: true
  },
  {
    text: "Profil",
    icon: PersonFill,
    path: '/profile'
  }
]