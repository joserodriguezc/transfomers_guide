"""Ejecuta con Python real todos los snippets del curso (los mismos que corren en Pyodide)."""

import pytest

from tools.snippets import SNIPPETS_DIR, find_snippets, run_snippet

SNIPPETS = find_snippets()


def test_hay_snippets():
    assert SNIPPETS, f"no se encontraron snippets en {SNIPPETS_DIR}"


@pytest.mark.parametrize("path", SNIPPETS, ids=lambda p: str(p.relative_to(SNIPPETS_DIR)))
def test_snippet_ejecuta(path):
    result = run_snippet(path)
    assert result.ok, result.error
