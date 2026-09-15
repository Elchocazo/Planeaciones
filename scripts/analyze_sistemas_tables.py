import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    sis_text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', sis_text)
print("=== SISTEMAS PAGES STRUCTURE ===")
current_grade = "Unknown"
for i in range(1, len(pages), 2):
    pnum = int(pages[i])
    pcont = pages[i+1]
    
    # check for grade
    gmatch = re.search(r'GRADO:\s*([^\n\r]+)', pcont, re.IGNORECASE)
    if gmatch:
        current_grade = gmatch.group(1).strip()
    
    # check for period
    periods = re.findall(r'(PRIMER|SEGUNDO|TERCER|CUARTO)\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*([^\n\r]+)', pcont, re.IGNORECASE)
    pers = [p[0] or p[1] for p in periods]
    
    # check if table headers present
    has_table = any(kw in pcont.upper() for kw in ['EJES TEMÁTICOS', 'INDICADORES DE DESEMPEÑO', 'PREGUNTA PROBLEMATIZADORA', 'OBJETIVO DEL GRADO'])
    if gmatch or pers or (pnum % 5 == 0):
        print(f"Page {pnum}: Grade={current_grade} | Periods={pers} | HasTable={has_table}")
