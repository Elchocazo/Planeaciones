import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf")

sections = [
    ("Sistemas 1°", 1, 5),
    ("Sistemas 2°", 6, 11),
    ("Sistemas 3°", 12, 18),
    ("Sistemas 4°", 19, 24),
    ("Sistemas 5°", 25, 30),
    ("Sistemas 6°", 31, 37),
    ("Sistemas 7°", 38, 44),
    ("Sistemas 8°", 45, 52),
    ("Robótica 9°", 53, 59),
    ("Robótica 10°", 60, 67),
    ("Robótica 11°", 68, 84),
]

for sec_name, start_p, end_p in sections:
    pages_text = []
    for p in range(start_p - 1, end_p):
        txt = reader.pages[p].extract_text() or ""
        pages_text.append(txt)
    full_text = "\n[PAGE_BREAK]\n".join(pages_text)
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    compact = " ".join(lines)
    
    # Check general DBA
    dba_match = re.search(r'D\.?B\.?A\.?\s+PARA\s+TODOS\s+LOS\s+PER[IÍ]ODOS:?(.*?)(COMPETENCIAS|DISEÑO|USO|EVALUACIÓN|PRIMER|PERÍODO)', compact, re.IGNORECASE)
    dba_len = len(dba_match.group(1)) if dba_match else 0
    
    # Check objective
    obj_match = re.search(r'OBJETIVO\s+DEL\s+GRADO:?(.*?)(D\.?B\.?A|COMPETENCIAS|PRIMER|PERÍODO)', compact, re.IGNORECASE)
    obj_str = obj_match.group(1)[:60] if obj_match else "None"
    
    # Split by periods
    p_splits = re.split(r'(PRIMER\s+PER[IÍ]ODO|SEGUNDO\s+PER[IÍ]ODO|TERCER\s+PER[IÍ]ODO|CUARTO\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|I|II|III|IV))', compact, flags=re.IGNORECASE)
    
    print(f"{sec_name:15}: DBA_len={dba_len:4} | Obj={obj_str:30} | Period_splits={len(p_splits)}")
