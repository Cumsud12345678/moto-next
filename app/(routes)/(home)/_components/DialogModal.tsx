'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Default } from '@/types/metadata'
import Image from 'next/image'
import { Check, Xmark } from '@gravity-ui/icons'


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
      showCloseButton={false}
        className='w-full h-full max-w-none sm:w-[90vw] rounded-none sm:h-[90vh] sm:max-w-3xl flex flex-col bg-white p-0'
      >
        <DialogHeader className='h-auto px-3 mt-3 text-xl shrink-0 flex flex-row items-center justify-between'>
          {label}
          <Xmark
            className='size-6 mt-2'
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <div className='flex p-3 flex-col overflow-auto'>

          <input value={value} onChange={(e) => setValue(e.target.value)} type="text" name="" id="" className='border w-full p-3 bg-gray-200 rounded-lg' placeholder='Axtar...' />

          <div className='mt-4'>
            <h3>Populyar</h3>
            <div className='flex flex-col mt-2'>
              {
                newData.map((item: Default) => {
                  const active = item._id === state

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item._id)}
                      className='flex items-center justify-between py-3 border-b'
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
                        && <Check className='size-5 text-green-500' />
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