# Idea del decodificador de máscaras: producto punto entre un token de salida y cada píxel del embedding
import numpy as np

rng = np.random.default_rng(1)
H = W = 24
D = 8
# Embedding de imagen sintético: tres regiones con «características» distintas
regiones = np.zeros((H, W), dtype=int)
regiones[4:14, 3:12] = 1
regiones[10:22, 14:22] = 2
centros = rng.normal(size=(3, D)) * 2
emb = centros[regiones] + rng.normal(0, 0.4, (H, W, D))       # (H, W, D)

clic = (8, 6)                                                 # el usuario pincha en la región 1
token = emb[clic]                                             # (en SAM, un token que ha atendido al prompt y a la imagen)
logits = emb @ token / np.sqrt(D)                             # (H, W): un logit por píxel
coseno = logits * np.sqrt(D) / (np.linalg.norm(emb, axis=-1) * np.linalg.norm(token))
mascara = coseno > 0.6                                        # (SAM: sigmoide del logit > 0.5)
iou = (mascara & (regiones == 1)).sum() / (mascara | (regiones == 1)).sum()
print("píxeles en la máscara:", int(mascara.sum()), " IoU con la región real:", iou.round(3))
for fila in mascara[::3, ::2].astype(int):
    print("".join("█" if v else "·" for v in fila))
