// Figura del modulo 8: por que hace falta un rele.
//
// Cada puesto es una casa con su router: un muro con dos compuertas que solo se
// abren desde dentro. Por el cable directo, la capsula de un puesto llega a la
// compuerta cerrada del otro y vuelve. Por el rele, los dos puestos llaman hacia
// fuera a la caja central, y la caja pasa lo de uno al otro por las compuertas
// que ellos mismos abrieron.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { crearBanco, k } from "../_banco.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const B = crearBanco({ depth: 128, bedDepth: 76, height: 326, tall: 10 });
const { S, L, D, at, BOX_H, BED_H, BEDS, BED_W } = B;

const Y_RELAY = -12;
const Y_DIRECT = 22;
const WALL_H = 16;
const centre = (name) => [BEDS[name] + BED_W / 2, -2];

function station(name) {
  const s = B.inner(name);
  const edge = B.innerEdge(name);
  const wx = s > 0 ? edge - 12 : edge + 9; // x del muro
  const [cx, cy] = centre(name);
  const piece = (y0, y1, extra = {}) => S(k.slabOf({ x: wx, y: y0, w: 3, d: y1 - y0, r: 0.8 }, BED_H, WALL_H, B.P, 2, 0.3), { tone: "mid", ...extra });
  const gate = (y, part) => B.group(part, S(k.slabOf({ x: wx + 0.4, y: y - 5, w: 2.2, d: 10, r: 0.5 }, BED_H, WALL_H - 3, B.P, 2), { tone: "hi", crease: "lo" }) +
    D([at([wx + 2.6, y, BED_H + 6])], { size: 0.45, tone: "hi" }));
  const wall = [piece(-36, Y_RELAY - 5), gate(Y_RELAY, `gate-relay-${name}`), piece(Y_RELAY + 5, Y_DIRECT - 5), gate(Y_DIRECT, `gate-direct-${name}`), piece(Y_DIRECT + 5, 36)].join("") +
    S(k.slabOf({ x: wx - 0.6, y: -36.6, w: 4.2, d: 73.2, r: 1 }, BED_H + WALL_H, 1.6, B.P, 2, 0.3), { tone: "mid" });
  // Dentro de la casa: el contador de lo que ha llegado.
  const inside = S(k.cylinder(cx, cy, 15, BED_H, 2, B.P, 40, 0.5), { tone: "mid" }) + L(k.ring(cx, cy, 12.6, BED_H + 2, B.P, 36), { tone: "faint" }) +
    B.gauge(`got-${name}`, [cx, cy], 11, BED_H + 2, { tone: name === "R" ? "lit" : "hi", frac: 0 });
  const out = [B.bed(name, { d: 76 })];
  // El muro queda entre el interior y la caja: detras en el puesto izquierdo, delante en el derecho.
  if (s > 0) out.push(inside, wall); else out.push(wall, inside);
  out.push(B.terminal(name, Y_RELAY), B.terminal(name, Y_DIRECT));
  return out.join("");
}

