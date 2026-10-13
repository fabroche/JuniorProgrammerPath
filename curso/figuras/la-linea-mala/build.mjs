// Figura del modulo 9: una mala red.
//
// El mismo banco de la figura 0.1, con un solo coche, y tres relojes en la caja
// central: retraso, variacion y perdida. Cada pulsacion pasa a un perfil de red
// peor. La copia del puesto derecho se mueve con lo que le llega: tarde, a
// destiempo y con huecos. Los datos perdidos caen a la bandeja de delante.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, TICK, TRAVEL } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 112, bedDepth: 68, height: 316 });
const { S, L, D, at, BOX_H, BEDS, START, BOX } = B;

const YC = -8;
const DIALS = { delay: [0, -18], jitter: [0, 0], loss: [0, 18] };
const TRAY = { x: -12, y: BOX.y + BOX.d + 4, w: 24, d: 14, r: 2 };
// Retraso por salto y variacion en ms, perdida en tanto por uno. El ultimo es el del video.
const PROFILES = [
  { name: "local", delay: 0, jitter: 0, loss: 0 },
  { name: "casa", delay: 30, jitter: 10, loss: 0.01 },
  { name: "móvil", delay: 120, jitter: 40, loss: 0.05 },
  { name: "mala", delay: 50, jitter: 50, loss: 0.1 },
];

function station(name) {
  const parts = B.lane(name, YC, name === "L" ? "owner" : "motor");
  const car = B.vehicle(YC, "a", { knob: name === "L", weight: name === "L" ? "lit" : "mid" });
  return B.bed(name, { d: 68 }) + parts.pre + B.group(`car-${name}`, car, [BEDS[name] + START + TRAVEL / 2, 0, 0]) + parts.post;
}

function top() {
  return Object.entries(DIALS).map(([name, c]) => B.gauge(name, c, 7.6, BOX_H, { tone: "hi", frac: 0 })).join("");
}

// Bandeja al pie de la caja: paredes bajas y un fondo, donde caen los datos perdidos.
function tray() {
  const out = [S(k.slabOf(TRAY, 0, 0.8, B.P, 3), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(TRAY, 1.6), 0.8, B.P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: TRAY.x, y: TRAY.y + TRAY.d - 1.6, w: TRAY.w, d: 1.6, r: 0.6 }, 0, 3.4, B.P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TRAY.x + TRAY.w - 1.6, y: TRAY.y, w: 1.6, d: TRAY.d, r: 0.6 }, 0, 3.4, B.P, 2), { tone: "mid" }));
  return out.join("");
}
const drop = `<g data-part="drop" style="display:none">${S(k.cylinder(0, TRAY.y + TRAY.d / 2 - 1, 2.4, 0.8, 2.4, B.P, 16), { tone: "hi" })}</g>`;

const ROUTES = { L: B.routeToBox("L", YC, 0), R: B.routeToBox("R", YC, 0) };

