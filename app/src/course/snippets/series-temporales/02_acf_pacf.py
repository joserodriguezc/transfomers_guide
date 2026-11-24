# Autocorrelación (ACF) y autocorrelación parcial (PACF) desde cero
import numpy as np

rng = np.random.default_rng(1)
# Proceso AR(2): x_t = 0.6 x_{t-1} + 0.3 x_{t-2} + ruido
x = np.zeros(2000)
for t in range(2, len(x)):
    x[t] = 0.6 * x[t - 1] + 0.3 * x[t - 2] + rng.normal()


def acf(x, k_max):
    x = x - x.mean()
    c0 = x @ x
    return np.array([x[k:] @ x[:len(x) - k] / c0 for k in range(k_max + 1)])


def pacf(x, k_max):
    # PACF(k) = último coeficiente de la regresión de x_t sobre x_{t-1}, ..., x_{t-k}
    out = [1.0]
    for k in range(1, k_max + 1):
        X = np.column_stack([x[k - j - 1:len(x) - j - 1] for j in range(k)])
        coef, *_ = np.linalg.lstsq(X, x[k:], rcond=None)
        out.append(coef[-1])
    return np.array(out)


print("ACF :", acf(x, 6).round(2))     # decae despacio
print("PACF:", pacf(x, 6).round(2))    # se corta tras el retardo 2: es un AR(2)
print("banda de significación ±", round(1.96 / np.sqrt(len(x)), 3))
