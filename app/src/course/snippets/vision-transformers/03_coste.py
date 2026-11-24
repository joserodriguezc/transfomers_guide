# Coste de la atención global (ViT) frente a la atención por ventanas (Swin)
M = 7                                            # ventana de 7×7 parches
for lado in [224, 512, 1024]:
    N = (lado // 4) ** 2                         # Swin empieza con parches de 4×4
    global_ = N ** 2
    ventanas = (N // (M * M)) * (M * M) ** 2     # = N · M²
    print(f"imagen {lado}×{lado}: {N:6d} tokens | global {global_:.2e} pares | "
          f"ventanas {ventanas:.2e} pares | ahorro ×{global_ / ventanas:,.0f}")
