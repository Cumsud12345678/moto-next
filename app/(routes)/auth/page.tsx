'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from '@/components/ui/toast'
import { useSendOtp } from '@/hooks/useSendOtp'
import { useVerifyOtp } from '@/hooks/useVerifyOtp'
import { setUser } from '@/redux/slices/userSlice'
import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useRouter } from 'next/navigation'

const AuthPage = () => {

  const dispatch = useDispatch()
  const router = useRouter()

  const [formStep, setFormStep] = useState<string>('start')
  const [isOldUser, setIsOldUser] = useState<boolean>(false)

  const [email, setEmail] = useState<string>('')
  const [loginStartLoading, setLoginStartLoading] = useState<boolean>(false)

  const sendOtpMutation = useSendOtp()
  const verifyOtpMutation = useVerifyOtp()

  const handleSendOtp = () => {
    sendOtpMutation.mutate({ email }, {
      onSuccess: (data) => {
        if (data.success) {
          toast.add({
            type: 'success',
            description: 'Kod gonderildi'
          })
          setLoginStartLoading(false)
          setIsOldUser(data.isOldUser)
          setFormStep('verify')
        }
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod göndərilmədi.', priority: 'high' })
      }
    })
  }

  const [name, setName] = useState<string>('')
  const [otp, setOtp] = useState<string>('')

  // ADDIM 2: OTP-ni yoxla, uğur olsa elanı göndər
  const handleVerify = () => {
    verifyOtpMutation.mutate({ email, name, otp }, {
      onSuccess: (data) => {
        if (data.success) {
          dispatch(setUser(data.user))
          router.push('/')
        }
      },
      onError: () => {
        toast.add({ type: 'error', description: 'Kod yanlışdır.', priority: 'high' })
      },
    })
  }

  return (
    <div className=''>
      {
        formStep === 'start'
        ?
          <div className='fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 p-4 w-full'>
            <div className='flex p-8 flex-col bg-white shadow-lg rounded-xl border-2'>
              <h3 className='text-2xl font-semibold mx-auto'>Login</h3>
              <div>
                <div className='my-3'>
                  <label htmlFor="" className='block'>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className='p-2 px-3 border-2 w-full rounded-lg' placeholder='example@gmail.com' />
                </div>
                <div>
                  <button
                    disabled={loginStartLoading}
                    onClick={handleSendOtp}
                    className={`bg-blue-500 text-white p-2 w-full rounded-lg ${loginStartLoading && 'opacity-70'}`}
                  >
                    {
                      loginStartLoading
                        ?
                        'Kod gonderilir...'
                        :
                        'Kod gonder'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        :
        <div className='fixed top-1/2 w-full -translate-y-1/2'>
          <Card className="mx-auto max-w-md my-auto">
            <CardHeader>
              <CardTitle>Verify your login</CardTitle>
              <CardDescription>
                Enter the verification code we sent to your email address:{" "}
                <span className="font-medium">m@example.com</span>.
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

export default AuthPage