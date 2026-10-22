'use client'
import { useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera } from '@gravity-ui/icons'
import { Button } from '@/components/ui/button'
import { imageSrc } from '../_lib/utils'

interface ImagePickerProps {
  // Serverdə olan şəkil (R2 açarı). Yeni fayl seçilməyibsə bu göstərilir
  currentKey?: string | null
  file: File | null
  onChange: (file: File | null) => void
  aspect?: 'square' | 'wide'
  hint?: string
}

const MAX_MB = 5

// Tək şəkil seçmək üçün: önizləmə, dəyişmək, ləğv etmək
export default function ImagePicker({ currentKey, file, onChange, aspect = 'square', hint }: ImagePickerProps) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const { getRootProps, getInputProps, isDragActive, open, fileRejections } = useDropzone({
    onDrop: (files) => files[0] && onChange(files[0]),
    accept: { 'image/png': [], 'image/jpeg': [], 'image/webp': [], 'image/gif': [], 'image/svg+xml': [] },
    multiple: false,
    maxSize: MAX_MB * 1024 * 1024,
    noClick: !!(file || currentKey),
  })

  const src = previewUrl ?? (currentKey ? imageSrc(currentKey) : null)
  const boxClass = aspect === 'wide' ? 'aspect-[4/1] w-full' : 'size-32'

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={`relative flex ${boxClass} cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed ${
          isDragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: önizləmə next/image ilə işləmir
          <img src={src} alt="" className="size-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 p-2 text-center text-gray-500">
            <Camera className="size-7" />
            <span className="text-xs">Şəkil seçin və ya bura atın</span>
          </div>
        )}
      </div>

      {(file || currentKey) && (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={open}>
            Şəkli dəyiş
          </Button>
          {file && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
              {currentKey ? 'Köhnəyə qaytar' : 'Sil'}
            </Button>
          )}
        </div>
      )}

      {fileRejections.length > 0 && (
        <p className="text-xs text-red-600">Şəkil {MAX_MB}MB-dan böyük olmamalı və png, jpg, webp, gif və ya svg olmalıdır.</p>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
