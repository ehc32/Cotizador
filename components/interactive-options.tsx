"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Check, Calendar, Ruler } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface Option {
  value: string
  label: string
  description?: string
}

// Componente para opciones de selección única (radio buttons visuales)
export function SingleChoiceOptions({
  options,
  onSelect,
}: {
  options: Option[]
  onSelect: (value: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-col space-y-2 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={selected === option.value ? "default" : "outline"}
            className={cn("justify-start text-left h-auto py-3", selected === option.value ? "border-primary" : "")}
            onClick={() => {
              setSelected(option.value)
              onSelect(option.value)
            }}
          >
            <div className="flex flex-col items-start">
              <span>{option.label}</span>
              {option.description && <span className="text-xs text-muted-foreground">{option.description}</span>}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

// Componente para opciones de selección múltiple (checkboxes)
export function MultiChoiceOptions({
  options,
  onSelect,
}: {
  options: Option[]
  onSelect: (values: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])

  const handleToggle = (value: string) => {
    setSelected((prev) => {
      const newSelection = prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      return newSelection
    })
  }

  return (
    <div className="flex flex-col space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex items-start space-x-2 border rounded-md p-3 cursor-pointer",
              selected.includes(option.value) ? "border-primary bg-primary/5" : "border-input",
            )}
            onClick={() => handleToggle(option.value)}
          >
            <Checkbox
              id={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => {}}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor={option.value} className="cursor-pointer font-medium">
                {option.label}
              </Label>
              {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={() => onSelect(selected)} className="self-end" disabled={selected.length === 0}>
        <Check className="h-4 w-4 mr-2" />
        Confirmar selección
      </Button>
    </div>
  )
}

// Componente para selección numérica (1-4 habitaciones)
export function NumberOptions({
  max = 4,
  onSelect,
}: {
  max?: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="flex space-x-2 mt-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
        <Button key={num} variant="outline" className="h-12 w-12 text-lg" onClick={() => onSelect(num)}>
          {num}
        </Button>
      ))}
    </div>
  )
}

// Componente para mostrar opciones de tipo de cama con imágenes
export function BedTypeOptions({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const bedOptions = [
    {
      value: "Sencilla",
      label: "Sencilla",
      description: "99x191 cm - 14m²",
      icon: "🛏️",
    },
    {
      value: "Doble",
      label: "Doble",
      description: "137x191 cm - 16m²",
      icon: "🛏️🛏️",
    },
    {
      value: "Queen",
      label: "Queen",
      description: "152x203 cm - 18m²",
      icon: "👑",
    },
    {
      value: "King",
      label: "King",
      description: "193x203 cm - 25m²",
      icon: "👑👑",
    },
    {
      value: "California King",
      label: "California King",
      description: "183x213 cm - 30m²",
      icon: "🌴👑",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
      {bedOptions.map((option) => (
        <div
          key={option.value}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all",
            selected === option.value
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-input hover:border-primary/50",
          )}
          onClick={() => {
            setSelected(option.value)
            onSelect(option.value)
          }}
        >
          <div className="text-center mb-2 text-2xl">{option.icon}</div>
          <h3 className="font-medium text-center">{option.label}</h3>
          <p className="text-xs text-muted-foreground text-center">{option.description}</p>
        </div>
      ))}
    </div>
  )
}

// Componente para opciones Sí/No
export function YesNoOptions({
  question,
  onSelect,
}: {
  question: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex space-x-3 mt-2">
      <Button variant="outline" className="flex-1 py-6" onClick={() => onSelect("Sí")}>
        <span className="text-lg mr-2">✓</span> Sí
      </Button>
      <Button variant="outline" className="flex-1 py-6" onClick={() => onSelect("No")}>
        <span className="text-lg mr-2">✗</span> No
      </Button>
    </div>
  )
}

// Componente para seleccionar metros cuadrados con slider
export function SquareMetersSelector({
  onSelect,
  min = 20,
  max = 500,
  defaultValue = 100,
}: {
  onSelect: (value: number) => void
  min?: number
  max?: number
  defaultValue?: number
}) {
  const [value, setValue] = useState<number>(defaultValue)

  const handleChange = (newValue: number[]) => {
    setValue(newValue[0])
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center space-x-2">
        <Ruler className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Metros cuadrados: {value}m²</span>
      </div>

      <Slider
        defaultValue={[defaultValue]}
        min={min}
        max={max}
        step={5}
        onValueChange={handleChange}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}m²</span>
        <span>{max}m²</span>
      </div>

      <Button onClick={() => onSelect(value)} className="w-full mt-2">
        Confirmar {value}m²
      </Button>
    </div>
  )
}

// Componente para seleccionar tiempo estimado
export function TimeEstimateSelector({
  onSelect,
}: {
  onSelect: (value: string) => void
}) {
  const timeOptions = [
    { value: "3 meses", label: "3 meses" },
    { value: "6 meses", label: "6 meses" },
    { value: "9 meses", label: "9 meses" },
    { value: "12 meses", label: "1 año" },
    { value: "18 meses", label: "1 año y medio" },
    { value: "24 meses", label: "2 años" },
  ]

  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Tiempo estimado</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {timeOptions.map((option) => (
          <Button
            key={option.value}
            variant={selected === option.value ? "default" : "outline"}
            className={cn(selected === option.value ? "border-primary" : "")}
            onClick={() => {
              setSelected(option.value)
              onSelect(option.value)
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
