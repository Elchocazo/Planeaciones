# -*- coding: utf-8 -*-
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

curriculum = {
    "1°": {},
    "2°": {},
    "3°": {},
    "4°": {}
}

# Helper to add items
def add_items(period, subject, grade, items):
    if subject not in curriculum[period]:
        curriculum[period][subject] = {}
    curriculum[period][subject][grade] = items

print("Helper ready.")
