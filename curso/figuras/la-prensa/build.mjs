// Figura del modulo 3: hacer aparecer un objeto en red.
//
// Solo la caja central tiene pulsador: es el servidor, el unico que crea. Al
// apretarlo, cada puesto saca de su tunel un bloque igual. Al volver a apretar,
// los dos lo guardan. Los puestos no tienen con que crear nada por su cuenta.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, HOP } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 104, bedDepth: 68, height: 310, tall: 6 });
const { S, L, D, at, BOX_H, BED_H, BEDS, BED_W } = B;

const SLOW = 10;
const OUT = 46; // lo que recorre el bloque del tunel a la peana
const BLOCK = { w: 20, d: 20, h: 14 };

// Tunel con el bloque dentro. La boca mira a la caja central.
function station(name) {
  const bx = BEDS[name];
  const s = B.inner(name);
  const home = bx + BED_W / 2 - s * 33; // centro del bloque guardado
  const x0 = home - 15;
  const out = [B.bed(name, { d: 68 })];
  // Peana donde queda el bloque al salir, con su cerco.
  const pad = { x: home + s * OUT - 13, y: -13, w: 26, d: 26, r: 3 };
  out.push(S(k.slabOf(pad, BED_H, 1, B.P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(pad, 2.4), BED_H + 1, B.P, 3), { tone: "faint" }));
  out.push(D(k.corners(pad, 3).map(([x, y]) => at([x, y, BED_H + 1])), { size: 0.4 }));
  // Guias por las que desliza, del tunel a la peana.
  for (const y of [-7, 7]) out.push(S(k.slabOf({ x: Math.min(home, home + s * OUT) - 4, y: y - 1, w: OUT + 8, d: 2, r: 0.6 }, BED_H, 0.8, B.P, 2), { tone: "mid", crease: "none" }));

  const wall = (y) => S(k.slabOf({ x: x0, y, w: 30, d: 2.4, r: 0.8 }, BED_H, 20, B.P, 2, 0.3), { tone: "mid" });
  const end = S(k.slabOf({ x: s > 0 ? x0 - 2.4 : x0 + 30, y: -14.4, w: 2.4, d: 28.8, r: 0.8 }, BED_H, 20, B.P, 2, 0.3), { tone: "mid" });
  const block = S(k.slabOf({ x: -BLOCK.w / 2, y: -BLOCK.d / 2, w: BLOCK.w, d: BLOCK.d, r: 2 }, BED_H + 1, BLOCK.h, B.P, 4, 0.6), { tone: "hi", crease: "lo", lit: true }) +
    L(k.planOutline({ x: -6, y: -6, w: 12, d: 12, r: 1.5 }, BED_H + 1 + BLOCK.h, B.P, 3), { tone: "lit" }) +
    D([at([-4, -4, BED_H + 1 + BLOCK.h]), at([0, 0, BED_H + 1 + BLOCK.h]), at([4, 4, BED_H + 1 + BLOCK.h])], { size: 0.5, tone: "lit" });
  const roof = S(k.slabOf({ x: x0 - 2.4, y: -14.4, w: 34.8, d: 28.8, r: 1.2 }, BED_H + 20, 2.4, B.P, 3, 0.5), { tone: "mid" }) +
    L(k.planOutline({ x: x0 + 3, y: -9, w: 24, d: 18, r: 1.5 }, BED_H + 22.4, B.P, 3), { tone: "faint" }) +
    D([[x0 + 1, -11], [x0 + 29, -11], [x0 + 1, 11], [x0 + 29, 11]].map(([x, y]) => at([x, y, BED_H + 22.4])), { size: 0.4 });

  out.push(wall(-14.4));
  if (s > 0) out.push(end); // en el puesto izquierdo el fondo queda detras del bloque
  out.push(B.group(`block-${name}`, block, [home, 0, 0]));
  out.push(roof, wall(12));
  if (s < 0) out.push(end);
  out.push(B.terminal(name, 0));
  return out.join("");
}

