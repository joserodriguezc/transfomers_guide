# Decodificar con y sin KV cache: mismo resultado, mucho menos trabajo
import numpy as np

rng = np.random.default_rng(0)
d, pasos = 16, 8
Wq, Wk, Wv = (rng.normal(size=(d, d)) / np.sqrt(d) for _ in range(3))
X = rng.normal(size=(pasos, d))           # embeddings de los tokens que van llegando


def atender(q, K, V):
    s = K @ q / np.sqrt(d)
    p = np.exp(s - s.max())
    return (p / p.sum()) @ V


# Sin caché: en cada paso se recalculan K y V de TODO el prefijo
sin, ops_sin = [], 0
for t in range(pasos):
    K, V = X[:t + 1] @ Wk, X[:t + 1] @ Wv
    ops_sin += 2 * (t + 1)
    sin.append(atender(X[t] @ Wq, K, V))

# Con caché: solo se calcula la K y la V del token nuevo y se añaden
K_cache, V_cache, con, ops_con = np.empty((0, d)), np.empty((0, d)), [], 0
for t in range(pasos):
    K_cache = np.vstack([K_cache, X[t] @ Wk])
    V_cache = np.vstack([V_cache, X[t] @ Wv])
    ops_con += 2
    con.append(atender(X[t] @ Wq, K_cache, V_cache))

print("¿mismas salidas?", np.allclose(sin, con))
print("proyecciones K/V calculadas: sin caché", ops_sin, "| con caché", ops_con)
