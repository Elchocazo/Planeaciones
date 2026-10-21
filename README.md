# Planeador de Clases Multigrados (.docx / .pdf)

Aplicación web integral diseñada para docentes que permite estructurar, planear y exportar planeaciones de clase diarias y secuencias curriculares multigrado. Genera documentos con fidelidad institucional Word (.docx) y PDF con soporte completo tanto online como 100% offline.

---

## 🚀 Modos de Ejecución

### Modalidad A: Ejecución Directa (Sin Servidor / 100% Offline)
Abre directamente el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari):
- **Cero dependencias:** No requiere instalación de Node.js, Python ni conexión a internet.
- **Arranque instantáneo:** Los scripts externos de CDN (Firebase) están desacoplados y diferidos, garantizando arranque en milisegundos sin congelamientos de red.
- **Persistencia en navegador:** Todos los datos se almacenan y resguardan en `LocalStorage` e `IndexedDB`.

### Modalidad B: Servidor Local con Respaldo Físico en Disco (Recomendado para Windows/Linux/Mac)
Para contar con guardado físico directo en el disco duro (`backups/disk_autosave_latest.json`) además del almacenamiento del navegador:

```bash
# Con Python (biblioteca estándar, sin pip ni dependencias externas):
python servidor_local.py

# O con npm:
npm start
```

El servidor abrirá automáticamente el navegador en `http://localhost:8000/index.html`. Cada vez que el docente guarda o edita una clase, el servidor guarda de manera transparente y sin bloquear la interfaz una copia física en `backups/`.

---

## 🏛️ Arquitectura de Persistencia y Seguridad (Cero Pérdida de Datos)

El sistema opera bajo los 10 principios arquitectónicos obligatorios (**GEMINI.md**):

1. **Blindaje Multinivel Inviolable (Regla 10):**
   - **Capa 1:** LocalStorage para lecturas y respuestas visuales instantáneas ($O(1)$).
   - **Capa 2:** IndexedDB de alta capacidad para cuadernos pedagógicos extensos, snapshots e imágenes.
   - **Capa 3:** Banco Semilla Oficial empaquetado (`initial-classes-data.js` con las 70 clases sincronizadas para el docente) que se restaura automáticamente si el almacenamiento local se borra.
   - **Capa 4:** Respaldo físico en disco vía `/api/autosave` cuando se usa `servidor_local.py`.
   - **Capa 5:** Cloud Firestore (cuando existe conectividad y autenticación de docente).

2. **Fusión Aditiva y Rechazo de Persistencia Destructiva:**
   - Ninguna migración, recarga, recolección o inicio de sesión puede sobrescribir con un mapa vacío `{}` o un arreglo menor `[]` las planeaciones existentes.
   - En caso de llaves de almacenamiento nuevas (`_v4` -> `_v5`), se consultan en cascada todas las versiones históricas (`_v4`, `_v3`, `_v2`, `_v1`, IndexedDB y banco semilla).

3. **Escritura Agrupada por Microtareas (Coalesced Microtask Writes):**
   - Múltiples operaciones de guardado concurrentes en un mismo tick (sincronización de espejos, actualización de notas, guardado de lote) se agrupan en **una sola serialización**.
   - **Rendimiento medido:** De 233.3 ms a **12.4 ms (94.7% más rápido)** y de 39 MB a **2 MB** de I/O en pruebas masivas.

4. **Blindaje contra ReDoS y Protección de Contenido Multimedia:**
   - Expresiones regulares acotadas deterministas (`[^\n:]{1,120}:`) sin cuantificadores anidados solapados.
   - Aislamiento automático de imágenes base64 (`___IMG_SHIELD_X___`), bloques de código (`___CODE_BLOCK_SHIELD_X___`) y fórmulas matemáticas LaTeX (`___MATH_BLOCK_SHIELD_X___`) antes de cualquier limpieza léxica.

---

## 🧪 Batería de Pruebas de Regresión

El proyecto cuenta con una suite completa de 52 pruebas automatizadas en Node.js que verifican el 100% de los requisitos del sistema:

```bash
# Ejecutar todas las pruebas (52 suites):
npm test
# o: node scripts/run_all_tests.js

# Ejecutar benchmark de autoguardado:
npm run bench
# o: node scripts/bench_save_with_seed.js
```

### Cobertura de Pruebas:
- ✅ **Integridad:** Cero pérdida de datos, aislamiento de días y clases, persistencia de cuadernos.
- ✅ **Reestructuración:** Migración segura a v5, recuperación universal, restauración de respaldos.
- ✅ **Consecutivos y Calendario:** Coherencia de numeración por paralelo (4°A ≠ 4°B) y sincronización con el horario semanal.
- ✅ **Rendimiento:** Tiempos de guardado inferiores a 15 ms, despegado y limpieza en < 10 ms.
- ✅ **Exportación:** Plantilla oficial `Preparador.docx` nativa, tablas 2x6, prevención de huérfanas en PDF.
- ✅ **Cuaderno Pedagógico:** Barra de herramientas, controles Word, formato de bloques de código y hojas independientes para talleres prácticos.

---

## 📂 Estructura del Repositorio

- `index.html`: Punto de entrada de la aplicación SPA con carga diferida de bibliotecas.
- `Preparador.docx`: Plantilla oficial institucional en orientación horizontal para exportación Word.
- `servidor_local.py`: Servidor local autónomo sin dependencias con API de guardado en disco.
- `css/`: Estilos modulares, diseño adaptable, modo cuaderno y estilos de impresión (`page-break`).
- `js/core/`: Núcleo de estado (`app-state.js`) y enrutador (`router.js`) con preservación de hash (`F5`).
- `js/repositories/`: Repositorios desacoplados (`class-repository.js`, `plan-repository.js`, `schedule-repository.js`, `sequence-repository.js`).
- `js/services/`: Servicios de negocio (`import-parser.js`, `migration-manager.js`, `recovery-service.js`, `backup-service.js`, `firestore-service.js`).
- `js/export/`: Generador Word (`docx-generator.js`), exportador PDF y adaptador unificado.
- `scripts/`: Suites de pruebas automatizadas y ejecutores de banco de pruebas.
- `backups/`: Directorio local donde `servidor_local.py` resguarda copias de seguridad físicas en disco.
