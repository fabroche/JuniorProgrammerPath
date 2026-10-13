#!/usr/bin/env python3
"""Publica el curso en GitHub Pages, en la rama `gh-pages`.

    python desplegar.py

Genera `dist/` y lo sube como unico contenido de la rama `gh-pages` del remoto
`origin`. Esa rama solo tiene la salida del generador, sin historia: cada
despliegue la sustituye entera, por eso el `push` va forzado. No toca ninguna
otra rama ni la copia de trabajo.

La pagina queda en https://<usuario>.github.io/<repositorio>/.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from generar import DIST, RAIZ, construir

RAMA = "gh-pages"


def git(*args: str, cwd: Path) -> str:
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()


if __name__ == "__main__":
    print("Generando el curso...")
    total = construir()
    remoto = git("remote", "get-url", "origin", cwd=RAIZ)
    origen = git("rev-parse", "--short", "HEAD", cwd=RAIZ)

    with tempfile.TemporaryDirectory() as temporal:
        sitio = Path(temporal) / "sitio"
        shutil.copytree(DIST, sitio)
        # Sin este fichero, GitHub pasa el sitio por Jekyll, que no hace falta.
        (sitio / ".nojekyll").write_text("", encoding="utf-8")
        git("init", "-q", "-b", RAMA, cwd=sitio)
        git("add", "-A", cwd=sitio)
        git("-c", "user.name=curso", "-c", "user.email=curso@localhost",
            "commit", "-q", "-m", f"Despliegue del curso desde {origen}", cwd=sitio)
        git("push", "-q", "--force", remoto, f"{RAMA}:{RAMA}", cwd=sitio)

    print(f"\nListo: {total} leccion(es) publicadas en la rama {RAMA} de {remoto}")
    sys.exit(0)
