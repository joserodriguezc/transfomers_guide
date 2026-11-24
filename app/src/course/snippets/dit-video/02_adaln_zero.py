# adaLN-Zero: la condición (paso t + clase) modula la normalización; el bloque empieza siendo la identidad
import numpy as np

rng = np.random.default_rng(1)
N, D = 6, 8
x = rng.normal(size=(N, D))
c = rng.normal(size=D)                       # embedding de condición (t y clase/texto)


def layer_norm(h):
    return (h - h.mean(-1, keepdims=True)) / (h.std(-1, keepdims=True) + 1e-6)


def bloque(x, c, W_mod, f):
    shift, scale, gate = np.split(c @ W_mod, 3)          # (en DiT hay 6: tres para atención y tres para la MLP)
    h = layer_norm(x) * (1 + scale) + shift              # modulación
    return x + gate * f(h)                               # la compuerta escala la contribución del bloque


f = lambda h: np.tanh(h @ rng.normal(size=(D, D)))
W_cero = np.zeros((D, 3 * D))                            # inicialización «Zero»
print("al inicio, ¿bloque = identidad?", np.allclose(bloque(x, c, W_cero, f), x))
W = rng.normal(size=(D, 3 * D)) * 0.1                    # tras entrenar
print("tras entrenar, cambio medio:", np.abs(bloque(x, c, W, f) - x).mean().round(3))
