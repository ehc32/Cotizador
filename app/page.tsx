"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { defaultModel, type modelID } from "@/ai/providers"
import { Textarea } from "@/components/textarea"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  SingleChoiceOptions,
  MultiChoiceOptions,
  NumberOptions,
  BedTypeOptions,
  YesNoOptions,
  SquareMetersSelector,
  TimeEstimateSelector,
} from "@/components/interactive-options"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import type { CotizacionData } from "@/lib/pdf-generator"

// Definir opciones para las diferentes preguntas
const tipoProyectoOptions = [
  { value: "Construcción nueva", label: "Construcción nueva" },
  { value: "Remodelación", label: "Remodelación" },
  { value: "Ampliación", label: "Ampliación" },
  { value: "Otro", label: "Otro" },
]

const nivelAcabadosOptions = [
  { value: "Estándar", label: "Estándar", description: "$1,900,000/m²" },
  { value: "Medio", label: "Medio", description: "$2,850,000/m²" },
  { value: "Premium", label: "Premium", description: "$4,560,000/m²" },
]

const espaciosAdicionalesOptions = [
  { value: "Estudio", label: "Estudio", description: "(18 m²)" },
  { value: "Sala de TV", label: "Sala de TV", description: "(14 m²)" },
  { value: "Habitación servicio con baño", label: "Habitación servicio con baño", description: "(14 m²)" },
  { value: "Cocina", label: "Cocina", description: "(11.5 m²)" },
  { value: "Sala", label: "Sala", description: "(13.5 m²)" },
  { value: "Comedor", label: "Comedor", description: "(18 m²)" },
  { value: "Ropas", label: "Ropas", description: "(8 m²)" },
  { value: "Baño Social", label: "Baño Social", description: "(2.5 m²)" },
  { value: "Depósito pequeño", label: "Depósito pequeño", description: "(4 m²)" },
  { value: "Depósito mediano", label: "Depósito mediano", description: "(6 m²)" },
  { value: "Depósito grande", label: "Depósito grande", description: "(9 m²)" },
  { value: "Sauna", label: "Sauna", description: "(9 m²)" },
  { value: "Turco", label: "Turco", description: "(9 m²)" },
  { value: "Piscina pequeña", label: "Piscina pequeña", description: "(16 m²)" },
  { value: "Piscina mediana", label: "Piscina mediana", description: "(24 m²)" },
  { value: "Piscina grande", label: "Piscina grande", description: "(32 m²)" },
  { value: "Baño social exterior", label: "Baño social exterior", description: "(4 m²)" },
]

