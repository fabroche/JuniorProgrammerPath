#!/usr/bin/env python3
"""Generador de clases del curso de multijugador en Unity.

Lee cada leccion en `contenido/**/*.md`, la renderiza con la plantilla que
corresponde a su `tipo` y escribe HTML autocontenido en `dist/`.

    python generar.py            genera dist/
    python generar.py --servir   genera, sirve dist/ en http://localhost:8765
                                 y lo abre en el navegador (o `abrir.bat`)

Servirlo importa por el video: YouTube no deja incrustar su reproductor en una
pagina abierta como fichero.

El objetivo del disenyo es que escribir una leccion sea escribir Markdown y
nada mas: los metadatos van en el front-matter y los bloques especiales son
contenedores `::: nombre`.

Cada leccion de concepto declara en el front-matter que tramo del video
cubre (`video`), y la ruta completa de modulos vive en `ruta.yml`.

Tipos de leccion soportados hoy: concepto, lab y referencia.
Los demas (ejercicio, checkpoint) se anyaden creando su plantilla en
`plantillas/` la primera vez que una leccion los necesite.
"""

from __future__ import annotations

import functools
import http.server
import re
import shutil
import webbrowser
import sys
from dataclasses import dataclass
from html import escape
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import frontmatter
import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined
from markdown_it import MarkdownIt
from mdit_py_plugins.container import container_plugin
from mdit_py_plugins.deflist import deflist_plugin
from mdit_py_plugins.tasklists import tasklists_plugin
from pygments import highlight as pyg_highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import TextLexer, get_lexer_by_name
from pygments.util import ClassNotFound

RAIZ = Path(__file__).parent
CONTENIDO = RAIZ / "contenido"
PLANTILLAS = RAIZ / "plantillas"
ESTILOS = RAIZ / "estilos"
DIST = RAIZ / "dist"
RUTA = RAIZ / "ruta.yml"
PUERTO = 8765
# Figuras de anatomy: cada una es una carpeta con su `build.mjs` y las dos
# paginas que escribe, `nombre.html` (oscura) y `nombre-light.html`.
FIGURAS = RAIZ / "figuras"

TIPOS_CONOCIDOS = {"concepto", "referencia", "lab", "ejercicio", "checkpoint"}

# Los marcadores admiten tres dos-puntos o mas: un contenedor que anida a otros
# necesita un marcador mas largo que el de dentro, porque markdown-it cierra con
# la primera linea de cierre que encuentra. `:{3,}` evita que estas reglas dejen
# de verse cuando eso pasa, que seria peor que el fallo original: dejarian de
# comprobar nada y sin avisar.
RE_PAR = re.compile(r"^:{3,}\s*(natural|tecnico)\b", re.MULTILINE)

# En un lab, cada paso explica por que es necesario. Un paso sin `porque`
# ensenya a copiar comandos, no a entender la herramienta.
RE_PASO = re.compile(r"^:{3,}\s*paso\b", re.MULTILINE)
RE_PORQUE = re.compile(r"^:{3,}\s*porque\b", re.MULTILINE)

# Marcas de tiempo del video, siempre con horas: 00:22:37.
RE_RELOJ = re.compile(r"^\d\d:[0-5]\d:[0-5]\d$")


def segundos(reloj: str) -> int:
    """Convierte `HH:MM:SS` en segundos, para el parametro `t` del enlace."""
    horas, minutos, segs = (int(x) for x in reloj.split(":"))
    return horas * 3600 + minutos * 60 + segs


# ---------------------------------------------------------------------------
# Markdown
# ---------------------------------------------------------------------------

def _resaltar(codigo: str, lenguaje: str, _atributos) -> str:
    """Colorea un bloque de codigo con Pygments y lo envuelve en <pre class=codigo>."""
    try:
        lexer = get_lexer_by_name(lenguaje) if lenguaje else TextLexer()
    except ClassNotFound:
        lexer = TextLexer()
    cuerpo = pyg_highlight(codigo, lexer, HtmlFormatter(nowrap=True))
    clase = lenguaje or "text"
    return f'<pre class="codigo"><code class="lenguaje-{clase}">{cuerpo}</code></pre>'


def _titulo_de(token, nombre: str) -> str:
    """Extrae el titulo de un contenedor escrito como `::: nombre Mi titulo`."""
    info = (token.info or "").strip()
    if info.startswith(nombre):
        info = info[len(nombre):]
    return info.strip()


