# El problema del pajar: con más contexto, la softmax diluye el token relevante
import numpy as np

ventaja = 4.0                                   # el logit de la «aguja» supera en 4 al resto
for N in [1_000, 32_000, 128_000, 1_000_000, 10_000_000]:
    p = np.exp(ventaja) / (np.exp(ventaja) + (N - 1))
    s = 0.4 * np.log(N)                         # escalar los logits con log N (idea de SSMax / YaRN)
    p_esc = np.exp(ventaja * s) / (np.exp(ventaja * s) + (N - 1))
    print(f"N = {N:>10,}: peso de la aguja {p:.5f}   con escalado log N: {p_esc:.3f}")
