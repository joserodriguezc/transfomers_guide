# PagedAttention: reservar la KV cache en páginas en lugar de un bloque contiguo por petición
import numpy as np

rng = np.random.default_rng(0)
max_len, pagina = 4096, 16
longitudes = rng.integers(50, 1500, size=20)     # tokens reales de 20 peticiones

contiguo = len(longitudes) * max_len             # reservar el máximo para cada una
paginado = int(np.sum(np.ceil(longitudes / pagina) * pagina))
print("tokens usados:", int(longitudes.sum()))
print(f"reserva contigua: {contiguo} ({longitudes.sum() / contiguo:.0%} aprovechado)")
print(f"reserva paginada: {paginado} ({longitudes.sum() / paginado:.0%} aprovechado)")
