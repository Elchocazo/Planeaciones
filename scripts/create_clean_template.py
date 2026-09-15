import zipfile
import xml.etree.ElementTree as ET

import shutil
import os

src_docx = r'Ejemplopreparador/F-GA PREPARADOR DE CLASE COLEGIO HOGAR (2).docx'
dst_docx = r'Preparador.docx'

if os.path.exists(dst_docx) and not os.path.exists('Preparador_antiguo.docx'):
    shutil.copy2(dst_docx, 'Preparador_antiguo.docx')
    print("Backed up old Preparador.docx to Preparador_antiguo.docx")

with zipfile.ZipFile(src_docx, 'r') as zin:
    # Read document.xml
    doc_xml = zin.read('word/document.xml')
    root = ET.fromstring(doc_xml)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    body = root.find('w:body', ns)
    
    # Check elements in body
    print("Original body children count:", len(body))
    for i, child in enumerate(body):
        tag = child.tag.split('}')[-1]
        txt = ' '.join(''.join(child.itertext()).split())[:60]
        print(f"[{i}] {tag}: {txt}")

    # Elements 0 to 6:
    # 0: Table 0 (Metadata)
    # 1: p
    # 2: p
    # 3: Table 1 (Classes)
    # 4: p
    # 5: p
    # 6: Table 2 (Observaciones)
    # Then we keep sectPr (the last element)
    sectPr = body[-1]
    
    # We construct the clean body:
    clean_children = [body[0], body[1], body[2], body[3], body[4], body[5], body[6], sectPr]
    
    # Clear body and append clean_children
    # In ElementTree:
    body[:] = clean_children
    print("\nCleaned body children count:", len(body))
    for i, child in enumerate(body):
        tag = child.tag.split('}')[-1]
        txt = ' '.join(''.join(child.itertext()).split())[:60]
        print(f"[{i}] {tag}: {txt}")

    # Now create the new Preparador.docx
    clean_xml = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    
    with zipfile.ZipFile(dst_docx, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename == 'word/document.xml':
                zout.writestr(item, clean_xml)
            else:
                zout.writestr(item, zin.read(item.filename))

print(f"\nSuccessfully created clean {dst_docx}")
