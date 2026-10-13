// Figura del modulo 7: cambiar de escena en red.
//
// Cada puesto es un teatrillo: tres decorados sobre un trineo que pasa por
// detras de un marco. Solo la caja central tiene selector de escena. Cuando lo
// mueve, cada puesto cambia su decorado a su ritmo, y la caja levanta un testigo
// por cada puesto que ha terminado. El peon de cada jugador no aparece hasta que
// estan los dos.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 104, bedDepth: 68, height: 320, tall: 14 });
const { S, L, D, at, BOX_H, BED_H, BEDS, BED_W } = B;

const GAP = 24; // de un decorado al siguiente
const FLAT = { w: 20, h: 22 };
const SLED_Y = -10;
const PINS = { L: [-9, -14], R: [9, -14] };
const centre = (name) => BEDS[name] + BED_W / 2;
const pawnAt = (name) => [centre(name), 18];

// Los tres decorados sobre su trineo, construidos con el del medio en x = 0.
function sled() {
  const out = [S(k.slabOf({ x: -GAP - 13, y: SLED_Y - 5, w: 2 * GAP + 26, d: 10, r: 1.5 }, BED_H + 0.8, 1.4, B.P, 3, 0.3), { tone: "mid" })];
  const z0 = BED_H + 2.2;
  const face = SLED_Y + 1.2;
  [-GAP, 0, GAP].forEach((cx, i) => {
    out.push(S(k.slabOf({ x: cx - FLAT.w / 2, y: SLED_Y - 1.2, w: FLAT.w, d: 2.4, r: 0.6 }, z0, FLAT.h, B.P, 2, 0.3), { tone: "hi", crease: "lo" }));
    const seg = (x1, z1, x2, z2) => k.segment([cx + x1, face, z0 + z1], [cx + x2, face, z0 + z2], B.P);
    const frame = seg(-8, 2.5, 8, 2.5) + seg(8, 2.5, 8, 19.5) + seg(8, 19.5, -8, 19.5) + seg(-8, 19.5, -8, 2.5);
    out.push(L(frame, { tone: "lo" }));
    if (i === 0) out.push(L(seg(-5.5, 15.5, 5.5, 15.5) + seg(-5.5, 11, 3, 11) + seg(-5.5, 6.5, 0.5, 6.5), { tone: "mid", free: true }));
    if (i === 1) out.push(L(k.sideRing([cx - 3.6, face, z0 + 11], 2.6, "y", B.P) + k.sideRing([cx + 3.6, face, z0 + 11], 2.6, "y", B.P), { tone: "mid" }));
    if (i === 2) out.push(L(seg(-8, 7, 8, 7), { tone: "mid" }) + L(seg(-5.5, 9.5, 1, 9.5) + seg(1, 9.5, 1, 13) + seg(1, 13, -5.5, 13) + seg(-5.5, 13, -5.5, 9.5), { tone: "mid" }));
  });
  return out.join("");
}

function station(name) {
  const cx = centre(name);
  const out = [B.bed(name, { d: 68 })];
  // Guias del trineo.
  for (const y of [SLED_Y - 3.4, SLED_Y + 3.4]) out.push(S(k.slabOf({ x: cx - 56, y: y - 0.8, w: 112, d: 1.6, r: 0.5 }, BED_H, 0.8, B.P, 2), { tone: "mid", crease: "none" }));
  out.push(B.group(`sled-${name}`, sled(), [cx + GAP, 0, 0]));
  // Marco, delante del trineo: lo que queda dentro es la escena cargada.
  for (const dx of [-13, 13]) {
    out.push(S(k.slabOf({ x: cx + dx - 1.6, y: SLED_Y + 4.4, w: 3.2, d: 3.2, r: 0.8 }, BED_H, 30, B.P, 2, 0.3), { tone: "mid" }));
  }
  out.push(S(k.slabOf({ x: cx - 16, y: SLED_Y + 4, w: 32, d: 4, r: 1 }, BED_H + 30, 3, B.P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([cx - 13, SLED_Y + 6, BED_H + 33]), at([cx + 13, SLED_Y + 6, BED_H + 33])], { size: 0.45 }));
  // Peana del jugador y su peon, que solo existe en la escena de partida.
  const [px, py] = pawnAt(name);
  out.push(S(k.cylinder(px, py, 8, BED_H, 1, B.P, 30), { tone: "lo" }));
  out.push(L(k.ring(px, py, 6, BED_H + 1, B.P, 24), { tone: "faint" }));
  const pawn = S(k.cylinder(px, py, 4.6, BED_H + 1, 2, B.P, 24, 0.3), { tone: "hi", lit: true }) +
    S(k.cylinder(px, py, 2.6, BED_H + 3, 6, B.P, 18), { tone: "hi", crease: "none", lit: true }) +
    S(k.cylinder(px, py, 3.6, BED_H + 9, 3.2, B.P, 20, 0.3), { tone: "hi", lit: true });
  out.push(`<g data-part="pawn-${name}" style="display:none">${pawn}</g>`);
  out.push(B.terminal(name, 0));
  return out.join("");
}

