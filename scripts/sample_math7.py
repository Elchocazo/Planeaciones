import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect how tables are laid out across pages in math
with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    math_text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', math_text)

# Let's check Matemáticas 7° (pages 6 to 12)
print("=== MATEMÁTICAS 7° SAMPLE (PAGE 6-8) ===")
for p in [6, 7, 8, 9, 10, 11, 12]:
    idx = p * 2
    print(f"--- PAGE {p} ---")
    lines = pages[idx].split('\n')
    for l in lines[:30]:
        if l.strip():
            print(l[:100])
