# El objetivo de GRPO: razón de probabilidades recortada (como PPO) y penalización KL con la referencia
import numpy as np

rng = np.random.default_rng(0)
T = 6                                                  # tokens de una respuesta
logp_viejo = rng.normal(-1.5, 0.3, T)                  # log-prob con la política que generó la muestra
logp_nuevo = logp_viejo + rng.normal(0.2, 0.3, T)      # tras unos pasos de entrenamiento
logp_ref = logp_viejo - 0.1                            # modelo de referencia congelado
A, eps, beta = 1.3, 0.2, 0.04                          # ventaja de esta respuesta (de su grupo)

ratio = np.exp(logp_nuevo - logp_viejo)
sin_recorte = ratio * A
recortado = np.clip(ratio, 1 - eps, 1 + eps) * A
objetivo_tok = np.minimum(sin_recorte, recortado)      # el mínimo: pesimista, evita pasos grandes
# Estimador de KL por token (siempre ≥ 0): e^{ref − nuevo} − (ref − nuevo) − 1
d = logp_ref - logp_nuevo
kl = np.exp(d) - d - 1
objetivo = np.mean(objetivo_tok - beta * kl)
print("razones π_nuevo/π_viejo:", ratio.round(3))
print("KL por token:", kl.round(4))
print("objetivo GRPO (a maximizar):", objetivo.round(4), "-> pérdida:", (-objetivo).round(4))
