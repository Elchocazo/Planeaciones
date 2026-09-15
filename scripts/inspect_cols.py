import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Page 2
lines = pages[4].split('\n')
for i, line in enumerate(lines):
    if 'EJES TEMÁTICOS' in line:
        print(f"Header line {i}:")
        print(line)
        for next_l in lines[i:i+35]:
            print(f"{next_l[:140]}")
        break
