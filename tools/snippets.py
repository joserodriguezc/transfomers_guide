"""Localiza y ejecuta los snippets Python del curso (app/src/course/snippets/**.py).

Convenciones dentro de un snippet:
- ``# expect-error: NombreDeExcepcion`` en cualquier línea: el snippet DEBE lanzar esa excepción
  (p. ej. el ejemplo de broadcasting que falla a propósito).
"""

from __future__ import annotations

import contextlib
import io
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNIPPETS_DIR = ROOT / "app" / "src" / "course" / "snippets"
_EXPECT = re.compile(r"#\s*expect-error:\s*(\w+)")


@dataclass
class Result:
    path: Path
    ok: bool
    output: str
    error: str | None = None


def find_snippets() -> list[Path]:
    return sorted(SNIPPETS_DIR.rglob("*.py"))


def run_snippet(path: Path) -> Result:
    os.environ.setdefault("MPLBACKEND", "Agg")
    code = path.read_text(encoding="utf-8")
    expected = _EXPECT.search(code)
    out = io.StringIO()
    ns: dict = {"__name__": "__main__"}
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, str(path), "exec"), ns)  # noqa: S102 - código propio del curso
    except Exception as e:  # noqa: BLE001
        if expected and type(e).__name__ == expected.group(1):
            return Result(path, True, out.getvalue())
        return Result(path, False, out.getvalue(), f"{type(e).__name__}: {e}")
    finally:
        if "matplotlib.pyplot" in sys.modules:
            sys.modules["matplotlib.pyplot"].close("all")
    if expected:
        return Result(path, False, out.getvalue(), f"se esperaba {expected.group(1)}")
    return Result(path, True, out.getvalue())


def main() -> None:
    """``uv run check-snippets``: ejecuta todos los snippets e informa de los fallos."""
    results = [run_snippet(p) for p in find_snippets()]
    for r in results:
        rel = r.path.relative_to(SNIPPETS_DIR)
        print(f"{'OK ' if r.ok else 'ERR'} {rel}" + (f"  -> {r.error}" if r.error else ""))
    failed = sum(not r.ok for r in results)
    print(f"\n{len(results) - failed}/{len(results)} snippets correctos")
    sys.exit(1 if failed else 0)
