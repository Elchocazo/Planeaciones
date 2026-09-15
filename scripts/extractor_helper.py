import os
import sys
import pypdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def extract_tokens(reader, start_page, end_page):
    """Extract and join text tokens across a range of pages (1-indexed)"""
    all_lines = []
    for p in range(start_page - 1, end_page):
        txt = reader.pages[p].extract_text() or ""
        for line in txt.split('\n'):
            line_str = line.strip()
            if line_str:
                all_lines.append(line_str)
    return " ".join(all_lines)

print("Extractor helper loaded successfully.")
