// Figura del modulo 2: un RPC de ida y vuelta.
//
// Cada puesto tiene un pulsador y un timbre. Al pulsar, una capsula viaja por el
// cable hasta la caja central; la caja envia una a cada puesto, y al llegar
// suena el timbre de los dos, tambien el de quien pulso. Va a camara lenta.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, HOP } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 104, bedDepth: 68, height: 310 });
const { S, L, D, at, BOX_H, BED_H, BEDS } = B;

const SLOW = 10; // un salto de HOP segundos se ve en HOP * SLOW
const LAMP = [0, 0];

function station(name) {
  const bx = BEDS[name];
  const s = B.inner(name);
  const out = [B.bed(name, { d: 68 })];
  // Timbre: campana de tres cuerpos sobre un zocalo, al fondo del puesto.
  const bell = [bx + 61 - s * 22, -8];
  out.push(S(k.cylinder(bell[0], bell[1], 12, BED_H, 1.2, B.P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(bell[0], bell[1], 10.5, BED_H + 1.2, 5, B.P, 40, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.sideArc(bell[0], bell[1], 10.5, BED_H + 3.4, B.P, 28), { tone: "faint" }));
  out.push(S(k.cylinder(bell[0], bell[1], 7, BED_H + 6.2, 3.6, B.P, 32, 0.5), { tone: "hi", crease: "lo" }));
  out.push(S(k.cylinder(bell[0], bell[1], 2.6, BED_H + 9.8, 2.6, B.P, 18), { tone: "mid" }));
  out.push(D([at([bell[0], bell[1], BED_H + 12.4])], { size: 0.5, tone: "hi" }));
  // Lo que se ve mientras suena: un aro de puntos alrededor de la campana.
  const ring = Array.from({ length: 12 }, (_, i) => at([bell[0] + Math.cos(i * Math.PI / 6) * 15, bell[1] + Math.sin(i * Math.PI / 6) * 15, BED_H + 4]));
  out.push(`<g data-part="ring-${name}" style="display:none">${D(ring, { size: 0.7, tone: "lit" })}</g>`);
  // Martillo: un poste con brazo que golpea la campana por el lado del lector.
  const post = [bell[0], bell[1] + 26];
  out.push(S(k.slabOf({ x: post[0] - 3, y: post[1] - 3, w: 6, d: 6, r: 1 }, BED_H, 9, B.P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([post[0], post[1], BED_H + 9])], { size: 0.45 }));
  const hammer = S(k.slabOf({ x: post[0] - 1, y: post[1] - 13, w: 2, d: 12, r: 0.6 }, BED_H + 6, 1.4, B.P, 2), { tone: "mid", crease: "none" }) +
    S(k.cylinder(post[0], post[1] - 13.5, 2.4, BED_H + 4.6, 4, B.P, 16), { tone: "hi" });
  out.push(B.group(`hammer-${name}`, hammer));
  // Pulsador: collar fijo y tapa que baja al apretar.
  const button = [bx + 61 + s * 26, 10];
  out.push(S(k.cylinder(button[0], button[1], 8, BED_H, 1.6, B.P, 32), { tone: "mid" }));
  out.push(L(k.ring(button[0], button[1], 6.4, BED_H + 1.6, B.P, 28), { tone: "lo" }));
  out.push(B.group(`button-${name}`, S(k.cylinder(button[0], button[1], 5.4, BED_H + 1.6, 3.4, B.P, 28, 0.5), { tone: "hi", crease: "lo", lit: name === "L" }) +
    L(k.ring(button[0], button[1], 2.6, BED_H + 5, B.P, 16), { tone: "lo" })));
  out.push(B.terminal(name, 0));
  return out.join("");
}

function top() {
  const out = [S(k.cylinder(LAMP[0], LAMP[1], 9, BOX_H, 1.4, B.P, 36), { tone: "lo" })];
  out.push(L(k.radialTicks(LAMP[0], LAMP[1], 8.4, 16, 4, BOX_H + 1.4, [1, 1.8], B.P).minor, { tone: "lo" }));
  const dome = (lit) => S(k.cylinder(LAMP[0], LAMP[1], 5.6, BOX_H + 1.4, 3, B.P, 28, 0.5), { tone: "hi", crease: "lo", lit }) +
    S(k.cylinder(LAMP[0], LAMP[1], 3.4, BOX_H + 4.4, 1.6, B.P, 20), { tone: "hi", lit });
  out.push(`<g data-part="lamp-off">${dome(false)}</g><g data-part="lamp-on" style="display:none">${dome(true)}</g>`);
  return out.join("");
}

const capsule = (name) => `<g data-part="${name}" style="display:none">${S(k.cylinder(0, 0, 2.6, 0, 2.6, B.P, 16), { tone: "hi", lit: true })}</g>`;
const ROUTES = { L: B.routeToBox("L", 0, -8), R: B.routeToBox("R", 0, 8) };

B.write(HERE, {
  name: "el-aviso",
  fig: "Fig 2.1",
  title: "Un aviso de ida y vuelta",
  hint: "Pulsa en un puesto",
  readout: "en reposo",
  keys: [
    { mark: "lit", label: "La cápsula: el mensaje, que solo existe mientras viaja" },
    { mark: "raised", label: "Pulsador y timbre de cada puesto" },
    { mark: "dashed", label: "Los cables: un puesto nunca le habla al otro directamente" },
  ],
  caption:
    `El cliente no hace sonar nada: se lo pide al servidor, y el servidor avisa a todos. El timbre suena en los dos puestos a la vez, también en el que pulsó. Va a cámara lenta: cada salto dura ${HOP * 1000} ms, un valor de ejemplo, y aquí se ve en ${HOP * SLOW} s.`,
  label:
    "Dos puestos con un pulsador y un timbre cada uno, unidos por cables a una caja central con una lámpara. Al pulsar en un puesto, una cápsula recorre el cable hasta la caja, la lámpara se enciende, salen dos cápsulas hacia los dos puestos y al llegar suenan los dos timbres.",
  aria: { label: "Un aviso de ida y vuelta: Intro pulsa en el puesto de la izquierda" },
  body: [
    B.plate(),
    B.wire(ROUTES.L, { flow: false }),
    B.wire(ROUTES.R, { flow: false }),
    capsule("cap-up"), capsule("cap-L"), capsule("cap-R"),
    station("L"),
    B.box({ glands: [-8, 8] }) + top(),
    station("R"),
  ],
  live: `
const ROUTES = ${JSON.stringify(ROUTES)}, LEG = ${HOP * SLOW};
const el = (n) => part(n);
const caps = { up: el("cap-up"), L: el("cap-L"), R: el("cap-R") };
// Fases: 0 reposo, 1 viaja al servidor, 2 el servidor decide, 3 viaja a todos, 4 suena.
let phase = 0, clock = 0, from = "L", idleFor = 0, auto = "R";
const place = (cap, route, t) => { const [x, y] = along(route, t); move(cap, [x, y, 0]); };
function draw() {
  show(caps.up, phase === 1); show(caps.L, phase === 3); show(caps.R, phase === 3);
  if (phase === 1) place(caps.up, ROUTES[from], clock / LEG);
  if (phase === 3) { place(caps.L, ROUTES.L, 1 - clock / LEG); place(caps.R, ROUTES.R, 1 - clock / LEG); }
  show(el("lamp-on"), phase === 2); show(el("lamp-off"), phase !== 2);
  for (const side of ["L", "R"]) {
    show(el("ring-" + side), phase === 4);
    const swing = phase === 4 ? Math.max(0, 1 - clock / 0.18) : 0;
    move(el("hammer-" + side), [0, -3 * swing, 0]);
    move(el("button-" + side), [0, 0, phase === 1 && side === from ? -1.6 : 0]);
  }
  say(["en reposo", "el cliente pide: viaja al servidor", "el servidor decide", "el servidor avisa a todos", "suena en los 2 puestos"][phase]);
}
const LENGTH = [0, LEG, 0.35, LEG, 0.9];
const run = loop((dt, calm) => {
  // Sin animacion no hay viaje que ensenar: se muestra el resultado y se queda.
  if (calm) { draw(); return true; }
  if (phase === 0) {
    idleFor += dt;
    if (idleFor > 2.6) { send(auto); auto = auto === "L" ? "R" : "L"; }
    draw();
    return false;
  }
  clock += dt;
  while (phase !== 0 && clock >= LENGTH[phase]) { clock -= LENGTH[phase]; phase = (phase + 1) % 5; }
  if (phase === 0) { clock = 0; idleFor = 0; }
  draw();
  return false;
});
function send(side) {
  if (still.matches) { from = side; phase = phase === 4 ? 0 : 4; clock = 1; run(); draw(); return; }
  if (phase !== 0) return;
  from = side; phase = 1; clock = 0; idleFor = 0; run();
}
stage.addEventListener("click", (event) => send(shareOf(event) < 0.5 ? "L" : "R"));
stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  send("L");
});
draw();
`,
});
