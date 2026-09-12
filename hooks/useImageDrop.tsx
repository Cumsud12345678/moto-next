import { toast } from "@/components/ui/toast";
import imageCompression from 'browser-image-compression'

interface ImageFile {
  id: string
  url: string
  file: File
}

interface useImageDropProps {
  images: ImageFile[]
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>
  draggedIndex: number | null
  setDraggedIndex: React.Dispatch<React.SetStateAction<number | null>>
  overIndex: number | null
  setOverIndex: React.Dispatch<React.SetStateAction<number | null>>
}

export const useImageDrop = ({images, setImages, draggedIndex, setDraggedIndex, overIndex, setOverIndex}: useImageDropProps) => {

  const handleDrop = async (files: File[]) => {

    console.log(files.length)

    if (images.length + files.length > 10) {
      toast.add({
        type: "warning",
        title: "Maksimum 10 şəkil əlavə edə bilərsiniz"
      });
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      initialQuality: 0.85,
      useWebWorker: true
    }

    const compressedImages = await Promise.all(
      files.map(async (file) => {
        const compressedBlob = await imageCompression(file, options)

        // ✅ orijinal adı və tipi qoruyaraq real File obyekti yarat
        const compressedFile = new File(
          [compressedBlob],
          file.name,              // orijinal ad (uzantı daxil) saxlanılır
          { type: compressedBlob.type || file.type }
        )

        return {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(compressedFile),
          file: compressedFile
        }
      })
    )

    setImages((prev) => [...prev, ...compressedImages])
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter((img) => img.id !== id)
    })
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0
    ) return

    setImages((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev

      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)

      if (!moved) return prev

      updated.splice(toIndex, 0, moved)

      return updated
    })
  }


  const handleDragStart = (
    e: React.PointerEvent,
    index: number
  ) => {
    setDraggedIndex(index)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleDragMove = (e: React.PointerEvent) => {
    if (draggedIndex === null) return

    const target = window.document.elementFromPoint(
      e.clientX,
      e.clientY
    )

    const card = target?.closest('[data-image-index]')

    if (card) {
      const index = Number(
        card.getAttribute('data-image-index')
      )

      if (!Number.isNaN(index)) {
        setOverIndex(index)
      }
    }
  }

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      overIndex !== null &&
      draggedIndex !== overIndex
    ) {
      reorderImages(draggedIndex, overIndex)
    }

    setDraggedIndex(null)
    setOverIndex(null)
  }


  return {
    handleDragMove,
    handleDragEnd,
    removeImage,
    handleDragStart,
    handleDrop,
  }

}