'use client'
import { Default } from "@/types/metadata";
import { Xmark } from "@gravity-ui/icons";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface InputAndListNumberProps {
  state: number,
  setState: React.Dispatch<React.SetStateAction<number>>,
  label: string,
  length: number,
  data: number[]
}

export default function InputAndListNumber({ state, setState, label, length=20, data }: InputAndListNumberProps) {
  
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null);
  const [newData, setNewData] = useState<string[]>([])

  const formatNumber = (text: number) => {
    if (!text) return "";

    return new Intl.NumberFormat("fr-FR")
      .format(Number(text))
      .replace(/\u202F|\u00A0/g, " ");
  };

  const handleChangeList = (item: string) => {
    setValue(item)
    setState(Number(item))
  }

  useEffect(() => {
    const newArr: string[] = data.map(String)
    setNewData(newArr)
  }, [data])

  useEffect(() => {
    const arr: number[] = data.filter((item: number) =>
      item.toString().startsWith(value.toString())
    )

    const newArr: string[] = arr.map(String)

    setNewData(newArr)
  }, [value])

  const clearValue = () => {
    setState(0)
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

        {state !== 0 && (
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
          state === 0 &&
          (
            newData.map((item: string, index) => (
              <div key={index} onClick={() => handleChangeList(item)} className="cursor-pointer flex gap-2 items-center hover:bg-gray-200 p-2 border-b">
                <span style={{ fontSize: '16px' }}>{item}</span>
              </div>
            ))
          )
        }
      </div>
    </div>
  );
}
