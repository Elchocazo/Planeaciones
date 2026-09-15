# -*- coding: utf-8 -*-
"""
Main assembler to build the complete js/curriculum.js
Integrates:
- build_math_data
- build_sistemas_data
- build_robotica_data
- Math fallbacks for 1°, 4°, 5°, 6°, 8°, 9°, 10°, 11°
- Subject aliases (Tecnología e Informática, Tecnología, 4°A, 4°B)
"""

import sys
import os
import json

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('scripts')

import build_math_data
import build_sistemas_data
import build_robotica_data

all_data = {
    "1°": {"Matemáticas": {}, "Lógica": {}, "Sistemas": {}, "Robótica": {}, "Dirección de grupo": {}},
    "2°": {"Matemáticas": {}, "Lógica": {}, "Sistemas": {}, "Robótica": {}, "Dirección de grupo": {}},
    "3°": {"Matemáticas": {}, "Lógica": {}, "Sistemas": {}, "Robótica": {}, "Dirección de grupo": {}},
    "4°": {"Matemáticas": {}, "Lógica": {}, "Sistemas": {}, "Robótica": {}, "Dirección de grupo": {}}
}

# 1. Populate all
build_math_data.populate_math(all_data)
build_sistemas_data.populate_sistemas(all_data)
build_robotica_data.populate_robotica(all_data)

# 2. Add Math fallbacks for secondary/primary grades if not already present
# (Extract from previous update_full_curriculum.py for completeness)
from update_full_curriculum import curriculum_math as fallback_math
for p in ["1°", "2°", "3°", "4°"]:
    if p in fallback_math:
        for g, items in fallback_math[p].items():
            if g not in all_data[p]["Matemáticas"]:
                all_data[p]["Matemáticas"][g] = items

# 3. Aliases
for p in ["1°", "2°", "3°", "4°"]:
    all_data[p]["Tecnología e Informática"] = all_data[p]["Sistemas"]
    all_data[p]["Tecnología"] = all_data[p]["Sistemas"]

print("Curriculum data gathered. Total periods:", len(all_data))
for p in all_data:
    print(f"Period {p}:")
    for sub in all_data[p]:
        grades = list(all_data[p][sub].keys())
        print(f"  {sub}: {len(grades)} grades ({', '.join(grades[:5])}...)")

# Read remaining code of js/curriculum.js (from CurriculumService onwards)
with open('js/curriculum.js', 'r', encoding='utf-8') as f:
    orig_code = f.read()

# Locate CurriculumService
service_idx = orig_code.find('const CurriculumService = {')
if service_idx == -1:
    raise ValueError("Could not find 'const CurriculumService = {' in js/curriculum.js")

service_code = orig_code[service_idx:]

# Update STORAGE_CURRICULUM_KEY to v13 in service_code or at top
header_comment = """/**
 * MÓDULO DE GESTIÓN DEL BANCO CURRICULAR POR PERIODO (MALLA DE TEMAS, LOGROS Y DBA)
 * Malla Curricular Oficial Institucional - Colegio Hogar Madre de Dios
 * Docente: Manuel Alejandro Muñoz Palomino / Manuel Muñoz
 * 
 * Basado estrictamente en los documentos oficiales de la carpeta 'Mallas/':
 * - Mallas Manuel 2026 -2027 Matemáticas.pdf
 * - Mallas curriculares Sistemas 1-11.docx (1).pdf
 * 
 * Asignaturas y Grados oficiales completos:
 * - Matemáticas (2°, 3°, 7° y banco de apoyo)
 * - Lógica (6°)
 * - Sistemas / Tecnología e Informática (1° a 8°, con 4°A y 4°B)
 * - Robótica (9°, 10°, 11°)
 * - Dirección de Grupo (7°)
 * Para los 4 periodos académicos (1°, 2°, 3°, 4°).
 */

const STORAGE_CURRICULUM_KEY = 'teacher_curriculum_bank_v13';

const DEFAULT_CURRICULUM = """ + json.dumps(all_data, ensure_ascii=False, indent=2) + """;

// Equivalencia completa entre Sistemas y Tecnología e Informática para todos los periodos
['1°', '2°', '3°', '4°'].forEach(p => {
  if (DEFAULT_CURRICULUM[p] && DEFAULT_CURRICULUM[p]['Sistemas']) {
    DEFAULT_CURRICULUM[p]['Tecnología e Informática'] = DEFAULT_CURRICULUM[p]['Sistemas'];
    DEFAULT_CURRICULUM[p]['Tecnología'] = DEFAULT_CURRICULUM[p]['Sistemas'];
  }
});

"""

full_new_curriculum_js = header_comment + service_code

with open('js/curriculum.js', 'w', encoding='utf-8') as f:
    f.write(full_new_curriculum_js)

print("Successfully written updated js/curriculum.js!")
