# DiT: «patchify» del latente y vuelta atrás
import numpy as np

I, C, p = 32, 4, 2                          # latente 32×32×4 (imagen 256×256 con un VAE de factor 8)
z = np.random.default_rng(0).normal(size=(I, I, C))

T = (I // p) ** 2
tokens = z.reshape(I // p, p, I // p, p, C).transpose(0, 2, 1, 3, 4).reshape(T, p * p * C)
print("tokens:", tokens.shape)              # (256, 16): T = (I/p)²

# La salida del transformer se «despatchifica» para obtener el ruido predicho con la forma del latente
vuelta = tokens.reshape(I // p, I // p, p, p, C).transpose(0, 2, 1, 3, 4).reshape(I, I, C)
print("¿recupera el latente?", np.allclose(vuelta, z))
for p_ in [2, 4, 8]:
    print(f"p = {p_}: {(I // p_) ** 2:4d} tokens")   # parches más pequeños = más tokens = más cómputo y mejor calidad
