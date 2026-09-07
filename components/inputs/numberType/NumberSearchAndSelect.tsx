'use client'
import { Default } from '@/types/metadata'
import { Check, ChevronDown, ChevronRight, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { Spinner } from '../../ui/spinner'

interface NumberSearchAndSelect {
  data:  number[]
  state: number
  setState: React.Dispatch<React.SetStateAction<number>>
  label: string
}

const NumberSearchAndSelect = ({data, state, setState, label}: NumberSearchAndSelect) => {

  const [value, setValue] = useState<number>(0)
  const [filteredData, setFilteredData] = useState<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState<boolean>(false)

  const handleChange = (value: number) => {
    setValue(value)
    setState(0)
  }

  const handleSelect = (item: number) => {
    setValue(item)
    setState(item)
  }

  const clearValue = () => {
    setValue(0)
    setState(0)
  }

  useEffect(() => {
    const newData: number[] = data.filter((item: Number) => item.toString().startsWith(value.toString()))
    setFilteredData(newData)
  }, [value, data])

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  useEffect(() => {
    if (!state) {
      setValue(0)
    }else {
      const a = data.find((item: number) => item === state)
      console.log(a)
      setValue(a || 0)
    }
  }, [state, data])

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="
            border focus:outline-sky-500 rounded-sm
            peer w-full px-3 pt-4.5 pb-1.5 text-[16px] bg-white
          "
          placeholder=" "
        />

        <label className="
          absolute left-3.5 top-3.1
          origin-left
          text-gray-500
          transition-transform duration-200
          peer-focus:-translate-y-3
          peer-focus:scale-75
          peer-not-placeholder-shown:-translate-y-3
          peer-not-placeholder-shown:scale-75"
        >
          {label}
        </label>

        
        {value ? (
          <button
            type="button"
            className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
            onClick={clearValue}
          >
            <Xmark />
          </button>
        ) : (
          <button
            type="button"
            className={`absolute right-2 transform transition-transform duration-300 ${focus ? 'rotate-180' : 'rotate-0'}`}
            onClick={() => inputRef.current?.focus()}
          >
            <ChevronDown />
          </button>
        )}
      </div>

      {focus && (
        <div className="absolute z-1000 mt-2 max-h-56.25 w-full overflow-auto rounded-lg border-2 bg-white p-1 shadow-lg">

          {/* Hele data yuklenmiyibse */}
          {
            (filteredData.length === 0 && value === 0) &&
            <div className="flex items-center justify-center p-1">
              <Spinner />
            </div>
          }
          {/* Axdarilan data tapilmiyibsa */}
          {
            (filteredData.length === 0 && value !== 0) &&
            <div className="flex items-center justify-center p-1">
              Tapılmadı
            </div>
          }
          {/* Data varsa */}
          {
            filteredData.length !== 0 &&
            (
              filteredData.map((item: number) => (
                <div
                  key={item}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200"
                  onMouseDown={() => handleSelect(item)}
                >
                  <div>
                    <span style={{ fontSize: '14px' }}>{item}</span>
                  </div>

                  {
                    state === item && (
                      <Check className='size-6 text-green-500' />
                    )
                  }
                </div>
              )))
          }
        </div>
      )}

    </div>
  )
}

export default NumberSearchAndSelect