'use client'
import { Default, Metadata, Type1 } from "@/types/metadata"
import { FunctionComponent, useEffect, useState } from "react"

const metadata: Metadata = {
  makes: [
    {
      _id: '111a',
      label: 'Tufan',
      logo: 'https://api.motoelan.com/uploads/1787769791823-96aa4591145003.Y3JvcCw5ODAsNzY2LDAsMTY3.jpg'
    },
    {
      _id: '111b',
      label: 'Harley',
      logo: 'https://api.motoelan.com/uploads/1787770419107-Harley_davidson_logo.jpg'
    }
  ],
  models: [
    {
      _id: '11a',
      make: '111a',
      label: 'M50'
    },
    {
      _id: '11b',
      make: '111b',
      label: 'M 150'
    }
  ],
  used_types: [
    {
      _id: '1a',
      label: 'Yeni',
      status: true
    },
    {
      _id: '1b',
      label: 'Surulmus',
      status: false
    }
  ],
  cities: [
    {
      _id: '1111a',
      label: 'Baki'
    },
    {
      _id: '1111b',
      label: 'Sumqayit'
    }
  ],
  document: [
    {
      _id: '1.1a',
      label: 'Senedli',
      status: true
    },
    {
      _id: '1.1b',
      label: 'Senedsiz',
      status: false
    }
  ],
  categories: [
    {
      _id: '111aaa',
      label: 'Motosiklet',
    },
    {
      _id: '111bbb',
      label: 'Moped ',
    },
    {
      _id: '111ccc',
      label: 'Kvadrosikl ',
    }
  ],
  fuel_types: [
    {
      _id: '1111a',
      label: 'Benzin'
    },
    {
      _id: '1111b',
      label: 'Elektro'
    }
  ],
  transmissions: [
    {
      _id: '1111a',
      label: 'Avtomat (AT)'
    },
    {
      _id: '1111b',
      label: 'Mexaniki (MT)'
    }
  ],
  colors: [
    {
      _id: '1111a',
      label: 'Qara'
    },
    {
      _id: '1111b',
      label: 'Aq'
    },
    {
      _id: '1111c',
      label: 'Qirmizi'
    },
    {
      _id: '1111d',
      label: 'Sari'
    },
    {
      _id: '1111e',
      label: 'Narinci'
    },
    {
      _id: '1111f',
      label: 'Cehrayi'
    }
  ],
  equipments: [
    {
      _id: '1111a',
      label: 'ABS'
    },
    {
      _id: '1111b',
      label: 'Yungul lehimli diskler'
    },
    {
      _id: '1111c',
      label: 'Oturacaqlarin isidilmesi'
    },
    {
      _id: '1111d',
      label: 'Merkezi qapanma'
    },
    {
      _id: '1111e',
      label: 'Deri salon'
    },
    {
      _id: '1111f',
      label: 'Ksenon lampalar'
    }
  ]
}

export const useFilter = () => {

  const [make, setMake] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [used, setUsed] = useState<boolean | null>(null)
  const [city, setCity] = useState<string>('')
  const [document, setDocument] = useState<boolean | null>(null)
  const [category, setCategory] = useState<string>('')
  const [credit, setCredit] = useState<boolean | null>(false)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(0)
  const [barter, setBarter] = useState<boolean | null>(false)
  const [isNew, setIsNew] = useState<boolean | null>(false)
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
  const [filteredModels, setFilteredModels] = useState<Array<Default>>([])
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


  const [speed, setSpeed] = useState<string>('')
  

  // Metadatani cek
  // useEffect(() => {
  //   const checkMetadata = async () => {
  //     const res = await fetch('https://sitem.com/api/metadata')
  //     const data = await res.json()
  //     setMetadata(data)
  //   }
  //   checkMetadata()
  // }, [])

  useEffect(() => {
    if(make && metadata) {
      setFilteredModels(metadata.models.filter((model: Default) => model.make === make))
    }else if(!make) {
      console.log('sifirladim')
      setModel('')
      setFilteredModels([])
    }
  }, [make, metadata])


  return {
    makes: metadata?.makes,
    make,
    setMake,

    models: filteredModels,
    model,
    setModel,

    used,
    setUsed,

    cities: metadata.cities,
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

    isNew,
    setIsNew,

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
    addEquipment,

    setElement,

    metadata
  }

}