def _contenedor(clase_css: str, etiqueta: str | None = None,
                clase_etiqueta: str = "aviso-etiqueta",
                abre_antes: str = "", cierra_despues: str = "",
                nombre: str = "", con_titulo: bool = False):
    """Fabrica el renderizador de un contenedor `::: nombre`."""

    def render(_self, tokens, idx, _opciones, _entorno):
        if tokens[idx].nesting == 1:
            html = abre_antes + f'<div class="{clase_css}">'
            if etiqueta:
                html += f'<span class="{clase_etiqueta}">{etiqueta}</span>'
            if con_titulo:
                titulo = _titulo_de(tokens[idx], nombre)
                if titulo:
                    html += f'<h3 class="paso-titulo">{escape(titulo)}</h3>'
            return html
        return "</div>" + cierra_despues

    return render


def _figura(_self, tokens, idx, _opciones, _entorno):
    """`::: figura nombre` incrusta una figura de anatomy ya construida.

    Las lecciones viven un nivel por debajo de `dist/`, de ahi el `../`. El
    `src` lo pone la pagina segun el tema, y lo cambia con el interruptor.
    """
    if tokens[idx].nesting != 1:
        return "</figure>"
    nombre = _titulo_de(tokens[idx], "figura")
    if not (FIGURAS / nombre / f"{nombre}.html").exists() or not (FIGURAS / nombre / f"{nombre}-light.html").exists():
        raise SystemExit(
            f"no existe la figura {nombre!r}. Construyela con "
            f"`node figuras/{nombre}/build.mjs` y otra vez con `--light`."
        )
    return (f'<figure class="figura"><iframe data-figura="{escape(nombre)}" '
            f'data-base="../figuras/{escape(nombre)}/{escape(nombre)}" loading="lazy" '
            f'title="Figura interactiva"></iframe>')


def _desplegable(clase_css: str, nombre: str, titulo_defecto: str):
    """Contenedor que se renderiza como <details> plegable, con titulo en la linea."""

    def render(_self, tokens, idx, _opciones, _entorno):
        if tokens[idx].nesting == 1:
            titulo = _titulo_de(tokens[idx], nombre) or titulo_defecto
            return (f'<details class="{clase_css}">'
                    f'<summary>{escape(titulo)}</summary>'
                    f'<div class="desplegable-cuerpo">')
        return "</div></details>"

    return render


def crear_markdown() -> MarkdownIt:
    md = MarkdownIt("commonmark", {"html": True, "highlight": _resaltar})
    md.enable("table")
    md.enable("strikethrough")
    # Listas de definicion: las usa el bloque de vocabulario.
    md.use(deflist_plugin)
    # Casillas `- [ ]`: prerrequisitos y comprobaciones de los labs.
    md.use(tasklists_plugin, enabled=True)

    # El par explicativo. `natural` abre tambien el contenedor `.par` y
    # `tecnico` lo cierra, de modo que ambos quedan lado a lado en la rejilla.
    md.use(container_plugin, name="natural",
           render=_contenedor("exp exp-natural", "En lenguaje natural",
                              clase_etiqueta="exp-etiqueta",
                              abre_antes='<div class="par">'))
    md.use(container_plugin, name="tecnico",
           render=_contenedor("exp exp-tecnico", "En lenguaje tecnico",
                              clase_etiqueta="exp-etiqueta",
                              cierra_despues="</div>"))

    # Avisos.
    md.use(container_plugin, name="clave",
           render=_contenedor("aviso aviso-clave", "Lo que importa"))
    md.use(container_plugin, name="ojo",
           render=_contenedor("aviso aviso-ojo", "Ojo con esto"))
    md.use(container_plugin, name="nota",
           render=_contenedor("aviso aviso-nota", "Nota"))
    # El video es de 2023: aqui va lo que cambio hasta la version instalada.
    md.use(container_plugin, name="hoy",
           render=_contenedor("aviso aviso-hoy", "Del vídeo a hoy"))
    md.use(container_plugin, name="porque",
           render=_contenedor("porque", "Por qué esto es necesario"))

    # Bloques compuestos.
    md.use(container_plugin, name="contraejemplo",
           render=_contenedor("contraejemplo", "Asi no / asi si"))
    md.use(container_plugin, name="vocabulario",
           render=_contenedor("tarjeta vocabulario", "Vocabulario",
                              clase_etiqueta="tarjeta-titulo"))

    md.use(container_plugin, name="figura", render=_figura)

    # Bloques del tipo `lab`.
    md.use(container_plugin, name="prerrequisitos",
           render=_contenedor("tarjeta prerrequisitos", "Antes de empezar",
                              clase_etiqueta="tarjeta-titulo"))
    md.use(container_plugin, name="paso",
           render=_contenedor("paso", nombre="paso", con_titulo=True))
    md.use(container_plugin, name="esperado",
           render=_contenedor("esperado", "Salida esperada"))
    md.use(container_plugin, name="verificar",
           render=_contenedor("verificar", "Comprueba antes de seguir"))
    md.use(container_plugin, name="problema",
           render=_desplegable("problema", "problema", "Si algo falla"))

    return md


