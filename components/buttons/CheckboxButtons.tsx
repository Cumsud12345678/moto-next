// import { Skeleton } from "@heroui/react";

import { Default } from "@/types/metadata";

interface CheckboxButtonsProps {
  data: Array<Default>
  ids: Array<string>
  onClick: (id: string) => void
}

export default function CheckboxButtons ({data, ids, onClick}: CheckboxButtonsProps) {

  // if(data.length === 0) {
  //   return (
  //     <div className="flex flex-wrap gap-2">
  //       {
  //         [...Array(9)].map((_, index) => (
  //           <Skeleton key={index} className={`h-10 w-18 cursor-pointer rounded-3xl`} />
  //         ))
  //       }
  //     </div>
  //   )
  // }

  return(
    <div className="flex flex-wrap gap-2">
      {
        data.map((item, index) => {
          const active = ids.includes(item._id);   // ← ids yerinə safeIds
          return (
            <button 
              key={item._id}
              className={`
                p-2.5 px-4 cursor-pointer rounded-3xl border-2
                ${active ? 'bg-green-200 text-black border-green-500' : 'border bg-white hover:bg-gray-200'}
              `}
              onClick={() => onClick(item._id)}
            >
              {item.label}
            </button>
          )
        })
      }
    </div>
  )
}