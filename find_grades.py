import pypdf, re

pdf_path = r'C:\Users\moz65\.gemini\antigravity\brain\cea54725-2040-452c-bda1-48369e120b0c\.user_uploaded\media_1787970284148.pdf'
r = pypdf.PdfReader(pdf_path)

with open('math_table_of_contents.txt', 'w', encoding='utf-8') as out:
    for i in range(len(r.pages)):
        raw = r.pages[i].extract_text()
        # Collapse whitespace
        clean = re.sub(r'\s+', ' ', raw)
        # Check if contains GRADO or PERIODO
        if 'GRADO' in clean.upper() or 'PERIODO' in clean.upper() or 'PERÍODO' in clean.upper():
            out.write(f"PAGE {i+1}: {clean[:200]}\n")

print("TOC generated!")
