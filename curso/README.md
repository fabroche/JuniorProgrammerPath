# Curso de multijugador en Unity

Ruta de estudio que sigue el vídeo de Code Monkey
[Learn Unity Multiplayer](https://www.youtube.com/watch?v=7glCsF9fv3s)
capítulo a capítulo y aplica cada concepto en el juego de vehículos de este
repositorio, con las versiones instaladas (Netcode for GameObjects 2.x).

El generador y el sistema de diseño vienen del curso de Ansible de Genzai.

## Uso

Doble clic en `abrir.bat`: genera el curso, lo sirve en
<http://localhost:8765> y lo abre en el navegador. Se para con Ctrl+C.

Hace falta servirlo porque YouTube rechaza su reproductor en una página
abierta como fichero suelto (error 153), y el vídeo va incrustado en cada
lección.

A mano:

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python generar.py            # solo genera dist/
.venv/Scripts/python generar.py --servir   # genera, sirve y abre
```

## Estructura

```
curso/
├── ruta.yml                    los módulos y el tramo del vídeo de cada uno
├── contenido/M00/01-....md     una lección = un Markdown
├── contenido/M00/01-....svg    su portada, con el mismo nombre
├── plantillas/
│   ├── base.html.j2            el cascarón común
│   ├── concepto.html.j2        una plantilla por tipo de lección
│   └── indice.html.j2          pinta la ruta entera, con lo pendiente
├── estilos/design-system.css   sistema de diseño
├── generar.py
├── descargar_fuente.py         baja la transcripción a fuente/ (no se versiona)
└── dist/                       salida (no se versiona)
```

## La dinámica

- **Híbrido.** El capítulo del vídeo es el caso resuelto, sobre *Kitchen Chaos*.
  El laboratorio aplica el mismo concepto en el juego de vehículos.
- **No se escribe por delante.** La siguiente lección se escribe cuando la
  anterior está leída o ejecutada.
- **La fricción se anota, no se interrumpe.** Las dudas y tropiezos de un
  laboratorio van a `NOTAS-PENDIENTES.md` (fuera de `contenido/`, porque el
  generador trata todo `.md` de ahí como lección) y se integran al terminar.
- **El código del juego lo escribe el alumno.** Las lecciones explican y dan
  esqueletos; no se edita `Assets/` desde aquí.

## Escribir una lección

Front-matter obligatorio: `modulo`, `leccion`, `tipo`, `titulo`.
Opcional: `resumen`, `duracion`, `objetivos`, `fuentes`.

`video` es obligatorio en las lecciones de tipo `concepto`: la lista de tramos
del vídeo que cubre. Las horas van entre comillas para que YAML no las lea como
números.

```yaml
video:
  - titulo: "Sync Player Movement, Client Vs Server Auth"
    inicio: "00:42:26"
    fin: "00:54:20"
```

Bloques disponibles:

### Comunes

| Directiva | Para qué |
|---|---|
| `::: natural` | Explicación en lenguaje llano. **Siempre seguida de `::: tecnico`** |
| `::: tecnico` | La misma idea en lenguaje preciso |
| `::: clave` | Lo que hay que retener |
| `::: ojo` | Trampa o excepción |
| `::: nota` | Apunte secundario |
| `::: hoy` | Lo que cambió entre el vídeo (2023) y la versión instalada |
| `::: porque` | Por qué algo es necesario |
| `::: contraejemplo` | Bloque diff «así no / así sí» |
| `::: vocabulario` | Lista de definiciones (`término` + línea `: definición`) |
| `::: figura nombre` | Incrusta la figura de anatomy `figuras/nombre/` |

### Del tipo `lab`

| Directiva | Para qué |
|---|---|
| `::: prerrequisitos` | Checklist de lo que hace falta antes de empezar |
| `::: paso Título` | Paso numerado automáticamente |
| `::: esperado` | Lo que se debe ver. No lleva botón de copiar ni resaltado |
| `::: verificar` | Checkpoint con casillas |
| `::: problema Mensaje de error` | Desplegable de troubleshooting |

## La portada de cada lección

Un SVG de 1280×720 con el mismo nombre que el Markdown, dibujado para el tema
de esa lección. Es la carátula del reproductor y la imagen de la ficha en el
índice. Sin texto, y con el quinto inferior despejado: ahí va superpuesto el
rótulo del capítulo. Si falta, el generador avisa y usa un fondo liso.

## Anidar bloques: el contenedor de fuera lleva más dos-puntos

Un bloque se cierra con la **primera** línea de cierre que encuentra, así que un
contenedor que envuelve a otros necesita un marcador más largo que el de dentro.
En la práctica esto solo afecta a `paso`, que contiene `porque`, `esperado` y
avisos:

```markdown
:::: paso Añadir el NetworkObject

::: porque
Explicación.
:::

::: esperado
Lo que se ve.
:::
::::
```

Si ves `:::` sueltos en el HTML, es esto.

## Las reglas que el generador hace cumplir

El generador **aborta** si se incumplen:

1. **Todo `::: natural` va seguido de un `::: tecnico`.** Cada idea se explica
   en los dos registros.
2. **Todo `::: paso` de un lab contiene un `::: porque`.** Un laboratorio que
   solo dice qué pulsar produce a alguien que sabe copiar pasos.
3. **Toda lección de `concepto` declara su tramo de `video`.** El curso sigue al
   vídeo; una lección que no apunta a ningún capítulo se ha salido de la ruta.
4. **El `modulo` de cada lección existe en `ruta.yml`.**

Las casillas `- [ ]` son clicables y su estado se guarda en `localStorage` por
página.

## Tipos de lección

Se añade la plantilla de cada tipo la primera vez que una lección lo necesita.

| Tipo | Estado |
|---|---|
| `concepto` | Implementado |
| `lab` | Implementado |
| `referencia` | Implementado |
| `checkpoint` | Pendiente — cierre de cada módulo |
| `ejercicio` | Pendiente |

## Figuras de anatomy

Una por módulo, para el mecanismo central. Cada figura es una carpeta en
`figuras/` con su `build.mjs`, que usa el kit de la skill instalada en
`.claude/skills/anatomy` y escribe dos páginas, una por tema:

```bash
node figuras/copias-por-maquina/build.mjs
node figuras/copias-por-maquina/build.mjs --light
```

Las dos páginas se versionan, así el curso se genera sin Node. En la lección
se incrusta con `::: figura copias-por-maquina` y el generador aborta si no
están construidas.

## Fuentes

Documentación oficial de Unity de la versión instalada
(`docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13`) como fuente
primaria. El vídeo y cualquier otra se marcan con `secundaria: true`.

La transcripción en `fuente/` es material del autor del vídeo: sirve para
consultarla al escribir cada lección y no se versiona.
