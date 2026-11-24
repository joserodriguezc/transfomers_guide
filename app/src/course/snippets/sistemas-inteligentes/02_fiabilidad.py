# Fiabilidad de una cadena de pasos: los errores se multiplican, la verificación los contiene
p = 0.95                         # probabilidad de que un paso salga bien
deteccion, reintentos = 0.8, 1   # un verificador detecta el 80 % de los fallos y se reintenta una vez

for k in [1, 5, 10, 20, 50]:
    sin = p ** k
    p_paso = p
    fallo = 1 - p
    for _ in range(reintentos):
        p_paso += fallo * deteccion * p
        fallo = fallo * deteccion * (1 - p) + fallo * (1 - deteccion)
    con = p_paso ** k
    print(f"{k:2d} pasos: sin verificación {sin:.3f} | con verificación y reintento {con:.3f}")