def verificar_pares(texto: str, origen: Path) -> None:
    """Comprueba que cada `::: natural` va seguido de `::: tecnico`."""
    secuencia = RE_PAR.findall(texto)
    esperada = ["natural", "tecnico"] * (len(secuencia) // 2)
    if secuencia != esperada:
        raise SystemExit(
            f"[{origen.name}] los bloques natural/tecnico deben ir emparejados "
            f"y en ese orden. Encontrado: {secuencia}"
        )


def verificar_pasos(texto: str, origen: Path) -> None:
    """Comprueba que todo `::: paso` incluye su `::: porque`.

    Un laboratorio que solo dice que ejecutar produce a alguien que sabe copiar
    comandos. La regla se verifica aqui para que no dependa de acordarse.
    """
    for numero, trozo in enumerate(RE_PASO.split(texto)[1:], start=1):
        if not RE_PORQUE.search(trozo):
            titulo = trozo.splitlines()[0].strip() if trozo.strip() else ""
            raise SystemExit(
                f"[{origen.name}] el paso {numero} ({titulo!r}) no tiene bloque "
                f"'::: porque'. En un lab, cada paso explica por que es necesario."
            )


def verificar_video(meta: dict, origen: Path) -> None:
    """Comprueba que una leccion de concepto dice que tramo del video cubre.

    El curso sigue al video: una leccion de concepto que no apunta a ningun
    capitulo se ha salido de la ruta sin avisar.
    """
    tramos = meta.get("video")
    if meta["tipo"] == "concepto" and not tramos:
        raise SystemExit(
            f"[{origen.name}] una leccion de concepto necesita `video` en el "
            f"front-matter: lista de tramos con `titulo`, `inicio` y `fin`."
        )
    for tramo in tramos or []:
        faltan = {"titulo", "inicio", "fin"} - set(tramo)
        if faltan:
            raise SystemExit(f"[{origen.name}] a un tramo de `video` le falta: {sorted(faltan)}")
        for clave in ("inicio", "fin"):
            if not RE_RELOJ.match(str(tramo[clave])):
                raise SystemExit(
                    f"[{origen.name}] `{clave}: {tramo[clave]}` no es HH:MM:SS. "
                    f"Ponlo entre comillas para que YAML no lo lea como numero."
                )


def cargar_ruta() -> dict:
    ruta = yaml.safe_load(RUTA.read_text(encoding="utf-8"))
    for modulo in ruta["modulos"]:
        for clave in ("inicio", "fin"):
            if not RE_RELOJ.match(str(modulo[clave])):
                raise SystemExit(f"[ruta.yml] modulo {modulo['numero']}: `{clave}` no es HH:MM:SS")
    return ruta


# ---------------------------------------------------------------------------
# Lecciones
# ---------------------------------------------------------------------------

@dataclass
class Leccion:
    origen: Path
    meta: dict
    cuerpo_md: str
    html: str = ""

    @property
    def modulo(self) -> int:
        return int(self.meta["modulo"])

    @property
    def numero(self) -> int:
        return int(self.meta["leccion"])

    @property
    def orden(self) -> tuple[int, int]:
        return (self.modulo, self.numero)

    @property
    def carpeta(self) -> str:
        return f"M{self.modulo:02d}"

    @property
    def salida(self) -> Path:
        return DIST / self.carpeta / f"{self.origen.stem}.html"

    @property
    def enlace(self) -> str:
        return f"{self.carpeta}/{self.origen.stem}.html"


def cargar_lecciones(md: MarkdownIt) -> list[Leccion]:
    lecciones: list[Leccion] = []
    for ruta in sorted(CONTENIDO.rglob("*.md")):
        doc = frontmatter.load(ruta)
        faltan = {"modulo", "leccion", "tipo", "titulo"} - set(doc.metadata)
        if faltan:
            raise SystemExit(f"[{ruta.name}] faltan claves en el front-matter: {sorted(faltan)}")
        if doc.metadata["tipo"] not in TIPOS_CONOCIDOS:
            raise SystemExit(f"[{ruta.name}] tipo desconocido: {doc.metadata['tipo']}")

        verificar_pares(doc.content, ruta)
        verificar_video(doc.metadata, ruta)
        if doc.metadata["tipo"] == "lab":
            verificar_pasos(doc.content, ruta)
        leccion = Leccion(origen=ruta, meta=doc.metadata, cuerpo_md=doc.content)
        leccion.html = md.render(doc.content)
        lecciones.append(leccion)

    return sorted(lecciones, key=lambda l: l.orden)


# ---------------------------------------------------------------------------
# Renderizado
# ---------------------------------------------------------------------------

def construir() -> int:
    if not CONTENIDO.exists():
        raise SystemExit(f"no existe {CONTENIDO}")

    md = crear_markdown()
    lecciones = cargar_lecciones(md)
    if not lecciones:
        raise SystemExit("no hay lecciones en contenido/")

    ruta = cargar_ruta()
    modulos = {m["numero"]: m for m in ruta["modulos"]}
    for leccion in lecciones:
        if leccion.modulo not in modulos:
            raise SystemExit(f"[{leccion.origen.name}] el modulo {leccion.modulo} no esta en ruta.yml")

    entorno = Environment(
        loader=FileSystemLoader(PLANTILLAS),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
        autoescape=False,
    )
    entorno.filters["segundos"] = segundos
    entorno.globals["video_url"] = ruta["video"]
    entorno.globals["video_id"] = parse_qs(urlparse(ruta["video"]).query)["v"][0]

    # Estilos: el sistema de disenyo mas el tema de Pygments.
    (DIST / "estilos").mkdir(parents=True, exist_ok=True)
    shutil.copy2(ESTILOS / "design-system.css", DIST / "estilos" / "design-system.css")
    (DIST / "estilos" / "pygments.css").write_text(
        HtmlFormatter(style="monokai").get_style_defs(".codigo"),
        encoding="utf-8",
    )

    for pagina in sorted(FIGURAS.glob("*/*.html")):
        destino = DIST / "figuras" / pagina.parent.name
        destino.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pagina, destino / pagina.name)

    # Portadas: la ilustracion de cada leccion es un SVG propio, con el mismo
    # nombre que su Markdown. Sirve de caratula del video y de ficha del indice.
    sin_portada = []
    for leccion in lecciones:
        portada = leccion.origen.with_suffix(".svg")
        if portada.exists():
            leccion.salida.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(portada, leccion.salida.with_suffix(".svg"))
            leccion.meta["portada"] = f"{leccion.carpeta}/{portada.name}"
        else:
            leccion.meta["portada"] = None
            sin_portada.append(leccion.origen.name)
    if sin_portada:
        print(f"  aviso: sin portada (.svg junto al .md): {', '.join(sin_portada)}")

    for i, leccion in enumerate(lecciones):
        hermanas = [l for l in lecciones if l.modulo == leccion.modulo]
        plantilla = entorno.get_template(f"{leccion.meta['tipo']}.html.j2")
        html = plantilla.render(
            meta=leccion.meta,
            modulo=modulos[leccion.modulo],
            contenido=leccion.html,
            rel="../",
            progreso={"total": len(hermanas), "actual": hermanas.index(leccion)},
            anterior=lecciones[i - 1] if i > 0 else None,
            siguiente=lecciones[i + 1] if i < len(lecciones) - 1 else None,
        )
        leccion.salida.parent.mkdir(parents=True, exist_ok=True)
        leccion.salida.write_text(html, encoding="utf-8")
        print(f"  {leccion.carpeta}/{leccion.origen.name}  ->  {leccion.enlace}")

    indice = entorno.get_template("indice.html.j2")
    (DIST / "index.html").write_text(
        indice.render(lecciones=lecciones, modulos=ruta["modulos"], rel=""), encoding="utf-8"
    )
    print(f"  indice                    ->  index.html")

    return len(lecciones)


def servir() -> None:
    """Sirve `dist/` en local, solo para esta maquina."""
    manejador = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(DIST))
    with http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), manejador) as servidor:
        print(f"\nCurso en http://localhost:{PUERTO}  (Ctrl+C para parar)")
        webbrowser.open(f"http://localhost:{PUERTO}")
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nParado.")


if __name__ == "__main__":
    print("Generando el curso...")
    total = construir()
    print(f"\nListo: {total} leccion(es) en {DIST}")
    if "--servir" in sys.argv:
        servir()
    sys.exit(0)
