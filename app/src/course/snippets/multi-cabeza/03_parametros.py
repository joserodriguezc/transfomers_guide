# Parámetros de la atención multi-cabeza: no dependen del número de cabezas
d_model = 4096
for h in [1, 8, 32, 64]:
    d_k = d_model // h
    por_cabeza = 3 * d_model * d_k          # W_Q, W_K, W_V de esa cabeza
    total = h * por_cabeza + d_model * d_model  # + W_O
    print(f"h = {h:2d}, d_k = {d_k:4d}: {total / 1e6:.1f} M parámetros")
