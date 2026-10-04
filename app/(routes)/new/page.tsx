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
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot,InputOTPSeparator } from "@/components/ui/input-otp"
import { useSendOtp } from '@/hooks/useSendOtp'
import { useCreateEvent } from '@/hooks/useCreateEvent'
import { useVerifyOtp } from '@/hooks/useVerifyOtp'
import { useRouter } from 'next/navigation'
import { RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createVideoUrl } from '@/lib/api/listings'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/slices/userSlice'

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
  const [isOldUser, setIsOldUser] = useState<boolean>(false)

  const dispatch = useDispatch()

  const router = useRouter()

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(
          `${API}/api/auth/me`,
          { withCredentials: true }
        )

        setUserData(res.data.data)
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
    region,
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

  const [video, setVideo] = useState<File | null>(null)
  const [images, setImages] = useState<ImageFile[]>([])
  const [description, setDescription] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [otp, setOtp] = useState<string>("")

  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const createEventMutation = useCreateEvent()

  const [loading, setLoading] = useState<boolean>(false)

  const warn = (description: string) => {
    toast.add({ type: 'warning', description })
    return false
  }

  const validateListing = (): boolean => {
    const currentYear = new Date().getFullYear()

    if (!make) return warn('Marka seçin')
    if (!model) return warn('Model seçin')

    if (!minYear || minYear < 1900 || minYear > currentYear)
      return warn(`İl 1900 ilə ${currentYear} arasında olmalıdır`)

    if (!minVolume || minVolume <= 0) return warn('Həcmi seçin')
    if (!category) return warn('Ban növünü seçin')
    if (!color) return warn('Rəngi seçin')
    if (!fuelType) return warn('Mühərrik növünü seçin')
    if (!transmission) return warn('Sürətlər qutusunu seçin')

    if (power <= 0) return warn('Güc daxil edin')
    if (!used && distance <= 0) return warn('Yürüş daxil edin')

    if (description.length > 1000)
      return warn('Məlumat maksimum 1000 simvol ola bilər')

    if (images.length < 1) return warn('Ən azı 1 şəkil əlavə edin')
    if (images.length > 10) return warn('Maksimum 10 şəkil əlavə edə bilərsiniz')

    if (!region) return warn('Şəhər seçin')
    if (!price || price <= 0) return warn('Qiymət 0-dan böyük olmalıdır')

    const rawPhone = phone.replace(/\s/g, '')
    if (rawPhone.length !== 9) return warn('Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır')

    if (!userData) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      if (!emailOk) return warn('Düzgün email daxil edin')
    }

    return true
  }

  // ADDIM 1: email+name+phone göndər, OTP istə (yalnız userData yoxdursa lazımdır)
  const handleSendOtp = () => {
    if (!validateListing()) return
    setLoading(true)

    if (userData) {
      submitListing()
      return
    }

    sendOtpMutation.mutate({ email }, {
      onSuccess: (data) => {
        if (data.success) {
          toast.add({ type: 'success', description: data.message })
          setFormStep('verify')
          setIsOldUser(data.isOldUser)
        }
        setLoading(false)
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod göndərilmədi.', priority: 'high' })
        setLoading(false) // əvvəl yox idi, düymə donub qalırdı
      },
    })
  }

  // ADDIM 2: OTP-ni yoxla, uğur olsa elanı göndər
  const handleVerify = () => {
    if (!isOldUser && name.trim().length < 2) return warn('Adınızı daxil edin')
    if (otp.length < 6) return warn('6 rəqəmli kodu tam daxil edin')

    verifyOtpMutation.mutate({ email, name, otp }, {
      onSuccess: (data) => {
        if (data.success) {
          dispatch(setUser(data.user))
          submitListing()
        } else {
          toast.add({ type: 'error', description: data.message ?? 'Kod yanlışdır.', priority: 'high' })
        }
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod yanlışdır.', priority: 'high' })
      },
    })
  }


  // ADDIM 3: elanı yarat
  const submitListing = async () => {
    const formData = new FormData()

    // Video varsa əvvəlcə onu yükləyirik (yalnız bir dəfə)
    if (video) {
      try {
        const { uploadUrl, key, listingId } = await createVideoUrl()

        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: video,
          headers: { 'Content-Type': video.type },
        })
        if (!res.ok) throw new Error('video upload failed')

        formData.set('listingId', listingId)
        formData.set('video', key)
      } catch {
        toast.add({ type: 'error', description: 'Video yüklənmədi.', priority: 'high' })
        setLoading(false)
        return
      }
    }

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
    formData.append('region', region)
    formData.append('phone', phone.replace(/\s/g, ''))

    if (used !== null) formData.append('used', String(used))
    if (credit !== null) formData.append('credit', String(credit))
    if (barter !== null) formData.append('barter', String(barter))
    if (document !== null) formData.append('document', String(document))

    images.forEach((image) => formData.append('images', image.file))
    equipment.forEach((eq) => formData.append('equipment', eq))

    createEventMutation.mutate(formData, {
      onSuccess: (data) => {
        toast.add({ type: 'success', description: data.message })
        setLoading(false)
        router.push('/')
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Elan yaradıla bilmədi.', priority: 'high' })
        setLoading(false)
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
      {
        formStep === 'start'
        &&
          <div className="flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5">
            <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5] mb-20">

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
                      setVideo={setVideo}
                    />

                    <Step3
                      setForm={handleSendOtp}          // 'setFormAndLogin' əvəzinə
                      isSubmitting={loading}
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

            </div>
          </div>
      }

      {
        formStep === 'verify'
        &&
        <div className='fixed top-1/2 w-full -translate-y-1/2'>
          <Card className="mx-auto max-w-md my-auto">
            <CardHeader>
              <CardTitle>Verify your login</CardTitle>
              <CardDescription>
                Enter the verification code we sent to your email address:{" "}
                <span className="font-medium">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {
                !isOldUser
                &&
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="otp-verification">
                        Ad yazin
                      </FieldLabel>
                    </div>
                    <div>
                      <input value={name} onChange={(e) => setName(e.target.value)} type="text" className='p-3 bg-white w-full rounded border' placeholder='Ad yazin' />
                    </div>
                  </Field>
              }
              
              <Field className='mt-4'>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="otp-verification">
                    Verification code
                  </FieldLabel>
                  <Button variant="outline" size="xs">
                    <RefreshCwIcon />
                    Resend Code
                  </Button>
                </div>
                <InputOTP 
                  maxLength={6} 
                  id="otp-verification" 
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={setOtp}
                  required
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl mx-auto">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl mx-auto">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription>
                  <a href="#">I no longer have access to this email address.</a>
                </FieldDescription>
              </Field>
            </CardContent>
            <CardFooter>
              <Field>
                <Button 
                  type="submit" 
                  size={'lg'} 
                  className="w-full"
                  onClick={handleVerify}
                  disabled={verifyOtpMutation.isPending || otp.length < 6}
                >
                  {verifyOtpMutation.isPending ? 'Yoxlanılır...' : 'Gonder'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Having trouble signing in?{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Contact support
                  </a>
                </div>
              </Field>
            </CardFooter>
          </Card>
        </div>
      }


    </div>
  )

}

export default NewPage