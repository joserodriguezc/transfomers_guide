# La «mentira» de la latencia media: lo que sufren los usuarios son las colas (p95, p99)
import numpy as np

rng = np.random.default_rng(2)
# 95 % de peticiones rápidas y 5 % que caen detrás de un prefill largo o de un pico de carga
latencias = np.concatenate([rng.lognormal(np.log(0.8), 0.25, 9500), rng.lognormal(np.log(6.0), 0.4, 500)])
print(f"media {latencias.mean():.2f} s | p50 {np.percentile(latencias, 50):.2f} s | "
      f"p95 {np.percentile(latencias, 95):.2f} s | p99 {np.percentile(latencias, 99):.2f} s")
slo = 3.0
print(f"cumplen un SLO de {slo} s: {np.mean(latencias <= slo):.1%} de las peticiones")
