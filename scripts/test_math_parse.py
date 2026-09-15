import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# For each grade in math:
# Grade 6 Lógica: pages 1 to 5
# Grade 7 Matemáticas: pages 6 to 12
# Grade 3 Matemáticas: pages 13 to 17
# Grade 2 Matemáticas: pages 18 to 24

def show_page_range(title, start_p, end_p):
    print(f"==================================================")
    print(f"{title} (Pages {start_p}-{end_p})")
    print(f"==================================================")
    full_text = ""
    for p in range(start_p, end_p + 1):
        idx = p * 2
        full_text += f"\n--- PAGE {p} ---\n" + pages[idx]
    
    # find periods
    periods = re.split(r'(PRIMER|SEGUNDO|TERCER|CUARTO)\s+PER[IÍ]ODO:?', full_text, flags=re.IGNORECASE)
    print(f"Found {len(periods)//2} periods")
    for i in range(1, len(periods), 2):
        pname = periods[i]
        pcontent = periods[i+1]
        print(f"\n>>> PERIOD: {pname} (Length: {len(pcontent)} chars)")
        # Look for EJES TEMATICOS
        ejes_match = re.search(r'EJES TEMÁTICOS(.*?)(INDICADORES DE DESEMPEÑO|RECURSOS|$)', pcontent, re.DOTALL | re.IGNORECASE)
        if ejes_match:
            print("  [EJES TEMÁTICOS snippet]:")
            ejes_lines = [l.strip() for l in ejes_match.group(1).split('\n') if l.strip()]
            for l in ejes_lines[:8]:
                print("    ", l[:90])

show_page_range("LÓGICA 6°", 1, 5)
show_page_range("MATEMÁTICAS 7°", 6, 12)
show_page_range("MATEMÁTICAS 3°", 13, 17)
show_page_range("MATEMÁTICAS 2°", 18, 24)
