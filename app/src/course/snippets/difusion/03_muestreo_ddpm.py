# Muestreo DDPM: partir de ruido puro y quitar ruido paso a paso
import matplotlib.pyplot as plt
import numpy as np

mu = np.array([[-2.0, 0.0], [2.0, 0.0], [0.0, 2.5]])
s2, T = 0.05, 1000
beta = np.linspace(1e-4, 0.02, T)
alpha, alpha_bar = 1 - beta, np.cumprod(1 - beta)


def eps_optimo(xt, t):
    ab = alpha_bar[t]
    var = ab * s2 + (1 - ab)
    d = xt[:, None, :] - np.sqrt(ab) * mu[None]
    logp = -(d ** 2).sum(-1) / (2 * var)
    r = np.exp(logp - logp.max(1, keepdims=True))
    r /= r.sum(1, keepdims=True)
    return (r[..., None] * np.sqrt(1 - ab) * d / var).sum(1)


rng = np.random.default_rng(2)
x = rng.normal(size=(400, 2))                      # x_T ~ N(0, I)
fotos = {}
for t in reversed(range(T)):
    eps = eps_optimo(x, t)
    media = (x - beta[t] / np.sqrt(1 - alpha_bar[t]) * eps) / np.sqrt(alpha[t])
    x = media + (np.sqrt(beta[t]) * rng.normal(size=x.shape) if t > 0 else 0)
    if t in (999, 600, 300, 0):
        fotos[t] = x.copy()

fig, ax = plt.subplots(1, 4, figsize=(12, 3), sharex=True, sharey=True)
for a, (t, pts) in zip(ax, sorted(fotos.items(), reverse=True)):
    a.scatter(pts[:, 0], pts[:, 1], s=3)
    a.set_title(f"t = {t}")
plt.show()
print("muestras cerca de cada centro:", [int((np.linalg.norm(x - m, axis=1) < 0.7).sum()) for m in mu])
