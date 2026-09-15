with open('js/curriculum.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 0
while True:
    idx = text.find('"Matemáticas":', pos)
    if idx == -1:
        break
    print(f"=== Found Matemáticas at {idx} ===")
    print(text[idx:idx+2500])
    pos = idx + 1
