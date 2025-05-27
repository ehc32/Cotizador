// ProjectOverview component

export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-end">
      {/* Logo + Título */}
      <div className="flex items-center space-x-4 mb-4">
      <img
  src="https://www.saavearquitectos.com/wp-content/uploads/2024/06/004-Blanco-horizontal-2-e1718998326209.png"
  alt="Logo SAAVE"
/>

        <h1 className="text-3xl font-semibold text-black-500">SAAVE | Arquitectos somos</h1>
      </div>

      {/* Descripción corta */}
     

      {/* Propósito del chatbot */}
      <p className="text-center text-sm text-black-500 italic">
        Usa nuestro asistente inteligente para obtener una <strong>cotización estimada</strong> respondiendo solo 5 preguntas clave. ¡Así de fácil!
      </p>
    </div>
  );
};

