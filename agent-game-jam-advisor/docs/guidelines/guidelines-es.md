# Guía Completa - Game Jam con Unity 6

## Resumen Ejecutivo

Esta guía proporciona todo lo necesario para que un equipo de 4 personas (Game Designer, Programador, Modelador 3D, Animador) complete exitosamente una game jam de 48-72 horas usando Unity 6.

**Principio fundamental:** Done is better than perfect.

---

## 1. Operaciones del Equipo

### Estructura del Equipo

| Rol | Responsabilidades |
|-----|-------------------|
| Game Designer | Concepto, GDD, level design, testing, audio |
| Programador | Unity, C#, integración, builds, Git |
| Modelador 3D | Assets 3D, Blender, exportación FBX |
| Animador | Rigging, Mixamo, animaciones, Unity Animator |

### Comunicación

**Stand-ups cada 6-8 horas:**
1. ¿Qué completaste?
2. ¿Qué harás ahora?
3. ¿Hay algo que te bloquea?

**Canales:**
- Discord/Slack para chat rápido
- GitHub Issues para tareas formales
- Notion para documentación

### Pipeline de Trabajo

```
Game Designer → Define mecánica y crea GDD
       ↓
Modelador → Crea assets 3D
       ↓
Animador → Rigea y anima
       ↓
Programador → Integra en Unity
       ↓
Game Designer → Testing e iteración
```

---

## 2. Gestión de Tareas

### Sistema de Priorización P0-P3

| Prioridad | Descripción | Deadline |
|-----------|-------------|----------|
| P0 | Sin esto NO hay juego | First Playable (Hora 8) |
| P1 | Mejora significativamente | Feature Complete (Hora 36) |
| P2 | Nice to have | Solo si hay tiempo |
| P3 | Cut first | Probablemente no entra |

### Milestones Críticos (48h Jam)

```
Hora 0-3: Planificación y GDD
Hora 8: FIRST PLAYABLE - Juego básico funcional
Hora 36: FEATURE COMPLETE - Todas las mecánicas
Hora 45: CODE FREEZE - NO tocar código
Hora 48: SUBMISSION - Entrega final
```

### Reglas de Oro

1. Si no hay First Playable a hora 12 → Cortar scope YA
2. Después de Feature Complete → NO features nuevas
3. Code Freeze es sagrado → Usar última build estable si hay problemas

---

## 3. Game Design Document (GDD)

### Template Mínimo

```markdown
# [Nombre del Juego]

## Concepto
[1-2 párrafos]

## Core Loop
1. [Acción]
2. [Resultado]
3. [Loop]

## Mecánica Principal
[Descripción detallada]

## Win/Lose
- Win: [Condición]
- Lose: [Condición]

## Scope MVP (P0)
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
```

### Validación del Scope

Antes de empezar, pregúntate:
- ¿Puedo explicar el juego en 1 frase?
- ¿La mecánica principal es técnicamente factible?
- ¿El scope es realista para 48h?
- ¿Cada feature es realmente necesaria?

---

## 4. Plan Operacional

### Día 1 (Horas 0-24)

**Horas 0-3: Setup**
- Crear proyecto Unity
- Configurar Git
- Crear GDD y tasks en GitHub

**Horas 3-8: Core Gameplay**
- Implementar mecánica principal
- Assets placeholder
- → META: First Playable

**Horas 8-24: Features P1**
- Implementar features secundarias
- Integrar assets
- Testing continuo

### Día 2 (Horas 24-48)

**Horas 24-36: Contenido y Polish**
- Level design
- Audio integration
- → META: Feature Complete

**Horas 36-45: Bug Fixing**
- Solo fixes, NO features nuevas
- Polish visual/audio
- → META: Code Freeze (Hora 45)

**Horas 45-48: Submission**
- Builds finales
- Testing
- Upload a plataforma

---

## 5. Recursos y Herramientas

### Assets Gratuitos

| Recurso | Contenido |
|---------|-----------|
| Kenney.nl | Props, UI, audio |
| Mixamo | Personajes, animaciones |
| Freesound.org | SFX |
| Incompetech | Música |
| Poly Haven | Texturas, HDRIs |

### Software

| Herramienta | Uso |
|-------------|-----|
| Unity 6 | Motor de juego |
| Blender | Modelado y animación |
| Visual Studio/Rider | Programación C# |
| Git + GitHub | Control de versiones |
| Audacity | Edición de audio |
| Figma | Diseño de UI |

---

## 6. Troubleshooting Rápido

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| Escala incorrecta de modelo | Blender: Ctrl+A → All Transforms antes de exportar |
| Animación no se reproduce | Verificar Animator Controller asignado y parámetros |
| Git conflict en escenas | Dividir en múltiples escenas, comunicar antes de editar |
| Build falla | Verificar escenas en Build Settings, errores en consola |
| Performance baja | Reducir poly count, optimizar scripts, usar profiler |

### Crisis Management

**Si van atrasados:**
1. Evaluar: ¿Cuántas horas quedan?
2. Cortar: Features P2/P3 primero
3. Priorizar: Solo P0
4. Comunicar: Todos deben saber el nuevo plan

**Si hay bugs críticos cerca del deadline:**
1. ¿Es realmente P0?
2. ¿Hay workaround?
3. Si no se puede arreglar → Usar última build estable

---

## 7. Checklist Final

### Antes de Submission

**Funcionalidad:**
- [ ] Juego inicia sin errores
- [ ] Controles funcionan
- [ ] Win/Lose conditions funcionan
- [ ] Se puede jugar de inicio a fin

**Polish:**
- [ ] Menú principal
- [ ] Audio integrado
- [ ] UI legible
- [ ] Al menos 1 nivel completo

**Submission:**
- [ ] Build funcional
- [ ] Screenshots
- [ ] Descripción escrita
- [ ] Controles documentados
- [ ] Créditos del equipo
- [ ] Subido antes del deadline

---

## Filosofía Final

> **Un juego simple terminado siempre vence a un juego ambicioso sin terminar.**

La única forma de fallar una game jam es no entregar. Todo lo demás es aprendizaje.

**Done is better than perfect. Siempre.**
