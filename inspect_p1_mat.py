with open('js/curriculum.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('"1°":')
idx_mat = text.find('"Matemáticas":', idx1)
idx_7 = text.find('"7°": [', idx_mat)
print(text[idx_7:idx_7+2500])
