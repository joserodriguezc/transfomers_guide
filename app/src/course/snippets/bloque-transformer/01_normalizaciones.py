# LayerNorm y RMSNorm sobre la última dimensión (cada token por separado)
import numpy as np


def layer_norm(x, gamma=1.0, beta=0.0, eps=1e-5):
    mu = x.mean(-1, keepdims=True)
    var = x.var(-1, keepdims=True)
    return gamma * (x - mu) / np.sqrt(var + eps) + beta


def rms_norm(x, gamma=1.0, eps=1e-6):
    return gamma * x / np.sqrt((x ** 2).mean(-1, keepdims=True) + eps)


x = np.array([[2.0, -1.0, 4.0, 0.5], [100.0, 101.0, 102.0, 103.0]])
print("LayerNorm:\n", layer_norm(x).round(3))
print("RMSNorm:\n", rms_norm(x).round(3))
print("media y desv. de LayerNorm por fila:", layer_norm(x).mean(-1).round(6), layer_norm(x).std(-1).round(3))
