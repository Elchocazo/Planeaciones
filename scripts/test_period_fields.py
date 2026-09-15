import sys
import pypdf
import re

sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf")

# Extract text of Grade 1 (Pages 1 to 5)
pages_text = [reader.pages[p].extract_text() or "" for p in range(5)]
full_text = "\n".join(pages_text)
lines = [l.strip() for l in full_text.split('\n') if l.strip()]
compact = " ".join(lines)

p_splits = re.split(r'(PRIMER\s+PER[IÍ]ODO|SEGUNDO\s+PER[IÍ]ODO|TERCER\s+PER[IÍ]ODO|CUARTO\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|I|II|III|IV))', compact, flags=re.IGNORECASE)

for i in range(1, len(p_splits), 2):
    pname = p_splits[i].strip()
    pcont = p_splits[i+1]
    print(f"\n==================== {pname} ====================")
    # Check if headers appear
    headers = ["PREGUNTA PROBLEMATIZADORA", "ESTÁNDAR", "EJES TEMÁTICOS", "INDICADORES DE DESEMPEÑO", "RECURSOS PEDAGÓGICOS", "EVALUACIÓN FORMATIVA"]
    # find where each header appears
    h_indices = []
    for h in headers:
        pos = pcont.find(h)
        if pos != -1:
            h_indices.append((pos, h))
    h_indices.sort()
    print("Found headers:", [h for _, h in h_indices])
    
    if len(h_indices) == 6:
        # After the 6th header is where the content begins!
        last_h_pos, last_h = h_indices[-1]
        content_start = last_h_pos + len(last_h)
        body = pcont[content_start:].strip()
        print(f"Body start: {body[:300]}...")