// Definir el flujo de preguntas en orden estricto
const PREGUNTAS_FLUJO = [
  "nombre",
  "edad",
  "tipo_proyecto",
  "metros_cuadrados",
  "nivel_acabados",
  "tiempo_estimado",
  "presupuesto_estimado",
  "tiene_lote",
  "habitaciones_adicionales",
  "habitacion_principal_cama",
  // Las preguntas de habitaciones adicionales y baños se generan dinámicamente
  "espacios_adicionales",
]

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel)
  const [interactiveOptions, setInteractiveOptions] = useState<{
    type: "single" | "multi" | "number" | "bedType" | "yesNo" | "squareMeters" | "timeEstimate" | null
    question: string
  } | null>(null)
  const [cotizacionData, setCotizacionData] = useState<CotizacionData | null>(null)
  const [showPdfButton, setShowPdfButton] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  // Used to track which question in the flow is currently active
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [habitacionesCount, setHabitacionesCount] = useState(0)
  const [habitacionActual, setHabitacionActual] = useState(0)
  const [preguntandoBano, setPreguntandoBano] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, status, append } = useChat({
    api: "/api/chat",
    body: {
      selectedModel,
    },
    initialMessages: [],
    id: "saave-arquitectos-chat",
    onFinish: (message) => {
      // Detectar preguntas en la respuesta del asistente
      const content = message.content.toLowerCase()

      // Verificar si la respuesta contiene datos de cotización
      if (content.includes("resumen de cotización") || content.includes("costos estimados")) {
        // Buscar en los mensajes anteriores para recopilar datos
        let nombre = ""
        let tipoProyecto = "Construcción nueva"
        let superficie = 0
        let precioPorMetroCuadrado = 1900000
        let tiempoEstimado = ""
        let presupuestoEstimado = ""
        let tieneLote = false
        const habitaciones: { tipoCama: string; conBano: boolean }[] = []
        const espaciosAdicionales: string[] = []

        // Extraer datos de los mensajes
        messages.forEach((msg) => {
          if (msg.role === "user") {
            const userMsg = msg.content.toLowerCase()

            // Extraer nombre
            if (
              userMsg.length < 30 &&
              !userMsg.includes("años") &&
              !userMsg.includes("m2") &&
              !userMsg.includes("si") &&
              !userMsg.includes("no")
            ) {
              nombre = msg.content
            }

            // Extraer tipo de proyecto
            if (
              userMsg.includes("construcción") ||
              userMsg.includes("remodelación") ||
              userMsg.includes("ampliación")
            ) {
              tipoProyecto = msg.content
            }

            // Extraer superficie
            const superficieMatch = userMsg.match(/(\d+)\s*m2/i) || userMsg.match(/(\d+)/i)
            if (superficieMatch && !userMsg.includes("años")) {
              const posibleSuperficie = Number.parseInt(superficieMatch[1])
              if (posibleSuperficie > 10 && posibleSuperficie < 10000) {
                superficie = posibleSuperficie
              }
            }

            // Extraer precio por metro cuadrado
            if (userMsg.includes("estándar")) precioPorMetroCuadrado = 1900000
            if (userMsg.includes("medio")) precioPorMetroCuadrado = 2850000
            if (userMsg.includes("premium")) precioPorMetroCuadrado = 4560000

            // Extraer tiempo estimado
            if (
              userMsg.includes("mes") ||
              userMsg.includes("año") ||
              userMsg.includes("semana") ||
              userMsg.includes("día")
            ) {
              tiempoEstimado = msg.content
            }

            // Extraer presupuesto
            if (userMsg.includes("presupuesto") || userMsg.includes("millones") || userMsg.includes("$")) {
              presupuestoEstimado = msg.content
            }

            // Extraer si tiene lote
            if (userMsg === "sí" || userMsg === "si") {
              tieneLote = true
            }

            // Extraer tipo de cama
            if (
              userMsg.includes("sencilla") ||
              userMsg.includes("doble") ||
              userMsg.includes("queen") ||
              userMsg.includes("king")
            ) {
              const tipoCama = userMsg.includes("sencilla")
                ? "Sencilla"
                : userMsg.includes("doble")
                  ? "Doble"
                  : userMsg.includes("queen")
                    ? "Queen"
                    : userMsg.includes("king") && userMsg.includes("california")
                      ? "California King"
                      : "King"

              // Verificar si es para una habitación específica o la principal
              const esParaBano =
                messages.findIndex((m) => m === msg) > 0 &&
                messages[messages.findIndex((m) => m === msg) - 1].content.toLowerCase().includes("baño propio")

              if (esParaBano) {
                // Es una respuesta sobre si tiene baño
                if (habitaciones.length > 0) {
                  habitaciones[habitaciones.length - 1].conBano = userMsg.includes("sí") || userMsg.includes("si")
                }
              } else {
                // Es una respuesta sobre tipo de cama
                habitaciones.push({ tipoCama, conBano: false })
              }
            }

            // Extraer espacios adicionales
            espaciosAdicionalesOptions.forEach((opcion) => {
              if (userMsg.includes(opcion.value.toLowerCase())) {
                espaciosAdicionales.push(opcion.value)
              }
            })
          }
        })

        // Si encontramos datos suficientes, crear objeto de cotización
        if (nombre && superficie > 0) {
          const costoTotal = superficie * precioPorMetroCuadrado
          const costoDiseño = costoTotal * 0.1

          const data: CotizacionData = {
            nombre,
            fecha: new Date(),
            tipoProyecto,
            superficie,
            nivelAcabados:
              precioPorMetroCuadrado === 1900000
                ? "Estándar"
                : precioPorMetroCuadrado === 2850000
                  ? "Medio"
                  : "Premium",
            precioPorMetroCuadrado,
            tiempoEstimado: tiempoEstimado || "210 días calendarios (7 meses)",
            presupuestoEstimado: presupuestoEstimado || "No especificado",
            tieneLote,
            habitaciones: habitaciones.length > 0 ? habitaciones : [{ tipoCama: "Doble", conBano: true }],
            espaciosAdicionales,
            costos: {
              costoDiseño,
              costoConstruccion: costoTotal,
              costoTotal: costoTotal + costoDiseño,
            },
          }

          setCotizacionData(data)
          setShowPdfButton(true)
        }
      }

      // Verificar si debemos mostrar el botón de PDF
      if (content.includes("descargar") && content.includes("pdf")) {
        setShowPdfButton(true)
      }

      // Avanzar en el flujo de preguntas
      if (content.includes("tipo de proyecto") && !answeredQuestions.has("tipo_proyecto")) {
        setInteractiveOptions({
          type: "single",
          question: "¿Qué tipo de proyecto estás pensando?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "tipo_proyecto"]))
        setCurrentQuestionIndex(3) // Índice de tipo_proyecto en PREGUNTAS_FLUJO
      } else if (content.includes("metros cuadrados") && !answeredQuestions.has("metros_cuadrados")) {
        setInteractiveOptions({
          type: "squareMeters",
          question: "¿Cuántos metros cuadrados tendría aproximadamente el proyecto?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "metros_cuadrados"]))
        setCurrentQuestionIndex(4) // Índice de metros_cuadrados en PREGUNTAS_FLUJO
      } else if (content.includes("nivel de acabados") && !answeredQuestions.has("nivel_acabados")) {
        setInteractiveOptions({
          type: "single",
          question: "¿Qué nivel de acabados te gustaría?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "nivel_acabados"]))
        setCurrentQuestionIndex(5) // Índice de nivel_acabados en PREGUNTAS_FLUJO
      } else if (content.includes("para cuándo") && !answeredQuestions.has("tiempo_estimado")) {
        setInteractiveOptions({
          type: "timeEstimate",
          question: "¿Para cuándo te gustaría tener el proyecto terminado?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "tiempo_estimado"]))
        setCurrentQuestionIndex(6) // Índice de tiempo_estimado en PREGUNTAS_FLUJO
      } else if (content.includes("tienes un lote") && !answeredQuestions.has("tiene_lote")) {
        setInteractiveOptions({
          type: "yesNo",
          question: "¿Ya tienes un lote?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "tiene_lote"]))
        setCurrentQuestionIndex(8) // Índice de tiene_lote en PREGUNTAS_FLUJO
      } else if (content.includes("habitaciones adicionales") && !answeredQuestions.has("habitaciones_adicionales")) {
        setInteractiveOptions({
          type: "number",
          question: "¿Cuántas habitaciones adicionales deseas?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "habitaciones_adicionales"]))
        setCurrentQuestionIndex(9) // Índice de habitaciones_adicionales en PREGUNTAS_FLUJO
      } else if (
        content.includes("habitación principal") &&
        content.includes("tipo de cama") &&
        !answeredQuestions.has("habitacion_principal_cama")
      ) {
        setInteractiveOptions({
          type: "bedType",
          question: "Habitación principal - ¿Qué tipo de cama le gustaría?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "habitacion_principal_cama"]))
        setCurrentQuestionIndex(10) // Índice de habitacion_principal_cama en PREGUNTAS_FLUJO
      } else if (content.includes("habitación") && content.includes("tipo de cama") && !preguntandoBano) {
        // Preguntas dinámicas para habitaciones adicionales
        const habitacionNumero = habitacionActual + 1
        const preguntaKey = `habitacion_${habitacionNumero}_cama`

        if (!answeredQuestions.has(preguntaKey)) {
          setInteractiveOptions({
            type: "bedType",
            question: `Habitación ${habitacionNumero} - ¿Qué tipo de cama le gustaría?`,
          })
          setAnsweredQuestions((prev) => new Set([...prev, preguntaKey]))
          setPreguntandoBano(true)
        }
      } else if (content.includes("baño propio") && preguntandoBano) {
        const habitacionNumero = habitacionActual + 1
        const preguntaKey = `habitacion_${habitacionNumero}_bano`

        if (!answeredQuestions.has(preguntaKey)) {
          setInteractiveOptions({
            type: "yesNo",
            question: `Habitación ${habitacionNumero} - ¿Tiene baño propio?`,
          })
          setAnsweredQuestions((prev) => new Set([...prev, preguntaKey]))
          setPreguntandoBano(false)

          // Avanzar a la siguiente habitación
          if (habitacionActual < habitacionesCount - 1) {
            setHabitacionActual(habitacionActual + 1)
          }
        }
      } else if (content.includes("espacios adicionales") && !answeredQuestions.has("espacios_adicionales")) {
        setInteractiveOptions({
          type: "multi",
          question: "¿Qué espacios adicionales quieres?",
        })
        setAnsweredQuestions((prev) => new Set([...prev, "espacios_adicionales"]))
        setCurrentQuestionIndex(PREGUNTAS_FLUJO.length - 1) // Último índice
      } else {
        setInteractiveOptions(null)
      }
    },
    onError: (error) => {
      console.error("Error en el chat:", error)
    },
  })

  // Función para manejar la selección de opciones
  const handleOptionSelect = (value: string | string[] | number) => {
    let responseText = ""

    if (typeof value === "string") {
      responseText = value
    } else if (Array.isArray(value)) {
      responseText = value.join(", ")
    } else {
      responseText = value.toString()
    }

    // Si estamos seleccionando el número de habitaciones adicionales
    if (interactiveOptions?.question.includes("habitaciones adicionales")) {
      setHabitacionesCount(typeof value === "number" ? value : 0)
      setHabitacionActual(0)
    }

    // Añadir la respuesta del usuario
    append({
      role: "user",
      content: responseText,
    })

    // Ocultar los controles después de la selección
    setInteractiveOptions(null)
  }

  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, interactiveOptions, showPdfButton])

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b bg-background">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">SAAVE | Arquitectos</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-primary"
                >
                  <path d="M2 22V12a10 10 0 1 1 20 0v10" />
                  <path d="M19 22V12" />
                  <path d="M5 22V12" />
                  <path d="M12 7v5" />
                  <path d="M12 15.5v.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Asistente de Cotización</h2>
              <p className="text-muted-foreground max-w-md">
                Bienvenido al asistente virtual de SAAVE | Arquitectos. Estoy aquí para ayudarte a cotizar tu proyecto
                de construcción.
              </p>
              <Button onClick={() => append({ role: "user", content: "Hola" })}>Comenzar cotización</Button>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col space-y-2 p-4 rounded-lg",
                  message.role === "user" ? "bg-primary/10 ml-auto max-w-[80%]" : "bg-muted mr-auto max-w-[80%]",
                )}
              >
                <div className="text-sm font-medium">{message.role === "user" ? "Tú" : "Asistente SAAVE"}</div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))
          )}

          {/* Controles interactivos */}
          {interactiveOptions && (
            <div className="mr-auto max-w-[90%] w-full">
              <div className="text-sm font-medium mb-1">Asistente SAAVE</div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="mb-3 font-medium">{interactiveOptions.question}</p>

                {interactiveOptions.type === "single" && interactiveOptions.question.includes("tipo de proyecto") && (
                  <SingleChoiceOptions options={tipoProyectoOptions} onSelect={(value) => handleOptionSelect(value)} />
                )}

                {interactiveOptions.type === "single" && interactiveOptions.question.includes("nivel de acabados") && (
                  <SingleChoiceOptions options={nivelAcabadosOptions} onSelect={(value) => handleOptionSelect(value)} />
                )}

                {interactiveOptions.type === "multi" && (
                  <MultiChoiceOptions
                    options={espaciosAdicionalesOptions}
                    onSelect={(values) => handleOptionSelect(values)}
                  />
                )}

                {interactiveOptions.type === "number" && (
                  <NumberOptions onSelect={(value) => handleOptionSelect(value)} />
                )}

                {interactiveOptions.type === "bedType" && (
                  <BedTypeOptions onSelect={(value) => handleOptionSelect(value)} />
                )}

                {interactiveOptions.type === "yesNo" && (
                  <YesNoOptions
                    question={interactiveOptions.question}
                    onSelect={(value) => handleOptionSelect(value)}
                  />
                )}

                {interactiveOptions.type === "squareMeters" && (
                  <SquareMetersSelector onSelect={(value) => handleOptionSelect(value)} />
                )}

                {interactiveOptions.type === "timeEstimate" && (
                  <TimeEstimateSelector onSelect={(value) => handleOptionSelect(value)} />
                )}
              </div>
            </div>
          )}

          {/* Botón de descarga de PDF */}
          {showPdfButton && cotizacionData && (
            <div className="mr-auto max-w-[90%] w-full">
              <div className="bg-muted p-4 rounded-lg flex flex-col items-center">
                <p className="mb-3 text-center">Tu cotización está lista para descargar</p>
                <PDFDownloadButton cotizacionData={cotizacionData} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 bg-background border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <Textarea
            input={input}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
            status={status}
            stop={stop}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </form>
      </footer>
    </div>
  )
}
