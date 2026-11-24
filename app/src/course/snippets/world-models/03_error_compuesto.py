# El error de un modelo imperfecto se acumula al encadenar predicciones
import numpy as np

A_real = np.array([[np.cos(0.2), -np.sin(0.2)], [np.sin(0.2), np.cos(0.2)]]) * 0.99
A_modelo = np.array([[np.cos(0.23), -np.sin(0.23)], [np.sin(0.23), np.cos(0.23)]]) * 0.99   # 0.03 rad de error

s_real = s_mod = np.array([1.0, 0.0])
for h in range(1, 31):
    s_real, s_mod = A_real @ s_real, A_modelo @ s_mod
    if h in (1, 5, 10, 20, 30):
        print(f"horizonte {h:2d}: error {np.linalg.norm(s_real - s_mod):.3f}")
print("Por eso se imaginan horizontes cortos y se vuelve a partir de estados reales.")
