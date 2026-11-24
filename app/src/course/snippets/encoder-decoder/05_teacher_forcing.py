# Entrenar un decoder: todas las posiciones a la vez gracias a la máscara causal
import numpy as np

tokens = np.array([0, 1, 2, 3, 4, 6])      # <s> el gato come pescado </s>
entrada, objetivo = tokens[:-1], tokens[1:] # desplazar una posición
print("entrada :", entrada)
print("objetivo:", objetivo)

rng = np.random.default_rng(0)
logits = rng.normal(size=(len(entrada), 7))  # lo que produciría el modelo: un vector por posición
logp = logits - np.log(np.exp(logits).sum(1, keepdims=True))
perdida = -logp[np.arange(len(objetivo)), objetivo].mean()
print("entropía cruzada media:", perdida.round(3), " (azar: ln 7 =", np.log(7).round(3), ")")
