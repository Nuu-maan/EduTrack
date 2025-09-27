"use client"

import React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export type DropdownOption = { label: string; value: string; disabled?: boolean }

type DropdownProps = {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  disabled,
}: DropdownProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={triggerClassName || "w-full min-w-[200px]"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.filter((opt) => opt.value !== "").map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
