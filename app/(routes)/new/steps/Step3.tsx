'use client'
import PlaceholderEffectInput from '@/components/inputs/PlaceholderEffectInput'
import React, { Fragment, useState } from 'react'

interface User {
  _id: string,
  name: string,
  email: string
}

interface Step3Props {
  setForm: () => void
  isSubmitting: boolean
  userData: User | undefined
  phone: string
  setPhone: React.Dispatch<React.SetStateAction<string>>
  name: string,
  setName: React.Dispatch<React.SetStateAction<string>>
  email: string
  setEmail: React.Dispatch<React.SetStateAction<string>>
}

const Step3 = ({setForm, isSubmitting, userData, phone, setPhone, name, setName, email, setEmail}: Step3Props) => {

  const phoneInputChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 9);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 7) return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5)}`;

    return `${numbers.slice(0, 2)} ${numbers.slice(2, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7)}`;
  };

  return (
    <Fragment>
      <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-5 bg-white p-5">
        <h3 className="text-xl">Əlaqə nömrəsi *</h3>
        <div>
          <input
            onChange={(e) => phoneInputChange(e.target.value)}
            id='number'
            type="text"
            inputMode="numeric"
            value={phone}
            className='border-2 w-full rounded-2xl p-3 bg-[#f5f5f5]' placeholder='55 555 55 55'
          />
        </div>

        {
          userData
          &&
          <div>
            <button
              onClick={() => setForm()}
              disabled={isSubmitting}
              className="w-full p-4 rounded-xl bg-blue-500 text-white cursor-pointer"
            >
              {isSubmitting ? 'Göndərilir...' : 'Gonder'}
            </button>
          </div>
        }

      </div>

      {
        !userData
        &&
        <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-5 bg-white p-5">
          <h3 className="text-xl">Email ve ad</h3>
          <div>
            <PlaceholderEffectInput state={email} setState={setEmail} label='Email' length={100} />
          </div>
          <div>
            <PlaceholderEffectInput state={name} setState={setName} label='Name' length={100} />
          </div>
          <div>
            <button
              onClick={() => setForm()}
              className="w-full p-4 rounded-xl bg-blue-500 text-white cursor-pointer"
            >
              Gonder
            </button>
          </div>
        </div>
      }
      
    </Fragment>
  )
}

export default Step3