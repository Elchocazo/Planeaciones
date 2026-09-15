# -*- coding: utf-8 -*-
"""
Script to build data_curriculum_complete.json with all official mallas from Mallas/
"""

import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

all_data = {
    "1°": {},
    "2°": {},
    "3°": {},
    "4°": {}
}

def set_items(period, subject, grade, items):
    if subject not in all_data[period]:
        all_data[period][subject] = {}
    all_data[period][subject][grade] = items

print("Initialized all_data dictionary.")
