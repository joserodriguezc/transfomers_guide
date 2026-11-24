# ¿De dónde salen los 8 mil millones de parámetros? Un modelo tipo Llama 3 8B
V, d, L, h, h_kv, d_ff = 128_256, 4096, 32, 32, 8, 14_336
d_head = d // h

atencion = d * d + 2 * d * (h_kv * d_head) + d * d   # Wq, Wk, Wv (GQA), Wo
ffn = 3 * d * d_ff                                   # SwiGLU: gate, up, down
normas = 2 * d
por_bloque = atencion + ffn + normas
embeddings = V * d
salida = V * d                                       # no compartida con los embeddings
total = L * por_bloque + embeddings + salida + d

print(f"atención por bloque: {atencion / 1e6:6.1f} M")
print(f"FFN por bloque:      {ffn / 1e6:6.1f} M")
print(f"{L} bloques:          {L * por_bloque / 1e9:6.2f} mil M")
print(f"embeddings + salida: {(embeddings + salida) / 1e9:6.2f} mil M")
print(f"total:               {total / 1e9:6.2f} mil M")
