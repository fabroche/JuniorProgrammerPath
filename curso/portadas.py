#!/usr/bin/env python3
"""Dibuja la portada de cada leccion a partir del motivo de su modulo.

    python portadas.py

Escribe un SVG de 1280x720 junto al Markdown de cada leccion de `PORTADAS`. Las
portadas comparten piezas (coche, pantalla, servidor) para que el curso se vea
como una sola cosa; cada modulo tiene su motivo y el laboratorio lo repite en
verde azulado con la insignia de las dos ventanas.

La de la 0.1 esta hecha a mano y no sale de aqui.
"""

from __future__ import annotations

from pathlib import Path

CONTENIDO = Path(__file__).parent / "contenido"

VIOLETA, VIOLETA_CLARO = "#7B76EC", "#8E8AF0"
AZUL, AZUL_CLARO = "#22A6C0", "#2FB8D2"
LINEA, PANEL, HUECO, GRIS = "#333850", "#1A1D2A", "#0C0E15", "#8B8FA3"
VERDE, AMBAR, ROJO = "#34D399", "#F5B942", "#F0627A"

DEFS = f"""
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12141F"/><stop offset="1" stop-color="#0B0C13"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.42" r="0.55">
      <stop offset="0" stop-color="HALO" stop-opacity="0.30"/><stop offset="1" stop-color="HALO" stop-opacity="0"/>
    </radialGradient>
    <pattern id="puntos" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#262A3A"/>
    </pattern>
    <symbol id="coche" viewBox="0 0 120 60">
      <path d="M30 28 L44 9 Q46 6 50 6 H78 Q82 6 84 9 L96 28 Z" fill="currentColor"/>
      <path d="M40 26 L49 13 H61 V26 Z M65 13 H77 L86 26 H65 Z" fill="#0B0C13" opacity="0.55"/>
      <rect x="4" y="26" width="112" height="22" rx="9" fill="currentColor"/>
      <rect x="104" y="31" width="10" height="6" rx="3" fill="#FFF4C2"/>
      <circle cx="32" cy="48" r="10" fill="#0B0C13"/><circle cx="32" cy="48" r="4" fill="{GRIS}"/>
      <circle cx="90" cy="48" r="10" fill="#0B0C13"/><circle cx="90" cy="48" r="4" fill="{GRIS}"/>
    </symbol>
    <symbol id="copia" viewBox="0 0 120 60">
      <g fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round">
        <path d="M30 28 L44 9 Q46 6 50 6 H78 Q82 6 84 9 L96 28"/>
        <rect x="4" y="26" width="112" height="22" rx="9"/>
        <circle cx="32" cy="48" r="10"/><circle cx="90" cy="48" r="10"/>
      </g>
    </symbol>
    <symbol id="avion" viewBox="0 0 120 60">
      <path d="M8 30 Q8 22 20 22 H84 Q112 22 112 30 Q112 38 84 38 H20 Q8 38 8 30 Z" fill="currentColor"/>
      <path d="M46 24 L62 2 H74 L66 24 Z M46 36 L62 58 H74 L66 36 Z M12 24 L18 8 H26 L24 24 Z" fill="currentColor"/>
      <rect x="88" y="26" width="14" height="6" rx="3" fill="#0B0C13" opacity="0.55"/>
    </symbol>
    <symbol id="pantalla" viewBox="0 0 380 300">
      <rect x="150" y="238" width="80" height="34" fill="#1F2231"/>
      <rect x="104" y="268" width="172" height="14" rx="7" fill="#262A3A"/>
      <rect x="4" y="4" width="372" height="240" rx="20" fill="{PANEL}" stroke="{LINEA}" stroke-width="3"/>
      <rect x="20" y="20" width="340" height="208" rx="10" fill="{HUECO}"/>
    </symbol>
    <symbol id="ventana" viewBox="0 0 380 260">
      <rect x="4" y="4" width="372" height="252" rx="16" fill="{PANEL}" stroke="{LINEA}" stroke-width="3"/>
      <rect x="16" y="40" width="348" height="204" rx="8" fill="{HUECO}"/>
      <circle cx="28" cy="22" r="6" fill="{ROJO}"/><circle cx="48" cy="22" r="6" fill="{AMBAR}"/><circle cx="68" cy="22" r="6" fill="{VERDE}"/>
    </symbol>
  </defs>"""


