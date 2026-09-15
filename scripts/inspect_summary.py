import zipfile
import xml.etree.ElementTree as ET

docx_path = r'Ejemplopreparador/F-GA PREPARADOR DE CLASE COLEGIO HOGAR (2).docx'
with zipfile.ZipFile(docx_path) as z:
    doc_xml = z.read('word/document.xml')
    root = ET.fromstring(doc_xml)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tbls = root.findall('.//w:tbl', ns)
    
    # Table 0
    print('=== TABLE 0 (METADATA) ===')
    t0 = tbls[0]
    for r_i, r in enumerate(t0.findall('w:tr', ns)):
        cells = r.findall('w:tc', ns)
        for c_i, c in enumerate(cells):
            tcW = c.find('.//w:tcW', ns)
            w = tcW.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w') if tcW is not None else None
            txt = ' '.join(''.join(c.itertext()).split())
            print(f'R{r_i} C{c_i} (w={w}): "{txt}"')
            
    # Table 1
    print('\n=== TABLE 1 (CLASSES HEADER) ===')
    t1 = tbls[1]
    r0 = t1.findall('w:tr', ns)[0]
    for c_i, c in enumerate(r0.findall('w:tc', ns)):
        tcW = c.find('.//w:tcW', ns)
        w = tcW.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w') if tcW is not None else None
        txt = ' '.join(''.join(c.itertext()).split())
        print(f'Header C{c_i} (w={w}): "{txt}"')

    # Table 1 Row 1 (Sample class row)
    print('\n=== TABLE 1 (SAMPLE CLASS ROW) ===')
    r1 = t1.findall('w:tr', ns)[1]
    for c_i, c in enumerate(r1.findall('w:tc', ns)):
        tcW = c.find('.//w:tcW', ns)
        w = tcW.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w') if tcW is not None else None
        txt = ' '.join(''.join(c.itertext()).split())
        print(f'Row1 C{c_i} (w={w}): "{txt}"')

    # Table 2
    print('\n=== TABLE 2 (OBSERVACIONES) ===')
    t2 = tbls[2]
    r0 = t2.findall('w:tr', ns)[0]
    for c_i, c in enumerate(r0.findall('w:tc', ns)):
        tcW = c.find('.//w:tcW', ns)
        w = tcW.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}w') if tcW is not None else None
        txt = ' '.join(''.join(c.itertext()).split())
        print(f'Obs C{c_i} (w={w}): "{txt[:50]}"')
