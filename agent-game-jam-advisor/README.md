# gameJamAdvisor v2.0

> Agente multi-modo que transforma equipos Junior con ideas ambiciosas en equipos que entregan juegos completos en 48 horas

## Novedades en v2.0

Esta versión introduce el **Sistema de Modos**, permitiendo que el agente se especialice según el rol del usuario:

| Modo | Especialización |
|------|-----------------|
| **Coordinador** | Planificación, scope management, milestones |
| **Programador** | Unity 6, C#, integración, Git, builds |
| **Game Designer** | GDD, level design, audio, UI/UX |
| **Animador** | Rigging, Mixamo, Animation Controllers |
| **Modelador** | Blender, low-poly, pipeline FBX |

---

## Instalación

```bash
npm install @genzai_cloud/agent-game-jam-advisor
```

---

## Uso con Claude Code

### 1. Instalar en tu proyecto

```bash
cd mi-proyecto-unity
npm install @genzai_cloud/agent-game-jam-advisor
```

### 2. Iniciar Claude Code

```bash
claude
```

### 3. Activar el agente

```
Usuario: "Usa la documentación de gameJamAdvisor para asesorarme"

Agente: "¡Hola! Soy tu asesor de game jam. Para darte la mejor ayuda posible, necesito saber:

¿Qué rol desempeñas en el equipo?

1. Coordinador - Planificación, scope y gestión
2. Programador - Unity, C#, integración
3. Game Designer - GDD, level design, audio
4. Animador - Rigging, animaciones, Mixamo
5. Modelador - Assets 3D, Blender

Responde con el número o nombre del rol."
```

### 4. Seleccionar modo

```
Usuario: "Soy el Programador"

Agente: "Perfecto, modo Programador activado. ¿En qué puedo ayudarte?"
```

### Cambiar de modo

En cualquier momento puedes decir:
- `"Modo: Game Designer"`
- `"Cambiar a modo Animador"`
- `"Ahora necesito ayuda como Modelador"`

---

## Estructura de Archivos

```
gameJamAdvisor/
├── README.md                    # Este archivo
├── prompt-principal.md          # Core del agente + sistema de modos
│
├── modos/                       # Conocimiento especializado por rol
│   ├── modo-coordinador.md      # Planificación y gestión
│   ├── modo-programador.md      # Unity, C#, Git
│   ├── modo-game-designer.md    # GDD, level design, audio
│   ├── modo-animador.md         # Rigging, Mixamo, animations
│   └── modo-modelador.md        # Blender, low-poly, FBX
│
├── fases/                       # Fases de coordinación (Modo Coordinador)
│   ├── fase-1-analisis-scope.md
│   ├── fase-2-planificacion-operacional.md
│   ├── fase-3-ejecucion-coordinacion.md
│   └── fase-4-polish-submission.md
│
└── docs/                        # Documentación adicional
    ├── github-templates/        # Templates de issues
    ├── notion-templates/        # Setup de workspace Notion
    └── guidelines/              # Guías completas (ES/EN)
```

---

## Los 5 Modos

### Modo Coordinador

Para el **líder del equipo** o quien gestiona el proyecto.

**Incluye:**
- Sistema de 4 fases (Análisis → Planificación → Ejecución → Polish)
- Frameworks de scope management (P0-P3)
- Milestones críticos (First Playable, Feature Complete, Code Freeze)
- Gestión de crisis y decisiones difíciles

### Modo Programador

Para el **desarrollador Unity/C#** del equipo.

**Incluye:**
- Arquitectura simple para game jams
- Code snippets útiles (Singleton, Object Pooling, Player Controller)
- Git workflow para equipos
- Integración de assets y Animator Controllers
- Troubleshooting técnico

### Modo Game Designer

Para quien define el **concepto y experiencia** del juego.

**Incluye:**
- Templates de GDD
- Principios de level design
- Gestión de audio (fuentes gratuitas, Audacity)
- Diseño de UI/UX
- Testing y feedback loops

### Modo Animador

Para quien da **vida y movimiento** a los personajes.

**Incluye:**
- Workflow completo con Mixamo
- Rigging manual en Blender
- Configuración de Animator Controllers
- Animation Events
- Blend Trees

