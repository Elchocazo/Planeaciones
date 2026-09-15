import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Map page ranges to grade
grades_info = [
    ("PRIMERO (1°)", 1, 5),
    ("SEGUNDO (2°)", 6, 11),
    ("TERCERO (3°)", 12, 18),
    ("CUARTO (4° / 4°A / 4°B)", 19, 24),
    ("QUINTO (5°)", 25, 30),
    ("SEXTO (6°)", 31, 37),
    ("SÉPTIMO (7°)", 38, 44),
    ("OCTAVO (8°)", 45, 52),
    ("NOVENO (9° - Robótica)", 53, 59),
    ("DÉCIMO (10° - Robótica)", 60, 67),
    ("UNDÉCIMO (11° - Robótica)", 68, 84),
]

for gname, start_p, end_p in grades_info:
    print(f"\n=======================================================")
    print(f"GRADE: {gname} (Pages {start_p}-{end_p})")
    print(f"=======================================================")
    for p in range(start_p, end_p + 1):
        idx = p * 2
        pcont = pages[idx]
        # find period mentions
        p_matches = re.findall(r'(PRIMER|SEGUNDO|TERCER|CUARTO)\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*([^\n\r]+)', pcont, re.IGNORECASE)
        # find axes or questions
        questions = [l.strip() for l in pcont.split('\n') if l.strip().startswith('¿')]
        topics = [l.strip() for l in pcont.split('\n') if any(l.strip().startswith(x) for x in ['Tema ', 'Eje ', '1.', '2.', '3.', '4.', '●', '-']) and len(l.strip()) < 80]
        p_str = ", ".join([m[0] or m[1] for m in p_matches])
        print(f"  P.{p}: Periods found: [{p_str}] | Questions: {len(questions)}")
