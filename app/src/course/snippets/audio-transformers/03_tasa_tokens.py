# ¿Cuántos tokens cuesta una hora de audio con cada representación?
hora = 3600
representaciones = {
    "muestras a 16 kHz": 16000,
    "tramas log-mel (10 ms)": 100,
    "encoder de Whisper (20 ms)": 50,
    "códec, 75 Hz × 8 libros": 75 * 8,
    "códec, 12.5 Hz × 8 libros (Mimi)": 12.5 * 8,
    "tokens semánticos 12.5 Hz (Kimi-Audio)": 12.5,
    "texto hablado (~2.5 tokens/s)": 2.5,
}
for nombre, por_seg in representaciones.items():
    print(f"{nombre:40s} {por_seg:8.1f} tokens/s -> {por_seg * hora:12,.0f} tokens por hora")
print("bitrate del códec (75 Hz × 8 libros × 10 bits):", 75 * 8 * 10 / 1000, "kbps")
