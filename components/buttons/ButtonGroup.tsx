'use client'
import { Default } from "@/types/metadata";
import { useEffect, useState } from "react";

interface ButtonGroupProps {
  data: Default[],
  state: string,
  setState: (id: string) => void
  wrap: boolean,
  isNew: boolean
}

const ButtonGroup = ({data, state, setState, wrap=false, isNew=false}: ButtonGroupProps) => {

  // if(data.length === 0) {
  //   return (
  //     <div className={`flex gap-2 pb-2 ${flex ? 'flex-nowrap' : 'flex-wrap'}`}>
  //       {
  //         [...Array(5)].map((_, index) => (
  //           <Skeleton key={index} className={`h-10 w-18 cursor-pointer rounded-3xl`}/>
  //         ))
  //       }
  //     </div>
  //   )
  // }
  
  const [newData, setNewData] = useState<Default[]>([])

  useEffect(() => {
    if(!data) return;
    setNewData([{_id: '', label: 'Hamisi'}, ...data])
  }, [data])


  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(window.location.hash)
  }, [])

  return(
    <div className={`flex items-center gap-2 ${wrap ? 'flex-nowrap' : 'flex-wrap'}`}>
      {
        newData.map((item, index) => {
          if(isNew && item.label === 'Hamisi') return; 
          const active = item._id === state
          return (
            <button 
              key={item._id}
              className={`
                p-2.5 px-4 cursor-pointer rounded-3xl border-2
                ${active ? 'bg-green-200 text-blaxk border-green-500' : hash ? 'bg-white' : 'bg-white hover:bg-gray-200'}
              `}
              onClick={() => setState(item._id)}
            >
              {item.label}
            </button>
          )
        })
      }
    </div>
  )
  
}

export default ButtonGroup