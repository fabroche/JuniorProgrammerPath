// Para las comprobaciones: el navegador de pruebas de esta maquina declara
// movimiento reducido, y con el las figuras no se animan. Cargado con
// `drive.mjs --preload`, hace que la pagina crea que no esta activado.
const original = window.matchMedia.bind(window);
window.matchMedia = (query) => query.includes("reduced-motion")
  ? { matches: false, media: query, addEventListener() {}, removeEventListener() {} }
  : original(query);