def use(simbolo, x, y, w, h, color=None, opacidad=None):
    extra = (f' color="{color}"' if color else "") + (f' opacity="{opacidad}"' if opacidad else "")
    return f'<use href="#{simbolo}" x="{x}" y="{y}" width="{w}" height="{h}"{extra}/>'


def carretera(x, y, w):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="56" fill="#151824"/>'
            f'<path d="M{x + 16} {y + 28} H{x + w - 16}" stroke="{LINEA}" stroke-width="4" stroke-dasharray="22 16"/>')


def servidor(x, y, borde=VIOLETA, luces=(VERDE, VIOLETA_CLARO, AZUL_CLARO)):
    """Torre de 148x316 con tres bandejas."""
    piezas = [f'<rect x="{x}" y="{y}" width="148" height="316" rx="18" fill="{PANEL}" stroke="{borde}" stroke-width="3"/>']
    for i, luz in enumerate(luces):
        yy = y + 22 + i * 72
        piezas.append(f'<rect x="{x + 18}" y="{yy}" width="112" height="56" rx="8" fill="{HUECO}" stroke="{LINEA}" stroke-width="2"/>')
        piezas.append(f'<path d="M{x + 62} {yy + 20} H{x + 114} M{x + 62} {yy + 36} H{x + 98}" stroke="{LINEA}" stroke-width="3" stroke-linecap="round"/>')
        piezas.append(f'<circle cx="{x + 38}" cy="{yy + 28}" r="7" fill="{luz}"/>')
    piezas.append(f'<path d="M{x + 30} {y + 252} H{x + 118} M{x + 30} {y + 268} H{x + 118} M{x + 30} {y + 284} H{x + 118}" stroke="{LINEA}" stroke-width="3" stroke-linecap="round"/>')
    return "".join(piezas)


def enlace(x1, x2, y, color, roto=False):
    if roto:
        m = (x1 + x2) // 2
        return (f'<path d="M{x1} {y} H{m - 34} M{m + 34} {y} H{x2}" fill="none" stroke="#3C4160" stroke-width="4" stroke-dasharray="3 13" stroke-linecap="round"/>'
                f'<rect x="{m - 40}" y="{y - 12}" width="22" height="24" rx="5" fill="{color}"/>'
                f'<path d="M{m - 18} {y - 6} h10 M{m - 18} {y + 6} h10" stroke="{color}" stroke-width="4" stroke-linecap="round"/>'
                f'<rect x="{m + 18}" y="{y - 12}" width="22" height="24" rx="5" fill="none" stroke="{GRIS}" stroke-width="3"/>'
                f'<path d="M{m - 6} {y - 34} l6 12 M{m + 8} {y - 36} l-3 13 M{m} {y + 24} l4 12" stroke="{AMBAR}" stroke-width="3" stroke-linecap="round"/>')
    return (f'<path d="M{x1} {y} H{x2}" fill="none" stroke="#3C4160" stroke-width="4" stroke-dasharray="3 13" stroke-linecap="round"/>'
            f'<circle cx="{x1 + 34}" cy="{y}" r="8" fill="{color}"/><circle cx="{x1 + 80}" cy="{y}" r="5" fill="{color}" opacity="0.5"/>')


def dos_pantallas(dentro_izq, dentro_der, centro, roto=False):
    """La composicion base: maquina, servidor, maquina."""
    return (enlace(452, 566, 286, VIOLETA_CLARO) + enlace(714, 828, 286, AZUL_CLARO, roto)
            + use("pantalla", 72, 136, 380, 300) + dentro_izq
            + use("pantalla", 828, 136, 380, 300) + dentro_der + centro)


