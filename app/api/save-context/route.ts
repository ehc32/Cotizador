import { NextResponse } from "next/server"

// Define un tipo específico para el contexto de conversación
interface ConversationContext {
  [key: string]: string | number | boolean | object | null | undefined;
  updatedAt?: string;
}

// En producción, esto se conectaría a una base de datos
const conversationContexts: Record<string, ConversationContext> = {}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, context } = body;

    if (!sessionId || !context) {
      return NextResponse.json(
        { error: "Faltan datos: sessionId o context" },
        { status: 400 }
      );
    }

    // Guardar el contexto en nuestro almacenamiento en memoria
    conversationContexts[sessionId] = {
      ...conversationContexts[sessionId],
      ...context,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Contexto guardado correctamente"
    });
  } catch (error) {
    console.error("Error al guardar contexto:", error);
    return NextResponse.json(
      { error: "Error al guardar el contexto" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Se requiere sessionId" },
        { status: 400 }
      );
    }

    const context = conversationContexts[sessionId] || null;

    return NextResponse.json({
      success: true,
      context
    });
  } catch (error) {
    console.error("Error al recuperar contexto:", error);
    return NextResponse.json(
      { error: "Error al recuperar el contexto" },
      { status: 500 }
    );
  }
}
