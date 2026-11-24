# Cross-attention: queries del decoder, keys y values del encoder
import numpy as np

rng = np.random.default_rng(0)
d = 8
memoria = rng.normal(size=(4, d))        # salida del encoder: 4 tokens de la frase origen
dec = rng.normal(size=(3, d))            # estados del decoder: 3 tokens generados hasta ahora
W_q, W_k, W_v = (rng.normal(size=(d, d)) / np.sqrt(d) for _ in range(3))

Q = dec @ W_q                            # (3, d)  <- del decoder
K, V = memoria @ W_k, memoria @ W_v      # (4, d)  <- del encoder
S = Q @ K.T / np.sqrt(d)                 # (3, 4): no es cuadrada
P = np.exp(S - S.max(1, keepdims=True))
P /= P.sum(1, keepdims=True)
print("pesos (destino × origen):\n", P.round(2))
print("salida:", (P @ V).shape)
