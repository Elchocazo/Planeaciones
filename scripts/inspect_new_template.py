import zipfile
import xml.etree.ElementTree as ET

docx_path = r'Ejemplopreparador/F-GA PREPARADOR DE CLASE COLEGIO HOGAR (2).docx'
with zipfile.ZipFile(docx_path) as z:
    doc_xml = z.read('word/document.xml')
    root = ET.fromstring(doc_xml)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tbls = root.findall('.//w:tbl', ns)
    
    for t_idx in [0, 1, 2]:
        print(f'================= TABLE {t_idx} =================')
        for r_idx, r in enumerate(tbls[t_idx].findall('w:tr', ns)):
            print(f'-- ROW {r_idx} --')
            for c_idx, c in enumerate(r.findall('w:tc', ns)):
                tcW = c.find('.//w:tcW', ns)
                w_val = tcW.attrib if tcW is not None else None
                shd = c.find('.//w:shd', ns)
                shd_val = shd.attrib if shd is not None else None
                p_aligns = [p.find('.//w:jc', ns).attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if p.find('.//w:jc', ns) is not None else 'left' for p in c.findall('w:p', ns)]
                r_fonts = [r.find('.//w:rFonts', ns).attrib if r.find('.//w:rFonts', ns) is not None else None for r in c.findall('.//w:r', ns)]
                r_sizes = [r.find('.//w:sz', ns).attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if r.find('.//w:sz', ns) is not None else None for r in c.findall('.//w:r', ns)]
                bolds = [r.find('w:b', ns) is not None for r in c.findall('.//w:r', ns)]
                t = ' '.join(''.join(c.itertext()).split())
                print(f'  Cell {c_idx}: width={w_val} shd={shd_val} align={p_aligns} sz={r_sizes} bold={bolds} text="{t}"')
