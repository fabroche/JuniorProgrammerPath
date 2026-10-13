#!/usr/bin/env python3
"""Descarga la transcripcion del video del curso y la parte por capitulos.

    python descargar_fuente.py

Necesita `yt-dlp` en el PATH. Escribe en `fuente/`, que no se versiona: es
material del autor del video y solo sirve para consultarlo al escribir cada
leccion. Un fichero por capitulo en `fuente/capitulos/`.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

VIDEO = "https://www.youtube.com/watch?v=7glCsF9fv3s"
FUENTE = Path(__file__).parent / "fuente"
CAPITULOS = FUENTE / "capitulos"

RE_CUE = re.compile(r"(\d\d):(\d\d):(\d\d)\.\d+ --> [^\n]*\n(.*?)(?=\n\n|\Z)", re.DOTALL)
RE_ETIQUETA = re.compile(r"<[^>]+>")


def descargar() -> None:
    FUENTE.mkdir(exist_ok=True)
    subprocess.run(
        ["yt-dlp", "--skip-download", "--write-info-json", "--write-auto-subs",
         "--sub-langs", "en", "--sub-format", "vtt", "-o", "video", VIDEO],
        cwd=FUENTE, check=True,
    )


def lineas_con_tiempo(vtt: str) -> list[tuple[int, str]]:
    """Los subtitulos automaticos repiten cada linea en varios cues: se deduplica."""
    lineas: list[tuple[int, str]] = []
    for h, m, s, cuerpo in RE_CUE.findall(vtt):
        segundo = int(h) * 3600 + int(m) * 60 + int(s)
        for cruda in cuerpo.split("\n"):
            linea = RE_ETIQUETA.sub("", cruda).strip()
            if linea and (not lineas or lineas[-1][1] != linea):
                lineas.append((segundo, linea))
    return lineas


def reloj(segundos: float) -> str:
    segundos = int(segundos)
    return f"{segundos // 3600:02d}:{segundos % 3600 // 60:02d}:{segundos % 60:02d}"


def partir() -> int:
    info = json.loads((FUENTE / "video.info.json").read_text(encoding="utf-8"))
    lineas = lineas_con_tiempo((FUENTE / "video.en.vtt").read_text(encoding="utf-8"))
    CAPITULOS.mkdir(exist_ok=True)

    for i, capitulo in enumerate(info["chapters"]):
        inicio, fin = capitulo["start_time"], capitulo["end_time"]
        texto = " ".join(l for t, l in lineas if inicio <= t < fin)
        slug = re.sub(r"[^a-z0-9]+", "-", capitulo["title"].lower()).strip("-")
        cabecera = f"# {capitulo['title']} [{reloj(inicio)} - {reloj(fin)}]\n\n"
        (CAPITULOS / f"{i:02d}-{slug}.txt").write_text(cabecera + texto + "\n", encoding="utf-8")
        print(f"  {reloj(inicio)}  {len(texto.split()):>6} palabras  {capitulo['title']}")

    return len(info["chapters"])


if __name__ == "__main__":
    descargar()
    total = partir()
    print(f"\nListo: {total} capitulos en {CAPITULOS}")
    sys.exit(0)
