# Generador de Planeadores de Clase Pedagógicos para Docentes

Aplicación web diseñada para docentes que permite organizar, estructurar y exportar planeaciones de clase diarias mediante un calendario interactivo que inicia en lunes y un editor de tabla pedagógica con exportación a Word (.docx / .doc) y PDF.

## ✨ Características Principales

1. **Configuración Inicial del Docente (Onboarding)**:
   - Nombre del docente y rol docente.
   - Institución educativa (opcional).
   - Curso a cargo / Dirección de grupo (ej. Grado 5°A).
   - Materias / Asignaturas impartidas (sistema dinámico de etiquetas).
   - Días laborales de la semana (Lunes a Viernes / Sábado).
   - Cantidad de horas diarias de clase.

2. **Calendario Mensual**:
   - Inicio de semana estricto en **LUNES** hasta **DOMINGO**.
   - Navegación entre meses y acceso directo a "Hoy".
   - Indicadores visuales en cada día (cantidad de clases planeadas, badges de materias).
   - Al hacer clic en cualquier día, abre el editor de planeación de esa fecha.

3. **Tabla de Planeación Pedagógica**:
   Estructura en tabla con las columnas solicitadas:
   - **Fecha de la clase**
   - **# de día de la clase** (Clase #1, #2, etc.)
   - **Día de la semana** (Lunes, Martes, etc.)
   - **DBA (Derechos Básicos de Aprendizaje)**
   - **Desempeño de aprendizaje**
   - **Descripción de la clase** (Inicio, Desarrollo y Cierre)
   - *Campos complementarios:* Asignatura y Grado.
   - Observaciones generales del día.

4. **Exportación con Menú Desplegable**:
   - **Exportar a Word (.doc / .docx)**: Genera un documento oficial con membrete, tabla de clases y líneas de firma.
   - **Exportar a PDF / Imprimir**: Formato optimizado para impresión o guardado como PDF en tamaño carta.

5. **Persistencia y Respaldo de Datos**:
   - Guardado automático y manual en `localStorage`.
   - Botón para descargar copia de seguridad (JSON) y restaurar en cualquier momento.

## 🚀 Cómo Usar

Simplemente abre el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Microsoft Edge, Firefox, Safari). No requiere conexión a internet ni instalación de servidores.
