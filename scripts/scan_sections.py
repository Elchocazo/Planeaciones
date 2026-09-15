import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def find_sections(filename):
    print(f"\n==========================================")
    print(f"SECTIONS IN {filename}")
    print(f"==========================================")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    pages = content.split('='*50)
    for p in pages:
        if not p.strip().startswith('PAGE'):
            continue
        lines = [l.strip() for l in p.split('\n') if l.strip()]
        page_num = lines[0] if lines else ""
        text = " ".join(lines)
        
        # Look for indicators of subject, grade, period
        header_matches = []
        for line in lines[:15]:
            if any(k in line.upper() for k in ['GRADO:', 'GRADO ', 'PERÍODO:', 'PERIODO:', 'PERÍODO', 'PERIODO', 'LÓGICA', 'MATEMÁTICA', 'SISTEMAS', 'ROBÓTICA', 'DOCENTE:']):
                header_matches.append(line)
        if header_matches:
            print(f"[{page_num}] " + " | ".join(header_matches[:4]))

find_sections('mallas_matematicas_full.txt')
find_sections('mallas_sistemas_full.txt')
