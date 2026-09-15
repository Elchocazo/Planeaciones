import zipfile
import xml.etree.ElementTree as ET

docx_path = r'Ejemplopreparador/F-GA PREPARADOR DE CLASE COLEGIO HOGAR (2).docx'
with zipfile.ZipFile(docx_path) as z:
    doc_xml = z.read('word/document.xml')
    root = ET.fromstring(doc_xml)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tbls = root.findall('.//w:tbl', ns)
    
    for t_idx in [0]:
        print(f"\n==================== TABLE {t_idx} ====================")
        tbl = tbls[t_idx]
        tblPr = tbl.find('w:tblPr', ns)
        print("tblPr:", ET.tostring(tblPr, encoding='unicode') if tblPr is not None else "None")
        tblGrid = tbl.find('w:tblGrid', ns)
        print("tblGrid:", ET.tostring(tblGrid, encoding='unicode') if tblGrid is not None else "None")
        
        for r_idx, r in enumerate(tbl.findall('w:tr', ns)):
            print(f"\n  --- ROW {r_idx} ---")
            trPr = r.find('w:trPr', ns)
            if trPr is not None:
                print("  trPr:", ET.tostring(trPr, encoding='unicode'))
            for c_idx, c in enumerate(r.findall('w:tc', ns)):
                tcPr = c.find('w:tcPr', ns)
                tcPr_str = ET.tostring(tcPr, encoding='unicode') if tcPr is not None else ""
                texts = [''.join(p.itertext()) for p in c.findall('w:p', ns)]
                pPrs = [ET.tostring(p.find('w:pPr', ns), encoding='unicode') if p.find('w:pPr', ns) is not None else "" for p in c.findall('w:p', ns)]
                print(f"    Cell {c_idx}:")
                print(f"      tcPr: {tcPr_str}")
                for pi, txt in enumerate(texts):
                    print(f"      P{pi}: '{txt}' | pPr: {pPrs[pi]}")
