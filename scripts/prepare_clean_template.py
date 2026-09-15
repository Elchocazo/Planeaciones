import zipfile
import xml.etree.ElementTree as ET
import shutil
import os

src_docx = r'Ejemplopreparador/F-GA PREPARADOR DE CLASE COLEGIO HOGAR (2).docx'
dst_docx = r'Preparador.docx'

# Registrar todos los namespaces para preservar los prefijos originales w:, w14:, r:, etc.
namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
    'v': 'urn:schemas-microsoft-com:vml',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'w10': 'urn:schemas-microsoft-com:office:word',
    'w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
    'w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
    'w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
    'w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
    'wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
    'cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
    'cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
    'cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
    'cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
    'cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
    'cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
    'cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
    'cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
    'cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
    'am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
    'o': 'urn:schemas-microsoft-com:office:office',
    'oel': 'http://schemas.microsoft.com/office/2019/extlst'
}
for prefix, uri in namespaces.items():
    ET.register_namespace(prefix, uri)

with zipfile.ZipFile(src_docx, 'r') as zin:
    doc_xml_bytes = zin.read('word/document.xml')
    root = ET.fromstring(doc_xml_bytes)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    body = root.find('w:body', ns)
    
    # Body elements originales:
    # 0: tbl (Metadata)
    # 1: p
    # 2: p
    # 3: tbl (Classes)
    # 4: p
    # 5: p
    # 6: tbl (Observaciones)
    # 7..16: ejemplos extras
    # 17: sectPr
    sectPr = body[-1]
    tbl_meta = body[0]
    p1 = body[1]
    tbl_classes = body[3]
    p4 = body[4]
    tbl_obs = body[6]
    
    # Inyectar placeholders en Tabla 0 (Metadatos)
    r0 = tbl_meta.findall('w:tr', ns)[0]
    r1 = tbl_meta.findall('w:tr', ns)[1]
    
    def set_cell_placeholder(tc, placeholder):
        # Localizar el elemento w:t dentro del tc o crear uno limpio preservando tcPr
        tcPr = tc.find('w:tcPr', ns)
        tc.clear()
        if tcPr is not None:
            tc.append(tcPr)
        p = ET.SubElement(tc, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')
        pPr = ET.SubElement(p, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
        rPr = ET.SubElement(pPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
        ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts', {
            '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii': 'Arial Narrow',
            '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi': 'Arial Narrow'
        })
        ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz', {'{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val': '24'})
        ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}szCs', {'{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val': '24'})
        
        r = ET.SubElement(p, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
        r_rPr = ET.SubElement(r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
        ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts', {
            '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii': 'Arial Narrow',
            '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi': 'Arial Narrow'
        })
        ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz', {'{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val': '24'})
        ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}szCs', {'{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val': '24'})
        
        t = ET.SubElement(r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        t.text = placeholder

    set_cell_placeholder(r0.findall('w:tc', ns)[1], '{{ASIGNATURA}}')
    set_cell_placeholder(r0.findall('w:tc', ns)[3], '{{GRADO}}')
    set_cell_placeholder(r0.findall('w:tc', ns)[5], '{{PERIODO}}')
    
    set_cell_placeholder(r1.findall('w:tc', ns)[1], '{{DOCENTE}}')
    set_cell_placeholder(r1.findall('w:tc', ns)[3], '{{SEMANA_DEL}}')
    set_cell_placeholder(r1.findall('w:tc', ns)[5], '{{SEMANA_AL}}')
    
    # Inyectar placeholder en Tabla 2 (Observaciones)
    obs_r0 = tbl_obs.findall('w:tr', ns)[0]
    set_cell_placeholder(obs_r0.findall('w:tc', ns)[1], '{{OBSERVACIONES}}')

    # Mantener solo los elementos oficiales
    body[:] = [tbl_meta, p1, tbl_classes, p4, tbl_obs, sectPr]
    
    clean_xml = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    
    # También limpiar header1.xml unificando los textos divididos
    hdr_bytes = zin.read('word/header1.xml')
    hdr_root = ET.fromstring(hdr_bytes)
    # Reemplazar runs fragmentados
    for p in hdr_root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        full_text = ''.join(p.itertext()).strip()
        if full_text in ['CODIGO: F- GA', 'VERSION: 02', 'PREPARADOR DE CLASES', '31.JUL.26', 'COLEGIO HOGAR MADRE DE DIOS']:
            pPr = p.find('w:pPr', ns)
            runs = p.findall('w:r', ns)
            rPr = runs[0].find('w:rPr', ns) if len(runs) > 0 else None
            p.clear()
            if pPr is not None:
                p.append(pPr)
            new_r = ET.SubElement(p, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
            if rPr is not None:
                new_r.append(rPr)
            t = ET.SubElement(new_r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
            t.text = full_text
    
    clean_hdr_xml = ET.tostring(hdr_root, encoding='utf-8', xml_declaration=True)

    with zipfile.ZipFile(dst_docx, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename == 'word/document.xml':
                zout.writestr(item, clean_xml)
            elif item.filename == 'word/header1.xml':
                zout.writestr(item, clean_hdr_xml)
            else:
                zout.writestr(item, zin.read(item.filename))

print(f"Successfully generated clean template {dst_docx} with proper w: namespace")