### Modo Modelador

Para quien crea los **assets visuales 3D**.

**Incluye:**
- Técnicas de modelado low-poly
- Pipeline Blender → Unity
- UV mapping rápido
- Naming conventions
- Optimización de assets

---

## Documentación Incluida

### GitHub Templates (`docs/github-templates/`)

Templates listos para usar en tu repositorio:
- `feature_request.md` - Nuevas funcionalidades
- `bug_report.md` - Reporte de errores
- `asset_request.md` - Solicitud de assets
- `design_task.md` - Tareas de diseño

### Notion Templates (`docs/notion-templates/`)

Guía para configurar un workspace completo:
- Dashboard
- GDD
- Task Board (Kanban)
- Asset Tracker
- Bug Log
- Schedule

### Guidelines (`docs/guidelines/`)

Guías completas disponibles en:
- Español (`guidelines-es.md`)
- English (`guidelines-en.md`)
- Italiano (`guidelines-it.md`)

---

## Filosofía Central

### Done is Better than Perfect

La única forma de fallar una game jam es **no terminar**. Este agente existe para asegurar que cruces la línea de meta con un juego jugable.

### Milestones Críticos

| Milestone | Hora | Regla |
|-----------|------|-------|
| First Playable | 8 | Si no llegas, el scope es muy grande |
| Feature Complete | 36 | NO features nuevas después |
| Code Freeze | 45 | NO tocar código |

### Scope Management

```
P0 (Critical)  → Debe estar en First Playable
P1 (High)      → Debe estar en Feature Complete
P2 (Medium)    → Solo si hay tiempo
P3 (Low)       → Se corta primero
```

---

## Para Quién Es

**Perfil del equipo:**
- 4 personas: Game Designer, Programador, Modelador 3D, Animador
- Nivel: Junior (1-2 jams completadas máximo)
- Duración: 48-72 horas
- Engine: Unity 6
- Assets: Blender, Mixamo
- Project Management: GitHub Issues + Notion

---

## Para Quién NO Es

- Equipos Senior/Expertos
- Jams de más de 1 semana
- Equipos que no están dispuestos a cortar features
- Proyectos que priorizan exploración creativa sobre entrega

---

## Recursos Integrados

El agente tiene conocimiento de:
- **Unity 6**: C# scripting, Animator, Physics, UI
- **Blender**: Modelado, UV mapping, exportación FBX
- **Mixamo**: Auto-rigging, biblioteca de animaciones
- **Git**: Workflow para game jams, .gitignore
- **itch.io**: Proceso de submission
- **Assets gratuitos**: Kenney, Mixamo, Freesound, Incompetech

---

## Ejemplo de Sesión

```
[Inicio]
Usuario: "Usa gameJamAdvisor"
Agente: "¿Qué rol desempeñas?"
Usuario: "Programador"

[Durante la jam]
Usuario: "Las animaciones no se reproducen en Unity"
Agente: "Checklist rápido:
1. ¿Animator Controller asignado al GameObject?
2. ¿Los parámetros del Animator coinciden con tu código?
3. ¿Las transiciones tienen condiciones correctas?
..."

[Hora 40]
Usuario: "Quiero agregar un power-up de velocidad"
Agente: "ALTO. Están después de Feature Complete.
Agregar features ahora es un RIESGO.
Enfóquense en:
✅ Bug fixing
✅ Polish
❌ Features nuevas"
```

---

## Contribuir

1. Usa el agente en una jam real
2. Documenta qué funcionó y qué no
3. Abre un issue con tus observaciones
4. Propón mejoras específicas

---

## Versión

**Versión**: 2.0.0
**Fecha**: 2026-01-18
**Engine target**: Unity 6
**Cambios**: Sistema de modos multi-rol

---

## Licencia

MIT License - Parte del proyecto [genzai-agents](https://github.com/fabroche/genzai-agents)

---

**Recuerda**: La única forma de fallar una game jam es no terminar. Este agente existe para asegurar que cruces la línea de meta con un juego jugable.

**Done is better than perfect. Siempre.**
