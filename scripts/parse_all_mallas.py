import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def parse_pdf_stream(pdf_path, sections):
    reader = pypdf.PdfReader(pdf_path)
    results = {}
    
    for sec_name, start_p, end_p in sections:
        print(f"\n=======================================================")
        print(f"PARSING SECTION: {sec_name} (Pages {start_p}-{end_p})")
        print(f"=======================================================")
        
        pages_text = []
        for p in range(start_p - 1, end_p):
            txt = reader.pages[p].extract_text() or ""
            pages_text.append(txt)
            
        full_text = "\n[PAGE_BREAK]\n".join(pages_text)
        
        # Clean up repeated whitespace
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        compact_stream = " ".join(lines)
        
        # Extract general DBA for all periods if present
        dba_all = ""
        dba_match = re.search(r'D\.?B\.?A\.?\s+PARA\s+TODOS\s+LOS\s+PER[IÍ]ODOS:?(.*?)(COMPETENCIAS|COMPONENTES|PRIMER\s+PER[IÍ]ODO)', compact_stream, re.IGNORECASE)
        if dba_match:
            dba_all = dba_match.group(1).strip()
            print(f"  Found general DBA ({len(dba_all)} chars)")
            
        # Extract Objective
        obj_match = re.search(r'OBJETIVO\s+DEL\s+GRADO:?(.*?)(D\.?B\.?A|COMPETENCIAS|COMPONENTES|PRIMER\s+PER[IÍ]ODO)', compact_stream, re.IGNORECASE)
        obj = obj_match.group(1).strip() if obj_match else ""
        if obj:
            print(f"  Objective: {obj[:120]}...")
            
        # Split by periods
        # Periods are typically: PRIMER PERIODO, SEGUNDO PERIODO, TERCER PERIODO, CUARTO PERIODO
        p_pattern = r'(PRIMER\s+PER[IÍ]ODO|SEGUNDO\s+PER[IÍ]ODO|TERCER\s+PER[IÍ]ODO|CUARTO\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|I|II|III|IV))'
        period_splits = re.split(p_pattern, compact_stream, flags=re.IGNORECASE)
        
        print(f"  Found {len(period_splits)} chunks in period split")
        results[sec_name] = {
            'objective': obj,
            'dba_all': dba_all,
            'raw_splits': len(period_splits)
        }
        
    return results

# Test math sections
math_sections = [
    ("Lógica 6°", 1, 5),
    ("Matemáticas 7°", 6, 12),
    ("Matemáticas 3°", 13, 17),
    ("Matemáticas 2°", 18, 24),
]

parse_pdf_stream("Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf", math_sections)
