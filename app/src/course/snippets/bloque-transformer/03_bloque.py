# Un bloque transformer pre-norm completo (atención multi-cabeza + SwiGLU + residuales)
import numpy as np

rng = np.random.default_rng(0)
n, d, h, d_ff = 6, 16, 4, 48
d_k = d // h
P = {k: rng.normal(size=s) / np.sqrt(s[0]) for k, s in {
    "Wq": (d, d), "Wk": (d, d), "Wv": (d, d), "Wo": (d, d),
    "Wg": (d, d_ff), "Wu": (d, d_ff), "Wd": (d_ff, d)}.items()}


def rms_norm(x, eps=1e-6):
    return x / np.sqrt((x ** 2).mean(-1, keepdims=True) + eps)


def softmax(s):
    e = np.exp(s - s.max(-1, keepdims=True))
    return e / e.sum(-1, keepdims=True)


def mha(x):
    q, k, v = ((x @ P[w]).reshape(n, h, d_k).transpose(1, 0, 2) for w in ("Wq", "Wk", "Wv"))
    a = softmax(q @ k.transpose(0, 2, 1) / np.sqrt(d_k))
    return (a @ v).transpose(1, 0, 2).reshape(n, d) @ P["Wo"]


def swiglu(x):
    g = x @ P["Wg"]
    return (g / (1 + np.exp(-g)) * (x @ P["Wu"])) @ P["Wd"]


def bloque(x):
    x = x + mha(rms_norm(x))        # 1.ª subcapa con conexión residual
    x = x + swiglu(rms_norm(x))     # 2.ª subcapa con conexión residual
    return x


X = rng.normal(size=(n, d))
Y = bloque(X)
print("entrada", X.shape, "-> salida", Y.shape)
print("cambio relativo:", (np.linalg.norm(Y - X) / np.linalg.norm(X)).round(3))
