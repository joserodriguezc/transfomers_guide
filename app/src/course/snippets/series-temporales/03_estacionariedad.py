# Estacionariedad: media y varianza estables en el tiempo. Diferenciar para conseguirla
import numpy as np

rng = np.random.default_rng(2)
paseo = np.cumsum(rng.normal(size=1000))           # paseo aleatorio: NO estacionario
dif = np.diff(paseo)                               # su diferencia: ruido blanco, estacionario


def resumen(x, nombre):
    mitades = np.array_split(x, 4)
    medias = [round(float(m.mean()), 2) for m in mitades]
    varianzas = [round(float(m.var()), 3) for m in mitades]
    print(f"{nombre:12s} medias por cuarto {medias}  varianzas {varianzas}")


resumen(paseo, "paseo")
resumen(dif, "diferenciada")
# Con una tendencia exponencial, tomar logaritmos antes de diferenciar estabiliza la varianza
ventas = np.exp(0.01 * np.arange(500)) * (1 + 0.05 * rng.normal(size=500))
resumen(np.diff(np.log(ventas)), "Δ log(ventas)")
