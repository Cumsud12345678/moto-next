'use client'
import { Fragment, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAxiosError } from 'axios'
import { ArrowsExpand, Xmark } from '@gravity-ui/icons'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import Dropzone from '@/components/Dropzone'
import SearchAndSelect from '@/components/inputs/SearchAndSelect'
import PlaceholderNumberInput from '@/components/inputs/numberType/PlaceholderNumberInput'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import Step3 from '../../new/steps/Step3'
import { useImageDrop } from '@/hooks/useImageDrop'
import { useMetadata } from '@/hooks/useMetadata'
import { useSendOtp } from '@/hooks/useSendOtp'
import { useVerifyOtp } from '@/hooks/useVerifyOtp'
import { createPart, updatePart } from '@/lib/api/parts'
import { partPath } from '@/lib/slug'
import { fetchMe, setUser } from '@/redux/slices/userSlice'
import { AppDispatch, RootState } from '@/redux/store'
import type { PartCondition, PartRaw } from '@/types/part'
import type { Default } from '@/types/metadata'

interface FormImage {
  id: string
  url: string
  file: File
  // Düzəlişdə köhnə şəkil: R2 açarı
  key?: string
}

const formatPhone = (value: string) => {
  const n = value.replace(/\D/g, '').slice(-9)
  if (n.length <= 2) return n
  if (n.length <= 5) return `${n.slice(0, 2)} ${n.slice(2)}`
  if (n.length <= 7) return `${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`
  return `${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`
}

const errorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string, errors?: { fieldErrors?: Record<string, string[]> } } | undefined
    const firstField = data?.errors?.fieldErrors && Object.values(data.errors.fieldErrors).flat()[0]
    return data?.message || firstField || fallback
  }
  return fallback
}

const section = 'lg:p-10 lg:border rounded-3xl flex flex-col gap-5 bg-white p-5'

