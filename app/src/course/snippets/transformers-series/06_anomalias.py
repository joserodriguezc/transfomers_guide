# AnomalyBERT en miniatura: degradar datos normales para crear anomalías sintéticas con etiqueta
import numpy as np

rng = np.random.default_rng(3)
L = 400
normal = np.sin(np.arange(L) / 10) + rng.normal(0, 0.1, L)


def degradar(x, rng, tipo):
    """Inserta un tramo anómalo de uno de los tipos que usa AnomalyBERT y devuelve las etiquetas."""
    x, y = x.copy(), np.zeros(len(x), dtype=int)
    ini = rng.integers(20, len(x) - 40)
    lon = rng.integers(5, 30)
    tramo = slice(ini, ini + lon)
    if tipo == "pico":
        x[ini] += rng.choice([-1, 1]) * 2.5
        tramo = slice(ini, ini + 1)
    elif tipo == "reemplazo":
        x[tramo] = rng.uniform(-1.5, 1.5, lon)
    elif tipo == "suave":
        otra = rng.integers(0, len(x) - lon)
        x[tramo] = 0.5 * x[tramo] + 0.5 * (x[otra:otra + lon] + 1.0)
    else:
        x[tramo] = x[ini]
    y[tramo] = 1
    return x, y


def detector(serie, k=9, umbral=10):
    """Distancia a la mediana móvil: un detector clásico (AnomalyBERT aprende una puntuación mejor)."""
    pad = np.pad(serie, k // 2, mode="edge")
    mediana = np.array([np.median(pad[i:i + k]) for i in range(len(serie))])
    r = np.abs(serie - mediana)
    return (r / (np.median(r) + 1e-9) > umbral).astype(int)


for tipo in ["pico", "reemplazo", "suave", "plano"]:
    serie, etiquetas = degradar(normal, rng, tipo)
    pred = detector(serie)
    tp = int((pred & etiquetas).sum())
    fp = int((pred & (1 - etiquetas)).sum())
    print(f"{tipo:10s} anómalos {int(etiquetas.sum()):2d} | detectados {tp:2d} | falsos positivos {fp}")
print("Las anomalías contextuales (suave, plano) escapan al detector local: hace falta contexto largo.")
