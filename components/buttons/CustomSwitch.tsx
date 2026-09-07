import { SetStateAction, useState } from "react";

export default function CustomSwitch({checked, setChecked}: {checked: boolean | null, setChecked: React.Dispatch<SetStateAction<boolean | null>>}) {
  
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className={`
        relative flex h-6 w-11 shrink-0 cursor-pointer items-center
        rounded-full p-1 transition-colors duration-200
        ${checked ? "bg-sky-500" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          block h-4 w-4 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}