import re

with open('septimo_p1_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Collapse single-letter or single-word lines
cleaned = re.sub(r'\n+', ' ', text)
cleaned = re.sub(r'\s+', ' ', cleaned)

# Split by pages
pages = cleaned.split('==================================================')

with open('septimo_clean_paragraphs.txt', 'w', encoding='utf-8') as f:
    for p in pages:
        if not p.strip(): continue
        f.write(f"\n{'='*50}\n")
        f.write(p.strip() + "\n")

print("Cleaned paragraphs written!")
