'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  House,
  Persons,
  PersonXmark,
  HardDrive,
  TrashBin,
  Star,
  LayoutCells,
  Megaphone,
  Tag,
  CircleQuestion,
  CircleExclamation,
  ArrowLeft,
  Flag,
  Wrench,
} from '@gravity-ui/icons'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Menyu bir yerdə saxlanılır: yeni səhifə əlavə etmək üçün bura bir sətir yazmaq kifayətdir
const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'Ümumi',
    items: [
      { href: '/admin', label: 'Dashboard', icon: House },
    ],
  },
  {
    label: 'İstifadəçilər',
    items: [
      { href: '/admin/users', label: 'Bütün istifadəçilər', icon: Persons },
      { href: '/admin/deleted/users', label: 'Silinmiş istifadəçilər', icon: PersonXmark },
    ],
  },
  {
    label: 'Elanlar',
    items: [
      { href: '/admin/listings', label: 'Bütün elanlar', icon: HardDrive },
      { href: '/admin/premium/listings', label: 'Premium elanlar', icon: Star },
      { href: '/admin/parts', label: 'Ehtiyat hissələri', icon: Wrench },
      { href: '/admin/reports', label: 'Şikayətlər', icon: Flag },
      { href: '/admin/deleted/listings', label: 'Silinmiş elanlar', icon: TrashBin },
    ],
  },
  {
    label: 'Məzmun',
    items: [
      { href: '/admin/metadata', label: 'Marka, model', icon: Tag },
      { href: '/admin/make-requests', label: 'Marka sorğuları', icon: CircleQuestion },
      { href: '/admin/groups', label: 'Qruplar', icon: LayoutCells },
      { href: '/admin/adsense', label: 'Reklamlar', icon: Megaphone },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { href: '/admin/error-logs', label: 'Xəta loqları', icon: CircleExclamation },
    ],
  },
]

const isActivePath = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-lg font-bold text-white">
            M
          </span>
          <span className="text-lg font-bold">Admin panel</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActivePath(pathname, item.href)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />}>
              <ArrowLeft />
              <span>Sayta qayıt</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
