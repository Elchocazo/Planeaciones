import os
import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

def dump_layout(filepath, out_txt):
    print(f"Dumping {filepath} with layout mode...")
    reader = pypdf.PdfReader(filepath)
    with open(out_txt, 'w', encoding='utf-8') as out:
        out.write(f"FILE: {filepath}\nTOTAL PAGES: {len(reader.pages)}\n\n")
        for i, page in enumerate(reader.pages):
            text = page.extract_text(extraction_mode='layout') or ""
            out.write(f"\n{'='*70}\nPAGE {i+1}\n{'='*70}\n")
            out.write(text)
    print(f"Saved to {out_txt}")

dump_layout("Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf", "mallas_matematicas_layout.txt")
dump_layout("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf", "mallas_sistemas_layout.txt")
