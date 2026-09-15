import sys
import pypdf
import re

sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf')
# Let's inspect page 2 text
txt = reader.pages[1].extract_text()

# Look at txt
lines = [l.strip() for l in txt.split('\n') if l.strip()]
print(f"Total lines: {len(lines)}")
# If we join tokens:
# notice consecutive non-empty lines are words or fragments
text_joined = " ".join(lines)
# Let's see how headers appear in text_joined:
headers = ["PREGUNTA PROBLEMATIZADORA", "ESTÁNDAR", "EJES TEMÁTICOS", "INDICADORES DE DESEMPEÑO", "RECURSOS PEDAGÓGICOS", "EVALUACIÓN FORMATIVA"]

pos = []
for h in headers:
    idx = text_joined.find(h)
    pos.append((idx, h))

pos.sort()
print("Header occurrences in page 2:")
for idx, h in pos:
    print(f"  {idx}: {h}")
