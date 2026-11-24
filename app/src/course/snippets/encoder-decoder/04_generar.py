# Decodificación autorregresiva: predecir, elegir, añadir y repetir
import numpy as np

vocab = ["<s>", "el", "gato", "come", "pescado", "duerme", "</s>"]
# Un «modelo» de juguete: probabilidades del siguiente token dado el último (una tabla de bigramas)
P = np.array([
    [0, .9, .05, 0, 0, 0, .05],
    [0, 0, .8, 0, .2, 0, 0],
    [0, 0, 0, .6, 0, .35, .05],
    [0, .3, 0, 0, .7, 0, 0],
    [0, 0, 0, 0, 0, 0, 1.],
    [0, 0, 0, 0, 0, 0, 1.],
    [0, 0, 0, 0, 0, 0, 1.],
])


def generar(estrategia, tau=1.0, semilla=0):
    rng = np.random.default_rng(semilla)
    seq = [0]
    while seq[-1] != 6 and len(seq) < 10:
        p = P[seq[-1]]
        if estrategia == "voraz":
            siguiente = int(p.argmax())
        else:                                     # muestreo con temperatura
            logits = np.log(p + 1e-12) / tau
            q = np.exp(logits - logits.max())
            siguiente = int(rng.choice(len(p), p=q / q.sum()))
        seq.append(siguiente)
    return " ".join(vocab[i] for i in seq)


print("voraz:   ", generar("voraz"))
for s in range(3):
    print("muestreo:", generar("muestreo", tau=1.0, semilla=s))
