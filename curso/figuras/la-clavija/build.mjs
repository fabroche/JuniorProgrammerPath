// Figura del modulo 6: desconexiones.
//
// Cada puesto se une a la caja central con una clavija. Sacar la de un puesto
// es un cliente que se va: su coche desaparece del otro puesto y la caja baja
// su testigo. Apagar la caja es el anfitrion que se cae: no queda nadie que
// decida, y los dos puestos se quedan vacios.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, TRAVEL } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ height: 330 });
const { S, L, D, at, BOX_H, BEDS, BED_W, START } = B;

const LANES = { a: -30, b: 22 };
const OWNS = { L: "a", R: "b" };
const PINS = { L: [-9, 0], R: [9, 0] };

function station(name) {
  const out = [B.bed(name)];
  for (const kind of ["a", "b"]) {
    const owned = OWNS[name] === kind;
    const parts = B.lane(name, LANES[kind], owned ? "owner" : "motor");
    const car = B.vehicle(LANES[kind], kind, { knob: owned, weight: owned ? (name === "L" ? "lit" : "hi") : "mid" });
    out.push(parts.pre, B.group(`car-${name}-${kind}`, car, [BEDS[name] + START + TRAVEL / 2, 0, 0]), parts.post);
  }
  return out.join("");
}

// Clavija sobre el suelo, al pie de la borna del carril propio de cada puesto.
function plug(name) {
  const edge = B.innerEdge(name);
  const s = B.inner(name);
  const y = LANES[OWNS[name]];
  return S(k.slabOf({ x: s > 0 ? edge : edge - 7, y: y - 3, w: 7, d: 6, r: 1.2 }, 0, 4.4, B.P, 3, 0.4), { tone: "hi" }) +
    D([at([edge + s * 3.5, y, 4.4])], { size: 0.5, tone: "hi" });
}

function top() {
  const out = [];
  // Dos testigos, uno por cliente: arriba mientras esta conectado.
  for (const side of ["L", "R"]) {
    const [x, y] = PINS[side];
    out.push(S(k.cylinder(x, y, 6, BOX_H, 1.2, B.P, 28), { tone: "lo" }));
    out.push(L(k.ring(x, y, 4.4, BOX_H + 1.2, B.P, 22), { tone: "lo" }));
    out.push(B.group(`pin-${side}`, S(k.cylinder(x, y, 3.4, BOX_H + 1.2, 7, B.P, 22, 0.4), { tone: "hi", crease: "lo" }) +
      L(k.sideArc(x, y, 3.4, BOX_H + 5, B.P, 14), { tone: "lo" }) + D([at([x, y, BOX_H + 8.2])], { size: 0.5, tone: "hi" })));
  }
  // Interruptor de la propia caja, delante.
  const slot = { x: -9, y: 16, w: 18, d: 8, r: 2 };
  out.push(S(k.slabOf(slot, BOX_H, 0.8, B.P, 3), { tone: "lo", crease: "none" }));
  out.push(`<g data-part="host-on">${B.knobAt([-4, 20], BOX_H + 0.8, 2.6, 4)}</g><g data-part="host-off" style="display:none">${B.knobAt([4, 20], BOX_H + 0.8, 2.6, 4)}</g>`);
  return out.join("");
}

const ROUTES = {
  L: B.routeToBox("L", LANES.a, -14),
  R: B.routeToBox("R", LANES.b, 14),
};

