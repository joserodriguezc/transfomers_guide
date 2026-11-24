# Espectrograma con la STFT: Fourier por tramas cortas con ventana de Hann
import matplotlib.pyplot as plt
import numpy as np

fs = 16000
t = np.arange(int(1.5 * fs)) / fs
x = np.sin(2 * np.pi * (200 * t + 600 * t ** 2))      # un «chirp»: la frecuencia sube con el tiempo

n_fft, hop = 400, 160                                  # 25 ms de ventana y 10 ms de salto (como Whisper)
ventana = np.hanning(n_fft)
tramas = np.stack([x[i:i + n_fft] * ventana for i in range(0, len(x) - n_fft, hop)])
S = np.abs(np.fft.rfft(tramas, axis=1)) ** 2           # potencia: (tramas, n_fft/2 + 1)
print("espectrograma:", S.shape, "->", S.shape[0], "tramas de 10 ms y", S.shape[1], "bandas de", fs / n_fft, "Hz")

plt.imshow(10 * np.log10(S.T + 1e-10), origin="lower", aspect="auto",
           extent=[0, len(x) / fs, 0, fs / 2])
plt.xlabel("tiempo (s)")
plt.ylabel("frecuencia (Hz)")
plt.colorbar(label="dB")
plt.show()
