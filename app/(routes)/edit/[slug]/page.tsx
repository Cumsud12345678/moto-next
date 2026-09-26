'use client'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import Dropzone from '@/components/Dropzone'
import PlaceholderNumberInput from '@/components/inputs/numberType/PlaceholderNumberInput'
import { toast } from '@/components/ui/toast'
import { useImageDrop } from '@/hooks/useImageDrop'
import { authCreateVideoUrl, getListing, updateListing } from '@/lib/api/listings'
import { ProductDescription } from '@/types/product'
import { ArrowsExpand, Xmark } from '@gravity-ui/icons'
import React, { useEffect, useRef, useState } from 'react'

interface ImageFile {
  id: string
  url: string
  file: File
  key?: string // DB-dən gələn köhnə şəkillər üçün orijinal R2 storage key-i (yenilərdə yoxdur)
}

const API_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

// DB-dən gələn şəkil yolları nisbi (məs. "/uploads/xxx.jpg") ola bilər —
// bu halda onları API base URL ilə birləşdiririk. Artıq tam URL-dirsə (http/https
// və ya data: URI) toxunmuruq.
const resolveImageUrl = (url: string) => {
  if (!url) return url
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const EditListingPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  // Client components can't be `async` functions — unwrap the params Promise with React.use() instead.
  const { slug } = React.use(params)

  const [data, setData] = useState<ProductDescription | null>(null)
  const [loading, setLoading] = useState(true)

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [used, setUsed] = useState<boolean | null>(null)
  const [credit, setCredit] = useState<boolean | null>(null)
  const [hasDocument, setHasDocument] = useState<boolean | null>(null)
  const [barter, setBarter] = useState<boolean | null>(null)

  const [power, setPower] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0)

  // const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [images, setImages] = useState<ImageFile[]>([])
  const [description, setDescription] = useState<string>('')

  const [oldVideo, setOldVideo] = useState<string>('')

  const [price, setPrice] = useState<number>(0)

  // Yeni
  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>('')

  const inputRef = useRef<HTMLInputElement>(null)
  
  const handleVideoClick = () => {
    inputRef.current?.click()
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return;

    if (!file.type.startsWith('video')) {
      toast.add({
        type: 'warning',
        description: 'Yalniz video qebul olunur'
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.add({
        type: 'warning',
        description: "Video maksimum 50 MB ola bilər",
      })
      return
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideo(file)

    const previewUrl = URL.createObjectURL(file)
    setVideoPreview(previewUrl)

  }

  const handleDeleteOldVidoe = () => {
    setOldVideo('')
  }

  const handleDeleteVidoe = () => {
    setVideo(null)
    setVideoPreview(null)
  }
  // ------------------------------------------

  // Data fetching has to happen in an effect since the component itself must stay synchronous.
  useEffect(() => {
    let cancelled = false

    const fetchListing = async () => {
      try {
        setLoading(true)
        const result = await getListing(slug)
        if (cancelled) return

        setData(result)
        setUsed(result.used)
        setCredit(result.credit)
        setHasDocument(result.document)
        setBarter(result.barter)
        setPower(result.power)
        setDistance(result.mileage)
        setOldVideo(result.video)
        setPrice(result.price)
        setDescription(result.description)

        // Populate existing images so they show up on the edit page.
        // DB-dən URL-lər nisbi (storage key) gəldiyi üçün resolveImageUrl ilə tam ünvana çeviririk,
        // amma orijinal key-i də saxlayırıq — submit zamanı backend məhz bu key-i gözləyir.
        if (Array.isArray(result.images)) {
          setImages(
            result.images.map((key: string, index: number) => ({
              id: `existing-${index}-${key}`,
              url: resolveImageUrl(key),
              file: new File([], `existing-${index}`),
              key,
            }))
          )
        }

      } catch (err) {
        toast.add({
          type: 'warning',
          description: 'Elan yüklənərkən xəta baş verdi',
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchListing()

    return () => {
      cancelled = true
    }
  }, [slug])

  const {
    handleDragMove,
    handleDragEnd,
    removeImage,
    handleDragStart,
    handleDrop,
  } = useImageDrop({
    images,
    setImages,
    draggedIndex,
    setDraggedIndex,
    overIndex,
    setOverIndex,
  })


  const submitListingUtilFunc = async () => {
    if(video && data){
      const { uploadUrl, key, listingId } = await authCreateVideoUrl(data._id)

      // burda sekili r2 ye gonderirik
      await fetch(uploadUrl, {
        method: "PUT",
        body: video,
        headers: {
          "Content-Type": video.type
        }
      })
      
      submitListing(key)
      
    }else {
      submitListing(oldVideo)
    }
  }

  const [submitting, setSubmitting] = useState(false)

  const submitListing = async (videoKey: string) => {
    // DEBUG: hər şəklin id/key/url-nə bax ki, filter niyə yanlış nəticə verdiyini görək
    console.log('SUBMIT ANINDA IMAGES:', images.map((img) => ({
      id: img.id,
      key: img.key,
      hasKey: !!img.key,
      urlStart: img.url?.slice(0, 25),
    })))

    // Köhnə (DB-dən gələn) şəkillərin hamısında `key` var — yenilərində yoxdur.
    // Filtri resolved URL-ə görə yox, məhz bu `key`-in mövcudluğuna görə aparırıq,
    // çünki backend keepImageKeys-i R2-dəki raw key ilə müqayisə edir (resolved URL ilə yox).
    const keepImageKeys = images
      .filter((img) => !!img.key)
      .map((img) => img.key as string)

    const newImages = images.filter((img) => !img.key)

    console.log('newImages say:', newImages.length)

    const formData = new FormData()

    formData.append('price', String(price))
    formData.append('power', String(power))
    formData.append('mileage', String(distance))
    formData.append('description', description)
    formData.append('video', videoKey)

    if (used !== null) formData.append('used', String(used))
    if (credit !== null) formData.append('credit', String(credit))
    if (barter !== null) formData.append('barter', String(barter))
    if (hasDocument !== null) formData.append('document', String(hasDocument))

    keepImageKeys.forEach((key) => formData.append('keepImageKeys', key))
    newImages.forEach((image) => formData.append('images', image.file))

    try {
      setSubmitting(true)
      // NOT: `@/lib/api/listings` modulunda `updateListing(slug, formData)` funksiyası
      // olmalıdır və PUT /api/listings/:listingId endpoint-inə multipart/form-data
      // sorğusu göndərməlidir. Adı fərqlidirsə, buradakı import/çağırışı ona uyğunlaşdır.
      const data = await updateListing(slug, formData)

      toast.add({
        type: 'success',
        description: data.message,
      })
    } catch (err) {
      toast.add({
        type: 'warning',
        description: 'Elan yenilənərkən xəta baş verdi',
      })
    } finally {
      setSubmitting(false)
    }
  }


  if (loading || !data) {
    return (
      <div className="flex w-full items-center justify-center py-30">
        <span className="text-gray-500">Yüklənir...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5">
        <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]">

          <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
            <div>
              <h3 className="text-xl mb-3">Ayarlar *</h3>
              <div className='grid grid-cols-2 pt-3 gap-3'>
                <div className='flex items-center justify-between w-full pr-5 border-r-3'>
                  <span>Yeni?</span>
                  <CustomSwitch checked={used} setChecked={setUsed} />
                </div>
                <div className='flex items-center justify-between w-full pl-5'>
                  <span>Barter?</span>
                  <CustomSwitch checked={barter} setChecked={setBarter} />
                </div>
                <div className='flex items-center justify-between w-full pr-5 border-r-3'>
                  <span>Kredit?</span>
                  <CustomSwitch checked={credit} setChecked={setCredit} />
                </div>
                <div className='flex items-center justify-between w-full pl-5'>
                  <span>Senedli?</span>
                  <CustomSwitch checked={hasDocument} setChecked={setHasDocument} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-4 bg-white p-5">
            <h3 className="text-xl">Güc və Yürüş</h3>
            <div>
              <PlaceholderNumberInput state={power} setState={setPower} label='Guc a.g.' length={30} />
            </div>
            <div>
              <PlaceholderNumberInput state={distance} setState={setDistance} label='Yuruyush km.' length={30} />
            </div>
          </div>

          <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
            <div>
              <h3 className="text-xl mb-3">Məlumat *</h3>
              <textarea
                className="border focus:outline-sky-500 w-full rounded-xl px-3 py-2 h-32 bg-[#f5f5f5] resize-none"
                placeholder="Motosiklet haqqında vacib məlumatları qeyd edin."
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <span className="text-gray-500">
                {description.length} / 1 000
              </span>
            </div>
          </div>


          {/* Sekil */}
          <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
            <div>
              <h3 className="text-xl mb-3">Şəkillər *</h3>
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    data-image-index={index}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={handleDragEnd}
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl border transition-all ${draggedIndex === index
                        ? 'border-blue-400 opacity-50'
                        : overIndex === index && draggedIndex !== null
                          ? 'border-blue-400 scale-95'
                          : 'border-gray-200'
                        }`}
                    >

                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-25 object-cover pointer-events-none"
                      />

                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute cursor-pointer top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-white shadow-sm hover:bg-gray-100"
                      >
                        <Xmark />
                      </button>

                      <div
                        onPointerDown={(e) => handleDragStart(e, index)}
                        style={{ touchAction: 'none' }}
                        className="absolute cursor-grab active:cursor-grabbing top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
                      >
                        <ArrowsExpand />
                      </div>

                    </div>
                  </div>
                ))}

                <div>
                  <Dropzone onDrop={handleDrop} />
                </div>

              </div>
              <p className="text-md mt-4">Şəkillərin sırasını dəyişmək üçün sol yuxarı küncdəki tutacaqdan sürükləyin. Minimum 1, maksimum 10 şəkil</p>

              <p>Video əlavə et</p>
              {
                oldVideo
                  ?
                  <div className='relative'>
                    <button
                      onClick={handleDeleteOldVidoe}
                      className='absolute top-0 right-0 m-3 bg-red-500 p-2 rounded-full'
                    >
                      <Xmark className='size-5 text-white' />
                    </button>
                    <video
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${oldVideo}`}
                      controls
                      playsInline
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                  :
                  videoPreview
                    ?
                    <div className='relative'>
                      <button
                        onClick={handleDeleteVidoe}
                        className='absolute top-0 right-0 m-3 bg-red-500 p-2 rounded-full'
                      >
                        <Xmark className='size-5 text-white' />
                      </button>
                      <video
                        src={videoPreview}
                        controls
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                    :
                    <div
                      onClick={handleVideoClick}
                      className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center"
                    >

                      <span className="text-sm text-gray-500">
                        Kliklə və video seç
                      </span>

                      <input
                        ref={inputRef}
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={handleVideoChange}
                      />
                    </div>
                  
              }
            </div>
          </div>

          <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-5 bg-white p-5">
            <h3 className="text-xl">Qiymət</h3>
            
            <div>
              <PlaceholderNumberInput state={price} setState={setPrice} label={'Qiymət *'} length={30} />
            </div>
          </div>

          <button
            onClick={submitListingUtilFunc}
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-sky-500 px-6 py-3 text-white disabled:opacity-50"
          >
            {submitting ? 'Göndərilir...' : 'Yadda saxla'}
          </button>

        </div>
      </div>
    </div>

  )
}

export default EditListingPage