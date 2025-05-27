"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Send } from "lucide-react"

interface Option {
  value: string
  label: string
  description?: string
}

interface SingleChoiceProps {
  options: Option[]
  onSelect: (value: string) => void
}

export function SingleChoice({ options, onSelect }: SingleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    setSelected(value)
  }

  const handleSubmit = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-4 bg-secondary/50 rounded-lg mt-2">
      <RadioGroup value={selected || ""} onValueChange={handleSelect}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2 py-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="cursor-pointer">
              {option.label}
              {option.description && <span className="text-xs text-muted-foreground ml-2">{option.description}</span>}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleSubmit} disabled={!selected} className="self-end">
        <Send className="h-4 w-4 mr-2" />
        Enviar
      </Button>
    </div>
  )
}

interface MultiChoiceProps {
  options: Option[]
  onSelect: (values: string[]) => void
}

export function MultiChoice({ options, onSelect }: MultiChoiceProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleSelect = (value: string, checked: boolean) => {
    if (checked) {
      setSelected((prev) => [...prev, value])
    } else {
      setSelected((prev) => prev.filter((item) => item !== value))
    }
  }

  const handleSubmit = () => {
    onSelect(selected)
  }

  return (
    <div className="flex flex-col space-y-4 p-4 bg-secondary/50 rounded-lg mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => handleSelect(option.value, checked as boolean)}
            />
            <Label htmlFor={option.value} className="cursor-pointer">
              {option.label}
              {option.description && <span className="text-xs text-muted-foreground ml-2">{option.description}</span>}
            </Label>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} className="self-end">
        <Check className="h-4 w-4 mr-2" />
        Confirmar selección
      </Button>
    </div>
  )
}

interface NumberInputProps {
  min?: number
  max?: number
  onSelect: (value: number) => void
}

export function NumberInput({ min = 1, max = 10, onSelect }: NumberInputProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => ({
    value: String(i + min),
    label: String(i + min),
  }))

  return (
    <div className="flex flex-col space-y-4 p-4 bg-secondary/50 rounded-lg mt-2">
      <div className="flex space-x-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className="w-10 h-10"
            onClick={() => onSelect(Number(option.value))}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface DropdownSelectProps {
  options: Option[]
  placeholder: string
  onSelect: (value: string) => void
}

export function DropdownSelect({ options, placeholder, onSelect }: DropdownSelectProps) {
  return (
    <div className="p-4 bg-secondary/50 rounded-lg mt-2">
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
              {option.description && <span className="text-xs text-muted-foreground ml-2">{option.description}</span>}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
