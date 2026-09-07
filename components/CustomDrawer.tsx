'use client'
import React, { useEffect, useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Default } from '@/types/metadata'
import Image from 'next/image'
import { Check } from '@gravity-ui/icons'

interface CustomDrawerProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  state: string,
  setState: (id: string) => void,
  data: Default[],
  label: string
}

const CustomDrawer = ({open, setOpen, state, setState, data, label}: CustomDrawerProps) => {

  const [newData, setNewData] = useState<Default[]>([])
  const [value, setValue] = useState<string>('')

  const handleSelect = (id: string) => {
    setOpen(false)
    setState(id)
  }

  useEffect(() => {
    const a = data.filter((item: Default) => item.label.toLowerCase().startsWith(value.toLowerCase()))
    setNewData(a)
  }, [data, value])


  const reset = () => {
    setState('')
    setValue('')
    setOpen(false)
  } 

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerContent className='h-[70%]'>
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 flex flex-col gap-4 text-[15px]">
          <div>
            <input value={value} onChange={(e) => setValue(e.target.value)} type="text" name="" id="" className='border w-full p-2.5 px-3 bg-gray-100 rounded-lg' placeholder='Axtar...' />
          </div>

          {
            newData.map((item: Default) => {
              const active = item._id === state

              return (
                <div 
                  key={item._id} 
                  onClick={() => handleSelect(item._id)}
                  className={`border flex items-center justify-between p-3 rounded-lg ${active && 'border-green-500'}`}
                >
                  <div className='flex items-center gap-2'>
                    {
                      item.logo
                      && <Image src={item.logo} alt='' width={30} height={30} />
                    }
                    {item.label}
                  </div>
                  
                  {
                    active 
                    && <Check className='size-6 text-green-400' />
                  }
                </div>
              )
            })
          }

        </div>
        <DrawerFooter>
          <div className=''>
            <button 
              onClick={reset}
              className='float-right bg-red-500 text-white p-2 px-5 rounded-lg'
            >
              Sifirla
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CustomDrawer