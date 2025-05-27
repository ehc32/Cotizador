import { Resend } from "resend"

// Inicializa Resend con tu API key
const resend = new Resend(process.env.RESEND_API_KEY)

type CotizacionEmailProps = {
  nombreCliente: string
  emailCliente: string
  telefonoCliente: string
  tipoProyecto: string
  superficie: number
  nivelAcabados: string
  costoTotal: number
}

export async function enviarEmailCotizacion({
  nombreCliente,
  emailCliente,
  telefonoCliente,
  tipoProyecto,
  superficie,
  nivelAcabados,
  costoTotal,
}: CotizacionEmailProps) {
  try {
    const formatoMoneda = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(costoTotal)

    const { data, error } = await resend.emails.send({
      from: "SAAVE Arquitectos <>",
      to: ["xzenzi259@gmail.com"], // Email del administrador
      subject: `Nueva solicitud de cotización de ${nombreCliente}`,
      html: `
        <h1>Nueva solicitud de cotización</h1>
        <p><strong>Cliente:</strong> ${nombreCliente}</p>
        <p><strong>Email:</strong> ${emailCliente}</p>
        <p><strong>Teléfono:</strong> ${telefonoCliente}</p>
        <p><strong>Tipo de proyecto:</strong> ${tipoProyecto}</p>
        <p><strong>Superficie:</strong> ${superficie} m²</p>
        <p><strong>Nivel de acabados:</strong> ${nivelAcabados}</p>
        <p><strong>Costo estimado:</strong> ${formatoMoneda}</p>
        <hr>
        <p>Por favor, contacta al cliente en las próximas 24 horas.</p>
      `,
    })

    // También enviamos una confirmación al cliente
    await resend.emails.send({
      from: "SAAVE Arquitectos <notificaciones@saavearquitectos.com>",
      to: [emailCliente],
      subject: "Confirmación de solicitud de cotización - SAAVE Arquitectos",
      html: `
        <h1>¡Gracias por tu interés, ${nombreCliente}!</h1>
        <p>Hemos recibido tu solicitud de cotización para un proyecto de ${tipoProyecto}.</p>
        <p>Un representante de SAAVE Arquitectos te contactará en las próximas 24 horas para discutir los detalles de tu proyecto.</p>
        <h2>Resumen de tu cotización:</h2>
        <ul>
          <li><strong>Tipo de proyecto:</strong> ${tipoProyecto}</li>
          <li><strong>Superficie:</strong> ${superficie} m²</li>
          <li><strong>Nivel de acabados:</strong> ${nivelAcabados}</li>
          <li><strong>Costo estimado:</strong> ${formatoMoneda}</li>
        </ul>
        <p>Si tienes alguna pregunta mientras tanto, no dudes en contactarnos.</p>
        <p>Saludos cordiales,</p>
        <p><strong>Equipo SAAVE Arquitectos</strong></p>
      `,
    })

    if (error) {
      console.error("Error al enviar email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error al enviar email:", error)
    return { success: false, error }
  }
}
