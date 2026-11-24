# SAM 2 en vídeo: propagar la máscara con un banco de memoria de fotogramas anteriores
import numpy as np

rng = np.random.default_rng(2)
H = W = 20
D = 8
fondo, objeto = np.eye(D)[0] * 2, np.eye(D)[1] * 2          # rasgos del fondo y del objeto


def fotograma(cx):
    """Un objeto cuadrado que se desplaza a la derecha."""
    m = np.zeros((H, W), bool)
    m[7:13, cx:cx + 5] = True
    emb = np.where(m[..., None], objeto, fondo) + rng.normal(0, 0.4, (H, W, D))
    return emb, m


memoria = []
emb0, m0 = fotograma(2)
memoria.append(emb0[m0].mean(0))                 # fotograma 0: el usuario marca el objeto
for t, cx in enumerate([4, 6, 8, 10, 12], start=1):
    emb, verdad = fotograma(cx)
    clave = np.mean(memoria[-3:], axis=0)        # atender a los últimos fotogramas de la memoria
    sim = emb @ clave / (np.linalg.norm(emb, axis=-1) * np.linalg.norm(clave))
    pred = sim > 0.5
    memoria.append(emb[pred].mean(0) if pred.any() else clave)
    iou = (pred & verdad).sum() / (pred | verdad).sum()
    print(f"fotograma {t}: IoU = {iou:.2f}")
