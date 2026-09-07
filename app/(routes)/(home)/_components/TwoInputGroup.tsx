import { Xmark } from "@gravity-ui/icons";
import { useRef } from "react";

interface PlaceholderEffectInputProps {
  stateMin: number;
  setStateMin: React.Dispatch<React.SetStateAction<number>>;
  stateMax: number;
  setStateMax: React.Dispatch<React.SetStateAction<number>>;
  length?: number;
  label?: string
}

export default function TwoInputGroup({
  stateMin,
  setStateMin,
  stateMax,
  setStateMax,
  length = 20,
  label
}: PlaceholderEffectInputProps) {
  const inputRefMin = useRef<HTMLInputElement>(null);
  const inputRefMax = useRef<HTMLInputElement>(null);

  // number -> string
  const formatNumber = (value: number) => {
    if (!value) return "";

    return new Intl.NumberFormat("fr-FR")
      .format(value)
      .replace(/\u202F|\u00A0/g, " ");
  };

  // input string -> number
  const handleMinChange = (value: string) => {
    const cleanValue = value.replace(/\s/g, "");

    if (cleanValue === "") {
      setStateMin(0);
      return;
    }

    // yalnız rəqəmlər
    if (!/^\d+$/.test(cleanValue)) return;

    setStateMin(Number(cleanValue));
  };

  const handleMaxChange = (value: string) => {
    const cleanValue = value.replace(/\s/g, "");

    if (cleanValue === "") {
      setStateMax(0);
      return;
    }

    // yalnız rəqəmlər
    if (!/^\d+$/.test(cleanValue)) return;

    setStateMax(Number(cleanValue));
  };

  return (
    <div className="relative w-full flex">

      {/* MIN */}
      <div className="relative flex items-center w-full">
        <input
          ref={inputRefMin}
          value={formatNumber(stateMin)}
          maxLength={length}
          inputMode="numeric"
          onChange={(e) => handleMinChange(e.target.value)}
          className="peer w-full border rounded-l-lg bg-[#fafbff] px-3 pt-4 pb-2 text-[16px] focus:outline-sky-500"
          placeholder=" "
        />

        <label
          className="
            pointer-events-none
            absolute left-3.5 top-3
            text-base text-gray-500
            transition-all duration-200
            peer-focus:top-1
            peer-focus:text-xs
            peer-[&:not(:placeholder-shown)]:top-1
            peer-[&:not(:placeholder-shown)]:text-xs
          "
        >
          {label ? label : 'min.'}
        </label>

        {stateMin !== 0 && (
          <button
            type="button"
            className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
            onClick={() => setStateMin(0)}
          >
            <Xmark />
          </button>
        )}
      </div>

      {/* MAX */}
      <div className="relative flex items-center w-full">
        <input
          ref={inputRefMax}
          value={formatNumber(stateMax)}
          maxLength={length}
          inputMode="numeric"
          onChange={(e) => handleMaxChange(e.target.value)}
          className="peer w-full rounded-r-lg border border-l-0 bg-[#fafbff] px-3 pt-4 pb-2 text-[16px] focus:outline-sky-500"
          placeholder=" "
        />

        <label
          className="
            pointer-events-none
            absolute left-3.5 top-3
            text-base text-gray-500
            transition-all duration-200
            peer-focus:top-1
            peer-focus:text-xs
            peer-[&:not(:placeholder-shown)]:top-1
            peer-[&:not(:placeholder-shown)]:text-xs
          "
        >
          max.
        </label>

        {stateMax !== 0 && (
          <button
            type="button"
            className="absolute right-2 rounded-full p-1 hover:bg-gray-200"
            onClick={() => setStateMax(0)}
          >
            <Xmark />
          </button>
        )}
      </div>
    </div>
  );
}