def reloj(cx, cy, r, angulo, color):
    """Un reloj de aguja: lo que vale ahora mismo una variable."""
    import math
    marcas = "".join(
        f'<path d="M{cx + math.sin(a) * (r - 12):.1f} {cy - math.cos(a) * (r - 12):.1f} L{cx + math.sin(a) * (r - 4):.1f} {cy - math.cos(a) * (r - 4):.1f}" stroke="{LINEA}" stroke-width="3" stroke-linecap="round"/>'
        for a in [math.radians(d) for d in range(-120, 121, 30)])
    a = math.radians(angulo)
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{HUECO}" stroke="{color}" stroke-width="4"/>{marcas}'
            f'<path d="M{cx} {cy} L{cx + math.sin(a) * (r - 16):.1f} {cy - math.cos(a) * (r - 16):.1f}" stroke="{color}" stroke-width="5" stroke-linecap="round"/>'
            f'<circle cx="{cx}" cy="{cy}" r="6" fill="{color}"/>')


def sobre(x, y, color):
    return (f'<path d="M{x - 46} {y + 10} h30 M{x - 58} {y + 26} h42" stroke="{color}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>'
            f'<rect x="{x}" y="{y}" width="72" height="50" rx="7" fill="{PANEL}" stroke="{color}" stroke-width="4"/>'
            f'<path d="M{x + 4} {y + 6} L{x + 36} {y + 30} L{x + 68} {y + 6}" fill="none" stroke="{color}" stroke-width="4" stroke-linejoin="round"/>')


def caja(x, y, lado, color, opacidad=1.0):
    return (f'<g opacity="{opacidad}"><rect x="{x}" y="{y}" width="{lado}" height="{lado}" rx="8" fill="{PANEL}" stroke="{color}" stroke-width="4"/>'
            f'<path d="M{x} {y + lado * 0.36:.0f} h{lado} M{x + lado / 2:.0f} {y} v{lado * 0.36:.0f}" stroke="{color}" stroke-width="4"/>'
            f'<circle cx="{x + lado - 14}" cy="{y + lado - 14}" r="6" fill="{AMBAR}"/></g>')


def corona(x, y, color, hueca=False):
    relleno = f'fill="none" stroke="{color}" stroke-width="4" stroke-dasharray="6 6"' if hueca else f'fill="{color}"'
    return f'<path d="M{x} {y + 44} V{y + 10} L{x + 20} {y + 28} L{x + 38} {y} L{x + 56} {y + 28} L{x + 76} {y + 10} V{y + 44} Z" {relleno} stroke-linejoin="round"/>'


# --- Motivos, uno por modulo ---------------------------------------------------

def m0(c1, c2):
    return (use("ventana", 150, 150, 440, 300) + carretera(170, 372, 400)
            + use("coche", 196, 322, 150, 75, c1) + use("copia", 392, 300, 140, 70, c2, 0.75)
            + use("ventana", 690, 150, 440, 300) + carretera(710, 372, 400)
            + use("copia", 736, 322, 150, 75, c1, 0.75) + use("coche", 932, 300, 140, 70, c2)
            + f'<path d="M606 300 H674" stroke="#3C4160" stroke-width="4" stroke-dasharray="3 13" stroke-linecap="round"/>'
            + f'<circle cx="640" cy="300" r="9" fill="{VERDE}"/>')


def m1(c1, c2):
    return (f'<path d="M640 130 V470" stroke="{LINEA}" stroke-width="3" stroke-dasharray="10 12"/>'
            + corona(246, 118, c1) + servidor(210, 176, c1)
            + use("copia", 392, 372, 190, 95, c2, 0.8)
            + f'<path d="M366 330 H420" stroke="{c1}" stroke-width="4" stroke-linecap="round"/><path d="M408 318 l14 12 l-14 12" fill="none" stroke="{c1}" stroke-width="4" stroke-linejoin="round"/>'
            + corona(788, 296, c2) + use("coche", 730, 352, 230, 115, c2)
            + f'<g opacity="0.45">{servidor(980, 176, LINEA, (LINEA, LINEA, LINEA))}</g>' + corona(1016, 118, GRIS, hueca=True))


