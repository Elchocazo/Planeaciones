import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

def get_page_text(pnum):
    idx = pnum * 2
    return pages[idx] if idx < len(pages) else ""

# Test reading Math 7 periods 1 to 4
print("=== READING MATH 7 PERIODS ===")
# Page 6: Period 1 table
# Page 8: Period 2 table
# Page 9: Period 3 table
# Page 10/11: Period 4 table

for pnum, name in [(6, "P1"), (8, "P2"), (9, "P3"), (11, "P4")]:
    txt = get_page_text(pnum)
    lines = txt.split('\n')
    print(f"\n--- Math 7 {name} (Page {pnum}) ---")
    for l in lines[:25]:
        if l.strip():
            print(l[:90])
