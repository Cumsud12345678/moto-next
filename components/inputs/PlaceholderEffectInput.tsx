import { Xmark } from "@gravity-ui/icons";
import { useEffect, useMemo, useRef, useState } from "react";

interface PlaceholderEffectInputProps {
  state: string,
  setState: React.Dispatch<React.SetStateAction<string>>,
  label: string,
  length: number,
}

export default function PlaceholderEffectInput({ state, setState, label, length=20 }: PlaceholderEffectInputProps) {
  
  const inputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (text: string | number) => {
    if (!text) return "";

    if(typeof text === 'string') {
      return text
    }

    return new Intl.NumberFormat("fr-FR")
      .format(Number(text))
      .replace(/\u202F|\u00A0/g, " ");
  };

  const changeInput = (value: string | number) => {
    if(typeof value === 'string') {
      const rawValue = value.replace(/\s/g, "");
      setState(rawValue);
    }
    
    // if (typeof value === 'number') {
    //   const newValue = value
    //   return setState(newValue);
    // }
    
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          value={formatNumber(state)}
          maxLength={length}
          inputMode={typeof state === 'string' ? 'text' : 'numeric'}
          onChange={(e) => changeInput(e.target.value)}
          className="peer w-full rounded-xl border bg-[#fafbff] px-3 pt-6 pb-2 text-[16px] focus:outline-sky-500"
          placeholder=" "
        />

        <label className="pointer-events-none absolute left-3.5 top-4 text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-xs">
          {label}
        </label>

        {state && (
          <button
            type="button"
            className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
            onClick={() => setState('')}
          >
            <Xmark />
          </button>
        )}
      </div>
    </div>
  );
}