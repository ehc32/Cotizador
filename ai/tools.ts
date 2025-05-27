import { tool } from "ai"
import { z } from "zod"

// Definición de tipos para espacios
type RoomType = {
  name: string
  area: number
}

type BedType = {
  type: string
  area: number
}

// Constantes para áreas según el PDF
const BED_TYPES: Record<string, BedType> = {
  Sencilla: { type: "Sencilla (99x191 cm)", area: 14 },
  Doble: { type: "Doble (137x191 cm)", area: 16 },
  Queen: { type: "Queen (152x203 cm)", area: 18 },
  King: { type: "King (193x203 cm)", area: 25 },
  "California King": { type: "California King (183x213 cm)", area: 30 },
}

const ADDITIONAL_SPACES: Record<string, RoomType> = {
  Estudio: { name: "Estudio", area: 18 },
  "Sala de TV": { name: "Sala de TV", area: 14 },
  "Habitación servicio con baño": { name: "Habitación servicio con baño", area: 14 },
  Cocina: { name: "Cocina", area: 11.5 },
  Sala: { name: "Sala", area: 13.5 },
  Comedor: { name: "Comedor", area: 18 },
  Ropas: { name: "Ropas", area: 8 },
  "Baño Social": { name: "Baño Social", area: 2.5 },
  "Depósito pequeño": { name: "Depósito pequeño", area: 4 },
  "Depósito mediano": { name: "Depósito mediano", area: 6 },
  "Depósito grande": { name: "Depósito grande", area: 9 },
  Sauna: { name: "Sauna", area: 9 },
  Turco: { name: "Turco", area: 9 },
  "Piscina pequeña": { name: "Piscina pequeña", area: 16 },
  "Piscina mediana": { name: "Piscina mediana", area: 24 },
  "Piscina grande": { name: "Piscina grande", area: 32 },
  "Baño social exterior": { name: "Baño social exterior", area: 4 },
}

