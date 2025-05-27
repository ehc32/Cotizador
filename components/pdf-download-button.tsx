"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { type CotizacionData, generarPDFCotizacion } from "@/lib/pdf-generator"

interface PDFDownloadButtonProps {
  cotizacionData: CotizacionData
}

export function PDFDownloadButton({ cotizacionData }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Generar el PDF
      const pdfBlob = await generarPDFCotizacion(cotizacionData)

      // Crear URL para el blob
      const url = URL.createObjectURL(pdfBlob)

      // Crear un elemento <a> para descargar
      const link = document.createElement("a")
      link.href = url
      link.download = `Cotizacion_SAAVE_${cotizacionData.nombre.replace(/\s+/g, "_")}.pdf`

      // Añadir al DOM, hacer clic y eliminar
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Liberar la URL
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al generar el PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} className="flex items-center space-x-2">
      {isGenerating ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      <span>{isGenerating ? "Generando PDF..." : "Descargar Cotización en PDF"}</span>
    </Button>
  )
}