function top() {
  const out = [S(k.cylinder(0, 0, 9, BOX_H, 1.4, B.P, 36), { tone: "lo" })];
  out.push(S(k.cylinder(0, 0, 2.2, BOX_H + 1.4, 16, B.P, 16), { tone: "mid", crease: "none" }));
  for (const z of [5, 10, 15]) out.push(S(k.cylinder(0, 0, 6.5 - z * 0.22, BOX_H + z, 0.9, B.P, 24), { tone: "hi", crease: "lo" }));
  out.push(D([at([0, 0, BOX_H + 17.4])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

const edgeL = B.innerEdge("L");
const edgeR = B.innerEdge("R");
const ROUTES = {
  L: B.routeToBox("L", Y_RELAY, -8),
  R: B.routeToBox("R", Y_RELAY, 8),
  direct: [[edgeL, Y_DIRECT], [edgeL + 10, Y_DIRECT], [edgeL + 10, 50], [edgeR - 10, 50], [edgeR - 10, Y_DIRECT], [edgeR, Y_DIRECT]],
};
const capsule = (name) => `<g data-part="${name}" style="display:none">${S(k.cylinder(0, 0, 2.6, 0, 2.6, B.P, 16), { tone: "hi", lit: true })}</g>`;

B.write(HERE, {
  name: "el-rele",
  fig: "Fig 8.1",
  title: "Llamar hacia fuera",
  hint: "Pulsa para cambiar de ruta",
  readout: "directa · el otro router no abre",
  keys: [
    { mark: "lit", label: "La cápsula: lo que el puesto de la izquierda quiere hacer llegar al de la derecha" },
    { mark: "raised", label: "Las compuertas del router de cada casa: solo se abren desde dentro" },
    { mark: "dashed", label: "Dos rutas: el cable directo, por delante, y la que pasa por la caja" },
  ],
  caption:
    "Un router no deja entrar conexiones que no se han pedido desde dentro. Por la ruta directa, lo que envía un jugador llega a la compuerta cerrada del otro y se pierde. Por el relé, los dos llaman hacia fuera, que sí está permitido, y el relé pasa lo de uno al otro. El relé no decide nada: el servidor sigue siendo el anfitrión, en una de las dos casas.",
  label:
    "Dos puestos, cada uno con un muro con dos compuertas en el lado que mira al centro y un reloj contador detrás, y una caja central con una antena. Un cable va directamente de un puesto al otro por delante de la caja, y otros dos van de cada puesto a la caja. En la ruta directa, una cápsula sale del puesto izquierdo, llega a la compuerta cerrada del derecho y retrocede. En la ruta por la caja, sale una cápsula de cada puesto hacia la caja, la caja las reenvía cruzadas, entran por las compuertas abiertas y los contadores avanzan.",
  aria: { label: "Llamar hacia fuera: Intro cambia entre la ruta directa y la del relé" },
  body: [
    B.plate({ label: false }),
    B.wire(ROUTES.L, { flow: false }),
    B.wire(ROUTES.R, { flow: false }),
    B.wire(ROUTES.direct, { flow: false, tone: "mid" }),
    capsule("cap-1"), capsule("cap-2"),
    station("L"),
    B.box({ glands: [-8, 8] }) + top(),
    station("R"),
  ],
  live: `
const ROUTES = ${JSON.stringify(ROUTES)}, C = ${JSON.stringify({ L: centre("L"), R: centre("R") })}, LIFT = ${WALL_H - 2};
const cap1 = part("cap-1"), cap2 = part("cap-2");
let relay = false, clock = 0, got = { L: 0, R: 0 }, counted = false;
const place = (cap, route, t) => { const [x, y] = along(route, t); move(cap, [x, y, 0]); show(cap, true); };
const lift = (name, amount) => move(part(name), [0, 0, LIFT * clamp(amount, 0, 1)]);
function draw() {
  show(cap1, false); show(cap2, false);
  const open = { "gate-relay-L": 0, "gate-relay-R": 0, "gate-direct-L": 0, "gate-direct-R": 0 };
  let text;
  if (!relay) {
    // Sale por su propia compuerta, llega a la del otro y vuelve.
    open["gate-direct-L"] = clock < 0.5 ? 1 : 0;
    if (clock < 1.7) { place(cap1, ROUTES.direct, clock / 1.7); text = "directa · viaja al otro puesto"; }
    else if (clock < 2.5) { place(cap1, ROUTES.direct, 1 - (clock - 1.7) / 0.8 * 0.3); text = "directa · el otro router no abre"; }
    else text = "directa · no ha llegado nada";
  } else {
    // Los dos llaman hacia fuera; la caja cruza lo que recibe y vuelve por donde ellos abrieron.
    open["gate-relay-L"] = open["gate-relay-R"] = clock < 2.6 ? 1 : 0;
    if (clock < 1.1) { place(cap1, ROUTES.L, clock / 1.1); place(cap2, ROUTES.R, clock / 1.1); text = "por relé · los dos llaman hacia fuera"; }
    else if (clock < 2.2) { place(cap1, ROUTES.R, 1 - (clock - 1.1) / 1.1); place(cap2, ROUTES.L, 1 - (clock - 1.1) / 1.1); text = "por relé · la caja lo pasa al otro"; }
    else text = "por relé · entregado en 2 saltos";
    if (clock >= 2.2 && !counted) { counted = true; got.L++; got.R++; }
  }
  for (const name in open) lift(name, open[name]);
  for (const side of ["L", "R"]) part("got-" + side).setAttribute("d", needleD(C[side], 11, ${BED_H + 5}, (got[side] % 9) / 8));
  say(text);
  stage.setAttribute("aria-pressed", String(relay));
}
const run = loop((dt, calm) => {
  if (calm) { clock = relay ? 2.4 : 2.0; draw(); return true; }
  clock += dt;
  if (clock > 3.4) { clock = 0; counted = false; }
  draw();
  return false;
});
function toggle() { relay = !relay; clock = 0; counted = false; run(); draw(); }
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggle();
});
draw();
`,
});
