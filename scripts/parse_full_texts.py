import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    math_text = f.read()

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    sis_text = f.read()

math_pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', math_text)
sis_pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', sis_text)

def get_math_p(num):
    idx = num * 2
    return math_pages[idx] if idx < len(math_pages) else ""

def get_sis_p(num):
    idx = num * 2
    return sis_pages[idx] if idx < len(sis_pages) else ""

print("Layout helpers initialized.")
