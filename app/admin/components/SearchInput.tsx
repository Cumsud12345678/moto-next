'use client'
import { useState } from 'react'
import { Magnifier, Xmark } from '@gravity-ui/icons'

interface SearchInputProps {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
}

// Enter basanda axtarır (hər hərfdə sorğu göndərmir)
export default function SearchInput({ value, onSearch, placeholder = 'Axtar...' }: SearchInputProps) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)

  // URL dəyişəndə (məs. "Təmizlə") input da yenilənsin
  if (value !== synced) {
    setSynced(value)
    setText(value)
  }

  return (
    <form
      className="relative w-full sm:w-80"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(text.trim())
      }}
    >
      <Magnifier className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border bg-white pl-9 pr-8 text-sm focus:outline-sky-500"
      />
      {text && (
        <button
          type="button"
          aria-label="Təmizlə"
          onClick={() => {
            setText('')
            onSearch('')
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-gray-100"
        >
          <Xmark className="size-4" />
        </button>
      )}
    </form>
  )
}
