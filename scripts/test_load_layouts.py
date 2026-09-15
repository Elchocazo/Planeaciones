import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect the layout text for math and systems, which preserves lines
with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    math_layout = f.read()

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    sis_layout = f.read()

print("Both layout files loaded successfully.")
