# Softmax en línea: procesar los logits por bloques sin guardarlos todos (la base de FlashAttention)
import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=20) * 3
bloque = 6

m, l = -np.inf, 0.0
for i in range(0, len(x), bloque):
    trozo = x[i:i + bloque]
    m_nuevo = max(m, trozo.max())
    l = l * np.exp(m - m_nuevo) + np.exp(trozo - m_nuevo).sum()   # reescalar lo acumulado
    m = m_nuevo
    print(f"tras el bloque {i // bloque}: m = {m:.3f}, l = {l:.4f}")

p_online = np.exp(x - m) / l
p = np.exp(x - x.max()) / np.exp(x - x.max()).sum()
print("¿igual que la softmax normal?", np.allclose(p_online, p))
