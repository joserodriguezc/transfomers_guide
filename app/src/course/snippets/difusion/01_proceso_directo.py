# Proceso hacia delante: añadir ruido gaussiano. x_t se puede muestrear directamente desde x_0
import numpy as np

T = 1000
beta = np.linspace(1e-4, 0.02, T)          # programa lineal del DDPM original
alpha = 1 - beta
alpha_bar = np.cumprod(alpha)

for t in [0, 99, 249, 499, 999]:
    snr = alpha_bar[t] / (1 - alpha_bar[t])
    print(f"t = {t + 1:4d}: √ᾱ = {np.sqrt(alpha_bar[t]):.3f} (señal)  √(1−ᾱ) = {np.sqrt(1 - alpha_bar[t]):.3f} (ruido)  SNR = {snr:.4f}")

rng = np.random.default_rng(0)
x0 = np.array([2.0, -1.0])
t = 499
eps = rng.normal(size=2)
xt = np.sqrt(alpha_bar[t]) * x0 + np.sqrt(1 - alpha_bar[t]) * eps   # sin recorrer los 500 pasos
print("x_0 =", x0, "-> x_500 =", xt.round(3))

# Objetivo de entrenamiento: el modelo ε_θ(x_t, t) debe predecir ε. Pérdida = MSE
eps_pred = eps + rng.normal(0, 0.3, 2)            # un modelo imperfecto
print("pérdida (MSE) =", np.mean((eps - eps_pred) ** 2).round(4))
