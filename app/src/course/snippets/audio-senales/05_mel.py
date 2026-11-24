# Banco de filtros mel y espectrograma log-mel (la entrada de Whisper)
import numpy as np

fs, n_fft, n_mels = 16000, 400, 80
hz2mel = lambda f: 2595 * np.log10(1 + f / 700)
mel2hz = lambda m: 700 * (10 ** (m / 2595) - 1)

# n_mels + 2 puntos equiespaciados en la escala mel, convertidos a índices de la FFT
puntos = mel2hz(np.linspace(hz2mel(0), hz2mel(fs / 2), n_mels + 2))
bins = np.floor((n_fft + 1) * puntos / fs).astype(int)
F = np.zeros((n_mels, n_fft // 2 + 1))
for m in range(1, n_mels + 1):
    izq, centro, der = bins[m - 1], bins[m], bins[m + 1]
    F[m - 1, izq:centro] = (np.arange(izq, centro) - izq) / max(centro - izq, 1)
    F[m - 1, centro:der] = (der - np.arange(centro, der)) / max(der - centro, 1)

print("anchura de los filtros (bins de FFT) — primeros:", (bins[2:6] - bins[:4]).tolist(), " últimos:", (bins[-4:] - bins[-6:-2]).tolist())
rng = np.random.default_rng(0)
potencia = np.abs(np.fft.rfft(rng.normal(size=(3000, n_fft)), axis=1)) ** 2   # 30 s de tramas
log_mel = np.log10(np.maximum(potencia @ F.T, 1e-10))
print("log-mel:", log_mel.shape, "(tramas × bandas mel); Whisper usa 3000 × 80 para 30 s")
