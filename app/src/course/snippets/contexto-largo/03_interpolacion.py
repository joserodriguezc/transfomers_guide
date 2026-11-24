# Ampliar el contexto: interpolación de posiciones (PI) y cambio de base (NTK)
import numpy as np

d, L, L_nuevo = 128, 2048, 8192
s = L_nuevo / L
theta = 10000 ** (-2 * np.arange(d // 2) / d)

# Ángulo máximo que ve cada frecuencia: en entrenamiento (L) y al extrapolar a L_nuevo
ang_entreno = L * theta
ang_extrapolar = L_nuevo * theta
ang_pi = (L_nuevo / s) * theta                     # PI: posiciones divididas por s
base_ntk = 10000 * s ** (d / (d - 2))              # NTK-aware: agrandar la base
ang_ntk = L_nuevo * base_ntk ** (-2 * np.arange(d // 2) / d)

for i in [0, 32, 63]:
    print(f"dim {i:2d}: entreno {ang_entreno[i]:9.2f} | extrapolar {ang_extrapolar[i]:9.2f}"
          f" | PI {ang_pi[i]:9.2f} | NTK {ang_ntk[i]:9.2f}")
print("PI comprime todas las frecuencias (también las altas, que distinguen tokens vecinos).")
print("NTK deja intactas las altas y lleva las bajas al rango visto en el entrenamiento.")
