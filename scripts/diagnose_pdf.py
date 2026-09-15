import os
import sys
import subprocess
from pypdf import PdfReader

# 1. Run node script to generate test PDFs
node_script = "
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

global.window = global;
require('../js/export.js');

const profile = {
  name: 'Manuel Muñoz',
  institution: 'COLEGIO HOGAR MADRE DE DIOS',
  code: 'F- GA',
  version: '02',
  formatDate: '31.JUL.26',
  period: '1°'
};

const makePlan = (multiplier) => ({
  date: '2026-09-14',
  period: '1°',
  classes: [
    {
      date: '2026-09-14',
      dayNumber: '1',
      dayOfWeek: 'Lunes',
      subject: 'Ciencias Naturales',
      grade: '6°',
      dba: 'Comprende que los seres vivos están formados por células y que estas cumplen funciones vitales.',
      achievement: 'Identifica la estructura básica de la célula eucariota y procariota, reconociendo organelos.',
      topic: 'La Célula: Estructura y Funcionamiento Celular',
      description: [
        'Fase de Inicio: Saludo de bienvenida y oración inicial. Exploración de saberes previos mediante preguntas orientadoras: ¿De qué están hechos todos los seres vivos? ¿Por qué no podemos ver las células a simple vista? Observación guiada de una lámina con corcho vegetal y tejido epitelial.',
        'Fase de Desarrollo: Explicación conceptual detallada de la teoría celular y los postulados fundamentales. Comparación gráfica entre células procariotas y eucariotas (animal y vegetal). ' + ('Proyección de un video didáctico sobre las funciones de los organelos: mitocondria, núcleo, ribosomas, retículo endoplasmático, aparato de Golgi y cloroplastos. Desarrollo de un cuadro comparativo en el cuaderno con los estudiantes. '.repeat(multiplier)),
        'Fase de Cierre: Ronda de preguntas rápidas y socialización de respuestas. Verificación de conceptos clave mediante la técnica del semáforo. Registro de conclusiones en el cuaderno pedagógico.',
        'Recursos: Láminas didácticas microscópicas, video educativo, televisor, marcadores y cuaderno de apuntes.',
        'Evaluación formativa: Participación activa en el diálogo socrático y revisión del cuadro comparativo individual en clase.',
        'Tarea / Compromiso: Dibujar en una página completa del cuaderno una célula animal señalando mínimo 8 organelos con sus respectivas funciones.'
      ].join('\\n\\n'),
      observations: 'Excelente participación activa de los estudiantes en la jornada.'
    }
  ]
});

const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const css = fs.readFileSync('css/styles.css', 'utf8');

[1, 2, 3, 4, 6].forEach(mult => {
  const plan = makePlan(mult);
  const htmlContent = ExportService.generatePreparadorHTML(plan, profile);
  const fullHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body><div id="printable-report" style="display:block;">' + htmlContent + '</div></body></html>';
  const htmlPath = path.resolve('test_diag_' + mult + '.html');
  const pdfPath = path.resolve('test_diag_' + mult + '.pdf');
  fs.writeFileSync(htmlPath, fullHtml);
  spawnSync(chromePath, ['--headless=new', '--disable-gpu', '--print-to-pdf=' + pdfPath, 'file:///' + htmlPath.replace(/\\\\/g, '/')]);
});
"

with open('scripts/temp_gen.js', 'w', encoding='utf-8') as f:
    f.write(node_script)

subprocess.run(['node', 'scripts/temp_gen.js'], check=True)

for mult in [1, 2, 3, 4, 6]:
    pdf_name = f'test_diag_{mult}.pdf'
    if not os.path.exists(pdf_name):
        print(f'Multiplier {mult}: PDF NOT FOUND')
        continue
    reader = PdfReader(pdf_name)
    num_pages = len(reader.pages)
    print(f'\\n================== MULTIPLIER {mult} ({num_pages} PÁGINAS) ==================')
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        has_header = 'COLEGIO HOGAR MADRE DE DIOS' in text
        has_table_header = 'FECHA' in text or 'Secuencia' in text
        has_content = 'Fase de Inicio' in text or 'Ciencias Naturales' in text
        print(f'  --- Página {i+1} --- (Largo texto: {len(text)} chars)')
        print(f'      Tiene Encabezado Institucional: {has_header}')
        print(f'      Tiene Encabezado de Columnas (FECHA, Secuencia): {has_table_header}')
        print(f'      Tiene Contenido de la Clase (Fase Inicio / Ciencias): {has_content}')
        lines = [line.strip() for line in text.split('\\n') if line.strip()]
        preview =  | .join(lines[:6])
        print(f'      Primeras líneas: {preview[:120]}...')

