// Figura de la leccion 0.1: no hay un coche, hay una copia por maquina.
//
// Dos bancos (las dos maquinas) con dos carriles cada uno, uno por coche. En
// cada banco un coche lleva pomo: es el que conduce el dueno de esa maquina. El
// otro lo arrastra un motor alimentado por el cable que viene de la caja
// central (el servidor). Los clientes no se tocan: todo pasa por la caja.
//
//   node build.mjs            copias-por-maquina.html
//   node build.mjs --light    copias-por-maquina-light.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const NAME = "copias-por-maquina";

const WIDTH = 640;
const HEIGHT = 330;

// --- El modelo: lo unico que es verdad en la figura ------------------------
const TICK = 30; // Hz, el TickRate del NetworkManager del proyecto
const HOP = 0.1; // s por salto de red; valor de ejemplo
const TRAVEL = 80; // recorrido de un coche, en unidades de la regla
const COPY_DELAY = 2 * HOP + 1 / TICK; // dos saltos mas un tick para interpolar

// --- El mundo --------------------------------------------------------------
const PLATE = { x: -200, y: -72, w: 400, d: 144, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const BED_W = 122;
const BED_D = 112;
const BED_H = 5;
const BEDS = { L: -186, R: 64 }; // x del borde izquierdo de cada banco
const LANES = { a: -30, b: 22 }; // y del centro de cada carril
const RAIL_H = 3;
const RAIL_TOP = BED_H + RAIL_H;
const CAR_Z = RAIL_TOP + 3; // techo del carro, donde apoya el coche
const START = 21; // x local del coche en la posicion 0

const BOX = { x: -22, y: -30, w: 44, d: 60, r: 4 };
const BOX_H = 30;
const GAUGES = { a: [0, -14], b: [0, 14] };
const GAUGE_R = 9;
const GAUGE_TOP = BOX_H + 3;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, GAUGE_TOP + 4], [BEDS.L + 20, LANES.a, CAR_Z + 16], [BEDS.R + 100, LANES.a, CAR_Z + 16]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 56 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // Placa de caracteristicas, delante de la caja.
  const label = { x: -20, y: 44, w: 40, d: 14, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([47.5, 51, 54.5].map((y, i) => k.lineOnTop([-15, y], [15 - i * 6, y], 0.6, P)).join(""), { tone: "faint", free: true }));
  out.push(D(k.corners(label, 2.2).map(([x, y]) => at([x, y, 0.6])), { size: 0.4 }));
  return out.join("");
}

// Cables sobre la placa. El coche A viaja de izquierda a derecha, el B al reves.
function wires() {
  const out = [];
  const edgeL = BEDS.L + BED_W;
  const edgeR = BEDS.R;
  const run = (points, flowBack) => {
    const screen = (flowBack ? [...points].reverse() : points).map(([x, y]) => at([x, y, 0]));
    return k.wireSvg(screen[0], screen[screen.length - 1], { via: screen.slice(1, -1), tone: "hi", dashed: true, flow: true, size: 1.4 });
  };
  const ya = GAUGES.a[1];
  const yb = GAUGES.b[1];
  out.push(run([[edgeL, LANES.a], [edgeL + 13, LANES.a], [edgeL + 13, ya], [BOX.x - 4, ya]], false));
  out.push(run([[BOX.x + BOX.w + 4, ya], [edgeR - 13, ya], [edgeR - 13, LANES.a], [edgeR, LANES.a]], false));
  out.push(run([[edgeL, LANES.b], [edgeL + 20, LANES.b], [edgeL + 20, yb], [BOX.x - 4, yb]], true));
  out.push(run([[BOX.x + BOX.w + 4, yb], [edgeR - 20, yb], [edgeR - 20, LANES.b], [edgeR, LANES.b]], true));
  return out.join("");
}

