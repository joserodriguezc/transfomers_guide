# Prefill frente a decode: por qué generar está limitado por el ancho de banda de memoria
params = 8e9
bytes_peso = 2                         # FP16
ancho_banda = 2.0e12                   # 2 TB/s (orden de magnitud de una GPU de gama alta)
flops = 400e12                         # 400 TFLOP/s efectivos en FP16

# Decode: cada token nuevo obliga a leer TODOS los pesos de memoria (para todo el lote a la vez)
t_lectura = params * bytes_peso / ancho_banda
for lote in [1, 8, 32, 128]:
    t_computo = 2 * params * lote / flops        # ~2 FLOP por parámetro y token
    t_paso = max(t_lectura, t_computo)
    print(f"lote {lote:3d}: {1000 * t_paso:5.1f} ms por paso -> {lote / t_paso:7.0f} tokens/s en total, "
          f"{1 / t_paso:5.0f} tokens/s por usuario")

# Prefill: el prompt entero se procesa en paralelo, limitado por cómputo
prompt = 2000
print(f"TTFT aproximado con un prompt de {prompt} tokens: {1000 * 2 * params * prompt / flops:.0f} ms")
