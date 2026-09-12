'use client'
import { FunctionComponent, useEffect, useState } from "react"

export const useFilter = () => {

  const [make, setMake] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [category, setCategory] = useState<string>('')

  const [used, setUsed] = useState<boolean | null>(null)
  const [credit, setCredit] = useState<boolean | null>(false)
  const [document, setDocument] = useState<boolean | null>(false)
  const [barter, setBarter] = useState<boolean | null>(false)

  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(0)
  
  const [fuelType, setFuelType] = useState<string>('')
  const [transmission, setTransmission] = useState<string>('')
  const [minVolume, setMinVolume] = useState<number>(0)
  const [maxVolume, setMaxVolume] = useState<number>(0)
  const [minDistance, setMinDistance] = useState<number>(0)
  const [maxDistance, setMaxDistance] = useState<number>(0)
  const [minYear, setMinYear] = useState<number>(0)
  const [maxYear, setMaxYear] = useState<number>(0)
  const [minPower, setMinPower] = useState<number>(0)
  const [maxPower, setMaxPower] = useState<number>(0)
  const [color, setColor] = useState<string>('')
  const [equipment, setEquipment] = useState<Array<string>>([])
  const years = Array.from({ length: 2026-1950 },(_, index) => 2026 - index)
  const volumes = Array.from({ length: 3000/50 + 1 }, (_, index) => (index + 1) * 50)
  const addEquipment = (id: string) => {
    const shalter = equipment.find((eq: string) => eq === id)
    if(shalter) {
      setEquipment(equipment.filter((eq: string) => eq !== id))
    }else {
      setEquipment([...equipment, id])
    }
  }
  const setElement = (key: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    key(value)
  }

  return {
    make,
    setMake,

    model,
    setModel,

    used,
    setUsed,

    city,
    setCity,

    document,
    setDocument,

    category,
    setCategory,

    years,
    minYear,
    setMinYear,
    maxYear,
    setMaxYear,
    
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    
    credit,
    setCredit,

    barter,
    setBarter,

    fuelType,
    setFuelType,

    transmission,
    setTransmission,

    volumes,
    minVolume,
    setMinVolume,
    maxVolume,
    setMaxVolume,

    minDistance,
    setMinDistance,
    maxDistance,
    setMaxDistance,

    minPower,
    setMinPower,
    maxPower,
    setMaxPower,

    color,
    setColor,

    equipment,
    setEquipment,
    addEquipment,

    setElement,
  }

}