def m2(c1, c2):
    return dos_pantallas(
        carretera(92, 304, 340) + use("coche", 180, 262, 150, 75, c1),
        carretera(848, 304, 340) + use("copia", 946, 262, 150, 75, c1, 0.75),
        servidor(566, 132) + sobre(470, 196, c1) + sobre(738, 196, c2))


def m3(c1, c2):
    chispas = lambda x, y: f'<path d="M{x} {y - 20} v-16 M{x - 24} {y - 8} l-12 -10 M{x + 24} {y - 8} l12 -10" stroke="{AMBAR}" stroke-width="4" stroke-linecap="round"/>'
    return dos_pantallas(
        carretera(92, 304, 340) + caja(216, 218, 92, c1) + chispas(262, 218),
        carretera(848, 304, 340) + caja(972, 218, 92, c1) + chispas(1018, 218),
        servidor(566, 132, c1) + caja(606, 38, 68, c1))


def m4(c1, c2):
    return dos_pantallas(
        reloj(262, 264, 78, 40, c1), reloj(1018, 264, 78, 40, c1),
        f'<rect x="566" y="132" width="148" height="316" rx="18" fill="{PANEL}" stroke="{c1}" stroke-width="3"/>'
        + reloj(640, 250, 56, 40, c1)
        + f'<path d="M596 384 H684 M596 400 H684 M596 416 H684" stroke="{LINEA}" stroke-width="3" stroke-linecap="round"/>')


def m5(c1, c2):
    luces = "".join(f'<circle cx="640" cy="{184 + i * 84}" r="30" fill="{color}" opacity="{op}"/>' for i, (color, op) in enumerate([(ROJO, 0.25), (AMBAR, 0.25), (VERDE, 1)]))
    cuadros = "".join(f'<rect x="{960 + (i % 4) * 34}" y="{156 + (i // 4) * 34}" width="34" height="34" fill="{"#E3E5F0" if (i + i // 4) % 2 == 0 else HUECO}"/>' for i in range(12))
    return (f'<rect x="586" y="126" width="108" height="292" rx="26" fill="{PANEL}" stroke="{c1}" stroke-width="3"/>{luces}'
            f'<rect x="632" y="418" width="16" height="52" fill="{LINEA}"/>'
            + carretera(120, 396, 420) + f'<path d="M500 386 V462" stroke="#E3E5F0" stroke-width="6" stroke-dasharray="10 9"/>'
            + use("coche", 150, 300, 160, 80, c1) + use("coche", 320, 338, 160, 80, c2)
            + f'<path d="M948 150 V470" stroke="{GRIS}" stroke-width="8" stroke-linecap="round"/>'
            + f'<g>{cuadros}</g><rect x="960" y="156" width="136" height="102" fill="none" stroke="{LINEA}" stroke-width="3"/>')


def m6(c1, c2):
    tarde = (f'<g opacity="0.85"><circle cx="1150" cy="150" r="46" fill="{PANEL}" stroke="{AMBAR}" stroke-width="4"/>'
             f'<path d="M1150 122 V150 L1170 162" fill="none" stroke="{AMBAR}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>')
    return dos_pantallas(
        carretera(92, 304, 340) + use("coche", 130, 262, 140, 70, c1) + use("copia", 286, 240, 130, 65, c2, 0.3),
        carretera(848, 304, 340) + use("coche", 1010, 262, 140, 70, c2, 0.35) + f'<path d="M984 220 l72 72 M1056 220 l-72 72" stroke="{ROJO}" stroke-width="8" stroke-linecap="round"/>',
        servidor(566, 132, c1, (VERDE, VIOLETA_CLARO, ROJO)) + tarde, roto=True)


