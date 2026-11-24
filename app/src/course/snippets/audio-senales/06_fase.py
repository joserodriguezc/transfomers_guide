# El espectrograma de magnitud descarta la fase: reconstruir con fase aleatoria suena distinto
import numpy as np

fs, n = 8000, 512
t = np.arange(n) / fs
x = np.sin(2 * np.pi * 300 * t) + 0.6 * np.sin(2 * np.pi * 1200 * t + 1.0)
X = np.fft.rfft(x)

con_fase = np.fft.irfft(np.abs(X) * np.exp(1j * np.angle(X)), n)
rng = np.random.default_rng(0)
fase_aleatoria = np.fft.irfft(np.abs(X) * np.exp(1j * rng.uniform(-np.pi, np.pi, len(X))), n)
print("error con la fase original:", np.abs(con_fase - x).max().round(6))
print("error con fase aleatoria:  ", np.abs(fase_aleatoria - x).max().round(3))
print("Por eso los modelos que generan espectrogramas necesitan un vocoder que invente una fase coherente.")
