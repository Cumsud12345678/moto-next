'use client'
import { useFilter } from '@/hooks/useFilter'
import axios from 'axios'
import { Spinner } from "@/components/ui/spinner"
import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import { Fragment, useEffect, useState } from 'react'
import { toast } from '@/components/ui/toast'
import { useMetadata } from '@/hooks/useMetadata'
import { Default } from '@/types/metadata'
import { api } from '@/lib/axios'

import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { useSendOtp } from '@/hooks/useSendOtp'
import { useCreateEvent } from '@/hooks/useCreateEvent'
import { useVerifyOtp } from '@/hooks/useVerifyOtp'

const API = process.env.NEXT_PUBLIC_API_URL!;

interface User {
  _id: string,
  name: string,
  email: string
}

interface ImageFile  {
  id: string 
  url: string
  file: File
}

const NewPage = () => {
  
  const [formStep, setFormStep] = useState<string>('start')
  const [userData, setUserData] = useState<User | undefined>(undefined)

  console.log(userData)

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(
          `${API}/api/auth/me`,
          { withCredentials: true }
        )

        console.log(res.data)
        // if(res.data.data.length > 0) {
          setUserData(res.data.data)
        // }
      } catch (error) {
        console.error(error)
      }
    }
    getMe()
  }, [])

  const filterStates = useFilter()
  const metadataHook = useMetadata()

  const {
    make,
    model,
    setModel,
    used,
    city,
    credit,
    barter,
    fuelType,
    transmission,
    minVolume,
    minYear,
    color,
    equipment,
    document,
    category,
  } = filterStates

  const {
    isLoading,
    error,
    usedTypes,
    metadata
  } = metadataHook

  const [filteredModels, setFilteredModels] = useState<Array<Default>>([])

  useEffect(() => {
    if(make && metadata) {
      setFilteredModels(metadata.models.filter((model: Default) => model.make === make))
    }else if(!make) {
      console.log('sifirladim')
      setModel('')
      setFilteredModels([])
    }
  }, [make, metadata])


  const [power, setPower] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)

  const [images, setImages] = useState<ImageFile[]>([])
  const [description, setDescription] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [otp, setOtp] = useState<string>("")



  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const createEventMutation = useCreateEvent()

  // ADDIM 1: email+name+phone göndər, OTP istə (yalnız userData yoxdursa lazımdır)
  const handleSendOtp = () => {
    if (userData) {
      // İstifadəçi artıq login-dir — OTP-yə ehtiyac yoxdur, birbaşa elanı göndər
      submitListing()
      return
    }

    sendOtpMutation.mutate({ email, name }, {
      onSuccess: (data) => {
        if (data.success) setFormStep('verify')
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod göndərilmədi.', priority: 'high' })
      },
    })
  }

  // ADDIM 2: OTP-ni yoxla, uğur olsa elanı göndər
  const handleVerify = () => {
    verifyOtpMutation.mutate({ email, otp }, {
      onSuccess: (data) => {
        if (data.success) {
          submitListing() // yalnız İNDİ elanı göndər
        }
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod yanlışdır.', priority: 'high' })
      },
    })
  }


  // ADDIM 3: elanı yarat (FormData-da artıq `otp` YOXDUR)
  const submitListing = () => {
    const formData = new FormData()

    formData.append('price', String(price))
    formData.append('make', make)
    formData.append('model', model)
    formData.append('year', String(minYear))
    formData.append('volume', String(minVolume))
    formData.append('category', category)
    formData.append('color', color)
    formData.append('fuelType', fuelType)
    formData.append('transmission', transmission)
    formData.append('power', String(power))
    formData.append('mileage', String(distance))
    formData.append('description', description)
    formData.append('region', city) // diqqət #6-ya bax
    formData.append('phone', phone.replace(/\s/g, '')) // diqqət #5-ə bax

    if (used !== null) formData.append('used', String(used))
    if (credit !== null) formData.append('credit', String(credit))
    if (barter !== null) formData.append('barter', String(barter))
    if (document !== null) formData.append('document', String(document))

    images.forEach((image) => formData.append('images', image.file))
    equipment.forEach((eq) => formData.append('equipment', eq))

    createEventMutation.mutate(formData, {
      onSuccess: () => {
        toast.add({ type: 'success', description: 'Elan uğurla yaradıldı.' })
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Elan yaradıla bilmədi.', priority: 'high' })
      },
    })
  }


  // BÜTÜN hook-lar əvvəl:
  useEffect(() => {
    if (error) {
      toast.add({
        type: "error",
        description: "The event could not be created.",
        priority: "high",
      });
    }
  }, [error]);

  // yalnız BUNDAN SONRA early return-lar:
  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5">
          <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]">
            <div className="flex items-center justify-center p-4 bg-white mt-3 lg:mt-0">
              <h1 className="lg:text-3xl text-2xl font-bold">Yeni elan</h1>
            </div>
            <div className="lg:p-10 border rounded-3xl bg-white p-5 flex flex-col gap-2 lg:gap-0 items-center justify-center">
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return null;
  if (!metadata) return null;

  return (
    <div>
      <div className="flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5">
        <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]">
          
        {
          formStep === 'start'
          &&
          <Fragment>
            <div className="flex items-center justify-center p-4 bg-white mt-3 lg:mt-0">
              <h1 className="lg:text-3xl text-2xl font-bold">Yeni elan</h1>
            </div>

            <Step1
              metadata={metadata}
              models={filteredModels}
              filterState={filterStates}
            />

            {
              fuelType &&

              <Fragment>

                <Step2
                  filterState={filterStates}
                  metadata={metadata}
                  images={images}
                  setImages={setImages}
                  description={description}
                  setDescription={setDescription}
                  power={power}
                  setPower={setPower}
                  distance={distance}
                  setDistance={setDistance}
                  price={price}
                  setPrice={setPrice}
                />

                <Step3
                  setForm={handleSendOtp}          // 'setFormAndLogin' əvəzinə
                  isSubmitting={sendOtpMutation.isPending}
                  userData={userData}
                  phone={phone}
                  setPhone={setPhone}
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                />

              </Fragment>
            }

          </Fragment>
        }

        {
          formStep === 'verify'
          &&
          <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]">
            <Field className="w-fit">
              <FieldLabel htmlFor="digits-only">Digits Only</FieldLabel>
              <InputOTP
                id="digits-only"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </Field>

            <div>
              <button
                onClick={handleVerify}
                disabled={verifyOtpMutation.isPending || otp.length < 6}
                className="w-full p-4 rounded-xl bg-blue-500 text-white cursor-pointer disabled:opacity-50"
              >
                {verifyOtpMutation.isPending ? 'Yoxlanılır...' : 'Gonder'}
              </button>
            </div>

          </div>
        }

        </div>
      </div>
    </div>
  )

}

export default NewPage