function top() {
  const out = [];
  for (const side of ["L", "R"]) {
    const [x, y] = PINS[side];
    out.push(S(k.cylinder(x, y, 5.4, BOX_H, 1.2, B.P, 26), { tone: "lo" }));
    out.push(B.group(`pin-${side}`, S(k.cylinder(x, y, 3, BOX_H + 1.2, 6.5, B.P, 20, 0.4), { tone: "hi", crease: "lo" }) + D([at([x, y, BOX_H + 7.7])], { size: 0.5, tone: "hi" }), [0, 0, -6]));
  }
  // Selector de tres posiciones.
  const slot = { x: -13, y: 8, w: 26, d: 9, r: 2 };
  out.push(S(k.slabOf(slot, BOX_H, 0.8, B.P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(slot, 1.6), BOX_H + 0.8, B.P, 3), { tone: "faint" }));
  out.push(L(k.topTicks(-8, 8, 8, 1, slot.y + slot.d + 0.6, BOX_H, [0, 2.4], B.P).major, { tone: "mid", free: true }));
  [-8, 0, 8].forEach((x, i) => out.push(`<g data-part="pick-${i}"${i ? ' style="display:none"' : ""}>${B.knobAt([x, 12.5], BOX_H + 0.8, 3, 4.6)}</g>`));
  return out.join("");
}

const ROUTES = { L: B.routeToBox("L", 0, 0), R: B.routeToBox("R", 0, 0) };

B.write(HERE, {
  name: "el-decorado",
  fig: "Fig 7.1",
  title: "Cambiar de escena",
  hint: "Pulsa para cambiar de escena",
  readout: "menú · cargada en 2 de 2",
  keys: [
    { mark: "lit", label: "El peón de cada jugador: se crea cuando todos han cargado la partida" },
    { mark: "raised", label: "Los tres decorados de cada puesto: menú, selección y partida" },
    { mark: "edge", label: "Los testigos de la caja: qué puestos han terminado de cargar" },
  ],
  caption:
    "Solo el servidor cambia de escena, y se lo ordena a todos. Cada máquina tarda lo suyo: el puesto de la derecha es más lento. El servidor espera a que hayan terminado los dos antes de crear los jugadores; si los creara nada más dar la orden, uno aparecería en una escena que el otro aún no tiene.",
  label:
    "Dos puestos, cada uno con tres paneles sobre un trineo que se desliza por detrás de un marco, y una peana delante. Una caja central con un selector de tres posiciones y dos testigos. Al mover el selector, el trineo de cada puesto se desliza hasta dejar otro panel dentro del marco, el de la izquierda antes que el de la derecha, y la caja levanta un testigo por cada uno que termina. En la tercera posición, cuando están arriba los dos testigos, aparece un peón en la peana de cada puesto.",
  aria: { label: "Cambiar de escena: Intro pasa a la escena siguiente" },
  body: [
    B.plate(),
    B.wire(ROUTES.L, { back: true }),
    B.wire(ROUTES.R, { back: true }),
    station("L"),
    B.box({ glands: [0] }) + top(),
    station("R"),
  ],
  live: `
const GAP = ${GAP}, CX = ${JSON.stringify({ L: centre("L"), R: centre("R") })};
const NAMES = ["menú", "selección", "partida"], LOAD = { L: 0.7, R: 1.7 };
let scene = 0, since = 9, idleFor = 0;
const at = { L: 0, R: 0 };
const loaded = (side) => since >= LOAD[side];
function draw() {
  for (const side of ["L", "R"]) {
    move(part("sled-" + side), [CX[side] + GAP - GAP * at[side], 0, 0]);
    move(part("pin-" + side), [0, 0, loaded(side) ? 0 : -6]);
    show(part("pawn-" + side), scene === 2 && loaded("L") && loaded("R"));
  }
  for (let i = 0; i < 3; i++) show(part("pick-" + i), i === scene);
  const count = (loaded("L") ? 1 : 0) + (loaded("R") ? 1 : 0);
  say(NAMES[scene] + " · cargada en " + count + " de 2" + (scene === 2 && count === 2 ? " · jugadores creados" : ""));
}
const run = loop((dt, calm) => {
  if (calm) { since = 9; at.L = at.R = scene; draw(); return true; }
  since += dt; idleFor += dt;
  for (const side of ["L", "R"]) {
    // Cada puesto termina su carga cuando le toca: llega al decorado justo entonces.
    const t = clamp(since / LOAD[side], 0, 1), ease = t * t * (3 - 2 * t);
    at[side] = from[side] + (scene - from[side]) * ease;
  }
  if (idleFor > 4.2) next();
  draw();
  return false;
});
const from = { L: 0, R: 0 };
function next() { from.L = at.L; from.R = at.R; scene = (scene + 1) % 3; since = 0; idleFor = 0; run(); draw(); }
stage.addEventListener("click", next);
stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowRight") return;
  event.preventDefault();
  next();
});
draw();
`,
});
