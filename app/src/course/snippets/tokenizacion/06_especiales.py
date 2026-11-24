# Tokens especiales y padding: varias frases de distinta longitud en un mismo lote
import numpy as np

vocab = {"[PAD]": 0, "[CLS]": 1, "[SEP]": 2, "el": 3, "gato": 4, "duerme": 5, "perro": 6, "ladra": 7, "mucho": 8}
frases = [["el", "gato", "duerme"], ["el", "perro", "ladra", "mucho"]]

ids = [[vocab["[CLS]"]] + [vocab[w] for w in f] + [vocab["[SEP]"]] for f in frases]
L = max(map(len, ids))
lote = np.array([s + [vocab["[PAD]"]] * (L - len(s)) for s in ids])
mascara = (lote != vocab["[PAD]"]).astype(int)  # 1 = token real, 0 = relleno
print(lote)
print(mascara)
