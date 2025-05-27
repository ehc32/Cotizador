import { jsPDF } from "jspdf"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipos para los datos de la cotización
export interface CotizacionData {
  nombre: string
  email?: string
  telefono?: string
  fecha: Date
  tipoProyecto: string
  superficie: number
  nivelAcabados: string
  precioPorMetroCuadrado: number
  tiempoEstimado: string
  presupuestoEstimado: string
  tieneLote: boolean
  habitaciones: {
    tipoCama: string
    conBano: boolean
  }[]
  espaciosAdicionales: string[]
  costos: {
    costoDiseño: number
    costoConstruccion: number
    costoTotal: number
  }
}

// Función para generar el PDF de cotización usando un PDF base
export const generarPDFCotizacion = async (data: CotizacionData): Promise<Blob> => {
  // Cargar el PDF base
  const pdfDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Configuración de fuentes
  pdfDoc.setFont("helvetica")

  // Fecha actual formateada en español
  const fechaFormateada = format(data.fecha, "MMMM d 'de' yyyy", { locale: es })

  // Ir a la página 3 (donde está la propuesta económica)
  pdfDoc.setPage(3)

  // Limpiar la página para insertar nueva información
  pdfDoc.setFillColor(255, 255, 255)
  pdfDoc.rect(20, 30, 170, 150, "F")

  // Título de la sección
  pdfDoc.setFontSize(14)
  pdfDoc.setFont("helvetica", "bold")
  pdfDoc.text("PROPUESTA ECONÓMICA", 105, 30, { align: "center" })

  // Calcular costos basados en la superficie y precio por metro cuadrado
  const costoDiseño = Math.round(data.costos.costoDiseño)
  const costoConstruccion = Math.round(data.costos.costoConstruccion)
  const costoTotal = Math.round(data.costos.costoTotal)

  // Calcular porcentajes para los diferentes servicios
  const diseñoArquitectonico = Math.round(costoTotal * 0.25)
  const diseñoEstructural = Math.round(costoTotal * 0.27)
  const licenciaPermisos = Math.round(costoTotal * 0.015)
  const diseñoElectrico = Math.round(costoTotal * 0.22)
  const diseñoHidraulico = Math.round(costoTotal * 0.19)
  const presupuesto = Math.round(costoTotal * 0.035)

  const subtotal1 = diseñoArquitectonico + diseñoEstructural + licenciaPermisos
  const subtotal2 = diseñoElectrico + diseñoHidraulico + presupuesto

  // Formatear números a pesos colombianos
  const formatoPeso = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  // Crear tabla manualmente
  const drawTable = (startY: number, headers: string[], rows: string[][], title?: string) => {
    const cellWidth = 80
    const cellHeight = 10
    const margin = 20
    const tableWidth = cellWidth * 2
    const startX = (pdfDoc.internal.pageSize.width - tableWidth) / 2

    // Título si existe
    if (title) {
      pdfDoc.setFontSize(12)
      pdfDoc.setFont("helvetica", "bold")
      pdfDoc.text(title, pdfDoc.internal.pageSize.width / 2, startY - 5, { align: "center" })
    }

    // Encabezados
    pdfDoc.setFillColor(0, 0, 0)
    pdfDoc.setTextColor(255, 255, 255)
    pdfDoc.setFont("helvetica", "bold")
    pdfDoc.rect(startX, startY, tableWidth, cellHeight, "F")

    headers.forEach((header, i) => {
      pdfDoc.text(header, startX + i * cellWidth + 5, startY + 7)
    })

    // Filas
    pdfDoc.setTextColor(0, 0, 0)
    pdfDoc.setFont("helvetica", "normal")

    rows.forEach((row, i) => {
      const rowY = startY + (i + 1) * cellHeight

      // Fondo alternado para mejor legibilidad
      if (i % 2 === 0) {
        pdfDoc.setFillColor(240, 240, 240)
        pdfDoc.rect(startX, rowY, tableWidth, cellHeight, "F")
      }

      // Borde
      pdfDoc.setDrawColor(0, 0, 0)
      pdfDoc.rect(startX, rowY, tableWidth, cellHeight)

      // Texto
      pdfDoc.text(row[0], startX + 5, rowY + 7)
      pdfDoc.text(row[1], startX + cellWidth - 5, rowY + 7, { align: "right" })
    })

    return startY + (rows.length + 1) * cellHeight + 10
  }

  // Tabla Etapa 1
  let currentY = 45
  currentY = drawTable(
    currentY,
    ["Concepto", "Valor"],
    [
      ["Diseño Arquitectónico", formatoPeso.format(diseñoArquitectonico)],
      ["Diseño y Cálculo Estructural", formatoPeso.format(diseñoEstructural)],
      ["Acompañamiento en Licencia y Permisos", formatoPeso.format(licenciaPermisos)],
      ["SUBTOTAL I", formatoPeso.format(subtotal1)],
    ],
    "Etapa 1",
  )

  // Tabla Etapa 2
  currentY = drawTable(
    currentY,
    ["Concepto", "Valor"],
    [
      ["Diseño y Cálculo Eléctrico", formatoPeso.format(diseñoElectrico)],
      ["Diseño Hidráulico y Sanitario", formatoPeso.format(diseñoHidraulico)],
      ["Presupuesto del Proyecto", formatoPeso.format(presupuesto)],
      ["SUBTOTAL II", formatoPeso.format(subtotal2)],
    ],
    "Etapa 2",
  )

  // Tabla Total
  currentY = drawTable(
    currentY,
    ["", ""],
    [
      ["TOTAL (I+II)", formatoPeso.format(costoTotal)],
      [`${numeroALetras(costoTotal)} PESOS M/CTE`, ""],
      ["Incluye IVA", ""],
    ],
  )

  // Actualizar la página 1 con los datos del cliente
  pdfDoc.setPage(1)

  // Limpiar área para datos del cliente
  pdfDoc.setFillColor(255, 255, 255)
  pdfDoc.rect(20, 30, 170, 30, "F")

  // Fecha
  pdfDoc.setFontSize(10)
  pdfDoc.setFont("helvetica", "normal")
  pdfDoc.text(`Neiva, ${fechaFormateada}`, 20, 30)

  // Datos del cliente
  pdfDoc.text("Señor", 20, 40)
  pdfDoc.setFont("helvetica", "bold")
  pdfDoc.text(data.nombre, 20, 45)
  if (data.email) {
    pdfDoc.setFont("helvetica", "normal")
    pdfDoc.text(data.email, 20, 50)
  }

  // Actualizar asunto
  pdfDoc.setFillColor(255, 255, 255)
  pdfDoc.rect(20, 65, 170, 15, "F")
  pdfDoc.setFontSize(10)
  pdfDoc.setFont("helvetica", "bold")
  pdfDoc.text(`Asunto: Propuesta técnica y económica para Diseño Arquitectónico y Estudios`, 20, 65)
  pdfDoc.text(`Técnicos del proyecto ${data.tipoProyecto.toLowerCase()} en Neiva – Huila.`, 20, 70)

  // Actualizar la página 2 con los datos del proyecto
  pdfDoc.setPage(2)

  // Actualizar la sección de propuesta técnica
  pdfDoc.setFillColor(255, 255, 255)
  pdfDoc.rect(20, 130, 170, 100, "F")

  pdfDoc.setFontSize(10)
  pdfDoc.setFont("helvetica", "normal")

  // Crear descripción de espacios basada en los datos recopilados
  let espaciosDescripcion = ""

  // Habitación principal
  if (data.habitaciones.length > 0) {
    espaciosDescripcion += `o Habitación principal ${data.habitaciones[0].conBano ? "+ WC" : ""} con cama ${data.habitaciones[0].tipoCama.toLowerCase()}\n`
  }

  // Habitaciones adicionales
  for (let i = 1; i < data.habitaciones.length; i++) {
    espaciosDescripcion += `o Habitación ${i} ${data.habitaciones[i].conBano ? "+ WC" : ""} con cama ${data.habitaciones[i].tipoCama.toLowerCase()}\n`
  }

  // Espacios adicionales
  data.espaciosAdicionales.forEach((espacio) => {
    espaciosDescripcion += `o ${espacio}\n`
  })

  const propuestaTecnica = `
En SAAVE | Arquitectos nos comprometemos a:
• Investigar lo estipulado en el POT de la ciudad para conocer las determinantes del
  diseño urbano y arquitectónico.
• Diseño arquitectónico general (plantas, cortes, fachadas y cubierta) y detalles
  arquitectónicos del proyecto. Como primer acercamiento se han contemplado los
  siguientes espacios:
${espaciosDescripcion}
  
En Total, se ha contemplado un área construida de ${data.superficie}m2 para un proyecto
de ${data.tipoProyecto.toLowerCase()}.`

  pdfDoc.text(propuestaTecnica, 20, 130)

  // Actualizar la página 4 con consideraciones finales
  pdfDoc.setPage(4)

  // Limpiar área para consideraciones
  pdfDoc.setFillColor(255, 255, 255)
  pdfDoc.rect(20, 40, 170, 30, "F")

  pdfDoc.setFontSize(10)
  pdfDoc.setFont("helvetica", "normal")
  pdfDoc.text(`• La presente propuesta está basada para un proyecto de ${data.superficie}m2.`, 20, 40)

  // Generar el PDF como blob
  const pdfBlob = pdfDoc.output("blob")
  return pdfBlob
}

// Función auxiliar para convertir números a letras (simplificada)
function numeroALetras(numero: number): string {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ]

  if (numero === 0) return "CERO"

  // Para simplificar, solo manejamos hasta mil millones
  if (numero >= 1000000000) return "MIL MILLONES"

  let resultado = ""

  // Millones
  if (numero >= 1000000) {
    const millones = Math.floor(numero / 1000000)
    resultado += millones === 1 ? "UN MILLÓN " : numeroALetras(millones) + " MILLONES "
    numero %= 1000000
  }

  // Miles
  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000)
    resultado += miles === 1 ? "MIL " : numeroALetras(miles) + " MIL "
    numero %= 1000
  }

  // Centenas
  if (numero >= 100) {
    const cen = Math.floor(numero / 100)
    resultado += centenas[cen] + " "
    numero %= 100
  }

  // Decenas y unidades
  if (numero > 0) {
    if (numero < 10) {
      resultado += unidades[numero]
    } else {
      const dec = Math.floor(numero / 10)
      const uni = numero % 10

      if (uni === 0) {
        resultado += decenas[dec]
      } else {
        resultado += decenas[dec] + " Y " + unidades[uni]
      }
    }
  }

  return resultado.trim()
}
