# Muestreo y aliasing: por encima de fs/2, una frecuencia se «disfraza» de otra
import numpy as np

fs = 1000                                   # 1000 muestras por segundo -> Nyquist = 500 Hz

for f in [100, 400, 600, 900]:
    espectro = np.abs(np.fft.rfft(np.sin(2 * np.pi * f * np.arange(fs) / fs)))
    aparente = np.argmax(espectro)          # resolución de 1 Hz con 1 s de señal
    print(f"tono real {f:3d} Hz -> frecuencia aparente {aparente:3d} Hz" + ("  (aliasing)" if f > fs / 2 else ""))
print("Whisper muestrea a 16 kHz: puede representar hasta 8 kHz, suficiente para la voz.")
