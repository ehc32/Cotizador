// Función para generar un ID de sesión único
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
  
  // Función para obtener el ID de sesión actual o crear uno nuevo
  export function getSessionId(): string {
    if (typeof window === "undefined") {
      return generateSessionId()
    }
  
    let sessionId = localStorage.getItem("saave_session_id")
  
    if (!sessionId) {
      sessionId = generateSessionId()
      localStorage.setItem("saave_session_id", sessionId)
    }
  
    return sessionId
  }
  
  // Función para guardar el contexto de la conversación
  export async function saveContext(context: any): Promise<boolean> {
    try {
      const sessionId = getSessionId()
  
      const response = await fetch("/api/save-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          context,
        }),
      })
  
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error al guardar contexto:", error)
      return false
    }
  }
  
  // Función para recuperar el contexto de la conversación
  export async function getContext(): Promise<any> {
    try {
      const sessionId = getSessionId()
  
      const response = await fetch(`/api/save-context?sessionId=${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      const data = await response.json()
      return data.context
    } catch (error) {
      console.error("Error al recuperar contexto:", error)
      return null
    }
  }
  