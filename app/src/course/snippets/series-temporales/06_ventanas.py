# Preparar un dataset: ventanas de contexto C y horizonte H, partición temporal y escalado
import numpy as np

serie = np.sin(np.arange(300) / 8) * 10 + np.arange(300) * 0.1 + 50
C, H = 48, 12

n = len(serie)
corte_val, corte_test = int(0.7 * n), int(0.85 * n)          # ¡nunca barajar en el tiempo!
media, desv = serie[:corte_val].mean(), serie[:corte_val].std()  # estadísticos SOLO del train
z = (serie - media) / desv


def ventanas(x, inicio, fin):
    X, Y = [], []
    for s in range(inicio, fin - C - H + 1):
        X.append(x[s:s + C])
        Y.append(x[s + C:s + C + H])
    return np.array(X), np.array(Y)


Xtr, Ytr = ventanas(z, 0, corte_val)
Xva, Yva = ventanas(z, corte_val - C, corte_test)            # el contexto puede venir del pasado
print("train:", Xtr.shape, Ytr.shape, "  val:", Xva.shape, Yva.shape)
# Línea base obligatoria: repetir el último valor (pronóstico ingenuo)
ingenuo = np.repeat(Xva[:, -1:], H, axis=1)
print("MAE del pronóstico ingenuo (val):", np.abs(ingenuo - Yva).mean().round(3))
