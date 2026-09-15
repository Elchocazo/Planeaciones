import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def scan_file(filename):
    print(f"\n=================================================================")
    print(f"ANALYSIS OF: {filename}")
    print(f"=================================================================")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    pages = content.split('='*70)
    for p in pages:
        p_clean = p.strip()
        if not p_clean.startswith('PAGE'):
            continue
        lines = p_clean.split('\n')
        page_header = lines[0].strip()
        
        # Look for subject, grade, period headers
        found = []
        for line in lines[1:25]:
            line_str = line.strip()
            if not line_str:
                continue
            if any(k in line_str.upper() for k in ['GRADO', 'PERÍODO', 'PERIODO', 'ASIGNATURA', 'LÓGICA', 'MATEMÁTICA', 'SISTEMAS', 'ROBÓTICA', 'DOCENTE:']):
                # simplify whitespace
                compact = re.sub(r'\s+', ' ', line_str)
                found.append(compact)
        if found:
            print(f"[{page_header}]")
            for item in found[:5]:
                print(f"   {item}")

scan_file("mallas_matematicas_layout.txt")
