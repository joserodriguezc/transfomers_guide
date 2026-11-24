# Transformada de Fourier: qué frecuencias contiene una señal
import matplotlib.pyplot as plt
import numpy as np

fs = 8000
t = np.arange(fs) / fs                      # 1 segundo
x = np.sin(2 * np.pi * 440 * t) + 0.5 * np.sin(2 * np.pi * 880 * t) + 0.2 * np.random.default_rng(0).normal(size=fs)

X = np.fft.rfft(x)
freqs = np.fft.rfftfreq(len(x), 1 / fs)
mag = np.abs(X) / len(x) * 2
picos = freqs[np.argsort(mag)[-2:]]
print("frecuencias dominantes:", sorted(float(p) for p in picos), "Hz")
plt.plot(freqs[:1500], mag[:1500])
plt.xlabel("frecuencia (Hz)")
plt.ylabel("amplitud")
plt.title("Espectro: un La (440 Hz) y su octava")
plt.show()
