// Figura del modulo 5: el estado de la partida.
//
// La caja central tiene el selector de fase, que solo mueve el servidor. Cada
// puesto tiene una palanca de «listo» y cuatro pilotos que repiten la fase. Nadie
// arranca hasta que las dos palancas estan bajadas; entonces hay cuenta atras,
// los dos coches corren a la vez, y se acaba para los dos a la vez.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k, TRAVEL } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 112, bedDepth: 76, height: 316 });
const { S, L, D, at, BOX_H, BED_H, BEDS, BED_W, START } = B;

const YC = -14;
const STATE = [0, -13];
const TIMER = [0, 14];
const SWITCH_Y = 26;
const lampX = (name, i) => BEDS[name] + 62 + i * 9;
const switchX = (name) => BEDS[name] + 30;

function lever(name, on) {
  const x = switchX(name) + (on ? 5 : -5);
  return B.knobAt([x, SWITCH_Y], BED_H + 0.8, 2.8, 4.2);
}

function station(name) {
  const parts = B.lane(name, YC, "owner");
  const car = B.vehicle(YC, name === "L" ? "a" : "b", { weight: "hi" });
  const out = [B.bed(name, { d: 76 }), parts.pre, B.group(`car-${name}`, car, [BEDS[name] + START, 0, 0]), parts.post];
  // Palanca de «listo»: ranura con dos posiciones.
  const slot = { x: switchX(name) - 10, y: SWITCH_Y - 4.5, w: 20, d: 9, r: 2 };
  out.push(S(k.slabOf(slot, BED_H, 0.8, B.P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(slot, 1.6), BED_H + 0.8, B.P, 3), { tone: "faint" }));
  out.push(`<g data-part="ready-${name}-off">${lever(name, false)}</g><g data-part="ready-${name}-on" style="display:none">${lever(name, true)}</g>`);
  // Cuatro pilotos: la fase, tal como la ve este puesto.
  const rail = { x: lampX(name, 0) - 5, y: SWITCH_Y - 4.5, w: 37, d: 9, r: 2 };
  out.push(S(k.slabOf(rail, BED_H, 0.8, B.P, 3), { tone: "lo", crease: "none" }));
  for (let i = 0; i < 4; i++) {
    // El piloto encendido sobresale: se distingue tambien sin color.
    const lamp = (lit) => S(k.cylinder(lampX(name, i), SWITCH_Y, 2.8, BED_H + 0.8, lit ? 4.6 : 1.6, B.P, 18, 0.3), { tone: "hi", crease: "lo", lit }) +
      (lit ? D([at([lampX(name, i), SWITCH_Y, BED_H + 5.4])], { size: 0.7, tone: "lit" }) : "");
    out.push(`<g data-part="lamp-${name}-${i}-off">${lamp(false)}</g><g data-part="lamp-${name}-${i}-on" style="display:none">${lamp(true)}</g>`);
  }
  return out.join("");
}

function top() {
  return B.gauge("state", STATE, 11, BOX_H, { tone: "lit", frac: 0 }) + B.gauge("timer", TIMER, 8, BOX_H, { tone: "hi", frac: 0 });
}

const ROUTES = { L: B.routeToBox("L", YC, -10), R: B.routeToBox("R", YC, -10) };

