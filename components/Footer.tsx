'use client'
import React, { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { navs } from '@/constants/navs';
import { Nav } from '@/types/nav';
import { usePathname } from 'next/navigation';
import { Default } from '@/types/metadata';

interface FooterProps {
  makes: Default[]
}

export default function Footer({ makes }: FooterProps) {

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
    <Fragment>

      {
        (pathname !== '/new' && pathname !== '/auth')
        &&
        <div className='bg-[#f1f3f7]'>
          <div className='container max-w-250 mx-auto px-3'>
            <div className='flex flex-row items-center justify-between border-y-gray-400 border-y border-red-50 py-3'>
              <span>Reklam yerlesdirin</span>
              <div className='flex gap-3 text-[14px] items-center'>
                <a href="">
                  <img src="./tiktok.png" alt="" className='size-6' />
                </a>
                <a href="">
                  <img src="./instagram.png" alt="" className='size-7' />
                </a>
                <a href="">
                  <div className='flex items-center gap-2'>
                    <img src="./email.png" alt="" className='size-6' />
                    <span>isayevcumu@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-2'>
              {
                makes.map(make => (
                  <Link key={make._id} href={`/motors?make=${make._id}`} className='py-1'>
                    <span className='text-[15px] text-gray-500 hover:text-orange-500'>{make.label}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        </div>
        
      }

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

    </Fragment>
    
  );
}