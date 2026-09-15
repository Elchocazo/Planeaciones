import pypdf

pdf_path = r'C:\Users\moz65\.gemini\antigravity\brain\cea54725-2040-452c-bda1-48369e120b0c\.user_uploaded\media_1787970284148.pdf'
r = pypdf.PdfReader(pdf_path)

with open('septimo_p1_text.txt', 'w', encoding='utf-8') as f:
    for p in range(61, 67):
        f.write(f"\n{'='*50}\nPAGE {p+1}\n{'='*50}\n")
        f.write(r.pages[p].extract_text())

print("Dumped pages 62-67 successfully")
