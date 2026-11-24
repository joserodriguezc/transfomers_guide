# De imagen a secuencia de parches (como ViT)
import numpy as np

rng = np.random.default_rng(0)
H = W = 224
C, P = 3, 16
img = rng.random((H, W, C))

# (H, W, C) -> (H/P, P, W/P, P, C) -> (H/P, W/P, P, P, C) -> (N, P·P·C)
parches = img.reshape(H // P, P, W // P, P, C).transpose(0, 2, 1, 3, 4).reshape(-1, P * P * C)
print("parches:", parches.shape)               # (196, 768)

# Comprobar que el primer parche es la esquina superior izquierda
print(np.allclose(parches[0], img[:P, :P].reshape(-1)))