B.write(HERE, {
  name: "la-salida",
  fig: "Fig 5.1",
  title: "La fase es de todos",
  hint: "Pulsa en un puesto: listo",
  readout: "esperando · listos 0 de 2",
  keys: [
    { mark: "lit", label: "El selector de fase, en la caja: solo lo mueve el servidor" },
    { mark: "raised", label: "Palanca de «listo» y pilotos de fase de cada puesto" },
    { mark: "dashed", label: "Los cables: sube el «listo», baja la fase" },
  ],
  caption:
    "Cada jugador le dice al servidor que está listo. El servidor lleva la cuenta, que solo necesita él, y cuando están los dos cambia la fase. Ese cambio sí baja a todos: los pilotos de los dos puestos se mueven a la vez, y los coches solo responden en la fase de carrera. El tiempo lo descuenta el servidor, por eso acaban a la vez.",
  label:
    "Dos puestos con un coche en un carril, una palanca de dos posiciones y cuatro pilotos en fila, unidos por cables a una caja central con dos relojes. Al bajar las dos palancas, la aguja del reloj grande pasa a la segunda posición y empieza una cuenta atrás; al terminar pasa a la tercera y los dos coches avanzan a la vez; al agotarse el tiempo pasa a la cuarta y se detienen. En cada momento, el piloto encendido es el mismo en los dos puestos.",
  aria: { label: "La fase es de todos: flecha izquierda y derecha bajan la palanca de cada puesto" },
  body: [
    B.plate(),
    B.wire(ROUTES.L, { back: true }),
    B.wire(ROUTES.R, { back: true }),
    station("L"),
    B.box({ glands: [-10] }) + top(),
    station("R"),
  ],
  live: `
const STATE = ${JSON.stringify(STATE)}, TIMER = ${JSON.stringify(TIMER)}, TOP = ${BOX_H + 3};
const NAMES = ["esperando", "cuenta atrás", "carrera", "fin"], LENGTH = [0, 3, 6, 2.5], SPEED = { L: 12.5, R: 11 };
const ready = { L: false, R: false }, pos = { L: 0, R: 0 };
let state = 0, left = 0, idleFor = 0;
function draw() {
  for (const side of ["L", "R"]) {
    show(part("ready-" + side + "-on"), ready[side]); show(part("ready-" + side + "-off"), !ready[side]);
    for (let i = 0; i < 4; i++) { show(part("lamp-" + side + "-" + i + "-on"), i === state); show(part("lamp-" + side + "-" + i + "-off"), i !== state); }
    move(part("car-" + side), [BEDS[side] + START + pos[side], 0, 0]);
  }
  part("state").setAttribute("d", needleD(STATE, 11, TOP, state / 3));
  part("timer").setAttribute("d", needleD(TIMER, 8, TOP, LENGTH[state] ? left / LENGTH[state] : 0));
  const count = (ready.L ? 1 : 0) + (ready.R ? 1 : 0);
  say(state === 0 ? "esperando · listos " + count + " de 2"
    : state === 3 ? "fin · para los dos a la vez"
    : NAMES[state] + " · quedan " + Math.ceil(left) + " s");
}
function enter(next) {
  state = next; left = LENGTH[next];
  if (next === 0) { ready.L = ready.R = false; pos.L = pos.R = 0; idleFor = 0; }
}
const run = loop((dt, calm) => {
  if (calm) {
    // Sin animacion: se ensena la fase a la que llevan las palancas, sin relojes.
    enter(ready.L && ready.R ? 2 : 0); if (state === 2) { ready.L = ready.R = true; pos.L = pos.R = 40; }
    draw(); return true;
  }
  if (state === 0) {
    idleFor += dt;
    if (idleFor > 1.6 && !ready.L) ready.L = true;
    if (idleFor > 3 && !ready.R) ready.R = true;
    if (ready.L && ready.R) enter(1);
  } else {
    left -= dt;
    if (state === 2) for (const side of ["L", "R"]) pos[side] = Math.min(TRAVEL, pos[side] + SPEED[side] * dt);
    if (left <= 0) enter((state + 1) % 4);
  }
  draw();
  return false;
});
function toggle(side) {
  if (state !== 0 && !still.matches) return;
  ready[side] = !ready[side]; idleFor = 0;
  run(); draw();
}
stage.addEventListener("click", (event) => toggle(shareOf(event) < 0.5 ? "L" : "R"));
stage.addEventListener("keydown", (event) => {
  const side = { ArrowLeft: "L", ArrowRight: "R" }[event.key];
  if (!side) return;
  event.preventDefault();
  toggle(side);
});
draw();
`,
});
