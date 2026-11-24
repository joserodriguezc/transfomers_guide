"""``uv run build-notebooks``: genera los notebooks opcionales de notebooks/ a partir de NOTEBOOKS.

Cada notebook acompaña a un módulo del curso y usa modelos reales (PyTorch, transformers, diffusers…).
Requieren las dependencias del grupo opcional: ``uv sync --group notebooks``. Los marcados con GPU
necesitan una tarjeta gráfica con CUDA (o mucha paciencia en CPU).
"""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "notebooks"

INSTALAR = (
    "> **Requisitos:** desde la raíz del repositorio, `uv sync --group notebooks` y abre este notebook con "
    "`uv run --group notebooks jupyter lab`. La primera ejecución descarga los modelos de Hugging Face."
)

# (archivo, título, módulo, requiere GPU, celdas). Cada celda: ("md" | "code", texto)
NOTEBOOKS: list[tuple[str, str, str, bool, list[tuple[str, str]]]] = [
    (
        "01_tokenizacion", "Tokenizadores reales", "tokenizacion", False,
        [
            ("md", "Comparamos los tokenizadores de BERT, GPT-2 y Qwen sobre el mismo texto en español e inglés y medimos su **fertilidad** (tokens por palabra)."),
            ("code", "from transformers import AutoTokenizer\n\ntokenizadores = {\n    \"BERT\": AutoTokenizer.from_pretrained(\"bert-base-uncased\"),\n    \"GPT-2\": AutoTokenizer.from_pretrained(\"gpt2\"),\n    \"Qwen2.5\": AutoTokenizer.from_pretrained(\"Qwen/Qwen2.5-0.5B\"),\n}"),
            ("code", "textos = {\n    \"inglés\": \"The Transformer has revolutionized NLP.\",\n    \"español\": \"El transformer ha revolucionado el procesamiento del lenguaje natural.\",\n}\nfor nombre, tok in tokenizadores.items():\n    for idioma, t in textos.items():\n        piezas = tok.tokenize(t)\n        print(f\"{nombre:8s} {idioma:8s} {len(piezas):3d} tokens  fertilidad {len(piezas) / len(t.split()):.2f}  {piezas}\")"),
            ("code", "# IDs con tokens especiales: [CLS] = 101 y [SEP] = 102 en BERT\nids = tokenizadores[\"BERT\"](textos[\"inglés\"])[\"input_ids\"]\nprint(ids)\nprint(tokenizadores[\"BERT\"].convert_ids_to_tokens(ids))"),
            ("code", "# Las primeras fusiones BPE aprendidas por GPT-2\ntok = tokenizadores[\"GPT-2\"]\nfusiones = tok.backend_tokenizer.model.__class__.__name__\nprint(\"modelo del tokenizador:\", fusiones, \"| tamaño del vocabulario:\", tok.vocab_size)\nprint([tok.decode([i]) for i in range(256, 276)])"),
            ("md", "**Para practicar:** mide la fertilidad con un texto largo de tu dominio y estima el coste en tokens de procesarlo con cada modelo."),
        ],
    ),
    (
        "02_embeddings_posicion", "Embeddings y posiciones aprendidas", "embeddings-posicion", False,
        [
            ("code", "import torch\nimport matplotlib.pyplot as plt\nfrom transformers import AutoModel, AutoTokenizer"),
            ("md", "El ejemplo del capítulo 1: los embeddings contextuales de BERT para una frase."),
            ("code", "tok = AutoTokenizer.from_pretrained(\"bert-base-uncased\")\nmodelo = AutoModel.from_pretrained(\"bert-base-uncased\")\nentrada = tok(\"The Transformer has revolutionized NLP.\", return_tensors=\"pt\")\nprint(entrada[\"input_ids\"])\nwith torch.no_grad():\n    salida = modelo(**entrada)\nprint(salida.last_hidden_state.shape)"),
            ("md", "Las posiciones **aprendidas** de GPT-2: similitud coseno entre los vectores de las primeras 128 posiciones."),
            ("code", "gpt2 = AutoModel.from_pretrained(\"gpt2\")\nP = gpt2.wpe.weight[:128].detach()\nP = P / P.norm(dim=1, keepdim=True)\nplt.imshow((P @ P.T).numpy(), cmap=\"viridis\")\nplt.title(\"Coseno entre posiciones aprendidas (GPT-2)\")\nplt.colorbar()\nplt.show()"),
        ],
    ),
    (
        "03_atencion", "Matrices de atención de BERT", "atencion", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport torch\nfrom transformers import AutoModel, AutoTokenizer\n\ntok = AutoTokenizer.from_pretrained(\"bert-base-uncased\")\nmodelo = AutoModel.from_pretrained(\"bert-base-uncased\", output_attentions=True, attn_implementation=\"eager\")"),
            ("code", "def atencion_de(frase, palabra, capa=8):\n    x = tok(frase, return_tensors=\"pt\")\n    with torch.no_grad():\n        att = modelo(**x).attentions[capa][0].mean(0)   # media de las cabezas\n    tokens = tok.convert_ids_to_tokens(x[\"input_ids\"][0])\n    i = tokens.index(palabra)\n    return tokens, att[i].numpy()\n\nfor frase in [\"The bank of the river was full of ducks.\", \"The bank approved the loan.\"]:\n    tokens, pesos = atencion_de(frase, \"bank\")\n    plt.figure(figsize=(8, 2))\n    plt.bar(tokens, pesos)\n    plt.title(frase)\n    plt.xticks(rotation=45)\n    plt.show()"),
            ("md", "Compara a qué tokens atiende `bank` en cada frase. Prueba otras capas: las primeras capturan relaciones locales y las últimas, semánticas."),
        ],
    ),
    (
        "04_multi_cabeza", "Las cabezas de una capa y las cabezas de inducción", "multi-cabeza", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport torch\nfrom transformers import AutoModel, AutoTokenizer\n\ntok = AutoTokenizer.from_pretrained(\"gpt2\")\nmodelo = AutoModel.from_pretrained(\"gpt2\", output_attentions=True, attn_implementation=\"eager\")"),
            ("md", "Una secuencia de tokens aleatorios repetida dos veces. Una **cabeza de inducción** atiende, en la segunda mitad, al token que siguió a la aparición anterior del token actual."),
            ("code", "torch.manual_seed(0)\nn = 40\nmitad = torch.randint(1000, 20000, (1, n))\nids = torch.cat([mitad, mitad], dim=1)\nwith torch.no_grad():\n    atts = modelo(ids).attentions                      # (capas) x (1, cabezas, 2n, 2n)\npuntuacion = torch.zeros(len(atts), atts[0].shape[1])\nfor c, a in enumerate(atts):\n    for i in range(n, 2 * n):\n        puntuacion[c] += a[0, :, i, i - n + 1]          # peso hacia el token siguiente a la copia anterior\npuntuacion /= n\nplt.imshow(puntuacion.numpy(), cmap=\"magma\")\nplt.xlabel(\"cabeza\")\nplt.ylabel(\"capa\")\nplt.colorbar(label=\"puntuación de inducción\")\nplt.show()\nprint(\"mejor cabeza (capa, cabeza):\", divmod(int(puntuacion.argmax()), puntuacion.shape[1]))"),
        ],
    ),
    (
        "05_bloque_transformer", "Un mini-GPT en PyTorch", "bloque-transformer", False,
        [
            ("md", "Un transformer decoder-only de caracteres con bloques pre-norm, entrenado unos cientos de pasos en CPU."),
            ("code", "import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\ntexto = (\"el transformer procesa todos los tokens en paralelo y la atencion decide de donde traer \"\n         \"la informacion mientras la red feed forward decide que hacer con ella. \") * 40\nvocab = sorted(set(texto))\nstoi = {c: i for i, c in enumerate(vocab)}\ndatos = torch.tensor([stoi[c] for c in texto])\nV, T, D, H, L = len(vocab), 64, 128, 4, 4"),
            ("code", "class Bloque(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.n1, self.n2 = nn.RMSNorm(D), nn.RMSNorm(D)\n        self.att = nn.MultiheadAttention(D, H, batch_first=True)\n        self.ffn = nn.Sequential(nn.Linear(D, 4 * D), nn.GELU(), nn.Linear(4 * D, D))\n\n    def forward(self, x):\n        m = torch.triu(torch.ones(x.shape[1], x.shape[1], dtype=torch.bool), 1)\n        h = self.n1(x)\n        x = x + self.att(h, h, h, attn_mask=m, need_weights=False)[0]\n        return x + self.ffn(self.n2(x))\n\n\nclass MiniGPT(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.tok, self.pos = nn.Embedding(V, D), nn.Embedding(T, D)\n        self.bloques = nn.Sequential(*[Bloque() for _ in range(L)])\n        self.norma, self.cabeza = nn.RMSNorm(D), nn.Linear(D, V)\n\n    def forward(self, idx):\n        x = self.tok(idx) + self.pos(torch.arange(idx.shape[1]))\n        return self.cabeza(self.norma(self.bloques(x)))\n\n\nmodelo = MiniGPT()\nprint(sum(p.numel() for p in modelo.parameters()), \"parámetros\")"),
            ("code", "opt = torch.optim.AdamW(modelo.parameters(), lr=3e-3)\nfor paso in range(300):\n    i = torch.randint(0, len(datos) - T - 1, (32,))\n    x = torch.stack([datos[j:j + T] for j in i])\n    y = torch.stack([datos[j + 1:j + T + 1] for j in i])\n    perdida = F.cross_entropy(modelo(x).reshape(-1, V), y.reshape(-1))\n    opt.zero_grad()\n    perdida.backward()\n    opt.step()\n    if paso % 50 == 0:\n        print(paso, round(perdida.item(), 3))"),
            ("code", "idx = torch.tensor([[stoi[\"e\"]]])\nfor _ in range(120):\n    p = F.softmax(modelo(idx[:, -T:])[0, -1], -1)\n    idx = torch.cat([idx, torch.multinomial(p, 1)[None]], 1)\nprint(\"\".join(vocab[i] for i in idx[0]))"),
        ],
    ),
    (
        "06_encoder_decoder", "Encoder, decoder y encoder-decoder en acción", "encoder-decoder", False,
        [
            ("code", "from transformers import pipeline"),
            ("md", "**Encoder (BERT):** rellenar un hueco mirando a ambos lados."),
            ("code", "relleno = pipeline(\"fill-mask\", model=\"bert-base-uncased\")\nfor r in relleno(\"The transformer [MASK] all tokens in parallel.\")[:3]:\n    print(r[\"token_str\"], round(r[\"score\"], 3))"),
            ("md", "**Decoder (GPT-2):** continuar un texto. Compara la decodificación voraz con el muestreo con temperatura y top-p."),
            ("code", "gen = pipeline(\"text-generation\", model=\"gpt2\")\nprompt = \"Transformers are useful because\"\nprint(gen(prompt, max_new_tokens=30, do_sample=False)[0][\"generated_text\"])\nfor _ in range(2):\n    print(gen(prompt, max_new_tokens=30, do_sample=True, temperature=0.8, top_p=0.9)[0][\"generated_text\"])"),
            ("md", "**Encoder-decoder:** traducción inglés → español."),
            ("code", "traductor = pipeline(\"translation\", model=\"Helsinki-NLP/opus-mt-en-es\")\nprint(traductor(\"The decoder attends to the encoder through cross-attention.\")[0][\"translation_text\"])"),
        ],
    ),
    (
        "07_contexto_largo", "Perplejidad y longitud de contexto", "contexto-largo", False,
        [
            ("code", "import torch\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\nnombre = \"Qwen/Qwen2.5-0.5B\"\ntok = AutoTokenizer.from_pretrained(nombre)\nmodelo = AutoModelForCausalLM.from_pretrained(nombre, torch_dtype=torch.float32)\nmodelo.eval()"),
            ("md", "La perplejidad de una frase esperada frente a una sorprendente (como el ejemplo de Falcon del libro)."),
            ("code", "def perplejidad(texto):\n    x = tok(texto, return_tensors=\"pt\")\n    with torch.no_grad():\n        perdida = modelo(**x, labels=x[\"input_ids\"]).loss\n    return torch.exp(perdida).item()\n\nprint(perplejidad(\"Apple Inc. is an American multinational technology company headquartered in Cupertino, California.\"))\nprint(perplejidad(\"A Falcon is a generative transformer model and it can't fly.\"))"),
            ("md", "Perplejidad con **ventana deslizante** sobre un texto largo, para distintas longitudes de contexto."),
            ("code", "texto = \" \".join([\"The history of transformers began with attention mechanisms for translation.\"] * 200)\nids = tok(texto, return_tensors=\"pt\")[\"input_ids\"]\nfor ventana in [64, 256, 1024]:\n    nll, n = 0.0, 0\n    for i in range(0, min(ids.shape[1], 2048) - ventana, ventana // 2):\n        trozo = ids[:, i:i + ventana]\n        objetivo = trozo.clone()\n        objetivo[:, : ventana // 2] = -100          # solo se evalúa la segunda mitad (con contexto previo)\n        with torch.no_grad():\n            nll += modelo(trozo, labels=objetivo).loss.item()\n        n += 1\n    print(ventana, round(float(torch.exp(torch.tensor(nll / n))), 3))"),
            ("md", "En la configuración del modelo verás `rope_theta` y, si se activa, `rope_scaling` (por ejemplo `{\"rope_type\": \"yarn\", \"factor\": 4.0}`)."),
            ("code", "print(modelo.config.rope_theta, getattr(modelo.config, \"rope_scaling\", None), modelo.config.max_position_embeddings)"),
        ],
    ),
    (
        "08_atencion_eficiente", "Atención eficiente y KV cache en PyTorch", "variantes-atencion", False,
        [
            ("code", "import time\n\nimport torch\nimport torch.nn.functional as F\n\nB, H, N, D = 1, 8, 2048, 64\nq, k, v = (torch.randn(B, H, N, D) for _ in range(3))"),
            ("code", "def manual(q, k, v):\n    s = q @ k.transpose(-2, -1) / D ** 0.5\n    return s.softmax(-1) @ v\n\nfor nombre, f in [(\"manual\", manual), (\"SDPA\", F.scaled_dot_product_attention)]:\n    t = time.perf_counter()\n    for _ in range(5):\n        y = f(q, k, v)\n    print(nombre, round((time.perf_counter() - t) / 5 * 1000, 1), \"ms\")\nprint(\"¿iguales?\", torch.allclose(manual(q, k, v), F.scaled_dot_product_attention(q, k, v), atol=1e-4))"),
            ("md", "El efecto de la KV cache al generar con un modelo real."),
            ("code", "from transformers import AutoModelForCausalLM, AutoTokenizer\n\ntok = AutoTokenizer.from_pretrained(\"gpt2\")\nmodelo = AutoModelForCausalLM.from_pretrained(\"gpt2\")\nx = tok(\"The key-value cache\", return_tensors=\"pt\")\nfor cache in [True, False]:\n    t = time.perf_counter()\n    modelo.generate(**x, max_new_tokens=100, do_sample=False, use_cache=cache, pad_token_id=tok.eos_token_id)\n    print(\"use_cache =\", cache, round(time.perf_counter() - t, 2), \"s\")"),
        ],
    ),
    (
        "09_series_temporales", "Análisis de una serie temporal real", "series-temporales", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport statsmodels.api as sm\nfrom statsmodels.graphics.tsaplots import plot_acf, plot_pacf\nfrom statsmodels.tsa.stattools import adfuller\n\nco2 = sm.datasets.co2.load_pandas().data[\"co2\"].resample(\"MS\").mean().interpolate()\nco2.plot(title=\"CO₂ en Mauna Loa\")\nplt.show()"),
            ("code", "descomp = sm.tsa.seasonal_decompose(co2, model=\"additive\", period=12)\ndescomp.plot()\nplt.show()"),
            ("code", "fig, ax = plt.subplots(1, 2, figsize=(10, 3))\nplot_acf(co2, lags=48, ax=ax[0])\nplot_pacf(co2.diff().dropna(), lags=48, ax=ax[1])\nplt.show()"),
            ("code", "for nombre, serie in [(\"original\", co2), (\"diferenciada\", co2.diff().dropna()), (\"dif. estacional\", co2.diff().diff(12).dropna())]:\n    p = adfuller(serie)[1]\n    print(f\"{nombre:16s} p-valor de Dickey-Fuller = {p:.4f}\", \"(estacionaria)\" if p < 0.05 else \"\")"),
        ],
    ),
    (
        "10_transformers_series", "Chronos en zero-shot y PatchTST", "transformers-series", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport numpy as np\nimport statsmodels.api as sm\nimport torch\nfrom chronos import ChronosPipeline\n\nserie = sm.datasets.co2.load_pandas().data[\"co2\"].resample(\"MS\").mean().interpolate().values\ncontexto, H = serie[:-24], 24"),
            ("code", "pipe = ChronosPipeline.from_pretrained(\"amazon/chronos-t5-small\", device_map=\"cpu\", torch_dtype=torch.float32)\nmuestras = pipe.predict(torch.tensor(contexto), prediction_length=H, num_samples=50)[0].numpy()\nq10, q50, q90 = np.quantile(muestras, [0.1, 0.5, 0.9], axis=0)\nmae = np.abs(q50 - serie[-H:]).mean()\nescala = np.abs(np.diff(contexto)).mean()\nprint(\"MASE de Chronos (zero-shot):\", round(mae / escala, 3))"),
            ("code", "t = np.arange(len(serie))\nplt.plot(t[-120:], serie[-120:], color=\"k\")\nplt.fill_between(t[-H:], q10, q90, alpha=0.3)\nplt.plot(t[-H:], q50)\nplt.show()"),
            ("md", "PatchTST en `transformers`: un modelo pequeño configurado a mano (para entrenarlo, usa un `Trainer` con ventanas como en el módulo 9)."),
            ("code", "from transformers import PatchTSTConfig, PatchTSTForPrediction\n\nconfig = PatchTSTConfig(num_input_channels=1, context_length=96, patch_length=16, patch_stride=8,\n                        prediction_length=24, d_model=64, num_attention_heads=4, num_hidden_layers=2)\nmodelo = PatchTSTForPrediction(config)\nx = torch.tensor(contexto[-96:], dtype=torch.float32)[None, :, None]\nprint(modelo(past_values=x).prediction_outputs.shape)"),
        ],
    ),
    (
        "11_vision_transformers", "Swin V2 y el token [CLS] de ViT", "vision-transformers", False,
        [
            ("code", "import torch\nfrom datasets import load_dataset\nfrom transformers import AutoImageProcessor, AutoModelForImageClassification\n\nds = load_dataset(\"Matthijs/snacks\")\netiquetas = ds[\"train\"].features[\"label\"].names\nprint(etiquetas)"),
            ("code", "nombre = \"microsoft/swinv2-tiny-patch4-window8-256\"\nprocesador = AutoImageProcessor.from_pretrained(nombre)\nmodelo = AutoModelForImageClassification.from_pretrained(nombre, num_labels=len(etiquetas), ignore_mismatched_sizes=True)\nx = procesador(ds[\"train\"][0][\"image\"], return_tensors=\"pt\")\nprint(modelo(**x).logits.shape)"),
            ("md", "Para el ajuste fino completo, usa `Trainer` con `TrainingArguments(learning_rate=5e-5, num_train_epochs=3, per_device_train_batch_size=16)` y aumento de datos (`torchvision.transforms`). Con GPU tarda minutos."),
            ("code", "from transformers import ViTModel\n\nvit = ViTModel.from_pretrained(\"google/vit-base-patch16-224\", output_attentions=True, attn_implementation=\"eager\")\nvp = AutoImageProcessor.from_pretrained(\"google/vit-base-patch16-224\")\nwith torch.no_grad():\n    att = vit(**vp(ds[\"train\"][0][\"image\"], return_tensors=\"pt\")).attentions[-1][0].mean(0)\nmapa = att[0, 1:].reshape(14, 14)        # atención del token [CLS] a los 196 parches\nimport matplotlib.pyplot as plt\nplt.imshow(mapa)\nplt.title(\"Atención del token [CLS] (última capa)\")\nplt.show()"),
        ],
    ),
    (
        "12_segment_anything", "Segment Anything con puntos y cajas", "segmentacion-sam", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport requests\nimport torch\nfrom PIL import Image\nfrom transformers import SamModel, SamProcessor\n\nmodelo = SamModel.from_pretrained(\"facebook/sam-vit-base\")\nproc = SamProcessor.from_pretrained(\"facebook/sam-vit-base\")\nurl = \"https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png\"\nimagen = Image.open(requests.get(url, stream=True).raw).convert(\"RGB\")"),
            ("code", "def segmentar(**prompt):\n    x = proc(imagen, return_tensors=\"pt\", **prompt)\n    with torch.no_grad():\n        y = modelo(**x)\n    mascaras = proc.image_processor.post_process_masks(y.pred_masks, x[\"original_sizes\"], x[\"reshaped_input_sizes\"])\n    return mascaras[0][0], y.iou_scores[0, 0]\n\nmascaras, iou = segmentar(input_points=[[[450, 600]]])\nfig, ax = plt.subplots(1, 3, figsize=(12, 4))\nfor i in range(3):\n    ax[i].imshow(imagen)\n    ax[i].imshow(mascaras[i], alpha=0.5)\n    ax[i].set_title(f\"IoU predicho {iou[i]:.2f}\")\nplt.show()"),
            ("code", "mascaras, iou = segmentar(input_boxes=[[[75, 275, 1725, 850]]])\nplt.imshow(imagen)\nplt.imshow(mascaras[int(iou.argmax())], alpha=0.5)\nplt.show()"),
        ],
    ),
    (
        "13_difusion", "Un modelo de difusión 2D y un pipeline de diffusers", "difusion", False,
        [
            ("md", "Primero entrenamos un pequeño predictor de ruido sobre datos 2D (espiral) con la pérdida DDPM."),
            ("code", "import math\n\nimport matplotlib.pyplot as plt\nimport torch\nimport torch.nn as nn\n\nn = 4000\nt = torch.rand(n) * 3 * math.pi + 0.5\nx0 = torch.stack([0.28 * t * torch.cos(t), 0.28 * t * torch.sin(t)], 1) + 0.03 * torch.randn(n, 2)\nT = 200\nbeta = torch.linspace(1e-4, 0.05, T)\nab = torch.cumprod(1 - beta, 0)\nred = nn.Sequential(nn.Linear(3, 128), nn.SiLU(), nn.Linear(128, 128), nn.SiLU(), nn.Linear(128, 2))\nopt = torch.optim.Adam(red.parameters(), 1e-3)\nfor paso in range(3000):\n    i = torch.randint(0, n, (256,))\n    tt = torch.randint(0, T, (256,))\n    eps = torch.randn(256, 2)\n    xt = ab[tt, None].sqrt() * x0[i] + (1 - ab[tt, None]).sqrt() * eps\n    perdida = ((red(torch.cat([xt, tt[:, None] / T], 1)) - eps) ** 2).mean()\n    opt.zero_grad()\n    perdida.backward()\n    opt.step()\nprint(\"pérdida final:\", perdida.item())"),
            ("code", "x = torch.randn(1000, 2)\nwith torch.no_grad():\n    for k in reversed(range(T)):\n        e = red(torch.cat([x, torch.full((1000, 1), k / T)], 1))\n        x = (x - beta[k] / (1 - ab[k]).sqrt() * e) / (1 - beta[k]).sqrt()\n        if k > 0:\n            x += beta[k].sqrt() * torch.randn_like(x)\nplt.scatter(*x.T, s=2)\nplt.title(\"Muestras generadas\")\nplt.show()"),
            ("md", "Un pipeline real de `diffusers` (con GPU es rápido; en CPU tarda): varía `guidance_scale` y `num_inference_steps`."),
            ("code", "from diffusers import AutoPipelineForText2Image\n\ndispositivo = \"cuda\" if torch.cuda.is_available() else \"cpu\"\npipe = AutoPipelineForText2Image.from_pretrained(\"stabilityai/sd-turbo\").to(dispositivo)\nfor g in [0.0, 1.5]:\n    img = pipe(\"a watercolor painting of a transformer robot reading a book\", num_inference_steps=2, guidance_scale=g).images[0]\n    plt.imshow(img)\n    plt.title(f\"guidance_scale = {g}\")\n    plt.axis(\"off\")\n    plt.show()"),
        ],
    ),
    (
        "14_dit_video", "DiT, PixArt-Σ y LTX-Video", "dit-video", True,
        [
            ("code", "import torch\nfrom diffusers import DiTPipeline\n\npipe = DiTPipeline.from_pretrained(\"facebook/DiT-XL-2-256\", torch_dtype=torch.float16).to(\"cuda\")\nids = pipe.get_label_ids([\"golden retriever\", \"volcano\"])\nimagenes = pipe(class_labels=ids, num_inference_steps=25, guidance_scale=4.0).images\nimagenes[0]"),
            ("code", "from diffusers import PixArtSigmaPipeline\n\npixart = PixArtSigmaPipeline.from_pretrained(\"PixArt-alpha/PixArt-Sigma-XL-2-512-MS\", torch_dtype=torch.float16).to(\"cuda\")\npixart(\"a cozy reading nook with books about transformers, warm light\", num_inference_steps=20).images[0]"),
            ("md", "Vídeo con LTX-Video (unos 2 segundos a 24 fps). Requiere una GPU con bastante memoria."),
            ("code", "from diffusers import LTXPipeline\nfrom diffusers.utils import export_to_video\n\nltx = LTXPipeline.from_pretrained(\"Lightricks/LTX-Video\", torch_dtype=torch.bfloat16).to(\"cuda\")\nvideo = ltx(prompt=\"a paper boat floating on a calm river at sunset\", width=704, height=480, num_frames=49,\n            num_inference_steps=40, guidance_scale=3.0).frames[0]\nexport_to_video(video, \"barco.mp4\", fps=24)"),
        ],
    ),
    (
        "15_audio_senales", "Espectrogramas reales y Griffin-Lim", "audio-senales", False,
        [
            ("code", "import librosa\nimport librosa.display\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ny, sr = librosa.load(librosa.ex(\"trumpet\"), sr=16000)\nprint(len(y), \"muestras a\", sr, \"Hz\")"),
            ("code", "S = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=400, hop_length=160, n_mels=80)\nlibrosa.display.specshow(librosa.power_to_db(S, ref=np.max), sr=sr, hop_length=160, x_axis=\"time\", y_axis=\"mel\")\nplt.colorbar(format=\"%+2.0f dB\")\nplt.show()"),
            ("code", "from transformers import WhisperFeatureExtractor\n\nfe = WhisperFeatureExtractor.from_pretrained(\"openai/whisper-small\")\nx = fe(y, sampling_rate=16000, return_tensors=\"np\")[\"input_features\"]\nprint(\"entrada de Whisper:\", x.shape)   # (1, 80, 3000): siempre 30 s"),
            ("code", "magnitud = np.abs(librosa.stft(y, n_fft=512, hop_length=128))\nreconstruida = librosa.griffinlim(magnitud, n_iter=32, hop_length=128)\nprint(\"correlación con la original:\", np.corrcoef(y[: len(reconstruida)], reconstruida)[0, 1].round(3))"),
        ],
    ),
    (
        "16_audio_transformers", "Whisper, WER y EnCodec", "audio-transformers", False,
        [
            ("code", "import jiwer\nimport torch\nfrom datasets import load_dataset\nfrom transformers import pipeline\n\nds = load_dataset(\"hf-internal-testing/librispeech_asr_dummy\", \"clean\", split=\"validation\")\nasr = pipeline(\"automatic-speech-recognition\", model=\"openai/whisper-small\")"),
            ("code", "refs, hips = [], []\nfor ej in ds.select(range(5)):\n    hip = asr(ej[\"audio\"][\"array\"].copy(), generate_kwargs={\"language\": \"english\", \"task\": \"transcribe\"})[\"text\"]\n    refs.append(ej[\"text\"].lower())\n    hips.append(hip.lower().replace(\",\", \"\").replace(\".\", \"\"))\nprint(hips[0])\nprint(\"WER:\", round(jiwer.wer(refs, hips), 3))"),
            ("code", "print(asr(ds[0][\"audio\"][\"array\"].copy(), generate_kwargs={\"language\": \"english\", \"task\": \"translate\"}, return_timestamps=True))"),
            ("md", "Tokens de audio con EnCodec: menos ancho de banda = menos libros de códigos."),
            ("code", "from transformers import AutoProcessor, EncodecModel\n\nmodelo = EncodecModel.from_pretrained(\"facebook/encodec_24khz\")\nproc = AutoProcessor.from_pretrained(\"facebook/encodec_24khz\")\nimport librosa\n\naudio = librosa.resample(ds[0][\"audio\"][\"array\"], orig_sr=16000, target_sr=24000)\nx = proc(raw_audio=audio, sampling_rate=24000, return_tensors=\"pt\")\nfor kbps in [1.5, 6.0, 24.0]:\n    cod = modelo.encode(x[\"input_values\"], x[\"padding_mask\"], bandwidth=kbps)\n    print(kbps, \"kbps -> códigos\", tuple(cod.audio_codes.shape))"),
        ],
    ),
    (
        "17_decision_transformer", "Decision Transformer en Hopper", "rl-decision-transformer", False,
        [
            ("md", "Necesita `gymnasium[mujoco]` (`uv pip install \"gymnasium[mujoco]\"`)."),
            ("code", "import gymnasium as gym\nimport numpy as np\nimport torch\nfrom transformers import DecisionTransformerModel\n\nmodelo = DecisionTransformerModel.from_pretrained(\"edbeeching/decision-transformer-gym-hopper-expert\")\nmodelo.eval()\nenv = gym.make(\"Hopper-v4\")\nd_s, d_a = env.observation_space.shape[0], env.action_space.shape[0]\n# Media y desviación de los estados del dataset con el que se entrenó (de la tarjeta del modelo)\nmedia = np.array([1.3490015, -0.11208222, -0.5506444, -0.13188992, -0.00378754, 2.6071432, 0.02322114, -0.01626922, -0.06840388, -0.05183131, 0.04272673])\ndesv = np.array([0.15980862, 0.0446214, 0.14307782, 0.17629202, 0.5912333, 0.5899924, 1.5405099, 0.8152689, 2.0173461, 2.4107876, 5.8440027])"),
            ("code", "def episodio(retorno_objetivo, escala=1000.0, K=20, max_pasos=1000):\n    s, _ = env.reset(seed=0)\n    S = torch.zeros(1, 0, d_s)\n    A = torch.zeros(1, 0, d_a)\n    R = torch.zeros(1, 0, 1)\n    T = torch.zeros(1, 0, dtype=torch.long)\n    rtg, total = retorno_objetivo / escala, 0.0\n    for t in range(max_pasos):\n        S = torch.cat([S, torch.tensor((s - media) / desv, dtype=torch.float32)[None, None]], 1)[:, -K:]\n        A = torch.cat([A, torch.zeros(1, 1, d_a)], 1)[:, -K:]\n        R = torch.cat([R, torch.tensor([[[rtg]]], dtype=torch.float32)], 1)[:, -K:]\n        T = torch.cat([T, torch.tensor([[t]])], 1)[:, -K:]\n        with torch.no_grad():\n            _, a, _ = modelo(states=S, actions=A, returns_to_go=R, timesteps=T, attention_mask=torch.ones_like(T), return_dict=False)\n        accion = a[0, -1].numpy()\n        A[0, -1] = a[0, -1]\n        s, r, fin, trunc, _ = env.step(accion)\n        total += r\n        rtg -= r / escala\n        if fin or trunc:\n            break\n    return total\n\nfor objetivo in [1000, 2000, 3600]:\n    print(objetivo, \"->\", round(episodio(objetivo), 1))"),
        ],
    ),
    (
        "18_world_models", "Un transformer como modelo del mundo de CartPole", "world-models", False,
        [
            ("code", "import gymnasium as gym\nimport matplotlib.pyplot as plt\nimport torch\nimport torch.nn as nn\n\nenv = gym.make(\"CartPole-v1\")\nS, A, S2 = [], [], []\nfor ep in range(200):\n    s, _ = env.reset(seed=ep)\n    for _ in range(200):\n        a = env.action_space.sample()\n        s2, r, fin, trunc, _ = env.step(a)\n        S.append(s)\n        A.append(a)\n        S2.append(s2)\n        s = s2\n        if fin or trunc:\n            break\nS, A, S2 = (torch.tensor(v, dtype=torch.float32) for v in (S, A, S2))\nprint(len(S), \"transiciones\")"),
            ("code", "class ModeloMundo(nn.Module):\n    def __init__(self, d=64):\n        super().__init__()\n        self.inp = nn.Linear(5, d)\n        capa = nn.TransformerEncoderLayer(d, 4, 128, batch_first=True, norm_first=True)\n        self.tr = nn.TransformerEncoder(capa, 2)\n        self.out = nn.Linear(d, 4)\n\n    def forward(self, s, a):            # s: (B, L, 4), a: (B, L)\n        x = self.inp(torch.cat([s, a[..., None]], -1))\n        m = nn.Transformer.generate_square_subsequent_mask(x.shape[1])\n        return s + self.out(self.tr(x, mask=m, is_causal=True))   # predice el cambio de estado\n\n\nmm = ModeloMundo()\nopt = torch.optim.Adam(mm.parameters(), 1e-3)\nL = 8\nfor paso in range(1500):\n    i = torch.randint(0, len(S) - L, (64,))\n    s = torch.stack([S[j:j + L] for j in i])\n    a = torch.stack([A[j:j + L] for j in i])\n    s2 = torch.stack([S2[j:j + L] for j in i])\n    perdida = ((mm(s, a) - s2) ** 2).mean()\n    opt.zero_grad()\n    perdida.backward()\n    opt.step()\nprint(\"pérdida:\", perdida.item())"),
            ("code", "s, _ = env.reset(seed=999)\nreal, imaginado = [s], [torch.tensor(s, dtype=torch.float32)]\nacciones = []\nfor t in range(15):\n    a = env.action_space.sample()\n    acciones.append(a)\n    s, *_ = env.step(a)\n    real.append(s)\n    with torch.no_grad():\n        pred = mm(torch.stack(imaginado)[None], torch.tensor(acciones, dtype=torch.float32)[None])[0, -1]\n    imaginado.append(pred)\nplt.plot([r[2] for r in real], label=\"ángulo real\")\nplt.plot([float(i[2]) for i in imaginado], \"--\", label=\"ángulo imaginado\")\nplt.legend()\nplt.show()"),
        ],
    ),
    (
        "19_razonamiento", "Qwen3 con y sin pensamiento, y GRPO con TRL", "razonamiento", False,
        [
            ("code", "import torch\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\nnombre = \"Qwen/Qwen3-0.6B\"\ntok = AutoTokenizer.from_pretrained(nombre)\nmodelo = AutoModelForCausalLM.from_pretrained(nombre, torch_dtype=\"auto\")"),
            ("code", "def preguntar(texto, pensar, max_new_tokens=512):\n    mensajes = [{\"role\": \"user\", \"content\": texto}]\n    prompt = tok.apply_chat_template(mensajes, tokenize=False, add_generation_prompt=True, enable_thinking=pensar)\n    x = tok(prompt, return_tensors=\"pt\")\n    y = modelo.generate(**x, max_new_tokens=max_new_tokens)\n    return tok.decode(y[0][x[\"input_ids\"].shape[1]:], skip_special_tokens=False)\n\nprint(preguntar(\"¿Cuánto es 17 × 24?\", pensar=False))\nprint(\"-\" * 40)\nprint(preguntar(\"¿Cuánto es 17 × 24?\", pensar=True))"),
            ("md", "Entrenar unos pasos con GRPO (`trl`) sobre sumas, con una recompensa verificable. Mejor con GPU."),
            ("code", "import random\nimport re\n\nfrom datasets import Dataset\nfrom trl import GRPOConfig, GRPOTrainer\n\nrandom.seed(0)\nfilas = []\nfor _ in range(200):\n    a, b = random.randint(10, 99), random.randint(10, 99)\n    filas.append({\"prompt\": f\"Calcula {a} + {b}. Responde solo con el número.\", \"respuesta\": str(a + b)})\ndatos = Dataset.from_list(filas)\n\n\ndef recompensa_exactitud(completions, respuesta, **kwargs):\n    return [1.0 if (m := re.search(r\"-?\\d+\", c)) and m.group() == r else 0.0 for c, r in zip(completions, respuesta)]\n\n\nconfig = GRPOConfig(output_dir=\"grpo-sumas\", num_generations=4, per_device_train_batch_size=4,\n                    max_completion_length=32, max_steps=20, logging_steps=5, learning_rate=1e-6)\nentrenador = GRPOTrainer(model=nombre, reward_funcs=recompensa_exactitud, args=config, train_dataset=datos)\nentrenador.train()"),
        ],
    ),
    (
        "20_agentes", "Un agente con llamadas a herramientas", "agentes", False,
        [
            ("code", "import json\nimport re\n\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\nnombre = \"Qwen/Qwen2.5-1.5B-Instruct\"\ntok = AutoTokenizer.from_pretrained(nombre)\nmodelo = AutoModelForCausalLM.from_pretrained(nombre, torch_dtype=\"auto\")"),
            ("code", "def calculadora(expresion: str) -> str:\n    \"\"\"Evalúa una expresión aritmética.\n\n    Args:\n        expresion: la expresión, por ejemplo \"2 * (3 + 4)\".\n    \"\"\"\n    if not re.fullmatch(r\"[\\d\\s+\\-*/().]+\", expresion):\n        return \"error: expresión no permitida\"\n    return str(eval(expresion))  # solo dígitos y operadores, validado arriba\n\n\nHERRAMIENTAS = {\"calculadora\": calculadora}"),
            ("code", "mensajes = [{\"role\": \"user\", \"content\": \"¿Cuánto cuestan 1.5 M de tokens a 0.40 $/M más 0.5 M a 1.60 $/M?\"}]\nfor paso in range(4):\n    prompt = tok.apply_chat_template(mensajes, tools=[calculadora], add_generation_prompt=True, tokenize=False)\n    x = tok(prompt, return_tensors=\"pt\")\n    y = modelo.generate(**x, max_new_tokens=256)[0][x[\"input_ids\"].shape[1]:]\n    salida = tok.decode(y, skip_special_tokens=True)\n    llamadas = re.findall(r\"<tool_call>(.*?)</tool_call>\", tok.decode(y), re.S)\n    if not llamadas:\n        print(\"RESPUESTA:\", salida)\n        break\n    for ll in llamadas:\n        ll = json.loads(ll)\n        resultado = HERRAMIENTAS[ll[\"name\"]](**ll[\"arguments\"])\n        print(\"herramienta:\", ll, \"->\", resultado)\n        mensajes.append({\"role\": \"assistant\", \"tool_calls\": [{\"type\": \"function\", \"function\": ll}]})\n        mensajes.append({\"role\": \"tool\", \"name\": ll[\"name\"], \"content\": resultado})"),
            ("md", "Con LangGraph, el mismo bucle se expresa como un grafo con un nodo de modelo, un nodo de herramientas y una arista condicional; un supervisor es un nodo más que decide el siguiente agente (ver el módulo 20)."),
        ],
    ),
    (
        "21_optimizacion", "Muon frente a AdamW", "optimizacion", False,
        [
            ("code", "import matplotlib.pyplot as plt\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\n\ndef newton_schulz(G, pasos=5):\n    a, b, c = 3.4445, -4.7750, 2.0315\n    X = G / (G.norm() + 1e-7)\n    t = X.shape[0] > X.shape[1]\n    if t:\n        X = X.T\n    for _ in range(pasos):\n        A = X @ X.T\n        X = a * X + (b * A + c * A @ A) @ X\n    return X.T if t else X\n\n\nclass Muon(torch.optim.Optimizer):\n    def __init__(self, params, lr=0.02, momentum=0.95):\n        super().__init__(params, dict(lr=lr, momentum=momentum))\n\n    @torch.no_grad()\n    def step(self):\n        for g in self.param_groups:\n            for p in g[\"params\"]:\n                if p.grad is None:\n                    continue\n                m = self.state[p].setdefault(\"m\", torch.zeros_like(p))\n                m.mul_(g[\"momentum\"]).add_(p.grad)\n                escala = max(1, p.shape[0] / p.shape[1]) ** 0.5\n                p.add_(newton_schulz(m), alpha=-g[\"lr\"] * escala)"),
            ("code", "torch.manual_seed(0)\nX = torch.randn(4096, 32)\ny = (X[:, :4].sum(1) > 0).long()\n\n\ndef entrenar(usar_muon):\n    torch.manual_seed(1)\n    red = nn.Sequential(nn.Linear(32, 256), nn.ReLU(), nn.Linear(256, 256), nn.ReLU(), nn.Linear(256, 2))\n    matrices = [p for p in red.parameters() if p.ndim == 2][1:-1]     # capas ocultas -> Muon\n    resto = [p for p in red.parameters() if all(p is not q for q in matrices)]\n    opts = [Muon(matrices), torch.optim.AdamW(resto, 1e-3)] if usar_muon else [torch.optim.AdamW(red.parameters(), 1e-3)]\n    curva = []\n    for paso in range(300):\n        i = torch.randint(0, len(X), (128,))\n        perdida = F.cross_entropy(red(X[i]), y[i])\n        for o in opts:\n            o.zero_grad()\n        perdida.backward()\n        for o in opts:\n            o.step()\n        curva.append(perdida.item())\n    return curva\n\n\nplt.plot(entrenar(False), label=\"AdamW\")\nplt.plot(entrenar(True), label=\"Muon (+AdamW)\")\nplt.legend()\nplt.yscale(\"log\")\nplt.show()"),
            ("md", "**ART + RULER (esqueleto).** Con la librería `openpipe-art`: se define un `rollout(model, escenario)` que ejecuta el agente y devuelve una `Trajectory`; se generan grupos de trayectorias por escenario, `ruler_score_group(grupo, \"openai/o4-mini\")` las puntúa de forma relativa y `model.train(grupos)` aplica GRPO. Consulta la documentación de ART para la versión actual de la API."),
        ],
    ),
    (
        "22_despliegue", "Cuantización, LoRA y pruebas de carga", "despliegue", True,
        [
            ("code", "import torch\nfrom transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig\n\nnombre = \"Qwen/Qwen2.5-1.5B\"\ntok = AutoTokenizer.from_pretrained(nombre)\nfp16 = AutoModelForCausalLM.from_pretrained(nombre, torch_dtype=torch.float16, device_map=\"cuda\")\nnf4 = AutoModelForCausalLM.from_pretrained(nombre, device_map=\"cuda\",\n    quantization_config=BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type=\"nf4\", bnb_4bit_compute_dtype=torch.float16))\nfor nombre_m, m in [(\"FP16\", fp16), (\"NF4\", nf4)]:\n    print(nombre_m, round(m.get_memory_footprint() / 1e9, 2), \"GB\")"),
            ("code", "texto = \"The KV cache stores keys and values of previous tokens so that each new token only needs to compute its own projections.\" * 4\nx = tok(texto, return_tensors=\"pt\").to(\"cuda\")\nfor nombre_m, m in [(\"FP16\", fp16), (\"NF4\", nf4)]:\n    with torch.no_grad():\n        print(nombre_m, \"perplejidad\", round(torch.exp(m(**x, labels=x[\"input_ids\"]).loss).item(), 3))"),
            ("code", "from peft import LoraConfig, get_peft_model\n\nconfig = LoraConfig(r=16, lora_alpha=32, target_modules=[\"q_proj\", \"v_proj\"], lora_dropout=0.05, task_type=\"CAUSAL_LM\")\nlora = get_peft_model(nf4, config)          # QLoRA: base en 4 bits + adaptadores en 16 bits\nlora.print_trainable_parameters()"),
            ("md", "**Prueba de carga** contra un servidor compatible con la API de OpenAI (por ejemplo `vllm serve Qwen/Qwen2.5-1.5B-Instruct`): mide TTFT, latencia entre tokens y percentiles con concurrencia creciente."),
            ("code", "import asyncio\nimport time\n\nimport numpy as np\nfrom openai import AsyncOpenAI\n\ncliente = AsyncOpenAI(base_url=\"http://localhost:8000/v1\", api_key=\"local\")\n\n\nasync def una_peticion():\n    t0 = time.perf_counter()\n    ttft = None\n    stream = await cliente.chat.completions.create(model=\"Qwen/Qwen2.5-1.5B-Instruct\", stream=True, max_tokens=128,\n                                                   messages=[{\"role\": \"user\", \"content\": \"Explica la KV cache en tres frases.\"}])\n    async for trozo in stream:\n        if ttft is None:\n            ttft = time.perf_counter() - t0\n    return ttft, time.perf_counter() - t0\n\n\nasync def carga(concurrencia):\n    r = np.array(await asyncio.gather(*[una_peticion() for _ in range(concurrencia)]))\n    print(concurrencia, \"TTFT p50/p95\", np.percentile(r[:, 0], [50, 95]).round(2), \"total p95\", np.percentile(r[:, 1], 95).round(2))\n\n# for c in [1, 8, 32]: await carga(c)"),
        ],
    ),
    (
        "23_sistemas_inteligentes", "Un agente visión-lenguaje + segmentación", "sistemas-inteligentes", True,
        [
            ("md", "Un modelo visión-lenguaje (Qwen2.5-VL) propone un punto para la referencia del usuario y SAM lo convierte en una máscara. Es la idea del agente SAM 3 del capítulo 12, en versión mínima."),
            ("code", "import re\n\nimport matplotlib.pyplot as plt\nimport requests\nimport torch\nfrom PIL import Image\nfrom transformers import AutoModelForImageTextToText, AutoProcessor, SamModel, SamProcessor\n\nurl = \"https://huggingface.co/ybelkada/segment-anything/resolve/main/assets/car.png\"\nimagen = Image.open(requests.get(url, stream=True).raw).convert(\"RGB\")\nvlm = AutoModelForImageTextToText.from_pretrained(\"Qwen/Qwen2.5-VL-3B-Instruct\", torch_dtype=torch.bfloat16, device_map=\"cuda\")\nvproc = AutoProcessor.from_pretrained(\"Qwen/Qwen2.5-VL-3B-Instruct\")\nsam = SamModel.from_pretrained(\"facebook/sam-vit-base\").to(\"cuda\")\nsproc = SamProcessor.from_pretrained(\"facebook/sam-vit-base\")"),
            ("code", "def planificar(referencia):\n    mensajes = [{\"role\": \"user\", \"content\": [{\"type\": \"image\"}, {\"type\": \"text\", \"text\":\n        f\"Da las coordenadas en píxeles (x, y) de un punto sobre: {referencia}. Responde solo 'x, y'.\"}]}]\n    prompt = vproc.apply_chat_template(mensajes, add_generation_prompt=True)\n    x = vproc(text=[prompt], images=[imagen], return_tensors=\"pt\").to(\"cuda\")\n    texto = vproc.batch_decode(vlm.generate(**x, max_new_tokens=20)[:, x[\"input_ids\"].shape[1]:], skip_special_tokens=True)[0]\n    return [int(v) for v in re.findall(r\"\\d+\", texto)[:2]]\n\n\ndef segmentar(punto):\n    x = sproc(imagen, input_points=[[punto]], return_tensors=\"pt\").to(\"cuda\")\n    with torch.no_grad():\n        y = sam(**x)\n    m = sproc.image_processor.post_process_masks(y.pred_masks.cpu(), x[\"original_sizes\"].cpu(), x[\"reshaped_input_sizes\"].cpu())[0][0]\n    return m[int(y.iou_scores[0, 0].argmax())]\n\n\npunto = planificar(\"la rueda delantera del coche\")\nplt.imshow(imagen)\nplt.imshow(segmentar(punto), alpha=0.5)\nplt.scatter(*punto, c=\"red\")\nplt.show()"),
            ("md", "**Para seguir:** añade un paso de verificación (el VLM mira la máscara superpuesta y decide si es correcta) y un reintento con otro punto si no lo es."),
        ],
    ),
]


def celda(tipo: str, texto: str) -> dict:
    lineas = texto.splitlines(keepends=True)
    if tipo == "md":
        return {"cell_type": "markdown", "metadata": {}, "source": lineas}
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": lineas}


def notebook(archivo: str, titulo: str, modulo: str, gpu: bool, celdas: list[tuple[str, str]]) -> dict:
    n = archivo.split("_")[0]
    cabecera = (
        f"# {titulo}\n\nNotebook opcional del **módulo {int(n)}** del curso "
        f"(en la app: `uv run dev` y la ruta `#/modulo/{modulo}`). Usa modelos reales; el módulo interactivo "
        "explica la teoría con NumPy.\n\n" + INSTALAR
        + ("\n\n> ⚠️ **Requiere GPU** con CUDA para ejecutarse en un tiempo razonable." if gpu else "")
    )
    return {
        "cells": [celda("md", cabecera)] + [celda(t, s) for t, s in celdas],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for archivo, titulo, modulo, gpu, celdas in NOTEBOOKS:
        ruta = OUT / f"{archivo}.ipynb"
        ruta.write_text(json.dumps(notebook(archivo, titulo, modulo, gpu, celdas), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("escrito", ruta.relative_to(OUT.parent))


if __name__ == "__main__":
    main()
