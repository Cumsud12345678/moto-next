'use client'
import { Default } from '@/types/metadata'
import { Check, ChevronDown, ChevronRight, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { Spinner } from '../../ui/spinner'

interface NumberSearchAndSelect {
  data:  number[]
  minState: number
  setMinState: React.Dispatch<React.SetStateAction<number>>
  maxState: number
  setMaxState: React.Dispatch<React.SetStateAction<number>>
  label: string
}

const TwoSearchAndSelect = ({data, minState, setMinState, maxState, setMaxState, label}: NumberSearchAndSelect) => {

  const [minValue, setMinValue] = useState<number>(0)
  const [maxValue, setMaxValue] = useState<number>(0)

  const [filteredDataMin, setFilteredDataMin] = useState<number[]>([])
  const [filteredDataMax, setFilteredDataMax] = useState<number[]>([])

  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)

  const [minFocus, setMinFocus] = useState<boolean>(false)
  const [maxFocus, setMaxFocus] = useState<boolean>(false)

  const handleChange = (item: number, setValue: React.Dispatch<React.SetStateAction<number>>, setState: React.Dispatch<React.SetStateAction<number>>) => {
    setValue(item)
    setState(0)
  }

  const handleSelect = (item: number, setValue: React.Dispatch<React.SetStateAction<number>>, setState: React.Dispatch<React.SetStateAction<number>>) => {
    setValue(item)
    setState(item)
  }

  const clearValue = (setValue: React.Dispatch<React.SetStateAction<number>>, setState: React.Dispatch<React.SetStateAction<number>>) => {
    setValue(0)
    setState(0)
  }

  useEffect(() => {
    const newData: number[] = data.filter((item: number) => item.toString().startsWith(minValue.toString()))
    setFilteredDataMin(newData)
  }, [minValue, data])

  useEffect(() => {
    const newData: number[] = data.filter((item: number) => item.toString().startsWith(maxValue.toString()))
    setFilteredDataMax(newData)
  }, [maxValue, data])

  useEffect(() => {
    setFilteredDataMin(data)
    setFilteredDataMax(data)
  }, [data])

  useEffect(() => {
    if (!minState) {
      setMinValue(0)
    }else {
      const a = data.find((item: number) => item === minState)
      setMinValue(a || 0)
    }
  }, [minState, data])

  useEffect(() => {
    if (!maxState) {
      setMaxValue(0)
    }else {
      const a = data.find((item: number) => item === maxState)
      setMaxValue(a || 0)
    }
  }, [maxState, data])

  return (
    <div className='flex'>
      <div className="relative w-full">
        <div className="flex items-center">
          <input
            ref={minInputRef}
            value={minValue}
            onChange={(e) => handleChange(Number(e.target.value), setMinValue, setMinState)}
            onFocus={() => setMinFocus(true)}
            onBlur={() => setMinFocus(false)}
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


          {minValue ? (
            <button
              type="button"
              className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
              onClick={() => clearValue(setMinValue, setMinState)}
            >
              <Xmark />
            </button>
          ) : (
            <button
              type="button"
              className={`absolute right-2 transform transition-transform duration-300 ${minFocus ? 'rotate-180' : 'rotate-0'}`}
              onClick={() => minInputRef.current?.focus()}
            >
              <ChevronDown />
            </button>
          )}
        </div>

        {minFocus && (
          <div className="absolute z-50 mt-2 max-h-56.25 w-full overflow-auto rounded-lg border-2 bg-white p-1 shadow-lg">

            {/* Hele data yuklenmiyibse */}
            {
              (filteredDataMin.length === 0 && minValue === 0) &&
              <div className="flex items-center justify-center p-1">
                <Spinner />
              </div>
            }
            {/* Axdarilan data tapilmiyibsa */}
            {
              (filteredDataMin.length === 0 && minValue !== 0) &&
              <div className="flex items-center justify-center p-1">
                Tapılmadı
              </div>
            }
            {/* Data varsa */}
            {
              filteredDataMin.length !== 0 &&
              (
                filteredDataMin.map((item: number) => (
                  <div
                    key={item}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200"
                    onMouseDown={() => handleSelect(item, setMinValue, setMinState)}
                  >
                    <div>
                      <span style={{ fontSize: '14px' }}>{item}</span>
                    </div>

                    {
                      minState === item && (
                        <Check className='size-6 text-green-500' />
                      )
                    }
                  </div>
                )))
            }
          </div>
        )}
      </div>


      <div className="relative w-full">
        <div className="flex items-center">
          <input
            ref={maxInputRef}
            value={maxValue}
            onChange={(e) => handleChange(Number(e.target.value), setMaxValue, setMaxState)}
            onFocus={() => setMaxFocus(true)}
            onBlur={() => setMaxFocus(false)}
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
            max.
          </label>


          {maxValue ? (
            <button
              type="button"
              className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
              onClick={() => clearValue(setMaxValue, setMaxState)}
            >
              <Xmark />
            </button>
          ) : (
            <button
              type="button"
              className={`absolute right-2 transform transition-transform duration-300 ${maxFocus ? 'rotate-180' : 'rotate-0'}`}
              onClick={() => maxInputRef.current?.focus()}
            >
              <ChevronDown />
            </button>
          )}
        </div>

        {maxFocus && (
          <div className="absolute z-50 mt-2 max-h-56.25 w-full overflow-auto rounded-lg border-2 bg-white p-1 shadow-lg">

            {/* Hele data yuklenmiyibse */}
            {
              (filteredDataMax.length === 0 && maxValue === 0) &&
              <div className="flex items-center justify-center p-1">
                <Spinner />
              </div>
            }
            {/* Axdarilan data tapilmiyibsa */}
            {
              (filteredDataMax.length === 0 && maxValue !== 0) &&
              <div className="flex items-center justify-center p-1">
                Tapılmadı
              </div>
            }
            {/* Data varsa */}
            {
              filteredDataMax.length !== 0 &&
              (
                filteredDataMax.map((item: number) => (
                  <div
                    key={item}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200"
                    onMouseDown={() => handleSelect(item, setMaxValue, setMaxState)}
                  >
                    <div>
                      <span style={{ fontSize: '14px' }}>{item}</span>
                    </div>

                    {
                      minState === item && (
                        <Check className='size-6 text-green-500' />
                      )
                    }
                  </div>
                )))
            }
          </div>
        )}

      </div>
    </div>
    
  )
}

export default TwoSearchAndSelect