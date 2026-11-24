# Métricas de pronóstico: MAE, sMAPE y MASE (escalada por el pronóstico ingenuo)
import numpy as np

y_train = np.array([10, 12, 11, 13, 12, 14, 13, 15], dtype=float)
y_real = np.array([14, 16, 15], dtype=float)
y_pred = np.array([14.5, 15, 15.5])

mae = np.abs(y_real - y_pred).mean()
smape = np.mean(2 * np.abs(y_real - y_pred) / (np.abs(y_real) + np.abs(y_pred))) * 100
escala = np.abs(np.diff(y_train)).mean()          # MAE del pronóstico ingenuo dentro del train
mase = mae / escala
print(f"MAE = {mae:.3f}  sMAPE = {smape:.2f} %  MASE = {mase:.3f}")
print("MASE < 1: mejor que repetir el último valor")
