# La misma arquitectura en todos los dominios: solo cambia qué es un «token»
dominios = [
    ("texto (1000 caracteres)", "subpalabra BPE", lambda: 1000 // 4),  # ~4 caracteres por token
    ("serie temporal (512 pasos)", "parche de 16 con paso 8", lambda: (512 - 16) // 8 + 1),
    ("imagen 224×224", "parche de 16×16", lambda: (224 // 16) ** 2),
    ("vídeo 704×512×48 (LTX)", "tubo latente 32×32×8", lambda: (704 // 32) * (512 // 32) * (48 // 8)),
    ("audio 30 s (Whisper)", "trama de 20 ms", lambda: 30 * 50),
    ("RL, 20 pasos (DT)", "(R̂, s, a)", lambda: 3 * 20),
]
print(f"{'entrada':30s} {'token':26s} {'nº de tokens':>12s}")
for nombre, token, n in dominios:
    print(f"{nombre:30s} {token:26s} {n():12d}")
print("\nDespués, en todos: embedding + posición -> bloques de atención y FFN -> cabeza de la tarea.")
