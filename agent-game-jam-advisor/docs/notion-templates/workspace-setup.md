# Notion Workspace Setup - Game Jam

Esta guía te ayuda a configurar un workspace de Notion optimizado para game jams de 48-72 horas.

---

## Estructura Recomendada

```
Game Jam Workspace/
├── Dashboard (Home)
├── GDD (Game Design Document)
├── Task Board (Kanban)
├── Asset Tracker
├── Bug Log
├── Schedule & Milestones
└── Resources
```

---

## 1. Dashboard (Home)

**Propósito:** Vista central con información crítica del proyecto.

### Contenido del Dashboard

```markdown
# [Nombre del Juego] - Dashboard

## Estado Actual
- **Milestone Actual:** [First Playable / Feature Complete / Polish]
- **Horas Restantes:** XX
- **Build Actual:** vX.X

## Enlaces Rápidos
- [GDD]
- [Task Board]
- [GitHub Repo]
- [Discord]

## Estadísticas
| Métrica | Valor |
|---------|-------|
| Tasks Completadas | X/Y |
| Bugs Abiertos | X |
| Assets Listos | X/Y |

## Equipo
- Game Designer: @nombre
- Programador: @nombre
- Modelador: @nombre
- Animador: @nombre
```

---

## 2. GDD (Game Design Document)

**Propósito:** Documentar la visión del juego de forma concisa.

### Template de GDD

```markdown
# GDD - [Nombre del Juego]

## Concepto
[1-2 párrafos describiendo el juego]

## Tema de la Jam
[Tema oficial y cómo lo interpretamos]

## Core Loop
1. [Acción 1]
2. [Acción 2]
3. [Resultado]
4. [Loop]

## Mecánicas

### Mecánica Principal
- Descripción:
- Input:
- Feedback:

### Mecánicas Secundarias
- [Mecánica 2]
- [Mecánica 3]

## Win/Lose Conditions
- **Win:** [Condición de victoria]
- **Lose:** [Condición de derrota]

## Controles
| Acción | Teclado | Gamepad |
|--------|---------|---------|
| Mover | WASD | Left Stick |
| Saltar | Space | A |
| Atacar | Click | X |

## Arte y Estilo
- **Estilo visual:** [Low-poly, pixel art, etc.]
- **Paleta de colores:** [Colores principales]
- **Referencias:** [Links/imágenes]

## Audio
- **Música:** [Estilo, mood]
- **SFX críticos:** [Lista]

## Scope

### P0 - MVP (Must Have)
- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

### P1 - High (Should Have)
- [ ] [Feature 4]
- [ ] [Feature 5]

### P2-P3 - Nice to Have
- [ ] [Feature 6]
- [ ] [Feature 7]
```

---

## 3. Task Board (Kanban)

**Propósito:** Gestionar tareas del equipo visualmente.

### Columnas Recomendadas

```
Backlog | Ready | In Progress | Review | Done
```

### Propiedades de Cada Tarea

- **Título:** Nombre de la tarea
- **Asignado a:** Miembro del equipo
- **Prioridad:** P0 / P1 / P2 / P3
- **Tipo:** Feature / Bug / Asset / Design
- **Rol:** Programador / Modelador / Animador / Designer
- **Sprint:** Day 1 / Day 2 / Day 3
- **Estado:** Backlog / Ready / In Progress / Review / Done
- **Estimación:** Horas
- **Bloqueado por:** Link a otra tarea

### Vistas Útiles

1. **Por Rol:** Filtrar tareas por rol asignado
2. **Por Prioridad:** Ordenar por P0 → P3
3. **Por Sprint:** Ver tareas del día actual
4. **Timeline:** Vista de calendario

---

## 4. Asset Tracker

**Propósito:** Inventario de todos los assets del proyecto.

### Propiedades de Assets

