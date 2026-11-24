# Por qué difundir en un espacio latente: tokens y coste de atención
def tokens(H, W, F, s_esp, s_temp, p):
    return (H // s_esp // p) * (W // s_esp // p) * max(1, F // s_temp)


casos = {
    "imagen 512², píxeles, p=8": (512, 512, 1, 1, 1, 8),
    "imagen 512², VAE ×8, p=2": (512, 512, 1, 8, 1, 2),
    "vídeo 704×512×48, VAE ×8 (2D), p=2": (704, 512, 48, 8, 1, 2),
    "vídeo 704×512×48, VAE 3D ×8/×4, p=2": (704, 512, 48, 8, 4, 2),
    "vídeo 704×512×48, LTX ×32/×8, p=1": (704, 512, 48, 32, 8, 1),
}
for nombre, args in casos.items():
    n = tokens(*args)
    print(f"{nombre:38s} {n:7,d} tokens  atención ~{n * n:.1e} pares")

# Compresión de LTX-Video: 32×32×8 → 128 canales
print("factor de compresión LTX:", 32 * 32 * 8 * 3 / 128, "(1:192)")
