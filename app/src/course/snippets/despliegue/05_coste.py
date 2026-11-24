# Coste por 1000 tokens: API frente a GPU propia (fórmula del capítulo 11)
def coste_1k_propio(usd_hora, tokens_s, utilizacion=1.0):
    return 1000 * usd_hora / (tokens_s * 3600 * utilizacion)


# Precios de ejemplo de una API (Qwen3-32B base y «fast», salida, $ por 1M de tokens) y throughput medido
api = {"base": (0.30, 129.4), "fast": (0.60, 344.5)}
for nivel, (precio_m, tps) in api.items():
    print(f"API {nivel:4s}: {precio_m / 1000:.5f} $ por 1k tokens de salida, {tps:.0f} tokens/s por petición")

for usd_hora, tps, util in [(2.5, 1500, 1.0), (2.5, 1500, 0.3), (2.5, 1500, 0.05)]:
    print(f"GPU propia a {usd_hora} $/h, {tps} tokens/s, utilización {util:.0%}: "
          f"{coste_1k_propio(usd_hora, tps, util):.5f} $ por 1k tokens")