// Hissə elanı forması: yeni elan və düzəliş üçün ortaq
const PartForm = ({ initial }: { initial?: PartRaw }) => {
  const isEdit = !!initial
  const dispatch = useDispatch<AppDispatch>()
  const { metadata, isLoading } = useMetadata()

  const user = useSelector((s: RootState) => s.user.user)
  const authLoading = useSelector((s: RootState) => s.user.loading)
  const authInitialized = useSelector((s: RootState) => s.user.initialized)
  const authError = useSelector((s: RootState) => s.user.error)
  const authReady = authInitialized && !authLoading

  const [title, setTitle] = useState(initial?.title ?? '')
  const [partCategory, setPartCategory] = useState(initial?.partCategory ?? '')
  const [condition, setCondition] = useState<PartCondition>(initial?.condition ?? 'used')
  const [make, setMakeState] = useState(initial?.make ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [price, setPrice] = useState<number>(initial?.price ?? 0)
  const [delivery, setDelivery] = useState<boolean | null>(initial?.delivery ?? false)
  const [phone, setPhone] = useState(initial?.phone ? formatPhone(String(initial.phone)) : '')
  const [images, setImages] = useState<FormImage[]>(
    () => (initial?.images ?? []).map((key, i) => ({
      id: `existing-${i}-${key}`,
      url: `${process.env.NEXT_PUBLIC_IMAGE_URL}/${key}`,
      file: new File([], `existing-${i}`),
      key,
    }))
  )

  // Qonaq üçün email + OTP
  const [formStep, setFormStep] = useState<'form' | 'verify'>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [isOldUser, setIsOldUser] = useState(false)
  const sendOtp = useSendOtp()
  const verifyOtp = useVerifyOtp()

  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const { handleDragMove, handleDragEnd, removeImage, handleDragStart, handleDrop } = useImageDrop({
    images, setImages, draggedIndex, setDraggedIndex, overIndex, setOverIndex,
  })

  const models = useMemo<Default[]>(
    () => (make && metadata ? metadata.models.filter((m) => m.make === make) : []),
    [make, metadata]
  )

  const setMake: React.Dispatch<React.SetStateAction<string>> = (value) => {
    const next = typeof value === 'function' ? value(make) : value
    if (next !== make) setModel('')
    setMakeState(next)
  }

  const warn = (description: string) => {
    toast.add({ type: 'warning', description })
    return false
  }

  const validate = () => {
    if (title.trim().length < 3) return warn('Elanın adını yazın (ən azı 3 simvol)')
    if (!partCategory) return warn('Kateqoriya seçin')
    if (images.length < 1) return warn('Ən azı 1 şəkil əlavə edin')
    if (images.length > 10) return warn('Maksimum 10 şəkil əlavə edə bilərsiniz')
    if (description.length > 2000) return warn('Təsvir maksimum 2000 simvol ola bilər')
    if (!region) return warn('Şəhər seçin')
    if (!price || price <= 0) return warn('Qiymət 0-dan böyük olmalıdır')
    if (phone.replace(/\D/g, '').length !== 9) return warn('Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır')
    if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())) return warn('Düzgün email daxil edin')
    return true
  }

  const submit = async () => {
    const fd = new FormData()
    fd.append('title', title.trim())
    fd.append('partCategory', partCategory)
    fd.append('condition', condition)
    fd.append('make', make)
    fd.append('model', model)
    fd.append('description', description)
    fd.append('region', region)
    fd.append('price', String(price))
    fd.append('phone', phone.replace(/\D/g, ''))
    fd.append('delivery', String(!!delivery))
    images.filter((img) => !img.key).forEach((img) => fd.append('images', img.file))
    if (isEdit) images.filter((img) => img.key).forEach((img) => fd.append('keepImageKeys', img.key as string))

    try {
      const data = isEdit ? await updatePart(initial!._id, fd) : await createPart(fd)
      toast.add({ type: 'success', description: data.message })
      const saved = data.data as { _id: string, title: string }
      // Yönləndirmə bitənə qədər düymə kilidli qalır
      window.location.href = partPath(saved.title, saved._id)
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, isEdit ? 'Elan yenilənmədi' : 'Elan yaradıla bilmədi'), priority: 'high' })
      setSubmitting(false)
      submittingRef.current = false
      setFormStep('form')
    }
  }

  const handleSubmit = () => {
    if (submittingRef.current || !authReady) return
    if (!validate()) return

    submittingRef.current = true
    setSubmitting(true)

    if (user) {
      submit()
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    setEmail(cleanEmail)
    sendOtp.mutate({ email: cleanEmail }, {
      onSuccess: (data) => {
        if (data.success) {
          toast.add({ type: 'success', description: data.message })
          setIsOldUser(data.isOldUser)
          setFormStep('verify')
        }
        setSubmitting(false)
        submittingRef.current = false
      },
      onError: (err) => {
        toast.add({ type: 'error', description: errorMessage(err, 'Kod göndərilmədi.'), priority: 'high' })
        setSubmitting(false)
        submittingRef.current = false
      },
    })
  }

  const handleVerify = () => {
    if (submittingRef.current) return
    if (!isOldUser && name.trim().length < 2) return warn('Adınızı daxil edin')
    if (otp.length < 6) return warn('6 rəqəmli kodu tam daxil edin')

    verifyOtp.mutate({ email: email.trim().toLowerCase(), name: name.trim(), otp }, {
      onSuccess: (data) => {
        if (data.success) {
          dispatch(setUser(data.user))
          submittingRef.current = true
          setSubmitting(true)
          submit()
        } else {
          toast.add({ type: 'error', description: data.message ?? 'Kod yanlışdır.', priority: 'high' })
        }
      },
      onError: (err) => {
        toast.add({ type: 'error', description: errorMessage(err, 'Kod yanlışdır.'), priority: 'high' })
      },
    })
  }

  const heading = isEdit ? 'Hissə elanına düzəliş' : 'Yeni hissə elanı'

  if (isLoading || !metadata) {
    return (
      <div className='flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5'>
        <div className='lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]'>
          <div className='flex items-center justify-center p-4 bg-white mt-3 lg:mt-0'>
            <h1 className='lg:text-3xl text-2xl font-bold'>{heading}</h1>
          </div>
          <div className='lg:p-10 border rounded-3xl bg-white p-5 flex items-center justify-center'>
            <Spinner />
          </div>
        </div>
      </div>
    )
  }

  if (formStep === 'verify') {
    return (
      <div className='fixed top-1/2 w-full -translate-y-1/2 px-3'>
        <Card className='mx-auto max-w-md my-auto'>
          <CardHeader>
            <CardTitle className='text-xl'>Girişinizi təsdiqləyin</CardTitle>
            <CardDescription>{email} E-poçt ünvanınıza göndərdiyimiz təsdiq kodunu daxil edin.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isOldUser && (
              <Field>
                <FieldLabel htmlFor='part-name'>Ad yazın</FieldLabel>
                <input id='part-name' value={name} onChange={(e) => setName(e.target.value)} type='text' className='p-3 bg-white w-full rounded-lg border' placeholder='Ad yazın' />
              </Field>
            )}
            <Field className='mt-4'>
              <FieldLabel htmlFor='part-otp'>Təsdiqləmə kodu</FieldLabel>
              <InputOTP maxLength={6} id='part-otp' pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp} required>
                <InputOTPGroup className='*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl mx-auto'>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className='*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl mx-auto'>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </Field>
          </CardContent>
          <CardFooter>
            <Button size='lg' className='w-full py-5' onClick={handleVerify} disabled={verifyOtp.isPending || submitting || otp.length < 6}>
              {verifyOtp.isPending ? 'Yoxlanılır...' : submitting ? 'Elan göndərilir...' : 'Göndər'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5'>
      <div className='lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5] mb-20'>
        <div className='flex items-center justify-center p-4 bg-white mt-3 lg:mt-0'>
          <h1 className='lg:text-3xl text-2xl font-bold'>{heading}</h1>
        </div>

        <div className={section}>
          <h3 className='text-xl'>Hissə haqqında *</h3>
          {/* PlaceholderEffectInput boşluqları silir, ona görə ad üçün eyni görünüşlü adi input */}
          <div className='relative flex items-center'>
            <input
              id='part-title'
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className='peer w-full rounded-xl border bg-[#fafbff] px-3 pt-6 pb-2 text-[16px] focus:outline-sky-500'
              placeholder=' '
            />
            <label htmlFor='part-title' className='pointer-events-none absolute left-3.5 top-4 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-xs'>
              Elanın adı, məs: Yamaha R1 porşeni
            </label>
          </div>
          <SearchAndSelect data={metadata.partCategories ?? []} state={partCategory} setState={setPartCategory} label='Kateqoriya' />
          <div>
            <p className='mb-2'>Vəziyyəti</p>
            <div className='flex'>
              {(['new', 'used'] as const).map((c, i) => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setCondition(c)}
                  className={`px-4 py-3 w-full cursor-pointer border ${i === 0 ? 'rounded-l-sm' : 'rounded-r-sm border-l-0'} ${condition === c ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-200'}`}
                >
                  {c === 'new' ? 'Yeni' : 'İşlənmiş'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={section}>
          <div>
            <h3 className='text-xl'>Hansı motosikletə uyğundur</h3>
            <p className='text-gray-500 text-sm mt-1'>Könüllü. Universal hissədirsə boş saxlayın.</p>
          </div>
          <SearchAndSelect data={metadata.makes} state={make} setState={setMake} label='Marka' />
          {make
            ? <SearchAndSelect data={models} state={model} setState={setModel} label='Model' />
            : <div className='border bg-gray-100 p-3 rounded text-gray-500'>Model</div>}
        </div>

        <div className={section}>
          <h3 className='text-xl'>Təsvir</h3>
          <div>
            <textarea
              className='border focus:outline-sky-500 w-full rounded-xl px-3 py-2 h-32 bg-[#f5f5f5] resize-none'
              placeholder='Hissənin vəziyyəti, orijinal və ya analoq olması, uyğun illər və s.'
              value={description}
              maxLength={2000}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className='text-gray-500'>{description.length} / 2 000</span>
          </div>
        </div>

        <div className={section}>
          <h3 className='text-xl'>Şəkillər *</h3>
          <div className='grid grid-cols-3 lg:grid-cols-4 gap-2'>
            {images.map((img, index) => (
              <div key={img.id} data-image-index={index} onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerCancel={handleDragEnd}>
                <div className={`relative overflow-hidden rounded-2xl border transition-all ${draggedIndex === index ? 'border-blue-400 opacity-50' : overIndex === index && draggedIndex !== null ? 'border-blue-400 scale-95' : 'border-gray-200'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- yerli önizləmə (blob URL) */}
                  <img src={img.url} alt='' className='w-full h-25 object-cover pointer-events-none' />
                  <button type='button' onClick={() => removeImage(img.id)} aria-label='Şəkli sil' className='absolute cursor-pointer top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100'>
                    <Xmark />
                  </button>
                  <div onPointerDown={(e) => handleDragStart(e, index)} style={{ touchAction: 'none' }} className='absolute cursor-grab active:cursor-grabbing top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100'>
                    <ArrowsExpand />
                  </div>
                </div>
              </div>
            ))}
            <Dropzone onDrop={handleDrop} />
          </div>
          <p>Şəkillərin sırasını dəyişmək üçün sol yuxarı küncdəki tutacaqdan sürükləyin. Minimum 1, maksimum 10 şəkil</p>
        </div>

        <div className={section}>
          <h3 className='text-xl'>Şəhər və Qiymət</h3>
          <SearchAndSelect data={metadata.cities} state={region} setState={setRegion} label='Şəhər' />
          <PlaceholderNumberInput state={price} setState={setPrice} label='Qiymət, AZN *' length={30} />
          <div className='flex items-center justify-between border rounded-xl p-3'>
            <span>Çatdırılma var?</span>
            <CustomSwitch checked={delivery} setChecked={setDelivery} />
          </div>
        </div>

        {!authReady ? (
          <div className='lg:p-10 lg:border rounded-3xl flex items-center justify-center bg-white p-5'>
            <Spinner />
          </div>
        ) : authError && !user ? (
          <div className='lg:p-10 lg:border rounded-3xl flex flex-col items-center gap-3 bg-white p-5'>
            <p>Serverlə əlaqə qurulmadı.</p>
            <button onClick={() => dispatch(fetchMe())} className='px-4 py-2 rounded-xl bg-blue-500 text-white'>
              Yenidən cəhd et
            </button>
          </div>
        ) : (
          <Fragment>
            <Step3
              setForm={handleSubmit}
              isSubmitting={submitting}
              userData={user ?? undefined}
              phone={phone}
              setPhone={setPhone}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
            />
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default PartForm
