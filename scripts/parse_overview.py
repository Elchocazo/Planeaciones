import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def parse_overview():
    with open('mallas_summary.txt', 'w', encoding='utf-8') as out:
        out.write("=================================================================\n")
        out.write("MALLAS MANUEL 2026-2027 MATEMÁTICAS\n")
        out.write("=================================================================\n")
        with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
            math_text = f.read()
        
        pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', math_text)
        for i in range(1, len(pages), 2):
            pnum = pages[i]
            pcont = pages[i+1]
            # search for main headers
            lines = [l.strip() for l in pcont.split('\n') if l.strip()]
            main_lines = []
            for l in lines[:10]:
                if any(k in l.upper() for k in ['GRADO', 'LÓGICA', 'MATEMÁTICA', 'PERÍODO', 'PERIODO', 'DOCENTE:']):
                    main_lines.append(re.sub(r'\s+', ' ', l))
            out.write(f"Page {pnum}: " + " | ".join(main_lines) + "\n")

        out.write("\n=================================================================\n")
        out.write("MALLAS CURRICULARES SISTEMAS 1-11\n")
        out.write("=================================================================\n")
        with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
            sis_text = f.read()
        
        pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', sis_text)
        for i in range(1, len(pages), 2):
            pnum = pages[i]
            pcont = pages[i+1]
            lines = [l.strip() for l in pcont.split('\n') if l.strip()]
            main_lines = []
            for l in lines[:12]:
                if any(k in l.upper() for k in ['GRADO:', 'PERÍODO:', 'PERIODO:', 'DOCENTE:', 'TECNOLOGÍA', 'SISTEMAS', 'ROBÓTICA', 'INFORMÁTICA', 'OBJETIVO DEL GRADO']):
                    main_lines.append(re.sub(r'\s+', ' ', l))
            out.write(f"Page {pnum}: " + " | ".join(main_lines) + "\n")

parse_overview()
print("Saved summary to mallas_summary.txt")
