// Figura del modulo 4: una NetworkVariable.
//
// La caja central tiene el reloj maestro: el valor lo escribe el servidor. Cada
// puesto tiene un reloj esclavo que lo sigue. El puesto de la derecha se puede
// desenchufar: su reloj se queda donde estaba, y al volver a enchufarlo recibe
// el valor de ahora, sin haber visto ninguno de los cambios intermedios.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, TICK, HOP } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 104, bedDepth: 68, height: 310, tall: 4 });
const { S, L, D, at, BOX_H, BED_H, BEDS, BED_W } = B;

const MASTER = [0, 0];
const MASTER_R = 17;
const SLAVE_R = 14;
const HEAD_Z = BED_H + 12;
const centre = (name) => [BEDS[name] + BED_W / 2, -2];

function station(name) {
  const [x, y] = centre(name);
  const out = [B.bed(name, { d: 68 })];
  // Peana, columna y cabeza del reloj esclavo.
  out.push(S(k.cylinder(x, y, 13, BED_H, 2, B.P, 40, 0.5), { tone: "mid" }));
  out.push(L(k.ring(x, y, 10.5, BED_H + 2, B.P, 32), { tone: "faint" }));
  out.push(D([0, 1, 2, 3].map((i) => at([x + Math.cos(i * Math.PI / 2 + 0.8) * 11.6, y + Math.sin(i * Math.PI / 2 + 0.8) * 11.6, BED_H + 2])), { size: 0.4 }));
  out.push(S(k.cylinder(x, y, 5, BED_H + 2, 10, B.P, 24), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(x, y, 5, BED_H + 5, B.P, 14) + k.sideArc(x, y, 5, BED_H + 9, B.P, 14), { tone: "faint" }));
  out.push(B.gauge(`slave-${name}`, [x, y], SLAVE_R, HEAD_Z, { tone: "hi", frac: 0.5 }));
  // Placa del puesto, con tres renglones.
  const plan = { x: x - 16, y: 19, w: 32, d: 10, r: 1.2 };
  out.push(S(k.slabOf(plan, BED_H, 0.6, B.P, 3), { tone: "lo", crease: "none" }));
  out.push(L([2.6, 5, 7.4].map((dy, i) => k.lineOnTop([x - 12, 19 + dy], [x + 10 - i * 5, 19 + dy], BED_H + 0.6, B.P)).join(""), { tone: "faint", free: true }));
  out.push(B.terminal(name, 0));
  return out.join("");
}

function top() {
  const out = [B.gauge("master", MASTER, MASTER_R, BOX_H, { tone: "lit", frac: 0.5, h: 4 })];
  out.push(L(k.knurl(MASTER[0], MASTER[1], MASTER_R, BOX_H + 1, BOX_H + 4, 60, B.P, 0.3), { tone: "lo" }));
  return out.join("");
}

// Clavija del puesto derecho, junto a su borna: es lo que se saca al desenchufar.
function plug() {
  const edge = BEDS.R;
  return S(k.slabOf({ x: edge - 7, y: -3, w: 7, d: 6, r: 1.2 }, 0, 4.4, B.P, 3, 0.4), { tone: "hi" }) +
    D([at([edge - 3.5, 0, 4.4])], { size: 0.5, tone: "hi" });
}

const ROUTES = { L: B.routeToBox("L", 0, 0), R: B.routeToBox("R", 0, 0) };

