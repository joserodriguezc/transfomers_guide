# DDIM: muestreo determinista con muchos menos pasos
import numpy as np

mu = np.array([[-2.0, 0.0], [2.0, 0.0], [0.0, 2.5]])
s2, T = 0.05, 1000
alpha_bar = np.cumprod(1 - np.linspace(1e-4, 0.02, T))


def eps_optimo(xt, t):
    ab = alpha_bar[t]
    var = ab * s2 + (1 - ab)
    d = xt[:, None, :] - np.sqrt(ab) * mu[None]
    logp = -(d ** 2).sum(-1) / (2 * var)
    r = np.exp(logp - logp.max(1, keepdims=True))
    r /= r.sum(1, keepdims=True)
    return (r[..., None] * np.sqrt(1 - ab) * d / var).sum(1)


def ddim(pasos, n=300, semilla=0):
    x = np.random.default_rng(semilla).normal(size=(n, 2))
    ts = np.linspace(T - 1, 0, pasos).astype(int)
    for i, t in enumerate(ts):
        e = eps_optimo(x, t)
        x0 = (x - np.sqrt(1 - alpha_bar[t]) * e) / np.sqrt(alpha_bar[t])   # estimación de x_0
        if i + 1 < len(ts):
            ab_sig = alpha_bar[ts[i + 1]]
            x = np.sqrt(ab_sig) * x0 + np.sqrt(1 - ab_sig) * e             # salto determinista
        else:
            x = x0
    return x


for pasos in [5, 20, 100]:
    x = ddim(pasos)
    cerca = np.mean(np.min(np.linalg.norm(x[:, None] - mu[None], axis=2), axis=1) < 0.7)
    print(f"{pasos:3d} pasos DDIM: {cerca:.0%} de las muestras sobre los datos")
