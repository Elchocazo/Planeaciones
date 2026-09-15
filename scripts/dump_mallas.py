import os
import sys
import pypdf
import re

sys.stdout.reconfigure(encoding='utf-8')

def analyze_pdf(filepath, out_txt):
    print(f"=== Analyzing {filepath} ===")
    reader = pypdf.PdfReader(filepath)
    with open(out_txt, 'w', encoding='utf-8') as out:
        out.write(f"FILE: {filepath}\nTOTAL PAGES: {len(reader.pages)}\n\n")
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            out.write(f"\n{'='*50}\nPAGE {i+1}\n{'='*50}\n")
            out.write(text)
    print(f"Written full text to {out_txt}")

analyze_pdf("Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf", "mallas_matematicas_full.txt")
analyze_pdf("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf", "mallas_sistemas_full.txt")
