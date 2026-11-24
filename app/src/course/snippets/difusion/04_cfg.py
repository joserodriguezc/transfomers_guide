# Guía sin clasificador: ε̃ = ε_incond + w · (ε_cond − ε_incond)
import numpy as np

mu = np.array([[-2.0, 0.0], [2.0, 0.0], [0.0, 2.5]])
s2, T = 0.3, 1000                                  # componentes anchas para ver el efecto de w
beta = np.linspace(1e-4, 0.02, T)
alpha, alpha_bar = 1 - beta, np.cumprod(1 - beta)


def eps(xt, t, pesos):
    ab = alpha_bar[t]
    var = ab * s2 + (1 - ab)
    d = xt[:, None, :] - np.sqrt(ab) * mu[None]
    logp = np.log(pesos + 1e-300)[None] - (d ** 2).sum(-1) / (2 * var)
    r = np.exp(logp - logp.max(1, keepdims=True))
    r /= r.sum(1, keepdims=True)
    return (r[..., None] * np.sqrt(1 - ab) * d / var).sum(1)


def muestrear(w, clase=1, n=300, semilla=0):
    rng = np.random.default_rng(semilla)
    x = rng.normal(size=(n, 2))
    cond, incond = np.eye(3)[clase], np.ones(3) / 3
    for t in reversed(range(T)):
        e_u, e_c = eps(x, t, incond), eps(x, t, cond)
        e = e_u + w * (e_c - e_u)
        x = (x - beta[t] / np.sqrt(1 - alpha_bar[t]) * e) / np.sqrt(alpha[t])
        if t > 0:
            x += np.sqrt(beta[t]) * rng.normal(size=x.shape)
    return x


for w in [0, 1, 3]:
    x = muestrear(w)
    en_clase = np.mean(np.linalg.norm(x - mu[1], axis=1) < 1.5)
    print(f"w = {w}: {en_clase:.0%} de muestras en la clase pedida, dispersión = {x.std(0).mean():.2f}")
