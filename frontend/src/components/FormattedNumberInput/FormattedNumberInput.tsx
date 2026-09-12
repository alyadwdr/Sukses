import type { CSSProperties } from 'react'

interface FormattedNumberInputProps {
  value: string
  onChange: (rawDigits: string) => void
  placeholder?: string
  required?: boolean
  style?: CSSProperties
}

export default function FormattedNumberInput({ value, onChange, placeholder, required, style }: FormattedNumberInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(digits)
  }

  const display = value ? Number(value).toLocaleString('id-ID') : ''

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      style={style}
    />
  )
}