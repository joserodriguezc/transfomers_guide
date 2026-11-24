# ¿Cabe el modelo? Memoria de pesos + KV cache según la precisión
BYTES = {"FP16/BF16": 2, "FP8/INT8": 1, "INT4": 0.5}
modelos = {"8B (32 capas, 8 KV, d_head 128)": (8e9, 32, 8, 128),
           "70B (80 capas, 8 KV, d_head 128)": (70e9, 80, 8, 128)}
contexto, usuarios = 8192, 16

for nombre, (params, capas, kv, dh) in modelos.items():
    kv_gb = 2 * capas * kv * dh * contexto * usuarios * 2 / 1e9        # KV cache en FP16
    print(nombre)
    for prec, b in BYTES.items():
        pesos = params * b / 1e9
        total = pesos + kv_gb
        print(f"  {prec:10s} pesos {pesos:6.1f} GB + KV {kv_gb:5.1f} GB = {total:6.1f} GB"
              f" -> GPUs de 80 GB: {int(-(-total * 1.1 // 80))}")      # +10 % de margen
