# Una serie = tendencia + estacionalidad + ruido. Separarla con una media móvil
import matplotlib.pyplot as plt
import numpy as np

rng = np.random.default_rng(0)
t = np.arange(120)                                  # 10 años de datos mensuales
tendencia = 50 + 0.4 * t
estacional = 8 * np.sin(2 * np.pi * t / 12)
y = tendencia + estacional + rng.normal(0, 2, size=t.size)

# Media móvil centrada de 12 meses: promedia un ciclo completo y deja la tendencia
k = 12
tend_est = np.convolve(y, np.ones(k) / k, mode="same")
sin_tend = y - tend_est
estac_est = np.array([sin_tend[6:-6][(np.arange(6, 114) % 12) == m].mean() for m in range(12)])
resto = y - tend_est - estac_est[t % 12]

fig, ax = plt.subplots(3, 1, figsize=(7, 6), sharex=True)
ax[0].plot(t, y, label="serie")
ax[0].plot(t, tend_est, label="tendencia estimada")
ax[0].legend()
ax[1].plot(t, estac_est[t % 12])
ax[1].set_title("estacionalidad estimada")
ax[2].plot(t[6:-6], resto[6:-6])
ax[2].set_title("residuo")
plt.tight_layout()
plt.show()
print("amplitud estacional estimada:", estac_est.max().round(2), "(real: 8)")