function top() {
  const out = [B.gauge("count", [0, -15], 8, BOX_H, { frac: 0 })];
  const c = [0, 12];
  out.push(S(k.cylinder(c[0], c[1], 10, BOX_H, 1.6, B.P, 36), { tone: "mid" }));
  out.push(L(k.ring(c[0], c[1], 8.2, BOX_H + 1.6, B.P, 32), { tone: "lo" }));
  out.push(B.group("plunger", S(k.cylinder(c[0], c[1], 7, BOX_H + 1.6, 5, B.P, 32, 0.6), { tone: "hi", crease: "lo" }) +
    L(k.knurl(c[0], c[1], 7, BOX_H + 1.6, BOX_H + 6.6, 30, B.P), { tone: "lo" }) +
    L(k.ring(c[0], c[1], 3.4, BOX_H + 6.6, B.P, 18), { tone: "mid" })));
  return out.join("");
}

const ROUTES = { L: B.routeToBox("L", 0, 0), R: B.routeToBox("R", 0, 0) };

B.write(HERE, {
  name: "la-prensa",
  fig: "Fig 3.1",
  title: "Aparecer en todas",
  hint: "Pulsa para crear o retirar",
  readout: "objetos en red: 0",
  keys: [
    { mark: "lit", label: "El objeto de red: un bloque igual en cada puesto" },
    { mark: "raised", label: "El pulsador, que solo está en la caja: solo el servidor crea y retira" },
    { mark: "dashed", label: "Los cables: por ellos baja la orden de crear, no el objeto" },
  ],
  caption:
    `El servidor no envía el bloque: envía la orden de crearlo, y cada puesto saca el suyo de su propio túnel, que es su copia del prefab. Por eso el prefab tiene que estar registrado en todas las máquinas. A cámara lenta: el salto de ${HOP * 1000} ms, un valor de ejemplo, se ve en ${HOP * SLOW} s.`,
  label:
    "Dos puestos, cada uno con un túnel del que sale un bloque sobre dos guías hasta una peana, unidos por cables a una caja central con un pulsador grande y un reloj contador. Al apretar el pulsador de la caja, el bloque de cada puesto sale de su túnel a la vez. Al volver a apretarlo, los dos se guardan.",
  aria: { label: "Aparecer en todas: Intro hace que el servidor cree o retire el objeto" },
  body: [
    B.plate(),
    B.wire(ROUTES.L, { back: true }),
    B.wire(ROUTES.R, { back: true }),
    station("L"),
    B.box({ glands: [0] }) + top(),
    station("R"),
  ],
  live: `
const OUT = ${OUT}, LEG = ${HOP * SLOW}, HOME = ${JSON.stringify({ L: BEDS.L + BED_W / 2 - 33, R: BEDS.R + BED_W / 2 + 33 })};
const blocks = { L: part("block-L"), R: part("block-R") }, plunger = part("plunger"), needle = part("count");
// spawned: lo que ha decidido el servidor. shown: cuanto ha salido el bloque en cada puesto, 0..1.
let spawned = false, since = 9, shown = 0, press = 0, idleFor = 0;
function draw() {
  move(blocks.L, [HOME.L + OUT * shown, 0, 0]);
  move(blocks.R, [HOME.R - OUT * shown, 0, 0]);
  move(plunger, [0, 0, -2.2 * press]);
  needle.setAttribute("d", needleD([0, -15], 8, ${BOX_H + 3}, spawned ? 0.25 : 0));
  const moving = shown > 0.02 && shown < 0.98;
  say(since < LEG ? (spawned ? "el servidor crea: la orden viaja" : "el servidor retira: la orden viaja")
    : moving ? (spawned ? "cada puesto saca el suyo" : "cada puesto lo guarda")
    : "objetos en red: " + (spawned ? 1 : 0));
  stage.setAttribute("aria-pressed", String(spawned));
}
const run = loop((dt, calm) => {
  if (calm) { shown = spawned ? 1 : 0; press = 0; since = 9; draw(); return true; }
  since += dt; idleFor += dt;
  press = Math.max(0, 1 - since / 0.25);
  // Los puestos solo se enteran cuando llega la orden, un salto despues.
  const want = since >= LEG ? (spawned ? 1 : 0) : (spawned ? 0 : 1);
  shown += (want - shown) * (1 - Math.exp(-dt / 0.22));
  if (idleFor > 3.4) toggle();
  draw();
  return false;
});
function toggle() { spawned = !spawned; since = 0; idleFor = 0; run(); draw(); }
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggle();
});
draw();
`,
});
