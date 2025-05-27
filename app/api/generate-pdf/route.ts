import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombreCliente, tipoProyecto, superficie, nivelAcabados, costoTotal, pdfData } = body

    // Aquí iría la lógica real de generación de PDF
    // Por ejemplo, usando una biblioteca como PDFKit o jsPDF

    // Simulamos la URL del PDF generado
    const pdfUrl = `https://www.saavearquitectos.com/cotizaciones/cotizacion-${nombreCliente.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`

    return NextResponse.json({
      success: true,
      pdfUrl,
      message: `PDF generado correctamente para ${nombreCliente}`,
    })
  } catch (error) {
    console.error("Error al generar PDF:", error)
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
