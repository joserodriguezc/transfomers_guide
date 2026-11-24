"""``uv run dev``: instala las dependencias del frontend (si faltan) y lanza Vite."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

APP = Path(__file__).resolve().parent.parent / "app"


def main() -> None:
    npm = shutil.which("npm")
    if npm is None:
        sys.exit("No se encontró npm. Instala Node.js >= 20: https://nodejs.org")
    if not (APP / "node_modules").exists():
        subprocess.run([npm, "install"], cwd=APP, check=True)
    try:
        subprocess.run([npm, "run", "dev", "--", "--open", *sys.argv[1:]], cwd=APP, check=True)
    except KeyboardInterrupt:
        pass
