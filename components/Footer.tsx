'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { navs } from '@/constants/navs';
import { Nav } from '@/types/nav';
import { usePathname } from 'next/navigation';

export default function Footer() {

  const [visible, setVisible] = useState<boolean>(true)
  const pathname = usePathname()

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // aşağı gedir
        setVisible(false)
      } else {
        // yuxarı gedir
        setVisible(true)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems: Nav[] = navs


  return (
    <footer 
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transition-transform duration-300
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}>
   
      <div
        className="
        lg:hidden
        mx-2.5 mb-2.5
        rounded-3xl border border-gray-200 bg-white
        shadow-md px-1.5 py-2.5"
      >
        <div className="flex w-full items-center justify-between flex-nowrap">
          {navItems.map((item: Nav) => {
            const active = pathname === item.path;
            const Icon = item.icon;

            const iconColorClasses = item.special
              ? 'bg-green-600 text-white'
              : active
              ? 'bg-gray-900 text-white'
              : 'bg-transparent text-gray-500';

            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1"
              >
                <div
                  className={`
                    flex h-10.5 w-10.5 items-center justify-center
                    rounded-full transition-colors
                    ${iconColorClasses}
                  `}
                >
                  <Icon className='size-6' />
                </div>

                <span
                  className={`
                    text-xs
                    ${active ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}
                  `}
                >
                  {item.text}
                </span>
              </Link>
            );
          })}
        </div>
      </div> 

    </footer>
  );
}