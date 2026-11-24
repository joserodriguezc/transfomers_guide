# El recorrido de Whisper, en formas de tensores y tokens
segundos, fs, hop, n_mels = 30, 16000, 160, 80
muestras = segundos * fs
tramas = muestras // hop                         # log-mel: 3000 × 80
tras_conv = tramas // 2                          # dos convoluciones, la segunda con paso 2 -> 1500
print(f"audio: {muestras:,} muestras -> log-mel {tramas} × {n_mels} -> encoder {tras_conv} posiciones")
print(f"cada posición del encoder representa {segundos / tras_conv * 1000:.0f} ms")

# El decoder recibe un prompt de tokens especiales que fija la tarea
prompt = ["<|startoftranscript|>", "<|es|>", "<|transcribe|>", "<|notimestamps|>"]
print("prompt del decoder:", " ".join(prompt))
traducir = ["<|startoftranscript|>", "<|es|>", "<|translate|>"]   # traducir al inglés
print("para traducir:     ", " ".join(traducir))
# Con marcas de tiempo, el decoder emite tokens <|t|> en pasos de 20 ms
print("marca de tiempo 3.24 s ->", f"<|{round(3.24 / 0.02) * 0.02:.2f}|>")
