import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Print pages 1 and 2 (Lógica Sexto)
print("=== PAGE 1 (Lógica 6°) ===")
print(pages[2][:2000])

print("\n=== PAGE 2 (Lógica 6° P1) ===")
print(pages[4][:2500])