B.write(HERE, {
  name: "reloj-maestro",
  fig: "Fig 4.1",
  title: "Un valor compartido",
  hint: "Mueve · pulsa para desenchufar",
  readout: "servidor 40 · copias 40 y 40",
  keys: [
    { mark: "lit", label: "La aguja del reloj maestro: el valor, que solo escribe el servidor" },
    { mark: "raised", label: "Los relojes esclavos: cada máquina tiene el suyo y solo lo lee" },
    { mark: "dashed", label: "Los cables: baja el valor de cada tick, no cada cambio" },
  ],
  caption:
    `El servidor cambia el valor y los demás lo acaban teniendo, un salto de ${HOP * 1000} ms después, que es un valor de ejemplo. Desenchufa el puesto de la derecha, mueve el valor y vuelve a enchufarlo: recibe el valor de ahora, no los que se perdió. Es lo que le pasa a quien se conecta tarde, y lo que un RPC no hace.`,
  label:
    "Una caja central con un reloj grande y dos puestos, cada uno con un reloj más pequeño sobre una columna, unidos a la caja por cables. La aguja del reloj central sigue al puntero y las de los puestos la copian con un pequeño retraso. El cable del puesto derecho termina en una clavija que se puede sacar: entonces su aguja se queda quieta, y al volver a meterla salta al valor actual.",
  aria: { label: "Un valor compartido: las flechas cambian el valor del servidor, Intro desenchufa el puesto derecho", role: "slider", min: 0, max: 80, now: 40 },
  body: [
    B.plate(),
    B.wire(ROUTES.L, { back: true }),
    `<g data-part="wire-R">${B.wire(ROUTES.R, { back: true })}</g>`,
    B.group("plug", plug()),
    station("L"),
    B.box({ glands: [0] }) + top(),
    station("R"),
  ],
  live: `
const MASTER = ${JSON.stringify(MASTER)}, C = ${JSON.stringify({ L: centre("L"), R: centre("R") })};
const DELAY = HOP + 1 / TICK;
const needles = { m: part("master"), L: part("slave-L"), R: part("slave-R") }, wireR = part("wire-R"), plug = part("plug");
const history = [];
const publish = (t, v) => { history.push([t, v]); while (history.length > 2 && history[1][0] < t - 1) history.shift(); };
const lerpAt = (t) => {
  if (t <= history[0][0]) return history[0][1];
  for (let n = 1; n < history.length; n++) if (history[n][0] >= t) { const p = history[n - 1], q = history[n]; return p[1] + (q[1] - p[1]) * (t - p[0]) / (q[0] - p[0]); }
  return history[history.length - 1][1];
};
let v = 40, target = 40, time = 0, nextTick = 0, clock = 0, touring = true, idle = 0;
// El puesto derecho: enchufado o no, el valor con el que se quedo, y cuando le llega el actual.
let plugged = true, frozen = 40, arrives = 0, pull = 0;
publish(-1, v); publish(0, v);
function draw() {
  const left = lerpAt(time - DELAY);
  const right = plugged && time >= arrives ? left : frozen;
  needles.m.setAttribute("d", needleD(MASTER, ${MASTER_R}, ${BOX_H + 4}, v / 80));
  needles.L.setAttribute("d", needleD(C.L, ${SLAVE_R}, ${HEAD_Z + 3}, left / 80));
  needles.R.setAttribute("d", needleD(C.R, ${SLAVE_R}, ${HEAD_Z + 3}, right / 80));
  move(plug, [-9 * pull, 6 * pull, 0]);
  show(wireR, plugged);
  say("servidor " + v.toFixed(0) + " · copias " + left.toFixed(0) + " y " + right.toFixed(0) + (plugged ? "" : " (suelta)"));
  stage.setAttribute("aria-valuenow", String(Math.round(v)));
  return Math.abs(left - v) < 0.02;
}
const run = loop((dt, calm) => {
  if (touring) { clock += dt; target = 40 + 32 * Math.sin(clock * 0.9); }
  v = calm ? target : v + (target - v) * (1 - Math.exp(-dt / 0.16));
  pull = calm ? (plugged ? 0 : 1) : pull + ((plugged ? 0 : 1) - pull) * (1 - Math.exp(-dt / 0.12));
  time += dt;
  while (nextTick <= time) { publish(nextTick, v); nextTick += 1 / TICK; }
  const settled = draw();
  return calm && settled && v === target;
});
function setPlugged(next) {
  if (next === plugged) return;
  if (!next) frozen = lerpAt(time - DELAY);
  else arrives = time + HOP;
  plugged = next;
  stage.setAttribute("aria-pressed", String(!plugged));
  run(); draw();
}
const steer = (next) => {
  touring = false; target = clamp(next, 0, 80);
  clearTimeout(idle);
  idle = setTimeout(() => { touring = !still.matches; clock = Math.asin(clamp((v - 40) / 32, -1, 1)) / 0.9; run(); }, 3600);
  run();
};
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => steer(clamp((shareOf(event) - 0.2) / 0.6, 0, 1) * 80));
stage.addEventListener("click", () => setPlugged(!plugged));
stage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setPlugged(!plugged); return; }
  const delta = { ArrowRight: 8, ArrowUp: 8, ArrowLeft: -8, ArrowDown: -8 }[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  steer(target + delta);
});
draw();
`,
});
