# ¿Cuánta memoria ocupa la KV cache? 2 (K y V) · capas · cabezas KV · d_head · tokens · bytes
def kv_gib(capas, kv_heads, d_head, tokens, lote=1, bytes_=2):
    return 2 * capas * kv_heads * d_head * tokens * lote * bytes_ / 2 ** 30


modelos = {
    "Llama 3 8B (GQA 8)": (32, 8, 128),
    "mismo con MHA (32)": (32, 32, 128),
    "Llama 3 70B (GQA 8)": (80, 8, 128),
}
for nombre, (L, kv, dh) in modelos.items():
    print(f"{nombre:22s} 8k tokens: {kv_gib(L, kv, dh, 8192):5.2f} GiB | "
          f"128k tokens: {kv_gib(L, kv, dh, 131072):6.1f} GiB | 32 usuarios × 8k: {kv_gib(L, kv, dh, 8192, 32):6.1f} GiB")
