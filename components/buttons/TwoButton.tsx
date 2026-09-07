'use client'
import { Default } from "@/types/metadata"
import { useEffect, useState } from "react"

interface ThreeButtonProps {
  data: Default[],
  state: string,
  setState: React.Dispatch<React.SetStateAction<string>>
}

// BUNU DUZELTMEMISEM

const TwoButton = ({data, state, setState}: ThreeButtonProps) => {

  const [newData, setNewData] = useState<Default[]>([])

  useEffect(() => {
    setNewData([{_id: '', label: 'Hamısı'}, ...data])
  }, [data])

  return(
    <div className="flex">
      {
        newData.map((item: Default, index) => {
          const active = item._id === state
          return (
            <button 
              key={index}
              className={`
                p-2 px-4 py-2.5 cursor-pointer 
                ${active ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}
                ${index == 0 ? 'border-2 rounded-l-lg' : ''}
                ${index == 1 ? 'border-y-2' : ''}
                ${index == 2 ? 'border-2 rounded-r-lg' : ''}
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

export default TwoButton