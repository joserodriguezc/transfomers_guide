# Atención por bloques al estilo FlashAttention: nunca se construye la matriz N×N completa
import numpy as np

rng = np.random.default_rng(1)
N, d, B = 64, 16, 16                    # secuencia, dimensión, tamaño de bloque
Q, K, V = (rng.normal(size=(N, d)) for _ in range(3))

O = np.zeros((N, d))
for i in range(0, N, B):                # bloque de queries (cabe en la SRAM)
    q = Q[i:i + B]
    m = np.full(B, -np.inf)             # máximo por fila
    l = np.zeros(B)                     # suma de exponenciales por fila
    acc = np.zeros((B, d))              # salida acumulada sin normalizar
    for j in range(0, N, B):            # recorrer bloques de keys/values
        s = q @ K[j:j + B].T / np.sqrt(d)            # solo un bloque B×B
        m_new = np.maximum(m, s.max(1))
        corr = np.exp(m - m_new)
        p = np.exp(s - m_new[:, None])
        l = l * corr + p.sum(1)
        acc = acc * corr[:, None] + p @ V[j:j + B]
        m = m_new
    O[i:i + B] = acc / l[:, None]

S = Q @ K.T / np.sqrt(d)
P = np.exp(S - S.max(1, keepdims=True))
ref = (P / P.sum(1, keepdims=True)) @ V
print("¿idéntica a la atención estándar?", np.allclose(O, ref))
print("memoria de puntuaciones: estándar", N * N, "| por bloques", B * B)