- **Nombre:** Nombre del asset
- **Tipo:** Modelo / Animación / SFX / Música / UI / Textura
- **Estado:** Pendiente / En Progreso / Listo / Integrado
- **Asignado a:** Artista responsable
- **Prioridad:** P0 / P1 / P2 / P3
- **Feature asociada:** Link a Feature Request
- **Archivo:** Adjunto o link al archivo
- **Notas:** Especificaciones técnicas

### Vistas Útiles

1. **Por Tipo:** Ver solo modelos, solo animaciones, etc.
2. **Por Estado:** Ver qué falta entregar
3. **Por Rol:** Ver assets de cada artista

---

## 5. Bug Log

**Propósito:** Trackear todos los bugs encontrados.

### Propiedades de Bugs

- **Título:** Descripción corta del bug
- **Severidad:** P0-Critical / P1-High / P2-Medium / P3-Low
- **Estado:** Abierto / En Progreso / Resuelto / Won't Fix
- **Reportado por:** Quien encontró el bug
- **Asignado a:** Quien lo arreglará
- **Pasos para reproducir:** Texto
- **Build:** Versión donde ocurre
- **Screenshot/Video:** Adjunto

### Priorización de Bugs

```
P0-Critical: Juego no funciona, crashea, bloqueante
P1-High: Gameplay afectado significativamente
P2-Medium: Bug notable pero jugable
P3-Low: Cosmético o menor
```

---

## 6. Schedule & Milestones

**Propósito:** Timeline del proyecto con checkpoints.

### Milestones Obligatorios (48h Jam)

```
| Milestone | Hora | Descripción |
|-----------|------|-------------|
| Kick-off | 0 | Inicio de la jam |
| First Playable | 8 | Juego básico funcional |
| Feature Complete | 36 | Todas las mecánicas listas |
| Code Freeze | 45 | NO más código |
| Submission | 48 | Entrega final |
```

### Stand-ups

Programar recordatorios cada 6-8 horas:
- ¿Qué completaste?
- ¿Qué harás ahora?
- ¿Hay blockers?

---

## 7. Resources

**Propósito:** Links útiles y referencias rápidas.

### Contenido Sugerido

```markdown
## Assets Gratuitos
- [Kenney.nl](https://kenney.nl) - Props, UI, audio
- [Mixamo](https://mixamo.com) - Personajes y animaciones
- [Freesound](https://freesound.org) - SFX
- [Incompetech](https://incompetech.com) - Música

## Documentación
- [Unity Manual](https://docs.unity3d.com)
- [Blender Manual](https://docs.blender.org)

## Herramientas
- [Audacity](https://audacityteam.org) - Edición de audio
- [BFXR](https://www.bfxr.net) - Generador de SFX
- [Figma](https://figma.com) - Diseño de UI

## Tutoriales Clave
- [Lista de videos relevantes]

## Atajos
- [Atajos de Blender]
- [Atajos de Unity]
```

---

## Setup Rápido (30 minutos)

### Implementación Mínima

Si tienes poco tiempo, crea solo:

1. **Dashboard** (5 min) - Copia el template
2. **GDD** (10 min) - Llena la información básica
3. **Task Board** (10 min) - Crea tareas P0
4. **Schedule** (5 min) - Marca milestones

### Implementación Completa

Si tienes tiempo antes de la jam:

1. Crea todas las páginas
2. Configura las propiedades
3. Crea vistas filtradas
4. Agrega el equipo al workspace
5. Haz un walkthrough con el equipo

---

## Tips para Game Jams

1. **Simplicidad > Complejidad:** No sobre-documentes
2. **Actualiza en tiempo real:** Notion debe reflejar el estado actual
3. **Links bidireccionales:** Conecta GDD con Tasks con Assets
4. **Mobile-friendly:** Usa Notion app para updates rápidos
5. **No duplicar con GitHub:** Usa Issues para bugs, Notion para planning

---

**Recuerda:** El propósito de Notion es mantener al equipo sincronizado, no crear documentación perfecta. Done is better than perfect.
