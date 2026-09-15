# -*- coding: utf-8 -*-
"""
Script to extract and generate the official curriculum bank for Colegio Hogar Madre de Dios
Docente: Manuel Muñoz / Manuel Alejandro Muñoz Palomino
From official PDFs in 'Mallas/' directory:
1. Mallas Manuel 2026 -2027 Matemáticas.pdf
2. Mallas curriculares Sistemas 1-11.docx (1).pdf
"""

import sys
import os
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

print("Starting official curriculum generation...")
