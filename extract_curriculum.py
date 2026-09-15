import pypdf

pdf_path = r'C:\Users\moz65\.gemini\antigravity\brain\cea54725-2040-452c-bda1-48369e120b0c\.user_uploaded\media_1787970284148.pdf'
r = pypdf.PdfReader(pdf_path)

with open('math_curriculum_extracted.txt', 'w', encoding='utf-8') as out:
    for i in range(len(r.pages)):
        txt = r.pages[i].extract_text()
        if any(w in txt.upper() for w in ['GRADO 7', 'GRADO: SÉPTIMO', 'GRADO: SEPTIMO', 'GRADO SÉPTIMO', 'GRADO SEPTIMO', 'MATEMÁTICAS GRADO 7', 'MATEMATICAS GRADO 7']):
            out.write(f"\n{'='*40}\nPAGE {i+1}\n{'='*40}\n")
            out.write(txt)

print("Extraction completed!")