// Partes fijas de un carril. `inner` es el extremo que mira a la caja central.
function lane(bx, yc, inner, owned) {
  const pre = [];
  const post = [];
  const rail = { x: bx + 8, y: yc - 4, w: BED_W - 16, d: 8, r: 1 };
  pre.push(S(k.slabOf(rail, BED_H, RAIL_H, P, 3, 0.4), { tone: "mid" }));
  pre.push(D([rail.x + 5, rail.x + rail.w - 5].map((x) => at([x, yc, RAIL_TOP])), { size: 0.4 }));
  const strip = { x: bx + 15, y: yc + 11, w: BED_W - 30, d: 6, r: 1 };
  pre.push(S(k.slabOf(strip, BED_H, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(bx + START, bx + START + TRAVEL, 4, 5, strip.y + 0.7, BED_H + 0.6, [1.8, 3.4], P);
  pre.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  pre.push(D([at([strip.x + 2, strip.y + 4.6, BED_H + 0.6]), at([strip.x + strip.w - 2, strip.y + 4.6, BED_H + 0.6])], { size: 0.4 }));

  const stop = (x, target) => {
    const plan = { x, y: yc - 9, w: 6, d: 18, r: 1.4 };
    target.push(S(k.slabOf(plan, BED_H, 8, P, 3, 0.5), { tone: "mid" }));
    target.push(D([at([x + 3, yc - 6.5, BED_H + 8]), at([x + 3, yc + 6.5, BED_H + 8])], { size: 0.4 }));
    if ((x > bx + 60) !== (inner > 0)) return;
    const cx = x + 3;
    if (owned) {
      // Codificador: lee donde esta el coche que se conduce aqui.
      const box = { x: cx - 2.4, y: yc - 4, w: 4.8, d: 8, r: 0.8 };
      target.push(S(k.slabOf(box, BED_H + 8, 3, P, 2, 0.3), { tone: "mid" }));
      target.push(D([at([cx, yc, BED_H + 11])], { size: 0.5, tone: "hi" }));
    } else {
      // Motor: mueve la copia hasta donde dice el cable.
      target.push(S(k.cylinder(cx, yc, 4, BED_H + 8, 9, P, 28, 0.4), { tone: "mid" }));
      target.push(L(k.sideArc(cx, yc, 4, BED_H + 11, P, 16) + k.sideArc(cx, yc, 4, BED_H + 14, P, 16), { tone: "lo" }));
      target.push(L(k.ring(cx, yc, 1.6, BED_H + 17, P, 12), { tone: "lo" }));
      target.push(D([at([cx, yc, BED_H + 17])], { size: 0.45, tone: "hi" }));
    }
  };
  stop(bx + 2, pre);
  stop(bx + BED_W - 8, post);

  // Borna en el canto del banco, sobre el final del cable.
  const edge = inner > 0 ? bx + BED_W - 4.5 : bx + 0.5;
  const term = { x: edge, y: yc - 3.5, w: 4, d: 7, r: 0.8 };
  const terminal = S(k.slabOf(term, BED_H, 2.4, P, 2, 0.3), { tone: "mid" }) +
    D([at([edge + 2, yc - 1.6, BED_H + 2.4]), at([edge + 2, yc + 1.6, BED_H + 2.4])], { size: 0.4 });
  (inner > 0 ? post : pre).push(terminal);
  return { pre: pre.join(""), post: post.join("") };
}

// El carro y su coche, construidos en x = 0. `kind` es "a" (turismo) o "b" (camion).
function vehicle(yc, kind, owned, lit) {
  const out = [];
  const base = { x: -11, y: yc - 9, w: 22, d: 18, r: 2.4 };
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(base, 2), RAIL_TOP, 0.1, P)}" style="filter:blur(3px)"/>`);
  out.push(S(k.slabOf(base, RAIL_TOP, 3, P, 4, 0.5), { tone: "mid" }));
  out.push(D([at([-8, yc - 7, CAR_Z]), at([8, yc - 7, CAR_Z])], { size: 0.4, tone: "lo" }));

  // Tres pesos: el coche que conduce el lector, el que conduce el otro
  // jugador en su banco, y las copias, que son las mas apagadas.
  const tone = { tone: owned ? "hi" : "mid", crease: "lo", lit };
  const wheel = (wx, y) => {
    out.push(S(k.slabOf({ x: wx - 3.3, y, w: 6.6, d: 2.4, r: 1.1 }, CAR_Z, 6.6, P, 3), { tone: "lo", crease: "none" }));
  };
  const hub = (wx) => out.push(L(k.sideRing([wx, yc + 8.4, CAR_Z + 3.3], 1.7, "y", P), { tone: "mid" }));
  wheel(-8, yc - 8.4);
  wheel(8, yc - 8.4);
  if (kind === "a") {
    const body = { x: -14, y: yc - 6.4, w: 28, d: 12.8, r: 3.4 };
    out.push(S(k.slabOf(body, CAR_Z + 2.6, 5.2, P, 5, 0.6), tone));
    const cabin = { x: -8, y: yc - 5.2, w: 14.5, d: 10.4, r: 2.8 };
    out.push(S(k.slabOf(cabin, CAR_Z + 7.8, 5.2, P, 5, 0.5), tone));
    out.push(L(k.planOutline(k.insetPlan(cabin, 2.2), CAR_Z + 13, P, 4), { tone: "faint" }));
    out.push(D([at([14, yc - 3.6, CAR_Z + 5]), at([14, yc + 3.6, CAR_Z + 5])], { size: 0.55, tone: "hi" }));
  } else {
    const chassis = { x: -14, y: yc - 6.4, w: 28, d: 12.8, r: 1.6 };
    out.push(S(k.slabOf(chassis, CAR_Z + 2.6, 2.4, P, 3), tone));
    const cargo = { x: -14, y: yc - 6.6, w: 17.5, d: 13.2, r: 1.2 };
    out.push(S(k.slabOf(cargo, CAR_Z + 5, 10, P, 3, 0.5), tone));
    out.push(L(k.planOutline(k.insetPlan(cargo, 2.2), CAR_Z + 15, P, 2), { tone: "faint" }));
    const cab = { x: 4.6, y: yc - 5.8, w: 9.4, d: 11.6, r: 2.2 };
    out.push(S(k.slabOf(cab, CAR_Z + 5, 7, P, 4, 0.5), tone));
    out.push(D([at([14, yc - 3.6, CAR_Z + 3.8]), at([14, yc + 3.6, CAR_Z + 3.8])], { size: 0.55, tone: "hi" }));
  }
  wheel(-8, yc + 6);
  wheel(8, yc + 6);
  hub(-8);
  hub(8);

  // Indice que marca sobre la regla.
  out.push(S(k.slabOf({ x: -1.2, y: yc + 9, w: 2.4, d: 5.4, r: 0.6 }, RAIL_TOP + 1, 1, P, 2), { tone: "mid", crease: "none" }));
  out.push(L(k.lineOnTop([0, yc + 9.6], [0, yc + 14.4], RAIL_TOP + 2, P), { tone: lit ? "lit" : owned ? "hi" : "mid" }));
  if (owned) {
    // Pomo: solo el coche que se conduce en esta maquina lo tiene.
    const knob = [7, yc + 12.4];
    out.push(S(k.slabOf({ x: knob[0] - 1.4, y: yc + 8.6, w: 2.8, d: 3, r: 0.6 }, RAIL_TOP + 0.6, 2, P, 2), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(knob[0], knob[1], 3.3, RAIL_TOP + 0.4, 5.6, P, 22), { tone: "mid" }));
    out.push(L(k.knurl(knob[0], knob[1], 3.3, RAIL_TOP + 0.4, RAIL_TOP + 6, 18, P), { tone: "lo" }));
    out.push(L(k.ring(knob[0], knob[1], 1.3, RAIL_TOP + 6, P, 10), { tone: "lo" }));
    out.push(D([at([knob[0], knob[1], RAIL_TOP + 6])], { size: 0.45, tone: "hi" }));
  }
  return out.join("");
}

function station(name, owns) {
  const bx = BEDS[name];
  const inner = name === "L" ? 1 : -1;
  const bed = { x: bx, y: -BED_D / 2, w: BED_W, d: BED_D, r: 5 };
  const out = [S(k.slabOf(bed, 0, BED_H, P, 6, 0.8), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(bed, 3.5), BED_H, P), { tone: "faint" }));
  const screws = k.corners(bed, 7);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, BED_H, P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, BED_H])), { size: 0.45 }));
  // Marca del banco: un punto o dos, grabados junto al tornillo delantero.
  const pips = name === "L" ? [0] : [0, 4];
  out.push(D(pips.map((dx) => at([bx + 16 + dx, BED_D / 2 - 7, BED_H])), { size: 0.6, tone: "hi" }));

  for (const kind of ["a", "b"]) {
    const yc = LANES[kind];
    const owned = owns === kind;
    const parts = lane(bx, yc, inner, owned);
    out.push(parts.pre);
    out.push(`<g data-part="${name}-${kind}" transform="${k.translateAlong(P, [bx + START + TRAVEL / 2, 0, 0])}">${vehicle(yc, kind, owned, name === "L" && owned)}</g>`);
    out.push(parts.post);
  }
  return out.join("");
}

