import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

print("=== MATEMÁTICAS 3° (PAGES 13-17) ===")
for p in range(13, 18):
    idx = p * 2
    print(f"\n--- PAGE {p} ---")
    lines = pages[idx].split('\n')
    for l in lines[:25]:
        if any(k in l.upper() for k in ['PERIODO', 'TEMA', 'EJES', 'PREGUNTA', 'ESTÁNDAR', 'OBJETIVO', 'D.B.A']):
            print("  ", l.strip()[:100])

print("\n=== MATEMÁTICAS 2° (PAGES 18-24) ===")
for p in range(18, 25):
    idx = p * 2
    print(f"\n--- PAGE {p} ---")
    lines = pages[idx].split('\n')
    for l in lines[:25]:
        if any(k in l.upper() for k in ['PERIODO', 'TEMA', 'EJES', 'PREGUNTA', 'ESTÁNDAR', 'OBJETIVO', 'D.B.A']):
            print("  ", l.strip()[:100])
