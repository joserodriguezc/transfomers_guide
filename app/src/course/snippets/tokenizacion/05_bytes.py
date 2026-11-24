# Los tokenizadores modernos (GPT, Llama, Qwen) parten de bytes UTF-8, no de caracteres:
# así cualquier texto, emoji o idioma es representable con un alfabeto base de 256 símbolos.
for s in ["a", "ñ", "€", "🤖", "transformer"]:
    b = s.encode("utf-8")
    print(f"{s!r:14} {len(s)} carácter(es) -> {len(b)} byte(s): {list(b)}")
