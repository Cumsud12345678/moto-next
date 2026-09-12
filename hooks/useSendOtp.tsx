'use client'
import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface SendOtpPayload {
  email: string,
  name?: string
}

interface SendOtpResponse {
  success: boolean,
}

async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
  const { data } = await api.post<SendOtpResponse>(
    '/api/auth/absolute/verify-start',
    payload,
    { withCredentials: true }
  )

  return data
}

export const useSendOtp = () => {
  return useMutation<SendOtpResponse, Error, SendOtpPayload>({
    mutationFn: sendOtp
  })
}
