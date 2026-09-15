import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

for i in range(1, len(pages), 2):
    pnum = int(pages[i])
    pcont = pages[i+1]
    for line in pcont.split('\n')[:10]:
        line_s = line.strip()
        if 'GRADO:' in line_s.upper():
            print(f"P.{pnum}: {line_s}")
