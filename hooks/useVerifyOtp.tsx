'use client'
import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  userId: string;
}

async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const { data } = await api.post<VerifyOtpResponse>(
    '/api/auth/absolute/verify-end',
    payload,
    { withCredentials: true } // cookie qəbul etmək üçün ŞƏRTdir
  )
  return data
}

export const useVerifyOtp = () => {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: verifyOtp
  })
}