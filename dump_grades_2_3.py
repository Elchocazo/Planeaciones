import pypdf, re

pdf_path = r'C:\Users\moz65\.gemini\antigravity\brain\cea54725-2040-452c-bda1-48369e120b0c\.user_uploaded\media_1787970284148.pdf'
r = pypdf.PdfReader(pdf_path)

def dump_pages(start, end, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        for p in range(start - 1, end):
            raw = r.pages[p].extract_text()
            clean = re.sub(r'\s+', ' ', raw)
            f.write(f"\n{'='*40}\nPAGE {p+1}\n{'='*40}\n")
            f.write(clean + "\n")

dump_pages(22, 28, 'segundo_math.txt')
dump_pages(29, 36, 'tercero_math.txt')
print("Dumped Segundo and Tercero Math!")
