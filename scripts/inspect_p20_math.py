import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect page 20-21 of math layout (Grado 2°)
with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

print("=== MATH 2° PAGE 20 TABLE INSPECTION ===")
p20 = pages[40] # Page 20
for line in p20.split('\n'):
    if line.strip():
        print(line[:120])
