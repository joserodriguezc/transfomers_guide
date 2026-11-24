# Correlación cruzada: ¿una serie adelanta a la otra?
import numpy as np

rng = np.random.default_rng(4)
n, retardo = 500, 7
publicidad = rng.normal(size=n)                          # gasto en publicidad del día t
ventas = 0.8 * np.concatenate([np.zeros(retardo), publicidad[:-retardo]]) + rng.normal(0, 0.5, n)


def ccf(x, y, k):
    """Correlación entre x en el día t e y en el día t + k."""
    x, y = (x - x.mean()) / x.std(), (y - y.mean()) / y.std()
    return np.mean(x[:len(x) - k] * y[k:])


corr = [ccf(publicidad, ventas, k) for k in range(15)]
mejor = int(np.argmax(np.abs(corr)))
print([round(float(c), 2) for c in corr])
print(f"la publicidad adelanta a las ventas {mejor} días (corr = {corr[mejor]:.2f})")
