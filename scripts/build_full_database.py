import sys
import os
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def parse_all():
    math_pdf = "Mallas/Mallas Manuel 2026 -2027 Matemáticas.pdf"
    sis_pdf = "Mallas/Mallas curriculares Sistemas 1-11.docx (1).pdf"
    
    sections = [
        # (PDF, subject, grade, start_page, end_page)
        (math_pdf, "Lógica", "6°", 1, 5),
        (math_pdf, "Matemáticas", "7°", 6, 12),
        (math_pdf, "Matemáticas", "3°", 13, 17),
        (math_pdf, "Matemáticas", "2°", 18, 24),
        (sis_pdf, "Sistemas", "1°", 1, 5),
        (sis_pdf, "Sistemas", "2°", 6, 11),
        (sis_pdf, "Sistemas", "3°", 12, 18),
        (sis_pdf, "Sistemas", "4°", 19, 24),
        (sis_pdf, "Sistemas", "5°", 25, 30),
        (sis_pdf, "Sistemas", "6°", 31, 37),
        (sis_pdf, "Sistemas", "7°", 38, 44),
        (sis_pdf, "Sistemas", "8°", 45, 52),
        (sis_pdf, "Robótica", "9°", 53, 59),
        (sis_pdf, "Robótica", "10°", 60, 67),
        (sis_pdf, "Robótica", "11°", 68, 84),
    ]
    
    database = {}
    
    for pdf_path, subject, grade, start_p, end_p in sections:
        print(f"Processing {subject} {grade} (Pages {start_p}-{end_p})...")
        reader = pypdf.PdfReader(pdf_path)
        pages_text = []
        for p in range(start_p - 1, end_p):
            txt = reader.pages[p].extract_text() or ""
            pages_text.append(txt)
        full_text = "\n".join(pages_text)
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        compact = " ".join(lines)
        
        # General DBA
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
        
        periods_data = {}
        for i in range(1, len(splits), 2):
            raw_name = splits[i].strip().upper()
            content = splits[i+1]
            
            p_key = "1°"
            if "SEGUND" in raw_name or " II" in raw_name or raw_name.endswith(": II"):
                p_key = "2°"
            elif "TERCER" in raw_name or " III" in raw_name or raw_name.endswith(": III"):
                p_key = "3°"
            elif "CUART" in raw_name or " IV" in raw_name or raw_name.endswith(": IV"):
                p_key = "4°"
                
            headers = ["PREGUNTA PROBLEMATIZADORA", "ESTÁNDAR", "EJES TEMÁTICOS", "INDICADORES DE DESEMPEÑO", "RECURSOS PEDAGÓGICOS", "EVALUACIÓN FORMATIVA"]
            indices = []
            for h in headers:
                pos = content.find(h)
                if pos != -1:
                    indices.append((pos, h))
            indices.sort()
            
            body = content
            if len(indices) >= 4:
                body = content[indices[-1][0] + len(indices[-1][1]):].strip()
                
            periods_data[p_key] = {
                'raw_name': raw_name,
                'body': body
            }
            
        key = f"{subject}_{grade}"
        database[key] = {
            'subject': subject,
            'grade': grade,
            'dba_general': dba_general,
            'objective': obj,
            'periods': periods_data
        }
        
    with open('extracted_curriculum_raw.json', 'w', encoding='utf-8') as out:
        json.dump(database, out, ensure_ascii=False, indent=2)
        
    print("\nSaved raw extraction to extracted_curriculum_raw.json")
    print(f"Total sections extracted: {len(database)}")

parse_all()
