# Pronóstico probabilístico: muestrear trayectorias, resumir con cuantiles y evaluar con la pérdida pinball
import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(2)
historia = 10 + np.cumsum(rng.normal(0, 1, 60))
H, M = 20, 200                                   # horizonte y número de trayectorias
# Un modelo de juguete: paseo aleatorio con deriva estimada (lo que haría un modelo es muestrear tokens)
deriva = np.diff(historia).mean()
tray = historia[-1] + np.cumsum(deriva + rng.normal(0, 1, (M, H)), axis=1)

q10, q50, q90 = np.quantile(tray, [0.1, 0.5, 0.9], axis=0)
real = historia[-1] + np.cumsum(deriva + rng.normal(0, 1, H))


def pinball(y, q_pred, tau):
    e = y - q_pred
    return np.mean(np.maximum(tau * e, (tau - 1) * e))


print("pérdida pinball τ=0.1/0.5/0.9:", [round(pinball(real, q, t), 3) for q, t in [(q10, .1), (q50, .5), (q90, .9)]])
print("cobertura del intervalo 10–90 %:", np.mean((real >= q10) & (real <= q90)))
t = np.arange(60, 60 + H)
plt.plot(np.arange(60), historia, color="k")
plt.fill_between(t, q10, q90, alpha=0.3, label="intervalo 10–90 %")
plt.plot(t, q50, label="mediana")
plt.plot(t, real, "--", label="real")
plt.legend()
plt.show()
