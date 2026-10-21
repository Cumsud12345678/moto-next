'use client'
import { useFilter } from '@/hooks/useFilter'
import axios from 'axios'
import { Spinner } from "@/components/ui/spinner"
import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import { Fragment, useEffect, useRef, useState } from 'react'
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
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, setUser } from '@/redux/slices/userSlice'
import { AppDispatch, RootState } from '@/redux/store'

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
  const [isOldUser, setIsOldUser] = useState<boolean>(false)

  const dispatch = useDispatch<AppDispatch>()

  const router = useRouter()

  // Əvvəl bu səhifə /me-ni ÖZÜ çəkirdi və sorğu düşəndə (timeout, Render yuxu rejimi)
  // giriş etmiş istifadəçiyə email + OTP formu göstərilirdi → "təkrar qeydiyyat".
  // İndi AuthProvider-in Redux-dakı nəticəsini istifadə edirik.
  const reduxUser = useSelector((state: RootState) => state.user.user)
  const authLoading = useSelector((state: RootState) => state.user.loading)
  const authInitialized = useSelector((state: RootState) => state.user.initialized)
  const authError = useSelector((state: RootState) => state.user.error)
  const userData: User | undefined = reduxUser ?? undefined
  const authReady = authInitialized && !authLoading

  // Dublikat qoruması: eyni anda yalnız bir göndərmə
  const submittingRef = useRef(false)
  const verifyingRef = useRef(false)
  // Bu formun unikal açarı — təkrar göndərilsə backend eyni elanı qaytarır
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )

  const errorMessage = (err: unknown, fallback: string) => {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    return msg || fallback
  }

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
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())
      if (!emailOk) return warn('Düzgün email daxil edin')
    }

    return true
  }

  // ADDIM 1: email+name+phone göndər, OTP istə (yalnız userData yoxdursa lazımdır)
  const handleSendOtp = () => {
    // setLoading növbəti render-də tətbiq olunur, ona görə sürətli double click
    // funksiyanı 2 dəfə çağırırdı. ref dərhal dəyişir.
    if (submittingRef.current) return
    if (!authReady) return
    if (!validateListing()) return

    submittingRef.current = true
    setLoading(true)

    if (userData) {
      submitListing()
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    setEmail(cleanEmail)

    sendOtpMutation.mutate({ email: cleanEmail }, {
      onSuccess: (data) => {
        if (data.success) {
          toast.add({ type: 'success', description: data.message })
          setFormStep('verify')
          setIsOldUser(data.isOldUser)
        }
        setLoading(false)
        submittingRef.current = false
      },
      onError: (err) => {
        toast.add({ type: 'error', description: errorMessage(err, 'Kod göndərilmədi.'), priority: 'high' })
        setLoading(false)
        submittingRef.current = false
      },
    })
  }

  // ADDIM 2: OTP-ni yoxla, uğur olsa elanı göndər
  const handleVerify = () => {
    if (verifyingRef.current || submittingRef.current) return
    if (!isOldUser && name.trim().length < 2) return warn('Adınızı daxil edin')
    if (otp.length < 6) return warn('6 rəqəmli kodu tam daxil edin')

    verifyingRef.current = true

    verifyOtpMutation.mutate({ email: email.trim().toLowerCase(), name: name.trim(), otp }, {
      onSuccess: (data) => {
        verifyingRef.current = false
        if (data.success) {
          // İstifadəçi artıq giriş edib. Elan alınmasa belə, yenidən OTP istənməyəcək.
          dispatch(setUser(data.user))
          submittingRef.current = true
          setLoading(true)
          submitListing()
        } else {
          toast.add({ type: 'error', description: data.message ?? 'Kod yanlışdır.', priority: 'high' })
        }
      },
      onError: (err) => {
        verifyingRef.current = false
        toast.add({ type: 'error', description: errorMessage(err, 'Kod yanlışdır.'), priority: 'high' })
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
        submittingRef.current = false
        setFormStep('start')
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

    createEventMutation.mutate({ formData, idempotencyKey: idempotencyKeyRef.current }, {
      onSuccess: (data) => {
        toast.add({ type: 'success', description: data.message })
        // submittingRef-i sıfırlamırıq: səhifə yönləndirilənə qədər düymə kilidli qalsın
        window.location.href = '/'
      },
      onError: (err) => {
        toast.add({ type: 'error', description: errorMessage(err, 'Elan yaradıla bilmədi.'), priority: 'high' })
        setLoading(false)
        submittingRef.current = false
        // OTP təsdiqindən sonra elan alınmasa, istifadəçi artıq login olub —
        // formaya qaytarırıq ki, "Göndər" ilə yenidən cəhd etsin (yeni kod istəmədən).
        // Eyni idempotency açarı göndərilir, ona görə dublikat yaranmır.
        setFormStep('start')
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

  // console.log(userData)

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

                    {
                      !authReady
                      ?
                        <div className="lg:p-10 lg:border rounded-3xl flex items-center justify-center bg-white p-5">
                          <Spinner />
                        </div>
                      :
                      authError && !userData
                      ?
                        <div className="lg:p-10 lg:border rounded-3xl flex flex-col items-center gap-3 bg-white p-5">
                          <p>Serverlə əlaqə qurulmadı.</p>
                          <button
                            onClick={() => dispatch(fetchMe())}
                            className="px-4 py-2 rounded-xl bg-blue-500 text-white"
                          >
                            Yenidən cəhd et
                          </button>
                        </div>
                      :
                        <Step3
                          setForm={handleSendOtp}
                          isSubmitting={loading}
                          userData={userData}
                          phone={phone}
                          setPhone={setPhone}
                          name={name}
                          setName={setName}
                          email={email}
                          setEmail={setEmail}
                        />
                    }

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
              <CardTitle className='text-xl'>Girişinizi təsdiqləyin</CardTitle>
              <CardDescription>
                {email} E-poçt ünvanınıza göndərdiyimiz təsdiq kodunu daxil edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {
                !isOldUser
                &&
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="otp-verification">
                        Ad yazın
                      </FieldLabel>
                    </div>
                    <div>
                      <input value={name} onChange={(e) => setName(e.target.value)} type="text" className='p-3 bg-white w-full rounded-lg border' placeholder='Ad yazın' />
                    </div>
                  </Field>
              }
              
              <Field className='mt-4'>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="otp-verification">
                    Təsdiqləmə kodu
                  </FieldLabel>
                  {/* <Button variant="outline" size="xs">
                    <RefreshCwIcon />
                    Resend Code
                  </Button> */}
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
                {/* <FieldDescription>
                  <a href="#">I no longer have access to this email address.</a>
                </FieldDescription> */}
              </Field>
            </CardContent>
            <CardFooter>
              <Field>
                <Button 
                  type="submit" 
                  size={'lg'} 
                  className="w-full py-5"
                  onClick={handleVerify}
                  disabled={verifyOtpMutation.isPending || loading || otp.length < 6}
                >
                  {verifyOtpMutation.isPending ? 'Yoxlanılır...' : loading ? 'Elan göndərilir...' : 'Göndər'}
                </Button>
                {/* <div className="text-sm text-muted-foreground">
                  Having trouble signing in?{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Contact support
                  </a>
                </div> */}
              </Field>
            </CardFooter>
          </Card>
        </div>
      }


    </div>
  )

}

export default NewPage