// Figura del modulo 1: quien tiene la autoridad sobre el movimiento.
//
// Un solo turismo. En el puesto de la izquierda lleva pomo: es el del lector.
// La palanca de la caja central elige quien manda. Con el dueno al mando, el
// coche obedece y su copia lo sigue. Con el servidor al mando, el lector empuja
// y el coche vuelve a donde dice la caja, treinta veces por segundo.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, TICK, HOP, TRAVEL } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 104, bedDepth: 68, height: 310 });
const { S, L, D, at, BOX_H, BEDS, START } = B;

const YC = -8;
const SRV = [0, -13];
const SLOT = { x: -11, y: 9, w: 22, d: 9, r: 2 };
const COPY_DELAY = 2 * HOP + 1 / TICK;

function station(name) {
  const parts = B.lane(name, YC, name === "L" ? "owner" : "motor");
  const car = B.vehicle(YC, "a", { knob: name === "L", weight: name === "L" ? "lit" : "mid" });
  return B.bed(name, { d: 68 }) + parts.pre + B.group(`car-${name}`, car, [BEDS[name] + START + TRAVEL / 2, 0, 0]) + parts.post;
}

// La palanca en una de sus dos posiciones: hacia el puesto del dueno o centrada en la caja.
function lever(x) {
  return B.knobAt([x, SLOT.y + SLOT.d / 2], BOX_H + 0.8, 3.1, 4.6);
}

function top() {
  const out = [B.gauge("srv", SRV, 9, BOX_H)];
  out.push(S(k.slabOf(SLOT, BOX_H, 0.8, B.P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(SLOT, 1.6), BOX_H + 0.8, B.P, 3), { tone: "faint" }));
  out.push(D([at([SLOT.x + 2, SLOT.y + 1.6, BOX_H + 0.8]), at([SLOT.x + SLOT.w - 2, SLOT.y + 1.6, BOX_H + 0.8])], { size: 0.4 }));
  out.push(`<g data-part="lever-owner">${lever(-6)}</g><g data-part="lever-server" style="display:none">${lever(6)}</g>`);
  return out.join("");
}

const toBoxL = B.routeToBox("L", YC, 0);
const toBoxR = B.routeToBox("R", YC, 0);

B.write(HERE, {
  name: "quien-manda",
  fig: "Fig 1.1",
  title: "Quién manda",
  hint: "Mueve · pulsa para cambiar",
  readout: "dueño · coche 40 · copia 40",
  keys: [
    { mark: "lit", label: "Tu coche, con pomo: lo empujas tú" },
    { mark: "raised", label: "La palanca de la caja: quién tiene la autoridad sobre el movimiento" },
    { mark: "dashed", label: "Los cables: hacia dónde viaja la posición" },
  ],
  caption:
    "Con el dueño al mando, tu coche obedece al pomo y su copia lo sigue. Con el servidor al mando, empujas igual, pero el servidor no ha recibido nada: cada dato suyo, 30 por segundo, devuelve el coche a donde él dice. Es el cliente del vídeo que pulsa y no se mueve.",
  label:
    "Dos puestos con un carril y un turismo cada uno, unidos por cables a una caja central con un reloj y una palanca de dos posiciones. El turismo de la izquierda lleva pomo. Con la palanca en una posición, el turismo sigue al pomo y el de la derecha lo copia con retraso. En la otra, el turismo de la izquierda da tirones hacia donde se le empuja y vuelve a la posición que marca el reloj de la caja.",
  aria: { label: "Quién manda: las flechas mueven el coche, Intro cambia quién tiene la autoridad", role: "slider", min: 0, max: TRAVEL, now: 40 },
  body: [
    B.plate(),
    B.wire(toBoxL, { name: "wire-up" }),
    `<g data-part="wire-down" style="display:none">${B.wire(toBoxL, { back: true })}</g>`,
    B.wire(toBoxR, { back: true }),
    station("L"),
    B.box({ glands: [0] }) + top(),
    station("R"),
  ],
  live: `
const SRV = ${JSON.stringify(SRV)}, GAUGE_TOP = ${BOX_H + 3}, COPY_DELAY = ${COPY_DELAY};
const carL = part("car-L"), carR = part("car-R"), needle = part("srv");
const leverOwner = part("lever-owner"), leverServer = part("lever-server"), wireUp = part("wire-up"), wireDown = part("wire-down");

// Lo que publica quien manda, una vez por tick. La copia lo recibe dos saltos despues.
const history = [];
const publish = (t, v) => { history.push([t, v]); while (history.length > 2 && history[1][0] < t - 1) history.shift(); };
const stepAt = (t) => { let v = history[0][1]; for (const h of history) { if (h[0] <= t) v = h[1]; else break; } return v; };
const lerpAt = (t) => {
  if (t <= history[0][0]) return history[0][1];
  for (let n = 1; n < history.length; n++) if (history[n][0] >= t) { const p = history[n - 1], q = history[n]; return p[1] + (q[1] - p[1]) * (t - p[0]) / (q[0] - p[0]); }
  return history[history.length - 1][1];
};

let serverRules = false, held = 40;
let a = 40, target = 40, time = 0, nextTick = 0, clock = 0, touring = true, idle = 0;
publish(-1, a); publish(0, a);

function draw() {
  const server = serverRules ? held : stepAt(time - HOP);
  const copy = lerpAt(time - COPY_DELAY);
  move(carL, [BEDS.L + START + a, 0, 0]);
  move(carR, [BEDS.R + START + copy, 0, 0]);
  needle.setAttribute("d", needleD(SRV, 9, GAUGE_TOP, server / TRAVEL));
  say(serverRules
    ? "servidor · empujas a " + target.toFixed(0) + " · vuelve a " + held.toFixed(0)
    : "dueño · coche " + a.toFixed(0) + " · copia " + copy.toFixed(0));
  stage.setAttribute("aria-valuenow", String(Math.round(a)));
  return Math.abs(copy - a) < 0.02;
}
const run = loop((dt, calm) => {
  if (touring) { clock += dt; target = 40 + 30 * Math.sin(clock * 1.2); }
  a = calm && !serverRules ? target : a + (target - a) * (1 - Math.exp(-dt / 0.14));
  time += dt;
  while (nextTick <= time) {
    // Con el servidor al mando, lo que llega pisa lo que el cliente movio por su cuenta.
    if (serverRules) a = held;
    publish(nextTick, serverRules ? held : a);
    nextTick += 1 / TICK;
  }
  const settled = draw();
  return calm && settled && (serverRules || a === target);
});
function setRules(next) {
  serverRules = next;
  if (serverRules) held = stepAt(time - HOP);
  show(leverOwner, !serverRules); show(leverServer, serverRules);
  show(wireUp, !serverRules); show(wireDown, serverRules);
  stage.setAttribute("aria-pressed", String(serverRules));
  run();
}
const steer = (next) => {
  touring = false; target = clamp(next, 0, TRAVEL);
  clearTimeout(idle);
  idle = setTimeout(() => { touring = !still.matches; clock = Math.asin(clamp((a - 40) / 30, -1, 1)) / 1.2; run(); }, 3200);
  run();
};
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => steer(clamp((shareOf(event) - 0.2) / 0.6, 0, 1) * TRAVEL));
stage.addEventListener("click", () => setRules(!serverRules));
stage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setRules(!serverRules); return; }
  const delta = { ArrowRight: 8, ArrowUp: 8, ArrowLeft: -8, ArrowDown: -8 }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  steer(target + delta);
});
draw();
`,
});
