import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_matematicas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Test slice on Page 2 and Page 3
lines = (pages[4] + '\n' + pages[6]).split('\n')
header_idx = -1
for i, l in enumerate(lines):
    if 'EJES TEMÁTICOS' in l:
        header_idx = i
        break

if header_idx != -1:
    # Find column indices from header
    hl = lines[header_idx]
    c_preg = hl.find('PREGUNTA')
    c_est = hl.find('ESTÁNDAR')
    c_ejes = hl.find('EJES')
    c_ind = hl.find('INDICADORES')
    c_rec = hl.find('RECURSOS')
    c_eva = hl.find('EVALUACIÓN')
    print(f"Col positions: preg={c_preg}, est={c_est}, ejes={c_ejes}, ind={c_ind}, rec={c_rec}, eva={c_eva}")
    
    col_preg = []
    col_est = []
    col_ejes = []
    col_ind = []
    col_rec = []
    col_eva = []
    
    for l in lines[header_idx+5:]:
        if 'SEGUNDO PERIODO' in l:
            break
        # slice
        col_preg.append(l[c_preg:c_est].strip())
        col_est.append(l[c_est:c_ejes].strip())
        col_ejes.append(l[c_ejes:c_ind].strip())
        col_ind.append(l[c_ind:c_rec].strip())
        col_rec.append(l[c_rec:c_eva].strip())
        col_eva.append(l[c_eva:].strip())
        
    print("\n--- EJES TEMÁTICOS EXTRACTED ---")
    print("\n".join([x for x in col_ejes if x]))
    
    print("\n--- INDICADORES EXTRACTED ---")
    print("\n".join([x for x in col_ind if x]))
    
    print("\n--- ESTÁNDAR EXTRACTED ---")
    print(" ".join([x for x in col_est if x]))
    
    print("\n--- PREGUNTA EXTRACTED ---")
    print(" ".join([x for x in col_preg if x]))
