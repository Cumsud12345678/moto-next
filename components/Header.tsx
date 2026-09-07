'use client'
import React, { useEffect, useState } from 'react'
import {ArrowRightFromSquare, Bars, ChevronRight, CircleQuestion, Envelope, Flag, Handset, PersonFill, PersonPlus, Plus} from '@gravity-ui/icons';
import { navs as links } from '@/constants/navs';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {Xmark} from '@gravity-ui/icons';
import { menuNavs } from '@/constants/menuNavs';
import Link from 'next/link';
import { Menu } from '@/types/menu';
import { usePathname } from 'next/navigation';

const Header = () => {

  const pathname = usePathname()

  const [visible, setVisible] = useState<boolean>(true)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const isAuth = false
  const menuLinks = menuNavs

  const navs = links

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


  const [isLg, setIsLg] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleChange = () => {
      setIsLg(mediaQuery.matches)
    }

    handleChange()

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const handleLogout = () => {
    console.log('aa')
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-transform duration-300
        md:translate-y-0 border bg-white
        ${visible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >

      <div className='flex flex-row items-center justify-between p-2 px-3 container mx-auto max-w-250'>
        <button onClick={() => setModalOpen(!modalOpen)} className='p-1'>
          <Bars />
        </button>
        <Link href={'/'} className='w-42 cursor-pointer'>
          <img src="/logo.png" className='w-full' alt="logo" />
        </Link>

        <Link href={'/new'} className='lg:hidden p-1.5 px-4 bg-green-400 text-white rounded-lg flex items-center justify-center gap-1'>
          <Plus />
          Yeni
        </Link>

        {
          isLg && 
            navs.map((nav) => {
              const active = pathname === nav.path
              const Icon = nav.icon

              return (
                <Link 
                  key={nav.path}
                  href={nav.path}
                  className={`
                    btn mx-[15px] 
                    ${(active && nav.path !== '/new') && 'bg-orange-400 text-white'} 
                    ${nav.path === '/new' && 'bg-green-500 text-white'}
                  `} 
                >
                  {/* <button className='flex items-center gap-2'> */}
                    <Icon className={`size-5 ${active && 'text-white'}`} />
                    <h5
                      className=''
                    >
                      {nav.text}
                    </h5>
                  {/* </button> */}
                </Link>
                
              )
              
            })
        }
      </div>



      {/* Munyu */}
      <Drawer swipeDirection='left' open={modalOpen} onOpenChange={setModalOpen}>
        <DrawerContent className='z-70'>
          <DrawerHeader className='flex flex-row items-center justify-between w-full'>
            <Link href={'/'} className='w-48 cursor-pointer'>
              <img src="/logo.png" className='w-full' alt="logo" />
            </Link>
            <DrawerDescription>
              <button onClick={() => setModalOpen(false)}>
                <Xmark className='size-6' />
              </button>
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-2 text-black">
            <div className='container mx-auto max-w-250 p-2'>
              <div className='grid grid-col gap-3 text-black'>

                {
                  menuLinks.map((link: Menu) => {
                    const Icon = link.icon
                    return (
                      <Link href={link.url} key={link.url} className='bg-[#f5f5f5] p-2 rounded-2xl cursor-pointer border border-[#f5f5f5] hover:border-blue-500'>
                        <div>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <div className='bg-white rounded-full p-2'>
                                <Icon className='' />
                              </div>
                              {
                                link.content
                                ? <div className='flex flex-col ml-2'>
                                    <span className='text-xs'>{link.title}</span>
                                    <span className='font-semibold'>{link.content}</span>
                                  </div>
                                :<span className='ml-2'>{link.title}</span>
                              }
                            </div>
                            <ChevronRight className='float-right text-gray-400' />
                          </div>
                        </div>
                      </Link>
                    )
                  })
                }
 

                {
                  isAuth
                    ?
                    <div onClick={handleLogout} className='bg-[#f5f5f5] p-2 rounded-2xl cursor-pointer border border-[#f5f5f5] hover:border-blue-500'>
                      <div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <div className='bg-white rounded-full p-2'>
                              <ArrowRightFromSquare className='text-muted' />
                            </div>
                            <span className='ml-2'>Çıxış</span>
                          </div>
                          <ChevronRight className='float-right text-gray-400' />
                        </div>
                      </div>
                    </div>
                    :
                    <div className='flex items-center justify-between p-1 gap-2'>
                      
                      <button className='active:scale-105 transition-all flex items-center w-full border-3 p-2 rounded-xl justify-center gap-1 cursor-pointer'>
                        <Link href="/auth" className='flex items-center gap-1'>
                          <PersonFill />
                          <span style={{ fontSize: '16px' }} className='font-bold shrink-0'>Daxil ol</span>
                        </Link> 
                      </button>

                      <button className='active:scale-105 transition-all flex items-center w-full border p-2 rounded-xl justify-center gap-1 bg-blue-500 text-white cursor-pointer'>
                        <PersonPlus />
                        <span style={{ fontSize: '16px' }} className='font-bold'>Üzv ol</span>
                      </button>
                    </div>
                }

              </div>
            </div>
          </div>
          {/* <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>

    </header>
  )
}

export default Header