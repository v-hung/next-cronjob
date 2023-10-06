"use client"
import React from 'react'

type State = {
  label?: string | null | null,
  name?: string
  required?: boolean | null,
  defaultValue?: string,
  value?: string,
  placeholder?: string,
  onChange?: (data: string) => void
  className?: string
}

const AdminFormFieldText: React.FC<State> = ({
  label,
  name,
  required = false,
  defaultValue,
  value,
  onChange,
  className,
  placeholder
}) => {

  const changeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onChange == 'function') 
      onChange(e.target.value)
  }

  return (
    <div className={className}>
      { label
        ? <p className="text-sm font-medium mb-1 capitalize">{label} { required && <span className="text-red-500">*</span> }</p>
        : null
      }
      <div className="border rounded focus-within:ring-2 ring-blue-500 bg-white">
        <input type='text' name={name} value={value} defaultValue={defaultValue} onChange={(e) => changeEvent(e)} className="w-full px-4 py-2" placeholder={placeholder} required={required || false} />
      </div>
    </div>
  )
}

export default AdminFormFieldText