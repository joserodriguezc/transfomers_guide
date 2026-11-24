# Profundidad de bits: cada bit añade unos 6 dB de relación señal/ruido de cuantización
import numpy as np

t = np.linspace(0, 1, 16000, endpoint=False)
x = 0.9 * np.sin(2 * np.pi * 440 * t)
for bits in [4, 8, 16]:
    niveles = 2 ** (bits - 1)
    xq = np.round(x * niveles) / niveles
    snr = 10 * np.log10(np.mean(x ** 2) / np.mean((x - xq) ** 2))
    print(f"{bits:2d} bits: {2 ** bits:6d} niveles, SNR = {snr:5.1f} dB (≈ 6.02·bits + 1.76 = {6.02 * bits + 1.76:.1f})")
