import subprocess, os, pypdf, pypdfium2 as pdfium

html_test = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="css/styles.css">
<style>
  /* Override thead so it does not repeat */
  .preparador-main-table thead {
    display: table-row-group !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
  .cell-p {
    margin: 0 0 5px 0 !important;
    line-height: 1.25 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    orphans: 3 !important;
    widows: 3 !important;
  }
  .phase-title {
    margin: 7px 0 3px 0 !important;
    font-weight: bold !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
</style>
</head>
<body>
<div id="printable-report">
  <div class="preparador-sheet-wrapper">
    <table class="preparador-header-table">
      <tr>
        <td class="header-logo-cell"><div>[ESCUDO]</div></td>
        <td class="header-title-cell">
          <div class="inst-name">COLEGIO HOGAR MADRE DE DIOS</div>
          <div class="doc-title">PREPARADOR DE CLASES</div>
        </td>
        <td class="header-meta-cell">
          <div class="meta-row"><strong>CODIGO:</strong> F- GA</div>
          <div class="meta-row"><strong>VERSION:</strong> 02</div>
          <div class="meta-row" style="border-bottom:none;">31.JUL.26</div>
        </td>
      </tr>
    </table>
    <div class="preparador-meta-lines">
      <div class="meta-line-row">
        <span class="meta-field"><strong>ASIGNATURA:</strong> <span class="underlined-val">Matemáticas</span></span>
        <span class="meta-field"><strong>GRADO:</strong> <span class="underlined-val">3°</span></span>
        <span class="meta-field"><strong>PERIODO:</strong> <span class="underlined-val">1°</span></span>
        <span class="meta-field" style="flex:1.5;"><strong>DOCENTE:</strong> <span class="underlined-val">Manuel Muñoz</span></span>
      </div>
      <div class="meta-line-row" style="margin-top: 6px;">
        <span class="meta-field" style="width:100%;"><strong>SEMANA DEL</strong> <span class="underlined-val">07 de Septiembre de 2026</span> <strong>AL</strong> <span class="underlined-val">11 de Septiembre de 2026</span></span>
      </div>
    </div>
    <table class="preparador-main-table">
      <thead>
        <tr>
          <th style="width: 10%;">FECHA<br/><small>d/m/a</small></th>
          <th style="width: 6%;">CLASE</th>
          <th style="width: 8%;">DÍA</th>
          <th style="width: 14%;">DBA</th>
          <th style="width: 16%;">LOGRO E<br/>INDICADOR</th>
          <th style="width: 14%;">TEMA</th>
          <th style="width: 32%;">Secuencia didáctica Inicio-Desarrollo -cierre</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8pt;">07/09/2026</td>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8.5pt; font-weight: bold;">1</td>
          <td style="text-align: center; vertical-align: middle; padding: 4px; font-size: 8pt;">Lunes</td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25;">
            <p class="cell-p">• Resuelve adiciones y sustracciones aplicando propiedades para optimizar cálculos.</p>
            <p class="cell-p">• Clasifica, describe y representa formas bidimensionales y tridimensionales según sus propiedades geométricas.</p>
            <p class="cell-p">• Clasifica y organiza datos en tablas de conteo y pictogramas, comunicando los resultados obtenidos.</p>
          </td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25;">
            <p class="cell-p">• Plantea y resuelve situaciones aditivas en contextos cotidianos.</p>
            <p class="cell-p">• Identifica y modela figuras geométricas en objetos de su entorno.</p>
            <p class="cell-p">• Interpreta información estadística presentada en tablas y gráficos.</p>
          </td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; font-weight: 500; line-height: 1.25;">
            <p class="cell-p">Clase #1: Diagnóstico inicial y bienvenida a Matemáticas</p>
          </td>
          <td style="vertical-align: top; padding: 4px; font-size: 8pt; line-height: 1.25;">
            <p class="cell-p">Plantea, resuelve y explica problemas aditivos en contextos cotidianos, para tomar decisiones y argumentar situaciones del entorno escolar y familiar.</p>
            <div class="phase-title">FASE DE INICIO (Tiempo: 30 minutos)</div>
            <p class="cell-p"><strong>Saludo y presentación del docente:</strong> Bienvenida al año lectivo e inicio formal del primer periodo académico. Presentación del docente titular del área de matemáticas, generando un ambiente de confianza, cercanía y motivación hacia el aprendizaje.</p>
            <p class="cell-p"><strong>Dinámica de integración y reconocimiento:</strong> Espacio guiado para que los estudiantes se presenten, compartan sus expectativas y reconozcan a sus compañeros de clase, estableciendo acuerdos iniciales de escucha activa y respeto mutuo.</p>
            <p class="cell-p"><strong>Encuadre pedagógico y metodológico:</strong> Socialización de las normas de convivencia para la clase de matemáticas, pautas sobre el cuidado de los materiales y la importancia del orden en el cuaderno cuadriculado (un número por casilla y uso adecuado del espacio).</p>
            <div class="phase-title">FASE DE DESARROLLO (Tiempo: 60 minutos)</div>
            <p class="cell-p"><strong>Diagnóstico verbal de saberes previos:</strong> Sondeo oral y actividades guiadas en el tablero para verificar habilidades básicas de conteo y cálculo aditivo.</p>
            <p class="cell-p"><strong>Resolución guiada de ejercicios:</strong> Modelado paso a paso en el tablero de situaciones cotidianas de suma y resta con material concreto y representaciones gráficas.</p>
            <p class="cell-p"><strong>Trabajo individual en el cuaderno:</strong> Aplicación práctica de los conceptos abordados mediante ejercicios de afianzamiento y cálculo mental reflexivo.</p>
            <p class="cell-p"><strong>Actividad complementaria de profundización:</strong> Resolución de problemas contextualizados en grupos cooperativos de 3 estudiantes, utilizando fichas de colores y rectas numéricas dibujadas en el patio.</p>
            <p class="cell-p"><strong>Puesta en común:</strong> Cada grupo expone su estrategia de resolución y se comparan los diferentes caminos seguidos para llegar a la respuesta correcta.</p>
            <div class="phase-title">FASE DE CIERRE (Tiempo: 15 minutos)</div>
            <p class="cell-p"><strong>Socialización y verificación de aprendizajes:</strong> Puesta en común de dudas recurrentes, consolidación de conclusiones y firma del compromiso escolar.</p>
            <p class="cell-p">Asignación de actividades de refuerzo en casa y despedida.</p>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="preparador-obs-container">
      <div class="obs-title"><strong>OBSERVACIONES:</strong></div>
      <div class="obs-content-lines">
        <div class="obs-line"></div>
        <div class="obs-line"></div>
        <div class="obs-line"></div>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""

with open("test_opt1.html", "w", encoding="utf-8") as f:
    f.write(html_test)

pdf_path = os.path.abspath("test_opt1.pdf")
cmd = [r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={pdf_path}", f"file:///{os.path.abspath('test_opt1.html')}"]
subprocess.run(cmd, capture_output=True, text=True)

reader = pypdf.PdfReader(pdf_path)
print("Num pages:", len(reader.pages))
pdf = pdfium.PdfDocument(pdf_path)
for i, page in enumerate(pdf):
    page.render(scale=2).to_pil().save(f"test_opt1_p{i+1}.png")
print("Saved pages as png!")
