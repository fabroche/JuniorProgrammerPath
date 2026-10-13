// Piezas comunes a las figuras del curso: el banco de dos puestos con una caja
// central, que es la misma maquina en todas. Cada figura monta encima su propio
// mecanismo. La figura de la 0.1 es anterior a este modulo y no lo usa.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

export { k };

export const TICK = 30; // Hz, el TickRate del NetworkManager del proyecto
export const HOP = 0.1; // s por salto de red; valor de ejemplo
export const TRAVEL = 80; // recorrido de un carro, en unidades de la regla

export function crearBanco({ width = 640, height = 330, depth = 144, bedDepth = 112, azimuth = 56, boxHeight = 30, tall = 0 } = {}) {
  const PLATE = { x: -200, y: -depth / 2, w: 400, d: depth, r: 8 };
  const PLATE_H = 10;
  const FOOT_H = 5;
  const BED_W = 122;
  const BED_H = 5;
  const BEDS = { L: -186, R: 64 };
  const RAIL_TOP = BED_H + 3;
  const CAR_Z = RAIL_TOP + 3;
  const START = 21;
  const BOX = { x: -22, y: -30, w: 44, d: 60, r: 4 };
  const BOX_H = boxHeight;

  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, BOX_H + 8 + tall], [BEDS.L + 20, -bedDepth / 2 + 20, CAR_Z + 16 + tall], [BEDS.R + 100, -bedDepth / 2 + 20, CAR_Z + 16 + tall]],
    width,
    height,
    { pad: 22, azimuth },
  );

  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const inner = (name) => (name === "L" ? 1 : -1);
  const innerEdge = (name) => (name === "L" ? BEDS.L + BED_W : BEDS.R);
  const group = (name, html, offset = [0, 0, 0], extra = "") =>
    `<g data-part="${name}" transform="${k.translateAlong(P, offset)}"${extra}>${html}</g>`;

  function plate({ label = true } = {}) {
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
    if (label) {
      const y0 = PLATE.y + PLATE.d - 21;
      const plan = { x: -20, y: y0, w: 40, d: 14, r: 1.5 };
      out.push(S(k.slabOf(plan, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
      out.push(L([3.5, 7, 10.5].map((dy, i) => k.lineOnTop([-15, y0 + dy], [15 - i * 6, y0 + dy], 0.6, P)).join(""), { tone: "faint", free: true }));
      out.push(D(k.corners(plan, 2.2).map(([x, y]) => at([x, y, 0.6])), { size: 0.4 }));
    }
    return out.join("");
  }

  // Un cable tendido sobre la placa, por puntos del suelo. `back` invierte el flujo.
  function wire(points, { back = false, tone = "hi", flow = true, name } = {}) {
    const screen = (back ? [...points].reverse() : points).map(([x, y]) => at([x, y, 0]));
    const svg = k.wireSvg(screen[0], screen[screen.length - 1], { via: screen.slice(1, -1), tone, dashed: true, flow, size: 1.4 });
    return name ? `<g data-part="${name}">${svg}</g>` : svg;
  }
  // Ruta de un puesto a la caja, en el suelo, a la altura `y` del puesto y `yBox` de la caja.
  const routeToBox = (name, y, yBox, jog = 13) => {
    const edge = innerEdge(name);
    const s = inner(name);
    const boxX = s > 0 ? BOX.x - 4 : BOX.x + BOX.w + 4;
    return [[edge, y], [edge + s * jog, y], [edge + s * jog, yBox], [boxX, yBox]];
  };

  function bed(name, { d = bedDepth, pips = true } = {}) {
    const bx = BEDS[name];
    const plan = { x: bx, y: -d / 2, w: BED_W, d, r: 5 };
    const out = [S(k.slabOf(plan, 0, BED_H, P, 6, 0.8), { tone: "mid" })];
    out.push(L(k.planOutline(k.insetPlan(plan, 3.5), BED_H, P), { tone: "faint" }));
    const screws = k.corners(plan, 7);
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, BED_H, P, 12)).join(""), { tone: "lo" }));
    out.push(D(screws.map(([x, y]) => at([x, y, BED_H])), { size: 0.45 }));
    if (pips) out.push(D((name === "L" ? [0] : [0, 4]).map((dx) => at([bx + 16 + dx, d / 2 - 7, BED_H])), { size: 0.6, tone: "hi" }));
    return out.join("");
  }

  // Borna en el canto del puesto que mira a la caja, sobre el final del cable.
  function terminal(name, yc) {
    const edge = inner(name) > 0 ? BEDS[name] + BED_W - 4.5 : BEDS[name] + 0.5;
    const plan = { x: edge, y: yc - 3.5, w: 4, d: 7, r: 0.8 };
    return S(k.slabOf(plan, BED_H, 2.4, P, 2, 0.3), { tone: "mid" }) +
      D([at([edge + 2, yc - 1.6, BED_H + 2.4]), at([edge + 2, yc + 1.6, BED_H + 2.4])], { size: 0.4 });
  }

  // Carril con regla y topes. `drive` es lo que lleva el tope interior:
  // "owner" (codificador), "motor" o nada. Devuelve lo que va antes y despues del carro.
  function lane(name, yc, drive) {
    const bx = BEDS[name];
    const pre = [];
    const post = [];
    const rail = { x: bx + 8, y: yc - 4, w: BED_W - 16, d: 8, r: 1 };
    pre.push(S(k.slabOf(rail, BED_H, 3, P, 3, 0.4), { tone: "mid" }));
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
      if ((x > bx + 60) !== (inner(name) > 0)) return;
      const cx = x + 3;
      if (drive === "owner") {
        target.push(S(k.slabOf({ x: cx - 2.4, y: yc - 4, w: 4.8, d: 8, r: 0.8 }, BED_H + 8, 3, P, 2, 0.3), { tone: "mid" }));
        target.push(D([at([cx, yc, BED_H + 11])], { size: 0.5, tone: "hi" }));
      } else if (drive === "motor") {
        target.push(S(k.cylinder(cx, yc, 4, BED_H + 8, 9, P, 28, 0.4), { tone: "mid" }));
        target.push(L(k.sideArc(cx, yc, 4, BED_H + 11, P, 16) + k.sideArc(cx, yc, 4, BED_H + 14, P, 16), { tone: "lo" }));
        target.push(L(k.ring(cx, yc, 1.6, BED_H + 17, P, 12), { tone: "lo" }));
        target.push(D([at([cx, yc, BED_H + 17])], { size: 0.45, tone: "hi" }));
      }
    };
    stop(bx + 2, pre);
    stop(bx + BED_W - 8, post);
    (inner(name) > 0 ? post : pre).push(terminal(name, yc));
    return { pre: pre.join(""), post: post.join("") };
  }

  // Carro con su vehiculo, construido en x = 0. `kind`: "a" turismo, "b" camion.
  // `weight`: "lit" (el que conduce el lector), "hi" (el de otro jugador), "mid" (copia).
  function vehicle(yc, kind, { knob = false, weight = "mid" } = {}) {
    const lit = weight === "lit";
    const out = [];
    const base = { x: -11, y: yc - 9, w: 22, d: 18, r: 2.4 };
    out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(base, 2), RAIL_TOP, 0.1, P)}" style="filter:blur(3px)"/>`);
    out.push(S(k.slabOf(base, RAIL_TOP, 3, P, 4, 0.5), { tone: "mid" }));
    out.push(D([at([-8, yc - 7, CAR_Z]), at([8, yc - 7, CAR_Z])], { size: 0.4, tone: "lo" }));
    const tone = { tone: weight === "mid" ? "mid" : "hi", crease: "lo", lit };
    const wheel = (wx, y) => out.push(S(k.slabOf({ x: wx - 3.3, y, w: 6.6, d: 2.4, r: 1.1 }, CAR_Z, 6.6, P, 3), { tone: "lo", crease: "none" }));
    const hub = (wx) => out.push(L(k.sideRing([wx, yc + 8.4, CAR_Z + 3.3], 1.7, "y", P), { tone: "mid" }));
    wheel(-8, yc - 8.4);
    wheel(8, yc - 8.4);
    if (kind === "a") {
      out.push(S(k.slabOf({ x: -14, y: yc - 6.4, w: 28, d: 12.8, r: 3.4 }, CAR_Z + 2.6, 5.2, P, 5, 0.6), tone));
      const cabin = { x: -8, y: yc - 5.2, w: 14.5, d: 10.4, r: 2.8 };
      out.push(S(k.slabOf(cabin, CAR_Z + 7.8, 5.2, P, 5, 0.5), tone));
      out.push(L(k.planOutline(k.insetPlan(cabin, 2.2), CAR_Z + 13, P, 4), { tone: "faint" }));
      out.push(D([at([14, yc - 3.6, CAR_Z + 5]), at([14, yc + 3.6, CAR_Z + 5])], { size: 0.55, tone: "hi" }));
    } else {
      out.push(S(k.slabOf({ x: -14, y: yc - 6.4, w: 28, d: 12.8, r: 1.6 }, CAR_Z + 2.6, 2.4, P, 3), tone));
      const cargo = { x: -14, y: yc - 6.6, w: 17.5, d: 13.2, r: 1.2 };
      out.push(S(k.slabOf(cargo, CAR_Z + 5, 10, P, 3, 0.5), tone));
      out.push(L(k.planOutline(k.insetPlan(cargo, 2.2), CAR_Z + 15, P, 2), { tone: "faint" }));
      out.push(S(k.slabOf({ x: 4.6, y: yc - 5.8, w: 9.4, d: 11.6, r: 2.2 }, CAR_Z + 5, 7, P, 4, 0.5), tone));
      out.push(D([at([14, yc - 3.6, CAR_Z + 3.8]), at([14, yc + 3.6, CAR_Z + 3.8])], { size: 0.55, tone: "hi" }));
    }
    wheel(-8, yc + 6);
    wheel(8, yc + 6);
    hub(-8);
    hub(8);
    out.push(S(k.slabOf({ x: -1.2, y: yc + 9, w: 2.4, d: 5.4, r: 0.6 }, RAIL_TOP + 1, 1, P, 2), { tone: "mid", crease: "none" }));
    out.push(L(k.lineOnTop([0, yc + 9.6], [0, yc + 14.4], RAIL_TOP + 2, P), { tone: lit ? "lit" : weight }));
    if (knob) out.push(knobAt([7, yc + 12.4], RAIL_TOP + 0.4, 3.3, 5.6, [7, yc + 8.6]));
    return out.join("");
  }

  // Pomo moleteado, con un vastago opcional que lo une a la pieza que mueve.
  function knobAt([x, y], z, r, h, stem) {
    const out = [];
    if (stem) out.push(S(k.slabOf({ x: stem[0] - 1.4, y: stem[1], w: 2.8, d: 3, r: 0.6 }, z + 0.2, 2, P, 2), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(x, y, r, z, h, P, 22), { tone: "mid" }));
    out.push(L(k.knurl(x, y, r, z, z + h, Math.round(r * 5.5), P), { tone: "lo" }));
    out.push(L(k.ring(x, y, r * 0.4, z + h, P, 10), { tone: "lo" }));
    out.push(D([at([x, y, z + h])], { size: 0.45, tone: "hi" }));
    return out.join("");
  }

  // La caja central: cuerpo, costura, rejilla y prensaestopas. Lo de encima lo pone cada figura.
  function box({ glands = [-14, 14], led = true } = {}) {
    const back = glands.map((y) => S(k.slabOf({ x: BOX.x - 4, y: y - 3, w: 4, d: 6, r: 1 }, 0, 4, P, 2, 0.3), { tone: "mid" })).join("");
    const out = [];
    const seam = L(k.sideSeam(BOX, BOX_H - 4, P, 6), { tone: "lo" });
    out.push(S(k.slabOf(BOX, 0, BOX_H, P, 6, 1), { tone: "mid", inner: seam }));
    out.push(L(k.planOutline(k.insetPlan(BOX, 3), BOX_H, P, 6), { tone: "faint" }));
    out.push(D(k.corners(BOX, 5).map(([x, y]) => at([x, y, BOX_H])), { size: 0.45 }));
    const face = BOX.y + BOX.d;
    const top = Math.min(20, BOX_H - 10);
    const slots = [-12, -7, -2, 3, 8].map((x) => {
      const [a, b, c, d] = [[x, 8], [x + 2.4, 8], [x + 2.4, top], [x, top]].map(([px, pz]) => [px, face, pz]);
      return k.segment(a, b, P) + k.segment(b, c, P) + k.segment(c, d, P) + k.segment(d, a, P);
    });
    out.push(L(slots.join(""), { tone: "lo" }));
    if (led) out.push(D([at([15, face, BOX_H - 7])], { size: 0.6, tone: "hi" }));
    const front = glands.map((y) => S(k.slabOf({ x: BOX.x + BOX.w, y: y - 3, w: 4, d: 6, r: 1 }, 0, 4, P, 2, 0.3), { tone: "mid" })).join("");
    return back + out.join("") + front;
  }

  // Reloj de aguja sobre una cara horizontal. La aguja es una pieza viva: `needleD`.
  const needleD = ([x, y], r, z, frac) => {
    const angle = (-0.375 + 0.75 * frac) * Math.PI * 2;
    return k.lineOnTop([x - Math.sin(angle) * r * 0.2, y + Math.cos(angle) * r * 0.2], [x + Math.sin(angle) * r * 0.72, y - Math.cos(angle) * r * 0.72], z + 0.2, P);
  };
  function gauge(name, [x, y], r, z, { tone = "hi", frac = 0.5, h = 3 } = {}) {
    const out = [S(k.cylinder(x, y, r, z, h, P, 40, 0.5), { tone: "hi", crease: "lo" })];
    const top = z + h;
    out.push(L(k.ring(x, y, r - 1.4, top, P, 40), { tone: "lo" }));
    const ticks = k.radialTicks(x, y, r - 2, 20, 5, top, [1, 2], P, -0.375 * Math.PI * 2, 0.75 * Math.PI * 2);
    out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
    out.push(L(k.ring(x, y, 0.9, top, P, 10), { tone: "mid" }));
    out.push(`<path data-part="${name}" class="iso-line" data-tone="${tone}" data-free="start" d="${needleD([x, y], r, top, frac)}" style="stroke-width:1"/>`);
    return out.join("");
  }

  // Lo que toda figura necesita en la pagina: piezas, bucle, lectura y aviso de alto.
  const prelude = (name) => `
const P = ${JSON.stringify(P)};
const TICK = ${TICK}, HOP = ${HOP}, TRAVEL = ${TRAVEL}, START = ${START};
const BEDS = ${JSON.stringify(BEDS)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const say = (text) => { if (readout.textContent !== text) readout.textContent = text; stage.setAttribute("aria-valuetext", text); };
const move = (el, offset) => el.setAttribute("transform", translateAlong(P, offset));
const show = (el, on) => { el.style.display = on ? "" : "none"; };
const needleD = ([x, y], r, z, frac) => {
  const angle = (-0.375 + 0.75 * frac) * Math.PI * 2;
  return lineOnTop([x - Math.sin(angle) * r * 0.2, y + Math.cos(angle) * r * 0.2], [x + Math.sin(angle) * r * 0.72, y - Math.cos(angle) * r * 0.72], z + 0.2, P);
};
// Punto a una fraccion t de una ruta por puntos, para mover algo a lo largo de un cable.
const along = (points, t) => {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let rest = clamp(t, 0, 1) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (rest <= lengths[i] || i === lengths.length - 1) { const f = lengths[i] ? rest / lengths[i] : 0; return [points[i][0] + (points[i + 1][0] - points[i][0]) * f, points[i][1] + (points[i + 1][1] - points[i][1]) * f]; }
    rest -= lengths[i];
  }
};
// Bucle: step(dt, calm) devuelve true cuando ya no queda nada moviendose.
function loop(step) {
  let frame = 0, last = 0, visible = false;
  const tick = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const settled = step(dt, still.matches);
    frame = visible && !settled ? requestAnimationFrame(tick) : 0;
  };
  const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
  return run;
}
// Donde ha pulsado el lector, como fraccion del ancho de la figura.
const shareOf = (event) => { const b = svg.getBoundingClientRect(); return clamp((event.clientX - b.left) / b.width, 0, 1); };
// Dentro de una leccion la figura va en un iframe: le dice su alto a la pagina.
const report = () => parent.postMessage({ figura: "${name}", alto: document.documentElement.scrollHeight }, "*");
if (parent !== window) { report(); addEventListener("resize", report); addEventListener("load", report); }
`;

  // Escribe la pagina de la figura. `aria` describe el control para lectores de pantalla.
  function write(here, { name, fig, title, hint, readout, keys, caption, label, body, live, aria }) {
    const theme = process.argv.includes("--light") ? "light" : "dark";
    const svg = k.figureSvg({ width, height, label, body });
    const role = aria.role ?? "button";
    const range = role === "slider" ? ` aria-valuemin="${aria.min}" aria-valuemax="${aria.max}" aria-valuenow="${aria.now}"` : "";
    const page = k.plateHtml({
      fig, title, hint, readout, keys, caption,
      body: `<div class="iso-stage" tabindex="0" role="${role}" aria-label="${aria.label}"${range}>${svg}</div>`,
    });
    const file = theme === "light" ? `${name}-light.html` : `${name}.html`;
    writeFileSync(join(here, file), k.pageHtml({ title, theme, body: page, script: kitScript() + prelude(name) + live }));
    console.log("wrote", file);
  }

  return {
    P, at, S, L, D, byDepth, group, inner, innerEdge,
    PLATE, BED_W, BED_H, BEDS, RAIL_TOP, CAR_Z, START, BOX, BOX_H,
    plate, wire, routeToBox, bed, terminal, lane, vehicle, knobAt, box, gauge, needleD, write,
  };
}
