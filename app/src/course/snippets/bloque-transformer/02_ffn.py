# La red feed-forward por posición: clásica (GELU) y con compuerta (SwiGLU)
import numpy as np

rng = np.random.default_rng(0)
d, d_ff = 8, 32


def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))


def silu(x):
    return x / (1 + np.exp(-x))


W1, W2 = rng.normal(size=(d, d_ff)) * 0.2, rng.normal(size=(d_ff, d)) * 0.2
ffn = lambda x: gelu(x @ W1) @ W2

d_sw = 2 * d_ff // 3                                                  # mantiene los parámetros
Wg, Wu, Wd = rng.normal(size=(d, d_sw)) * 0.2, rng.normal(size=(d, d_sw)) * 0.2, rng.normal(size=(d_sw, d)) * 0.2
swiglu = lambda x: (silu(x @ Wg) * (x @ Wu)) @ Wd

X = rng.normal(size=(5, d))                    # 5 tokens: la misma red se aplica a cada uno
print("FFN:", ffn(X).shape, " SwiGLU:", swiglu(X).shape)
print("parámetros FFN:", W1.size + W2.size, " SwiGLU:", Wg.size + Wu.size + Wd.size)
# «Por posición»: procesar un token solo da lo mismo que dentro del lote
print(np.allclose(ffn(X[2:3]), ffn(X)[2:3]))
