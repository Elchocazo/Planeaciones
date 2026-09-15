import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('mallas_sistemas_layout.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pages = re.split(r'={20,}\s*PAGE\s+(\d+)\s*={20,}', text)

# Test on Page 2
lines = pages[4].split('\n')
header_idx = -1
for i, l in enumerate(lines):
    if 'EJES' in l and 'TEMÁTICOS' in l:
        header_idx = i
        break

if header_idx != -1:
    hl = lines[header_idx]
    print("Header line:", hl)
    c_preg = hl.find('PREGUNTA')
    c_est = hl.find('ESTÁNDAR')
    c_ejes = hl.find('EJES')
    c_ind = hl.find('INDICADORES')
    c_rec = hl.find('RECURSOS')
    c_eva = hl.find('EVALUACIÓN')
    print(f"Positions: preg={c_preg}, est={c_est}, ejes={c_ejes}, ind={c_ind}, rec={c_rec}, eva={c_eva}")
    
    col_ejes = []
    col_ind = []
    col_est = []
    col_preg = []
    for l in lines[header_idx+1:]:
        if 'PERÍODO:' in l.upper() or 'PERIODO:' in l.upper():
            break
        col_preg.append(l[c_preg:c_est].strip())
        col_est.append(l[c_est:c_ejes].strip())
        col_ejes.append(l[c_ejes:c_ind].strip())
        col_ind.append(l[c_ind:c_rec].strip())
        
    print("\n--- EJES ---")
    print("\n".join([x for x in col_ejes if x]))
    print("\n--- IND ---")
    print("\n".join([x for x in col_ind if x]))
    print("\n--- EST ---")
    print(" ".join([x for x in col_est if x]))
    print("\n--- PREG ---")
    print(" ".join([x for x in col_preg if x]))
