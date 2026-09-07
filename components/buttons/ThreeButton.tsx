'use client'
import { Type1 } from "@/types/metadata"
import { useEffect, useState } from "react"

interface ThreeButtonProps {
  data: Array<Type1>,
  state: boolean | null,
  setState: React.Dispatch<React.SetStateAction<boolean | null>>
}

const ThreeButton = ({data, state, setState}: ThreeButtonProps) => {

  const [newData, setNewData] = useState<Type1[]>([])

  useEffect(() => {
    setNewData([{_id: '', label: 'Hamısı', status: null}, ...data])
  }, [data])

  return(
    <div className="flex">
      {
        newData.map((item: Type1, index) => {
          const active = item.status === state
          return (
            <button 
              key={index}
              className={`
                px-4 py-2 cursor-pointer w-full
                ${active ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}
                ${index == 0 ? 'border rounded-l-sm' : ''}
                ${index == 1 ? 'border-y' : ''}
                ${index == 2 ? 'border rounded-r-sm' : ''}
              `}
              onClick={() => setState(item.status)}
            >
              {item.label}
            </button>
          )
        })
      }
    </div>
  )
}

export default ThreeButton