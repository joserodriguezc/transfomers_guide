# Checkpoint Engine (modelo simplificado): llevar los pesos nuevos del entrenador a los motores de inferencia
parametros = 1.0e12             # un modelo de 1 billón de parámetros
bytes_por_param = 1             # pesos en FP8
gpus = 256
fragmento = parametros * bytes_por_param / gpus      # cada GPU de inferencia guarda su parte

h2d = 25e9                      # supuesto: CPU -> GPU por PCIe, 25 GB/s
difusion = 40e9                 # supuesto: difusión entre GPUs, 40 GB/s
recarga = 60e9                  # supuesto: copiar al motor de inferencia (búfer IPC), 60 GB/s

t_h2d, t_dif, t_rec = fragmento / h2d, fragmento / difusion, fragmento / recarga
print(f"fragmento por GPU: {fragmento / 1e9:.1f} GB")
print(f"todo en serie:                    {t_h2d + t_dif + t_rec:.2f} s")
print(f"H2D y después difusión ∥ recarga: {t_h2d + max(t_dif, t_rec):.2f} s")
print(f"desde disco a 2 GB/s:             {fragmento / 2e9:.2f} s por GPU (y el disco se comparte)")