B.write(HERE, {
  name: "la-linea-mala",
  fig: "Fig 9.1",
  title: "Con mala red",
  hint: "Mueve · pulsa para empeorar",
  readout: "local · 0 ms · copia a 0",
  keys: [
    { mark: "lit", label: "Tu coche: responde igual con cualquier red, porque mandas tú sobre él" },
    { mark: "dim", label: "La copia, en el otro puesto: se mueve con lo que le llega" },
    { mark: "raised", label: "Tres relojes: retraso, variación y pérdida. Delante, la bandeja de lo perdido" },
  ],
  caption:
    "Cuatro perfiles de red, de la de tu ordenador a una mala. El retraso deja la copia por detrás; la variación la mueve a tirones, porque los datos no llegan a intervalos iguales; la pérdida abre huecos que la interpolación tiene que saltar. El último perfil es el que prueba el vídeo: 50 ms, 50 de variación y 10 % de pérdida.",
  label:
    "Dos puestos con un carril y un turismo cada uno, unidos por cables a una caja central con tres relojes en fila y una bandeja delante. El turismo de la izquierda sigue al puntero. El de la derecha lo copia. Al pulsar, las agujas de los tres relojes suben y la copia va más retrasada y se mueve a saltos; de vez en cuando cae una ficha a la bandeja.",
  aria: { label: "Con mala red: las flechas mueven tu coche, Intro pasa al siguiente perfil de red", role: "slider", min: 0, max: TRAVEL, now: 40 },
  body: [
    B.plate({ label: false }),
    B.wire(ROUTES.L),
    B.wire(ROUTES.R, { back: true }),
    tray(), drop,
    station("L"),
    B.box({ glands: [0] }) + top(),
    station("R"),
  ],
  live: `
const PROFILES = ${JSON.stringify(PROFILES)}, DIALS = ${JSON.stringify(DIALS)}, TOP = ${BOX_H + 3};
const carL = part("car-L"), carR = part("car-R"), dropEl = part("drop");
// Cada dato: cuando se envio, que valia, y cuando llega al otro puesto (o nunca).
let samples = [], lost = 0, falling = 9;
let profile = 0, a = 40, target = 40, copy = 40, time = 0, nextTick = 0, clock = 0, touring = true, idle = 0;
// Sorteo repetible, para que la figura se comporte igual cada vez que se abre.
let seed = 7;
const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function send(t, v) {
  const p = PROFILES[profile];
  const gone = random() < p.loss;
  if (gone) { lost++; falling = 0; }
  samples.push({ sent: t, value: v, arrives: gone ? Infinity : t + (2 * p.delay + (random() * 2 - 1) * p.jitter) / 1000 });
  while (samples.length > 3 && samples[0].sent < t - 2) samples.shift();
}
// La copia va por detras lo justo para tener, casi siempre, dos datos entre los que moverse.
const buffer = () => { const p = PROFILES[profile]; return (2 * p.delay + p.jitter) / 1000 + 1 / TICK; };
function received(t) {
  const have = samples.filter((s) => s.arrives <= time);
  if (!have.length) return copy;
  let before = null, after = null;
  for (const s of have) { if (s.sent <= t) before = s; else if (!after) after = s; }
  if (before && after) return before.value + (after.value - before.value) * (t - before.sent) / (after.sent - before.sent);
  return (before || after).value;
}
function draw() {
  const p = PROFILES[profile];
  move(carL, [BEDS.L + START + a, 0, 0]);
  move(carR, [BEDS.R + START + copy, 0, 0]);
  part("delay").setAttribute("d", needleD(DIALS.delay, 7.6, TOP, p.delay / 150));
  part("jitter").setAttribute("d", needleD(DIALS.jitter, 7.6, TOP, p.jitter / 60));
  part("loss").setAttribute("d", needleD(DIALS.loss, 7.6, TOP, p.loss / 0.12));
  show(dropEl, falling < 0.45);
  move(dropEl, [0, 0, Math.max(0, 14 * (1 - falling / 0.3))]);
  say(p.name + " · " + p.delay + " ms ±" + p.jitter + " · " + Math.round(p.loss * 100) + " % · copia a " + Math.abs(a - copy).toFixed(0));
  stage.setAttribute("aria-valuenow", String(Math.round(a)));
}
const run = loop((dt, calm) => {
  if (touring) { clock += dt; target = 40 + 32 * Math.sin(clock * 1.25); }
  a = calm ? target : a + (target - a) * (1 - Math.exp(-dt / 0.14));
  time += dt; falling += dt;
  while (nextTick <= time) { send(nextTick, a); nextTick += 1 / TICK; }
  copy = received(time - buffer());
  draw();
  return calm && Math.abs(copy - a) < 0.02 && a === target;
});
function worse() { profile = (profile + 1) % PROFILES.length; run(); draw(); }
const steer = (next) => {
  touring = false; target = clamp(next, 0, TRAVEL);
  clearTimeout(idle);
  idle = setTimeout(() => { touring = !still.matches; clock = Math.asin(clamp((a - 40) / 32, -1, 1)) / 1.25; run(); }, 3200);
  run();
};
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => steer(clamp((shareOf(event) - 0.2) / 0.6, 0, 1) * TRAVEL));
stage.addEventListener("click", worse);
stage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); worse(); return; }
  const delta = { ArrowRight: 8, ArrowUp: 8, ArrowLeft: -8, ArrowDown: -8 }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  steer(target + delta);
});
draw();
`,
});
