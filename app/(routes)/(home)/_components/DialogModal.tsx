'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Default } from '@/types/metadata'
import Image from 'next/image'


interface CustomDrawerProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  state: string,
  setState: (id: string) => void,
  data: Default[],
  label: string
}


const DialogModal = ({open, setOpen, state, setState, data, label}: CustomDrawerProps) => {

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
  
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent
        className='w-full h-full max-w-none sm:w-[90vw] rounded-none sm:h-[90vh] sm:max-w-3xl flex flex-col bg-white p-0'
      >
        <DialogHeader className='h-auto px-3 mt-5 text-2xl'>
          {label}
        </DialogHeader>

        <div className='flex p-3 flex-col'>

          <input value={value} onChange={(e) => setValue(e.target.value)} type="text" name="" id="" className='border w-full p-2 px-3 bg-gray-200 rounded-lg' placeholder='Axtar...' />

          <div className='mt-4'>
            <h3>Populyar</h3>
            <div className='flex flex-col gap-3 mt-2'>
              {
                newData.map((item: Default) => {
                  const active = item._id === state

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item._id)}
                      className='border flex items-center justify-between p-3 bg-[#f5f5f5] rounded-lg'
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
                        && <span>secili</span>
                      }
                    </div>
                  )
                })
              }
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>

  )
}

export default DialogModal