const needleAt = (center, pos) => {
  const angle = (-0.375 + 0.75 * (pos / 80)) * Math.PI * 2;
  const [x, y] = center;
  return k.lineOnTop([x - Math.sin(angle) * 1.8, y + Math.cos(angle) * 1.8], [x + Math.sin(angle) * 6.4, y - Math.cos(angle) * 6.4], 33.2, P);
};

function relay() {
  const out = [];
  // Prensaestopas donde entran los cables, a ambos lados.
  for (const y of [GAUGES.a[1], GAUGES.b[1]]) {
    out.push(S(k.slabOf({ x: BOX.x - 4, y: y - 3, w: 4, d: 6, r: 1 }, 0, 4, P, 2, 0.3), { tone: "mid" }));
  }
  const seam = L(k.sideSeam(BOX, BOX_H - 4, P, 6), { tone: "lo" });
  out.push(S(k.slabOf(BOX, 0, BOX_H, P, 6, 1), { tone: "mid", inner: seam }));
  out.push(L(k.planOutline(k.insetPlan(BOX, 3), BOX_H, P, 6), { tone: "faint" }));
  out.push(D(k.corners(BOX, 5).map(([x, y]) => at([x, y, BOX_H])), { size: 0.45 }));
  // Rejilla de ventilacion: ranuras cerradas en la cara que mira al lector.
  const face = BOX.y + BOX.d;
  const slots = [-12, -7, -2, 3, 8].map((x) => {
    const [a, b, c, d] = [[x, 8], [x + 2.4, 8], [x + 2.4, 20], [x, 20]].map(([px, pz]) => [px, face, pz]);
    return k.segment(a, b, P) + k.segment(b, c, P) + k.segment(c, d, P) + k.segment(d, a, P);
  });
  out.push(L(slots.join(""), { tone: "lo" }));
  out.push(D([at([15, face, 23])], { size: 0.6, tone: "hi" }));
  for (const y of [GAUGES.a[1], GAUGES.b[1]]) {
    out.push(S(k.slabOf({ x: BOX.x + BOX.w, y: y - 3, w: 4, d: 6, r: 1 }, 0, 4, P, 2, 0.3), { tone: "mid" }));
  }
  // Dos relojes: la posicion de cada coche segun la caja.
  for (const kind of ["a", "b"]) {
    const [x, y] = GAUGES[kind];
    out.push(S(k.cylinder(x, y, GAUGE_R, BOX_H, 3, P, 40, 0.5), { tone: "hi", crease: "lo" }));
    out.push(L(k.ring(x, y, GAUGE_R - 1.4, GAUGE_TOP, P, 40), { tone: "lo" }));
    const ticks = k.radialTicks(x, y, GAUGE_R - 2, 20, 5, GAUGE_TOP, [1, 2], P, -0.375 * Math.PI * 2, 0.75 * Math.PI * 2);
    out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
    out.push(L(k.ring(x, y, 0.9, GAUGE_TOP, P, 10), { tone: "mid" }));
    out.push(`<path data-part="gauge-${kind}" class="iso-line" data-tone="${kind === "a" ? "lit" : "hi"}" data-free="start" d="${needleAt([x, y], TRAVEL / 2)}" style="stroke-width:1"/>`);
  }
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Dos bancos sobre una placa, unidos por cables a una caja central. Cada banco tiene dos carriles con regla: en uno va un turismo y en el otro un camión. En el banco de la izquierda el turismo lleva pomo y se conduce a mano; el camión lo arrastra un motor. En el de la derecha es al revés. Al mover un coche con pomo, su copia en el otro banco lo sigue con retraso, y los dos relojes de la caja marcan la posición que la caja conoce de cada coche.",
  body: [plate(), wires(), station("L", "a"), relay(), station("R", "b")],
});