// Herramienta para calcular el costo del proyecto
export const calcularCostoProyectoTool = tool({
  description:
    "Calcula el costo total de un proyecto de construcción basado en la superficie y el precio por metro cuadrado",
  parameters: z.object({
    superficie: z.number().describe("Superficie en metros cuadrados"),
    precioPorMetroCuadrado: z.number().describe("Precio por metro cuadrado según el nivel de acabados"),
    tipoProyecto: z
      .string()
      .optional()
      .describe("Tipo de proyecto: construcción nueva, remodelación, ampliación, etc."),
    habitaciones: z
      .array(
        z.object({
          tipoCama: z.string().describe("Tipo de cama en la habitación"),
          conBano: z.boolean().describe("Si la habitación tiene baño propio"),
        }),
      )
      .optional()
      .describe("Detalles de las habitaciones"),
    espaciosAdicionales: z.array(z.string()).optional().describe("Espacios adicionales seleccionados"),
    tieneLote: z.boolean().optional().describe("Si el cliente ya tiene un lote"),
    tiempoEstimado: z.string().optional().describe("Tiempo estimado para completar el proyecto"),
    presupuestoEstimado: z.string().optional().describe("Presupuesto estimado del cliente"),
    nombre: z.string().optional().describe("Nombre del cliente"),
  }),
  execute: async ({
    superficie,
    precioPorMetroCuadrado,
    tipoProyecto = "Construcción nueva",
    habitaciones = [],
    espaciosAdicionales = [],
    tieneLote = false,
    tiempoEstimado = "No especificado",
    presupuestoEstimado = "No especificado",
    nombre = "",
  }) => {
    // Cálculo del costo de construcción
    const costoTotal = superficie * precioPorMetroCuadrado

    // Cálculo del costo de diseño (aproximadamente 10% del costo total)
    const costoDiseño = costoTotal * 0.1

    // Cálculo de áreas por tipo de espacio
    let areaHabitaciones = 0
    let areaBanos = 0
    let areaEspaciosAdicionales = 0

    // Calcular área de habitaciones
    habitaciones.forEach((hab) => {
      const bedType = BED_TYPES[hab.tipoCama] || BED_TYPES["Doble"] // Default a doble si no se encuentra
      areaHabitaciones += bedType.area

      if (hab.conBano) {
        areaBanos += 3.5 // Área de baño según PDF
      }
    })

    // Calcular área de espacios adicionales
    espaciosAdicionales.forEach((espacio) => {
      const space = ADDITIONAL_SPACES[espacio]
      if (space) {
        areaEspaciosAdicionales += space.area
      }
    })

    // Formatear montos en pesos colombianos
    const formatoMoneda = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    // Crear resumen de cotización
    const resumenCotizacion = `
📋 RESUMEN DE COTIZACIÓN - SAAVE | Arquitectos

🏗️ Tipo de proyecto: ${tipoProyecto}
📏 Superficie total: ${superficie} m²
💰 Nivel de acabados: ${formatoMoneda.format(precioPorMetroCuadrado)}/m²
⏱️ Tiempo estimado: ${tiempoEstimado}
💼 Presupuesto cliente: ${presupuestoEstimado}

COSTOS ESTIMADOS:
🎨 Diseño: ${formatoMoneda.format(costoDiseño)}
🏢 Construcción: ${formatoMoneda.format(costoTotal)}
💵 TOTAL: ${formatoMoneda.format(costoTotal + costoDiseño)}

¿Deseas descargar esta cotización en PDF? Puedes hacerlo haciendo clic en el botón "Descargar Cotización en PDF".
    `

    // Crear reporte completo con más detalles
    const reporteCompleto = {
      nombre,
      tipoProyecto,
      superficie,
      precioPorMetroCuadrado: formatoMoneda.format(precioPorMetroCuadrado),
      tieneLote,
      tiempoEstimado,
      presupuestoEstimado,
      detalleEspacios: {
        areaHabitaciones,
        areaBanos,
        areaEspaciosAdicionales,
        areaTotal: superficie,
      },
      costos: {
        costoDiseño,
        costoConstruccion: costoTotal,
        costoTotal: costoTotal + costoDiseño,
      },
      habitaciones: habitaciones.map((hab, index) => ({
        numero: index === 0 ? "Principal" : `Habitación ${index}`,
        tipoCama: hab.tipoCama,
        conBano: hab.conBano ? "Sí" : "No",
        area: BED_TYPES[hab.tipoCama]?.area || 16,
      })),
      espaciosAdicionales: espaciosAdicionales.map((espacio) => ({
        nombre: espacio,
        area: ADDITIONAL_SPACES[espacio]?.area || 0,
      })),
      fecha: new Date(),
    }

    return {
      superficie,
      precioPorMetroCuadrado,
      costoTotal,
      costoDiseño,
      formatoMoneda: formatoMoneda.format(costoTotal + costoDiseño),
      resumenCotizacion,
      reporteCompleto,
      pdfData: {
        ...reporteCompleto,
        costos: {
          costoDiseño,
          costoConstruccion: costoTotal,
          costoTotal: costoTotal + costoDiseño,
        },
        fecha: new Date(),
      },
    }
  },
})

// Ya no necesitamos la herramienta de enviar correo, la reemplazamos por la descarga de PDF
export const generarPDFTool = tool({
  description: "Genera un PDF con la cotización para que el cliente pueda descargarlo",
  parameters: z.object({
    nombre: z.string().describe("Nombre del cliente"),
    tipoProyecto: z.string().describe("Tipo de proyecto"),
    superficie: z.number().describe("Superficie en metros cuadrados"),
    cotizacion: z.string().describe("Resumen de la cotización generada"),
  }),
  execute: async ({ nombre, tipoProyecto, superficie, cotizacion }) => {
    // Esta herramienta solo indica al frontend que debe mostrar el botón de descarga
    // La generación real del PDF ocurre en el cliente con jsPDF

    const confirmacion = `
✅ ¡Cotización lista para descargar!

Hemos preparado tu cotización para el proyecto de ${tipoProyecto} de ${superficie}m².
Puedes descargarla en formato PDF haciendo clic en el botón "Descargar Cotización en PDF" que aparece debajo.

Gracias ${nombre} por confiar en SAAVE | Arquitectos para tu proyecto. 
Si tienes alguna pregunta adicional, no dudes en contactarnos o agendar una cita en nuestra web: https://www.saavearquitectos.com/reservas/
    `

    return {
      success: true,
      confirmacion,
      showPdfButton: true,
    }
  },
})
