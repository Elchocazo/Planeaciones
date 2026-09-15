import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def extract_section_periods(pdf_path, start_page, end_page):
    reader = pypdf.PdfReader(pdf_path)
    pages_text = []
    for p in range(start_page - 1, end_page):
        txt = reader.pages[p].extract_text() or ""
        pages_text.append(txt)
    full_text = "\n".join(pages_text)
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    compact = " ".join(lines)
    
    # Get general DBA
    dba_general = ""
    dba_match = re.search(r'D\.?B\.?A\.?\s+PARA\s+TODOS\s+LOS\s+PER[IÍ]ODOS:?(.*?)(COMPETENCIAS|COMPONENTES|DISEÑO|USO|EVALUACIÓN|PRIMER\s+PER[IÍ]ODO|PERÍODO:\s*PRIMERO)', compact, re.IGNORECASE)
    if dba_match:
        dba_general = dba_match.group(1).strip()
    
    # Objective
    obj = ""
    obj_match = re.search(r'OBJETIVO\s+DEL\s+GRADO:?(.*?)(D\.?B\.?A|COMPETENCIAS|COMPONENTES|PRIMER\s+PER[IÍ]ODO|PERÍODO:\s*PRIMERO)', compact, re.IGNORECASE)
    if obj_match:
        obj = obj_match.group(1).strip()
        
    # Split periods
    p_pattern = r'(PRIMER\s+PER[IÍ]ODO|SEGUNDO\s+PER[IÍ]ODO|TERCER\s+PER[IÍ]ODO|CUARTO\s+PER[IÍ]ODO|PER[IÍ]ODO:\s*(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|I|II|III|IV))'
    splits = re.split(p_pattern, compact, flags=re.IGNORECASE)
    
    periods = {}
    
    for i in range(1, len(splits), 2):
        raw_name = splits[i].strip().upper()
        content = splits[i+1]
        
        # map name to 1°, 2°, 3°, 4°
        p_key = "1°"
        if "SEGUND" in raw_name or " II" in raw_name or raw_name.endswith(": II"):
            p_key = "2°"
        elif "TERCER" in raw_name or " III" in raw_name or raw_name.endswith(": III"):
            p_key = "3°"
        elif "CUART" in raw_name or " IV" in raw_name or raw_name.endswith(": IV"):
            p_key = "4°"
            
        # Extract headers and body
        headers = ["PREGUNTA PROBLEMATIZADORA", "ESTÁNDAR", "EJES TEMÁTICOS", "INDICADORES DE DESEMPEÑO", "RECURSOS PEDAGÓGICOS", "EVALUACIÓN FORMATIVA"]
        
        # If the 6 headers exist, body starts after last header
        # Let's find each header's index
        indices = []
        for h in headers:
            idx = content.find(h)
            if idx != -1:
                indices.append((idx, h))
        indices.sort()
        
        body = content
        if len(indices) >= 4:
            body = content[indices[-1][0] + len(indices[-1][1]):].strip()
            
        periods[p_key] = {
            'raw_name': raw_name,
            'body': body
        }
        
    return {
        'dba_general': dba_general,
        'objective': obj,
        'periods': periods
    }

# Test on Sistemas 1°
res = extract_section_periods("Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf", 1, 5)
print("Sistemas 1° periods extracted:", list(res['periods'].keys()))
for p, data in res['periods'].items():
    print(f"  {p}: body length = {len(data['body'])} chars | Starts: {data['body'][:100]}...")
