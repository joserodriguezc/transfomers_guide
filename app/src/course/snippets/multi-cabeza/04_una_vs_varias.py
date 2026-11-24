# Una sola cabeza promedia relaciones distintas; dos cabezas las separan
import numpy as np


def softmax(s):
    e = np.exp(s - s.max(-1, keepdims=True))
    return e / e.sum(-1, keepdims=True)


# Token 0 debe recoger dos cosas: el «color» del token 1 y el «tamaño» del token 2
V = np.array([[0, 0], [1, 0], [0, 1]], dtype=float)  # (color, tamaño)
una = softmax(np.array([0.0, 2.0, 2.0]))              # una cabeza reparte su atención
print("una cabeza:", (una @ V).round(2), "  <- mezcla diluida")

cabeza_color = softmax(np.array([0.0, 6.0, 0.0]))
cabeza_tamano = softmax(np.array([0.0, 0.0, 6.0]))
print("cabeza 1:", (cabeza_color @ V).round(2), " cabeza 2:", (cabeza_tamano @ V).round(2))
print("concatenadas:", np.concatenate([cabeza_color @ V, cabeza_tamano @ V]).round(2))
