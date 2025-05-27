  import { enviarEmailCotizacion } from "@/lib/resend";
  import { NextResponse } from "next/server";

  export async function POST(request: Request) {
    try {
      const body = await request.json();
      
      // Validación de campos obligatorios
      const requiredFields = [
        'nombreCliente', 
        'emailCliente', 
        'telefonoCliente',
        'tipoProyecto',
        'superficie',
        'nivelAcabados',
        'costoTotal'
      ];
      
      const missingFields = requiredFields.filter(field => !body[field]);
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Faltan campos: ${missingFields.join(', ')}` },
          { status: 400 }
        );
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.emailCliente)) {
        return NextResponse.json(
          { error: "El formato del email no es válido" },
          { status: 400 }
        );
      }

      const result = await enviarEmailCotizacion({
        nombreCliente: body.nombreCliente,
        emailCliente: body.emailCliente,
        telefonoCliente: body.telefonoCliente,
        tipoProyecto: body.tipoProyecto,
        superficie: Number(body.superficie),
        nivelAcabados: body.nivelAcabados,
        costoTotal: Number(body.costoTotal),
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Error al enviar el correo" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Correos enviados correctamente",
      });

    } catch (error) {
      console.error("Error en la API:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }