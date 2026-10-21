'use client'
import { api } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query"

interface CreateEventResponse {
  success: boolean
  message: string
  data: { _id: string }
  duplicate?: boolean
}

interface CreateEventPayload {
  formData: FormData
  // Eyni elan formu üçün həmişə eyni açar göndərilir.
  // Backend bu açarla ikinci sorğunu tanıyıb yeni elan YARATMIR.
  idempotencyKey: string
}

async function sendEvent({ formData, idempotencyKey }: CreateEventPayload): Promise<CreateEventResponse> {
  const { data } = await api.post(
    '/api/listings',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Idempotency-Key': idempotencyKey,
      },
      withCredentials: true,
      // Şəkillər serverdə emal olunur və R2-yə yüklənir — bu uzun çəkə bilər.
      // Əvvəl 10 san. idi: brauzer "xəta" göstərirdi, amma server elanı yaradırdı,
      // istifadəçi yenidən basırdı və 2-ci elan yaranırdı.
      timeout: 120000,
    }
  )

  return data
}

export const useCreateEvent = () => {
  return useMutation<CreateEventResponse, Error, CreateEventPayload>({
    mutationFn: sendEvent
  })
}
