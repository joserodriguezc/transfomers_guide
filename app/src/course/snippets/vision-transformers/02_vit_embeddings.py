# Embeddings de ViT: proyección lineal + token [CLS] + posiciones aprendidas
import numpy as np

rng = np.random.default_rng(1)
N, P2C, D = 196, 768, 384
parches = rng.random((N, P2C))

W_e = rng.normal(size=(P2C, D)) / np.sqrt(P2C)    # equivale a una convolución con kernel = paso = 16
cls = rng.normal(size=(1, D)) * 0.02              # token de clasificación aprendido
pos = rng.normal(size=(N + 1, D)) * 0.02          # una posición aprendida por token

tokens = np.vstack([cls, parches @ W_e]) + pos
print("secuencia para el encoder:", tokens.shape)  # (197, 384)
# Tras los bloques, la clase se predice desde la salida del token [CLS] (fila 0)
W_head = rng.normal(size=(D, 1000)) * 0.01
logits = tokens[0] @ W_head
print("logits de clase:", logits.shape)
