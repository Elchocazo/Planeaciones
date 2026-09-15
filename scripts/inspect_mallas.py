import os
import pypdf

def inspect_pdf(filepath):
    print(f"==================================================")
    print(f"FILE: {filepath}")
    print(f"==================================================")
    reader = pypdf.PdfReader(filepath)
    print(f"Total pages: {len(reader.pages)}")
    
    for i in range(min(5, len(reader.pages))):
        print(f"\n--- Page {i+1} sample (first 400 chars) ---")
        text = reader.pages[i].extract_text() or ""
        print(text[:400].replace('\n', ' '))

inspect_pdf("Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf")
inspect_pdf("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf")