def m7(c1, c2):
    marco = lambda x: f'<rect x="{x}" y="170" width="300" height="230" rx="18" fill="{PANEL}" stroke="{LINEA}" stroke-width="3"/><rect x="{x + 16}" y="186" width="268" height="198" rx="8" fill="{HUECO}"/>'
    flecha = lambda x: f'<path d="M{x} 262 l22 22 l-22 22" fill="none" stroke="{GRIS}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
    menu = "".join(f'<rect x="170" y="{222 + i * 46}" width="{180 - i * 30}" height="26" rx="13" fill="{c1 if i == 0 else LINEA}"/>' for i in range(3))
    seleccion = (f'<rect x="508" y="216" width="124" height="136" rx="14" fill="none" stroke="{c1}" stroke-width="4"/>'
                 + use("coche", 516, 254, 108, 54, c1) + use("avion", 648, 254, 108, 54, GRIS)
                 + f'<circle cx="570" cy="330" r="6" fill="{c1}"/><circle cx="702" cy="330" r="6" fill="{LINEA}"/>')
    juego = carretera(866, 316, 268) + use("coche", 890, 266, 130, 65, c1) + use("copia", 1016, 244, 110, 55, c2, 0.75)
    return marco(110) + menu + flecha(430) + marco(490) + seleccion + flecha(810) + marco(850) + juego


def m8(c1, c2):
    casa = lambda x, color: (f'<path d="M{x} 300 L{x + 110} 210 L{x + 220} 300 V430 H{x} Z" fill="{PANEL}" stroke="{LINEA}" stroke-width="3" stroke-linejoin="round"/>'
                             f'<rect x="{x + 52}" y="322" width="116" height="76" rx="8" fill="{HUECO}" stroke="{color}" stroke-width="3"/>')
    nube = (f'<path d="M560 236 Q520 236 520 200 Q520 164 560 164 Q572 122 620 122 Q668 122 684 160 Q742 156 748 204 Q752 236 716 236 Z" fill="{PANEL}" stroke="{c1}" stroke-width="4" stroke-linejoin="round"/>'
            f'<circle cx="634" cy="186" r="14" fill="{c1}"/>')
    arcos = (f'<path d="M270 250 Q380 150 516 196" fill="none" stroke="{c1}" stroke-width="4" stroke-dasharray="3 13" stroke-linecap="round"/>'
             f'<path d="M1010 250 Q900 150 752 196" fill="none" stroke="{c2}" stroke-width="4" stroke-dasharray="3 13" stroke-linecap="round"/>')
    billete = (f'<rect x="530" y="330" width="220" height="92" rx="14" fill="{PANEL}" stroke="{AMBAR}" stroke-width="3" stroke-dasharray="10 8"/>'
               + "".join(f'<rect x="{554 + i * 44}" y="356" width="32" height="40" rx="6" fill="{AMBAR}" opacity="{1 - i * 0.12}"/>' for i in range(4)))
    return arcos + casa(160, c1) + use("coche", 228, 334, 84, 42, c1) + casa(900, c2) + use("coche", 968, 334, 84, 42, c2) + nube + billete


def m9(c1, c2):
    panel = f'<rect x="150" y="150" width="620" height="300" rx="18" fill="{PANEL}" stroke="{LINEA}" stroke-width="3"/><rect x="170" y="170" width="580" height="260" rx="8" fill="{HUECO}"/>'
    rejilla = "".join(f'<path d="M190 {210 + i * 50} H730" stroke="#1A1D2A" stroke-width="2"/>' for i in range(5))
    onda = f'<path d="M190 380 L250 372 L310 384 L370 368 L430 376 L480 250 L520 214 L560 300 L620 372 L680 380 L730 374" fill="none" stroke="{c1}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>'
    lupa = (f'<circle cx="512" cy="238" r="76" fill="{c2}" fill-opacity="0.10" stroke="{c2}" stroke-width="7"/>'
            f'<path d="M566 292 L636 362" stroke="{c2}" stroke-width="14" stroke-linecap="round"/>')
    crono = (f'<circle cx="960" cy="310" r="112" fill="{PANEL}" stroke="{AMBAR}" stroke-width="5"/><rect x="944" y="168" width="32" height="30" rx="6" fill="{AMBAR}"/>'
             f'<circle cx="960" cy="310" r="88" fill="{HUECO}"/><path d="M960 310 L960 244 M960 310 L1004 336" stroke="{AMBAR}" stroke-width="7" stroke-linecap="round"/>'
             f'<circle cx="960" cy="310" r="9" fill="{AMBAR}"/>')
    return panel + rejilla + onda + lupa + crono


