'use client'
import { Default } from "@/types/metadata";
import { Xmark } from "@gravity-ui/icons";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface InputAndListStringProps {
  state: string,
  setState: React.Dispatch<React.SetStateAction<string>>,
  label: string,
  length: number,
  data: Default[]
}

export default function InputAndListString({ state, setState, label, length=20, data }: InputAndListStringProps) {
  
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null);
  const [newData, setNewData] = useState<Default[]>([])

  const changeInput = (value: string) => {
    if(typeof value === 'string') {
      const rawValue = value.replace(/\s/g, "");
      setState(rawValue);
    }
  }

  const handleChangeList = (id: string, label: string) => {
    setValue(label)
    setState(id)
  }

  useEffect(() => {
    setNewData(data)
  }, [data])

  useEffect(() => {
    const a = data.filter((item: Default) => item.label.toLowerCase().startsWith(value.toLowerCase()))
    setNewData(a)
  }, [value])


  const clearValue = () => {
    setState('')
    setValue('')
  }


  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          value={value}
          maxLength={length}
          inputMode={typeof state === 'string' ? 'text' : 'numeric'}
          onChange={(e) => setValue(e.target.value)}
          className="peer w-full rounded-xl border bg-[#fafbff] px-3 pt-6 pb-2 text-[16px] focus:outline-sky-500"
          placeholder=" "
        />

        <label className="pointer-events-none absolute left-3.5 top-4 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-xs">
          {label}
        </label>

        {state && (
          <button
            type="button"
            className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
            onClick={() => clearValue()}
          >
            <Xmark />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 mt-2 lg:mt-6 max-h-screen overflow-auto">
        {
          !state &&
          (
            newData.map((item: Default, index) => (
              <div key={index} onClick={() => handleChangeList(item._id, item.label)} className="cursor-pointer flex gap-2 items-center hover:bg-gray-200 p-2 border-b">
                {item.logo &&
                  <Image src={item.logo} width={30} height={30} alt={item.label} />
                }
                <span style={{ fontSize: '16px' }}>{item.label}</span>
              </div>
            ))
          )
        }
      </div>
    </div>
  );
}