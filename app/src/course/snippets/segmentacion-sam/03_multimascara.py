# Un punto es ambiguo: SAM propone tres máscaras (parte, objeto, todo) y predice su IoU
import numpy as np

H = W = 20
puerta = np.zeros((H, W), bool)
puerta[12:18, 8:11] = True
casa = np.zeros((H, W), bool)
casa[6:18, 4:15] = True
escena = np.zeros((H, W), bool)
escena[2:19, 1:19] = True
propuestas = {"parte (puerta)": puerta, "objeto (casa)": casa, "todo (escena)": escena}
iou_predicho = {"parte (puerta)": 0.71, "objeto (casa)": 0.93, "todo (escena)": 0.64}  # salida del modelo


def iou(a, b):
    return (a & b).sum() / (a | b).sum()


def dice(a, b):
    return 2 * (a & b).sum() / (a.sum() + b.sum())


verdad = casa                                     # lo que quería el usuario
for nombre, m in propuestas.items():
    print(f"{nombre:16s} IoU real {iou(m, verdad):.2f}  Dice {dice(m, verdad):.2f}  IoU predicho {iou_predicho[nombre]}")
print("elegida:", max(iou_predicho, key=iou_predicho.get))
