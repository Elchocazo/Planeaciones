import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Pages 6 to 12 are Matemáticas 7°
m7_text = ""
for p in range(6, 13):
    idx = p * 2
    m7_text += f"\n--- PAGE {p} ---\n" + pages[idx]

# Let's find each period header
periods = re.split(r'(PRIMER\s+PERIODO|SEGUNDO\s+PERIODO|TERCER\s+PERIODO|CUARTO\s+PERIODO):?', m7_text, flags=re.IGNORECASE)
print(f"Math 7 periods found: {len(periods)//2}")
for i in range(1, len(periods), 2):
    pname = periods[i].strip()
    pbody = periods[i+1]
    print(f"\n====================== {pname} ======================")
    # look for EJES TEMÁTICOS in the layout lines
    lines = pbody.split('\n')
    header_found = False
    for l in lines:
        if 'EJES TEMÁTICOS' in l:
            header_found = True
        if 'PREGUNTA' in l and '¿' in l:
            print("Pregunta:", l.strip()[:80])
