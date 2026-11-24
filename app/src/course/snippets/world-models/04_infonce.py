# Codificación predictiva contrastiva (CPC / TWISTER): reconocer el futuro real entre negativos
import numpy as np

rng = np.random.default_rng(2)
n, d, tau = 16, 32, 0.1
futuro_real = rng.normal(size=(n, d))                   # embeddings de los estados futuros reales
prediccion = futuro_real + rng.normal(0, 0.8, (n, d))   # lo que predice el modelo del mundo


def infonce(pred, real, tau):
    p = pred / np.linalg.norm(pred, axis=1, keepdims=True)
    r = real / np.linalg.norm(real, axis=1, keepdims=True)
    logits = p @ r.T / tau                              # (n, n): la diagonal son los pares positivos
    logits -= logits.max(1, keepdims=True)
    logp = logits - np.log(np.exp(logits).sum(1, keepdims=True))
    return -np.mean(np.diag(logp)), np.mean(logits.argmax(1) == np.arange(len(pred)))


perdida, acierto = infonce(prediccion, futuro_real, tau)
print(f"InfoNCE = {perdida:.3f} (azar: log {n} = {np.log(n):.3f}), acierto = {acierto:.0%}")
perdida, acierto = infonce(rng.normal(size=(n, d)), futuro_real, tau)
print(f"modelo aleatorio: InfoNCE = {perdida:.3f}, acierto = {acierto:.0%}")