const live = `
const P = ${JSON.stringify(P)};
const TICK = ${TICK}, HOP = ${HOP}, TRAVEL = ${TRAVEL}, COPY_DELAY = ${COPY_DELAY}, START = ${START};
const BEDS = ${JSON.stringify(BEDS)}, GAUGES = ${JSON.stringify(GAUGES)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const cars = { La: part("L-a"), Lb: part("L-b"), Ra: part("R-a"), Rb: part("R-b") };
const needles = { a: part("gauge-a"), b: part("gauge-b") };
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};

// El modelo. Cada dueno publica su posicion TICK veces por segundo. La caja la
// conoce un salto despues; la otra maquina, dos saltos despues, e interpola
// entre los dos ultimos ticks que tiene, asi que va un tick mas por detras.
const history = [];
const publish = (t, a, b) => { history.push([t, a, b]); while (history.length > 2 && history[1][0] < t - 1) history.shift(); };
const stepAt = (t, i) => { let v = history[0][i]; for (const h of history) { if (h[0] <= t) v = h[i]; else break; } return v; };
const lerpAt = (t, i) => {
  if (t <= history[0][0]) return history[0][i];
  for (let n = 1; n < history.length; n++) {
    if (history[n][0] >= t) { const p = history[n - 1], q = history[n]; return p[i] + (q[i] - p[i]) * (t - p[0]) / (q[0] - p[0]); }
  }
  return history[history.length - 1][i];
};

let a = 52, b = 30, target = a, time = 0, nextTick = 0;
let frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;
publish(-1, a, b); publish(0, a, b);
const otherPlayer = (t) => 40 + 26 * Math.sin(t * 0.8 + 2);

function draw() {
  const serverA = stepAt(time - HOP, 1), serverB = stepAt(time - HOP, 2);
  const copyA = lerpAt(time - COPY_DELAY, 1), copyB = lerpAt(time - COPY_DELAY, 2);
  const place = (el, bed, pos) => el.setAttribute("transform", translateAlong(P, [BEDS[bed] + START + pos, 0, 0]));
  place(cars.La, "L", a); place(cars.Rb, "R", b);
  place(cars.Ra, "R", copyA); place(cars.Lb, "L", copyB);
  needles.a.setAttribute("d", needleAt(GAUGES.a, serverA));
  needles.b.setAttribute("d", needleAt(GAUGES.b, serverB));
  const text = "tu coche " + a.toFixed(0) + " · su copia " + copyA.toFixed(0) + " · " + Math.round(COPY_DELAY * 1000) + " ms por detrás";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(a)));
  stage.setAttribute("aria-valuetext", text);
  return Math.abs(copyA - a) < 0.02 && Math.abs(copyB - b) < 0.02;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = 40 + 32 * Math.sin(clock * 1.25); }
  a = calm ? target : a + (target - a) * (1 - Math.exp(-dt / 0.14));
  if (Math.abs(target - a) < 0.01) a = target;
  if (!calm) b = otherPlayer(time);
  time += dt;
  while (nextTick <= time) { publish(nextTick, a, b); nextTick += 1 / TICK; }
  const settled = draw();
  frame = visible && !(calm && settled && a === target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, 0, TRAVEL);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = Math.asin(clamp((a - 40) / 32, -1, 1)) / 1.25; run(); }, 3200);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.2) / 0.6, 0, 1) * TRAVEL);
});
stage.addEventListener("keydown", (event) => {
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = target + 8;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = target - 8;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = TRAVEL;
  if (to === null) return;
  event.preventDefault();
  steer(to);
});
draw();
// Dentro de una leccion la figura va en un iframe: le dice su alto a la pagina.
const report = () => parent.postMessage({ figura: "copias-por-maquina", alto: document.documentElement.scrollHeight }, "*");
if (parent !== window) { report(); addEventListener("resize", report); addEventListener("load", report); }
`;

