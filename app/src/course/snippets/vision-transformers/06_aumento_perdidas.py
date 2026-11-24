# Aumento de datos y pérdidas para segmentación: Dice y focal
import numpy as np

rng = np.random.default_rng(3)
img = rng.random((32, 32))
volteo = img[:, ::-1]                              # volteo horizontal
recorte = img[4:28, 4:28]                          # recorte aleatorio (luego se reescala)
mixup = 0.7 * img + 0.3 * rng.random((32, 32))     # mixup: mezcla de dos imágenes (y de sus etiquetas)
print(volteo.shape, recorte.shape, mixup.shape)

real = np.zeros((32, 32))
real[10:20, 10:20] = 1                             # una lesión pequeña (desbalance: 10 % de píxeles)
pred = np.clip(real + rng.normal(0, 0.3, real.shape), 0, 1)

dice = 2 * (pred * real).sum() / (pred.sum() + real.sum())
print("pérdida Dice:", (1 - dice).round(3))
p_t = np.where(real == 1, pred, 1 - pred)
gamma = 2
focal = -((1 - p_t) ** gamma * np.log(p_t + 1e-7)).mean()
ce = -np.log(p_t + 1e-7).mean()
print(f"entropía cruzada {ce:.3f} vs focal {focal:.3f} (la focal resta peso a los píxeles fáciles)")