B.write(HERE, {
  name: "la-clavija",
  fig: "Fig 6.1",
  title: "Alguien se va",
  hint: "Pulsa un puesto o la caja",
  readout: "conectados: 2 de 2",
  keys: [
    { mark: "lit", label: "Tu coche, en tu puesto" },
    { mark: "raised", label: "Los testigos de la caja: lo que el servidor guarda de cada cliente" },
    { mark: "dashed", label: "Los cables, cada uno con su clavija" },
  ],
  caption:
    "Saca la clavija de un puesto: es un cliente que se va. Su coche desaparece del otro puesto, porque era suyo, y la caja baja su testigo: lo que el servidor guardaba de él hay que retirarlo a mano. Apaga la caja: es el anfitrión el que cae. No queda nadie que decida y la partida termina para los dos.",
  label:
    "Dos puestos con dos carriles y dos vehículos cada uno, unidos por cables con clavija a una caja central con dos testigos cilíndricos y un interruptor. Al sacar la clavija de un puesto, su vehículo desaparece del otro puesto, los dos vehículos del puesto desenchufado desaparecen, y su testigo en la caja se hunde. Al apagar el interruptor de la caja se sueltan las dos clavijas, se hunden los dos testigos y los dos puestos quedan vacíos.",
  aria: { label: "Alguien se va: flecha izquierda y derecha desenchufan un puesto, Intro apaga el anfitrión" },
  body: [
    B.plate(),
    `<g data-part="wire-L">${B.wire(ROUTES.L)}</g>`,
    `<g data-part="wire-R">${B.wire(ROUTES.R)}</g>`,
    B.group("plug-L", plug("L")),
    B.group("plug-R", plug("R")),
    station("L"),
    B.box() + top(),
    station("R"),
  ],
  live: `
const OTHER = { L: "R", R: "L" }, OWNS = { L: "a", R: "b" }, DIR = { L: 1, R: -1 };
const link = { L: true, R: true };
let host = true, clock = 0;
const pull = { L: 0, R: 0 }, sink = { L: 0, R: 0 }, pos = { L: 40, R: 40 }, copy = { L: 40, R: 40 };
const online = (side) => host && link[side];
function draw() {
  for (const side of ["L", "R"]) {
    const on = online(side), other = OTHER[side];
    // En cada puesto: su coche existe mientras el este conectado; la copia del otro, mientras lo esten los dos.
    show(part("car-" + side + "-" + OWNS[side]), on);
    show(part("car-" + side + "-" + OWNS[other]), on && online(other));
    move(part("car-" + side + "-" + OWNS[side]), [BEDS[side] + START + pos[side], 0, 0]);
    move(part("car-" + other + "-" + OWNS[side]), [BEDS[other] + START + copy[side], 0, 0]);
    show(part("wire-" + side), on);
    move(part("plug-" + side), [DIR[side] * 8 * pull[side], 5 * pull[side], 0]);
    move(part("pin-" + side), [0, 0, -6.4 * sink[side]]);
  }
  show(part("host-on"), host); show(part("host-off"), !host);
  const count = (online("L") ? 1 : 0) + (online("R") ? 1 : 0);
  say(!host ? "cayó el anfitrión · fin para todos" : "conectados: " + count + " de 2");
}
const run = loop((dt, calm) => {
  clock += calm ? 0 : dt;
  let busy = false;
  for (const side of ["L", "R"]) {
    const want = online(side) ? 0 : 1, rate = calm ? 1 : 1 - Math.exp(-dt / 0.12);
    pull[side] += (want - pull[side]) * rate; sink[side] += (want - sink[side]) * rate;
    if (Math.abs(want - pull[side]) > 0.01) busy = true;
    if (online(side)) {
      pos[side] = 40 + 26 * Math.sin(clock * (side === "L" ? 1.1 : 0.8) + (side === "L" ? 0 : 2));
      copy[side] += (pos[side] - copy[side]) * (calm ? 1 : 1 - Math.exp(-dt / 0.2));
    }
  }
  draw();
  return calm && !busy;
});
function unplug(side) { if (!host) return; link[side] = !link[side]; run(); draw(); }
function switchHost() { host = !host; if (host) link.L = link.R = true; run(); draw(); }
stage.addEventListener("click", (event) => {
  const share = shareOf(event);
  if (share < 0.38) unplug("L"); else if (share > 0.62) unplug("R"); else switchHost();
});
stage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); switchHost(); return; }
  const side = { ArrowLeft: "L", ArrowRight: "R" }[event.key];
  if (!side) return;
  event.preventDefault();
  unplug(side);
});
draw();
`,
});
