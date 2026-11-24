# Grouped-query attention: h cabezas de query comparten g cabezas de key/value
import numpy as np

rng = np.random.default_rng(0)
n, h, g, d_k = 6, 8, 2, 4                 # 8 cabezas Q, 2 cabezas KV -> grupos de 4
Q = rng.normal(size=(h, n, d_k))
K = rng.normal(size=(g, n, d_k))          # solo g cabezas de K y V
V = rng.normal(size=(g, n, d_k))

# Cada cabeza de query usa la KV de su grupo: repetir K y V h/g veces
K_rep = np.repeat(K, h // g, axis=0)      # (h, n, d_k)
V_rep = np.repeat(V, h // g, axis=0)
S = Q @ K_rep.transpose(0, 2, 1) / np.sqrt(d_k)
P = np.exp(S - S.max(-1, keepdims=True))
P /= P.sum(-1, keepdims=True)
O = P @ V_rep
print("salida:", O.shape)
print("KV guardada:", K.size + V.size, "valores frente a", 2 * h * n * d_k, "con MHA")
for nombre, kv in [("MHA", h), ("GQA", g), ("MQA", 1)]:
    print(f"{nombre}: {kv} cabezas KV -> {kv / h:.0%} de la KV cache de MHA")