INSIGNIA = (f'<g><rect x="48" y="44" width="92" height="76" rx="16" fill="{PANEL}" stroke="{AZUL}" stroke-width="3"/>'
            f'<rect x="66" y="60" width="38" height="30" rx="5" fill="none" stroke="{AZUL_CLARO}" stroke-width="3"/>'
            f'<rect x="84" y="74" width="38" height="30" rx="5" fill="{PANEL}" stroke="{AZUL_CLARO}" stroke-width="3"/></g>')

MOTIVOS = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9]

PORTADAS = {
    "M00/02-dos-jugadores-en-tu-maquina": (0, True, "Dos ventanas del mismo juego, cada una con su coche y la copia del otro"),
    "M01/01-conexion-y-autoridad": (1, False, "A un lado manda el servidor; al otro, el dueño del coche"),
    "M01/02-quien-mueve-el-coche": (1, True, "A un lado manda el servidor; al otro, el dueño del coche"),
    "M02/01-rpc-y-logica-de-servidor": (2, False, "Un mensaje viaja de una máquina al servidor y del servidor a la otra"),
    "M02/02-el-claxon-y-el-trafico": (2, True, "Un mensaje viaja de una máquina al servidor y del servidor a la otra"),
    "M03/01-objetos-en-red": (3, False, "El servidor crea un objeto y aparece a la vez en las dos máquinas"),
    "M03/02-trafico-en-red": (3, True, "El servidor crea un objeto y aparece a la vez en las dos máquinas"),
    "M04/01-estado-continuo-networkvariable": (4, False, "Tres relojes, uno por máquina, marcando el mismo valor"),
    "M04/02-el-volante-y-los-choques": (4, True, "Tres relojes, uno por máquina, marcando el mismo valor"),
    "M05/01-estado-de-partida-y-pausa": (5, False, "Dos coches en la salida, un semáforo en verde y una bandera a cuadros"),
    "M05/02-la-carrera": (5, True, "Dos coches en la salida, un semáforo en verde y una bandera a cuadros"),
    "M06/01-desconexiones-y-entradas-tardias": (6, False, "Un cable desenchufado entre el servidor y una máquina, y un reloj de quien llega tarde"),
    "M06/02-caidas-y-aforo": (6, True, "Un cable desenchufado entre el servidor y una máquina, y un reloj de quien llega tarde"),
    "M07/01-escenas-y-seleccion": (7, False, "Tres escenas en fila: menú, selección de vehículo y juego"),
    "M07/02-menu-seleccion-y-juego": (7, True, "Tres escenas en fila: menú, selección de vehículo y juego"),
    "M08/01-jugar-por-internet": (8, False, "Dos casas unidas a través de una nube, y un billete con un código"),
    "M08/02-sesiones-con-codigo": (8, True, "Dos casas unidas a través de una nube, y un billete con un código"),
    "M09/01-depurar-y-cerrar": (9, False, "Una gráfica con un pico bajo una lupa, y un cronómetro"),
    "M09/02-mala-red-y-un-jugador": (9, True, "Una gráfica con un pico bajo una lupa, y un cronómetro"),
}


def portada(modulo: int, lab: bool, descripcion: str) -> str:
    c1, c2 = (AZUL, VIOLETA) if lab else (VIOLETA, AZUL)
    defs = DEFS.replace("HALO", "#0E8FA8" if lab else "#5B57D6")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="{descripcion}">{defs}\n'
            f'  <rect width="1280" height="720" fill="url(#fondo)"/><rect width="1280" height="720" fill="url(#puntos)"/>'
            f'<rect width="1280" height="720" fill="url(#halo)"/>\n'
            f'  {MOTIVOS[modulo](c1, c2)}\n  {INSIGNIA if lab else ""}\n</svg>\n')


if __name__ == "__main__":
    for nombre, (modulo, lab, descripcion) in PORTADAS.items():
        destino = CONTENIDO / f"{nombre}.svg"
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(portada(modulo, lab, descripcion), encoding="utf-8")
        print(f"  {nombre}.svg")
    print(f"\nListo: {len(PORTADAS)} portadas")
