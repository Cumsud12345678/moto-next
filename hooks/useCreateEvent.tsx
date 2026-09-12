'use client'
import { api } from "@/lib/axios"
import { useMutation } from "@tanstack/react-query"

interface CreateEventResponse {
  success: boolean,
  data: { _id: string }
}

async function sendEvent(fotmData: FormData): Promise<CreateEventResponse> {
  const { data } = await api.post(
    '/api/listings',
    fotmData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    }
  )

  return data
}

export const useCreateEvent = () => {
  return useMutation<CreateEventResponse, Error, FormData>({
    mutationFn: sendEvent
  })
}

