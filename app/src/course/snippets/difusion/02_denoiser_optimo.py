# Para datos que son una mezcla de gaussianas, el mejor predictor de ruido tiene fórmula cerrada
import numpy as np

mu = np.array([[-2.0, 0.0], [2.0, 0.0], [0.0, 2.5]])   # tres «clases»
s2 = 0.05                                               # varianza de cada componente
T = 1000
alpha_bar = np.cumprod(1 - np.linspace(1e-4, 0.02, T))


def eps_optimo(xt, t, pesos=None):
    """E[ε | x_t] bajo la mezcla. `pesos` permite condicionar a una clase (one-hot) o no (uniforme)."""
    ab = alpha_bar[t]
    pesos = np.ones(len(mu)) / len(mu) if pesos is None else pesos
    var = ab * s2 + (1 - ab)                            # varianza de x_t dentro de cada componente
    d2 = ((xt[:, None, :] - np.sqrt(ab) * mu[None]) ** 2).sum(-1)
    logp = np.log(pesos + 1e-300)[None] - d2 / (2 * var)
    r = np.exp(logp - logp.max(1, keepdims=True))
    r /= r.sum(1, keepdims=True)                        # responsabilidad de cada componente
    # Para una gaussiana: E[ε | x_t, k] = √(1−ᾱ) (x_t − √ᾱ μ_k) / var
    e_k = np.sqrt(1 - ab) * (xt[:, None, :] - np.sqrt(ab) * mu[None]) / var
    return (r[..., None] * e_k).sum(1)


rng = np.random.default_rng(1)
x0 = mu[rng.integers(0, 3, 500)] + np.sqrt(s2) * rng.normal(size=(500, 2))
for t in [50, 500, 950]:
    eps = rng.normal(size=x0.shape)
    xt = np.sqrt(alpha_bar[t]) * x0 + np.sqrt(1 - alpha_bar[t]) * eps
    print(f"t = {t}: MSE del predictor óptimo = {np.mean((eps_optimo(xt, t) - eps) ** 2):.3f}")