const body = k.plateHtml({
  fig: "Fig 0.1",
  title: "Una copia por máquina",
  hint: "Mueve el puntero para conducir el turismo",
  readout: "tu coche 52 · su copia 52 · 233 ms por detrás",
  keys: [
    { mark: "lit", label: "El coche que conduces tú: el único con pomo en tu banco" },
    { mark: "raised", label: "El camión que conduce el otro jugador en su banco" },
    { mark: "dim", label: "Las copias: las mueve un motor según lo que llega por el cable" },
    { mark: "dashed", label: "Los cables: cada banco solo está unido a la caja central" },
  ],
  caption:
    "Dos máquinas y un servidor. Tu turismo responde al instante; su copia en la otra máquina va por detrás, porque la posición viaja 30 veces por segundo (el TickRate de tu NetworkManager), cruza dos saltos de red de 100 ms cada uno, un valor de ejemplo, y se interpola entre los dos últimos datos recibidos. Los relojes de la caja marcan lo que el servidor sabe de cada coche.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Una copia por máquina: las flechas mueven el turismo que conduces" aria-valuemin="0" aria-valuemax="${TRAVEL}" aria-valuenow="52">${svg}</div>`,
});

const file = theme === "light" ? `${NAME}-light.html` : `${NAME}.html`;
writeFileSync(join(HERE, file), k.pageHtml({ title: "Una copia por máquina", theme, body, script: kitScript() + live }));
console.log("wrote", file);
