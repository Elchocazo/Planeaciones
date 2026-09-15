import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    math_text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', math_text)
print("=== MATH PAGES STRUCTURE ===")
for i in range(1, len(pages), 2):
    pnum = int(pages[i])
    pcont = pages[i+1]
    # let's find lines with PERIODO, EJES TEMATICOS, INDICADORES, DBA, etc.
    lines = pcont.split('\n')
    keywords = []
    for l in lines:
        for kw in ['PREGUNTA PROBLEMATIZADORA', 'ESTÁNDAR', 'EJES TEMÁTICOS', 'INDICADORES DE DESEMPEÑO', 'RECURSOS', 'EVALUACIÓN FORMATIVA', 'D.B.A.', 'D.B.A', 'PRIMER PERIODO', 'SEGUNDO PERIODO', 'TERCER PERIODO', 'CUARTO PERIODO', 'GRADO:']:
            if kw in l.upper():
                keywords.append(kw)
    print(f"Page {pnum}: {list(dict.fromkeys(keywords))}")
