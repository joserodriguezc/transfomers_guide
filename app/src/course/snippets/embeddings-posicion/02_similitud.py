# Similitud coseno entre embeddings: palabras parecidas apuntan en direcciones parecidas
import numpy as np

# Embeddings 3D de juguete: (realeza, género, «es un animal»)
emb = {
    "rey":    np.array([0.9,  0.8, 0.0]),
    "reina":  np.array([0.9, -0.8, 0.0]),
    "hombre": np.array([0.1,  0.8, 0.0]),
    "mujer":  np.array([0.1, -0.8, 0.0]),
    "gato":   np.array([0.0,  0.1, 0.9]),
}


def coseno(a, b):
    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))


for w in ["reina", "hombre", "gato"]:
    print(f"cos(rey, {w}) = {coseno(emb['rey'], emb[w]):.2f}")

# La famosa analogía: rey − hombre + mujer ≈ reina
v = emb["rey"] - emb["hombre"] + emb["mujer"]
mejor = max((w for w in emb if w != "rey"), key=lambda w: coseno(v, emb[w]))
print("rey − hombre + mujer ≈", mejor)
