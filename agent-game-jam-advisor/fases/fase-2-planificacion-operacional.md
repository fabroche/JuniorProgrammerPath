# FASE 2: Planificación Operacional

## Objetivo de esta Fase

Convertir el GDD aprobado en un plan de acción concreto: quién hace qué, cuándo, y cómo se comunican.

**Input**: GDD simplificado + Features priorizadas de Fase 1

**Output**: Plan operacional día por día + Issues de GitHub creados + Sistema de comunicación establecido

**Duración**: Horas 0-3 de la jam (o última sesión pre-jam)

## El Problema que Resuelves

¿No les ha pasado que tienen una idea clara de qué hacer, pero luego durante la jam todos están confundidos sobre qué les toca, qué necesitan de otros, y qué está bloqueando el progreso?

Esto pasa porque tienen un **GDD pero no un PLAN OPERACIONAL**.

GDD = QUÉ van a hacer
Plan Operacional = QUIÉN hace QUÉ, CUÁNDO, y cómo se COORDINAN

Esta fase transforma el documento estático en un sistema vivo de trabajo.

## Proceso de Planificación

### Paso 1: Setup del Repositorio y Herramientas

Antes de planificar features, asegúrate que las herramientas están listas.

#### GitHub Repository

```bash
1. Crear repositorio (si no existe):
   - Nombre: [nombre-juego]-gamejam
   - Privado o Público (según reglas de la jam)
   - .gitignore: Unity template (CRÍTICO)

2. Clonar en máquinas de todos:
   git clone [url]

3. Verificar que funciona:
   - Cada persona hace commit de prueba
   - Todos hacen pull
   - Si hay problemas, resolverlos AHORA

4. Estructura de branches (simple para jams):
   - main: Siempre funcional, solo merges aprobados
   - develop: Trabajo activo
   - feature/[nombre]: Features individuales (opcional para jams)
```

**.gitignore para Unity** (CRÍTICO):
```
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
.vs/
*.csproj
*.sln
```

¿Por qué crítico? Porque sin .gitignore correcto, el repo será enorme, los pulls tomarán siglos, y habrá conflictos constantes.

#### GitHub Issues + Projects

```
1. Activar GitHub Issues en el repo

2. Crear GitHub Project:
   - Name: [Nombre Juego] - Game Jam
   - Template: Board (Kanban)
   - Columns: Backlog | To Do | In Progress | Done

3. Crear Labels:
   - P0-critical (rojo)
   - P1-high (naranja)
   - P2-medium (amarillo)
   - P3-low (verde)
   - feature (azul)
   - bug (rojo oscuro)
   - asset (morado)
   - blocked (negro)

Script rápido para crear labels (ejecutar en repo):
```

```bash
gh label create "P0-critical" --color "d73a4a" --description "Critical for MVP"
gh label create "P1-high" --color "ff6b6b" --description "High priority"
gh label create "P2-medium" --color "ffd93d" --description "Medium priority"
gh label create "P3-low" --color "6bcf7f" --description "Low priority"
gh label create "feature" --color "0075ca" --description "New feature"
gh label create "bug" --color "d73a4a" --description "Bug report"
gh label create "asset" --color "a44afe" --description "Asset request"
gh label create "blocked" --color "000000" --description "Blocked by dependency"
```

#### Canal de Comunicación

```
1. Discord/Slack channel dedicado

2. Pines obligatorios en el canal:
   - Link al GDD
   - Link a GitHub Project
   - Horarios de Stand-ups
   - Milestones y Deadlines

3. Reglas del canal:
   - Blockers se comunican INMEDIATAMENTE
   - @everyone solo para urgencias
   - Compartir builds aquí para testing
```

### Paso 2: Crear Issues de GitHub

Ahora viene lo importante: transformar cada feature del GDD en issues accionables.

#### Template: Feature Request

```markdown
**Título**: [Feature] - [Nombre descriptivo]

**Descripción**:
[Qué hace esta feature en 2-3 líneas]

**Criterios de Aceptación**:
- [ ] [Criterio 1 - qué debe funcionar]
- [ ] [Criterio 2]
- [ ] [Criterio 3]

**Assets Necesarios** (si aplica):
- [ ] [Asset 1] - Issue #X
- [ ] [Asset 2] - Issue #Y

**Prioridad**: P0-critical / P1-high / P2-medium / P3-low

**Milestone**: First Playable / Feature Complete

**Asignado a**: @[usuario]

**Estimación**: [horas]

**Dependencias**:
- Bloqueado por: #[issue number]
- Bloquea a: #[issue number]

**Notas Técnicas**:
[Cualquier detalle de implementación importante]
```

**EJEMPLO REAL**:

```markdown
**Título**: [Feature] - Player Movement & Jump

**Descripción**:
Implementar movimiento básico del jugador (WASD) y mecánica de salto con física realista.

**Criterios de Aceptación**:
- [ ] Player se mueve horizontalmente con WASD
- [ ] Player salta con Espacio
- [ ] Player tiene gravedad y cae al vacío
- [ ] Animaciones básicas (idle, walk, jump) funcionan
- [ ] Camera sigue al player suavemente

**Assets Necesarios**:
- [ ] Player model (low-poly) - Issue #5
- [ ] Player animations (idle, walk, jump) - Issue #6

**Prioridad**: P0-critical

**Milestone**: First Playable (Hora 8)

**Asignado a**: @programador

**Estimación**: 3 horas

**Dependencias**:
- Bloqueado por: #5 (Player model) - Contingency: Usar cápsula placeholder
- Bloquea a: #3 (Dash mechanic)

**Notas Técnicas**:
- Usar CharacterController de Unity (no Rigidbody)
- Jump force: ~10f (ajustar en testing)
- Move speed: ~5f (ajustar en testing)
- Usar Input.GetAxisRaw para movimiento responsive
```

#### Template: Asset Request

```markdown
**Título**: [Asset] - [Tipo] - [Nombre]

**Descripción**:
[Qué asset se necesita en 1-2 líneas]

**Especificaciones Técnicas**:
- Tipo: Model / Animation / Texture / Audio
- Formato: FBX / PNG / WAV / OGG
- Poly count (3D): [número] tris
- Dimensiones (2D): [ancho]x[alto] px
- Estilo: [low-poly, flat colors, etc.]

**Referencias Visuales**:
[Links o descripciones de ejemplos]

**Para qué Feature**:
Necesario para Issue #[número] - [nombre feature]

**Prioridad**: P0 / P1 / P2 / P3

**Deadline**: Hora [X] (para [milestone])

**Asignado a**: @[modelador/animador]

**Estimación**: [horas]

**Contingency Plan**:
Si no está listo a tiempo: [Usar placeholder X / Usar asset gratuito Y]
```

**EJEMPLO REAL**:

```markdown
**Título**: [Asset] - Model - Player Character

**Descripción**:
Modelo low-poly del personaje jugador (humanoide simple)

**Especificaciones Técnicas**:
- Tipo: Model
- Formato: FBX
- Poly count: 3000-5000 tris máximo
- Escala: ~1.8 unidades de altura en Unity
- Estilo: Low-poly, colores flat, sin texturas complejas
- Debe estar en T-pose para rigging

**Referencias Visuales**:
- Estilo similar a: Kenney.nl character packs
- Forma simple, proporciones caricaturescas
- Colores: Azul/Blanco (tema del juego)

**Para qué Feature**:
Necesario para Issue #2 - Player Movement & Jump

**Prioridad**: P0-critical

**Deadline**: Hora 6 (para integración antes de First Playable Hora 8)

**Asignado a**: @modelador

**Estimación**: 2-3 horas

**Contingency Plan**:
Si no está listo a Hora 6: Descargar character de Mixamo como placeholder
```

#### Crear Issues para Todo el P0

Haz esto sistemáticamente:

```
1. Revisa el GDD
2. Por cada feature P0, crea un Feature Request issue
3. Por cada asset necesario para P0, crea un Asset Request issue
4. Vincula assets a features (dependencies)
5. Asigna a responsables
6. Agrega a milestone "First Playable"
```

**EJEMPLO DE SET COMPLETO** (juego de plataformas con dash):

```
Issues P0 (First Playable - Hora 8):

#1 [Feature] - Unity Project Setup - @programador - 1h
#2 [Feature] - Player Movement & Jump - @programador - 3h
#3 [Feature] - Dash Mechanic - @programador - 2h
#4 [Feature] - Death System (fall off world) - @programador - 1h
#5 [Asset] - Player Model - @modelador - 2h
#6 [Asset] - Player Animations (idle,walk,jump,dash) - @animador - 3h (con Mixamo)
#7 [Feature] - Level 1 Blockout - @gamedesigner - 2h
#8 [Feature] - Crystal Collectible - @programador - 1h
#9 [Feature] - Basic Camera Controller - @programador - 1h

Total estimado: ~16 horas de trabajo
Distribuido en 4 personas: ~4 horas promedio
Target: Hora 8
Buffer: Hora 8-12 para resolución de bugs

Issues P1 (Feature Complete - Hora 36):

#10 [Feature] - UI (Lives, Dash Cooldown) - @programador - 2h
#11 [Feature] - Checkpoint System - @programador - 2h
#12 [Feature] - Level 2 & 3 - @gamedesigner - 4h
#13 [Asset] - Environment Assets (platforms, obstacles) - @modelador - 3h
#14 [Feature] - Audio Integration - @gamedesigner - 2h
#15 [Asset] - Audio (music + 5 SFX) - @gamedesigner - 2h
#16 [Feature] - Main Menu - @programador - 2h

... y así sucesivamente
```

### Paso 3: Plan Día por Día

Ahora crea un cronograma visual para el equipo.

#### Template de Plan (Jam de 48h)

```markdown
# Plan Operacional - [Nombre Juego] - 48h Game Jam

## Milestone Checkpoints
- ⏰ First Playable: Hora 8 (Día 1 noche)
- ⏰ Feature Complete: Hora 36 (Día 2 tarde)
- ⏰ Code Freeze: Hora 45 (Día 2 noche)
- ⏰ Submission: Hora 48 (Día 3 mediodía)

---

## DÍA 1 - Viernes

### Hora 0-3: Setup y Planificación (18:00 - 21:00)
**Todos**:
- [x] Repositorio Git configurado
- [x] Issues de GitHub creados
- [x] GDD finalizado y aprobado
- [x] Proyecto Unity creado y commiteado

**Programador**:
- [ ] Issue #1: Unity Project Setup

**Game Designer**:
- [ ] Finalizar GDD
- [ ] Crear todos los GitHub Issues
- [ ] Buscar referencias de audio

**Modelador**:
- [ ] Preparar Blender workspace
- [ ] Revisar pipeline de exportación FBX

**Animador**:
- [ ] Crear cuenta Mixamo
- [ ] Test de pipeline Mixamo → Unity

### Hora 3-8: Desarrollo Core P0 (21:00 - 02:00)
🎯 **Target: Mecánicas base implementadas**

**Programador**:
- [ ] Issue #2: Player Movement & Jump (usar cápsula placeholder)
- [ ] Issue #9: Basic Camera Controller
- [ ] Issue #4: Death System

**Modelador**:
- [ ] Issue #5: Player Model (low-poly, simple)

**Animador**:
- [ ] Issue #6: Player Animations (Mixamo auto-rig + descargar 4 animaciones)

**Game Designer**:
- [ ] Issue #7: Level 1 Blockout (ProBuilder)
- [ ] Testear mecánicas según estén listas

**Stand-up**: Hora 6 (15 minutos)

### Hora 8: ⏰ CHECKPOINT - First Playable
**Verificación**:
- ¿Player se mueve y salta?
- ¿Player puede morir?
- ¿Existe un nivel simple?
- ¿Se puede "jugar" de inicio a fin?

**SI SÍ**: ✅ Continuar a features P1
**SI NO**: ⚠️ Evaluar scope y cortar features

### Hora 8-12: Integración y Features P0 Restantes (02:00 - 06:00)
**Programador**:
- [ ] Issue #3: Dash Mechanic
- [ ] Issue #8: Crystal Collectible
- [ ] Integrar player model final (si está listo)
- [ ] Integrar animaciones

**Modelador**:
- [ ] Issue #13: Environment Assets (plataformas, obstáculos simples)

**Animador**:
- [ ] Configurar Animator Controller en Unity
- [ ] Ayudar a programador con animation events (si necesario)

**Game Designer**:
- [ ] Pulir Level 1
- [ ] Empezar Level 2 blockout
- [ ] Testing continuo

**Descanso recomendado**: Hora 12-14 (dormir 2-4 horas si es posible)

---

## DÍA 2 - Sábado

### Hora 14-24: Features P1 y Level Design (08:00 - 18:00)
🎯 **Target: Todas las mecánicas P0+P1 funcionando**

**Programador**:
- [ ] Issue #10: UI (Lives, Dash Cooldown)
- [ ] Issue #11: Checkpoint System
- [ ] Bug fixing
- [ ] Configurar builds de testing

**Modelador**:
- [ ] Finalizar environment assets P0
- [ ] Assets P1 (props decorativos, variaciones)
- [ ] Pulir models si hay tiempo

**Animador**:
- [ ] Animaciones secundarias (toma damage, muerte)
- [ ] Polish de transiciones
- [ ] Partículas simples (salto, dash, muerte)

**Game Designer**:
- [ ] Issue #12: Levels 2 y 3 completos
- [ ] Empezar Level 4 y 5 (P1)
- [ ] Buscar y descargar audio assets
- [ ] Testing extensivo

**Stand-up**: Hora 18 y Hora 24 (15 minutos cada uno)

### Hora 24-36: Polish y Audio (18:00 - 06:00)
🎯 **Target: Juego completo y pulido**

**Programador**:
- [ ] Issue #16: Main Menu
- [ ] Bug fixing intensivo
- [ ] Optimización de performance
- [ ] Builds frecuentes para testing

**Modelador**:
- [ ] Assets P2 (si hay tiempo)
- [ ] Polish visual (mejorar texturas, iluminación)

**Animador**:
- [ ] Polish de animaciones
- [ ] Efectos visuales adicionales

**Game Designer**:
- [ ] Issue #14: Audio Integration
- [ ] Issue #15: Implementar música y SFX
- [ ] Levels finales
- [ ] Balanceo de dificultad

### Hora 36: ⏰ CHECKPOINT - Feature Complete
**Verificación**:
- ¿Todas las mecánicas P0 + P1 funcionan?
- ¿Hay al menos 3 niveles jugables?
- ¿UI funcional?
- ¿Audio integrado?

**SI SÍ**: ✅ Cambiar a mode "Polish Only"
**SI NO**: ⚠️ Cortar P1, enfocarse en que P0 funcione perfectamente

🚨 **REGLA**: NO agregar features nuevas después de este punto

---

## DÍA 3 - Domingo

### Hora 36-42: Polish Final (06:00 - 12:00)
🎯 **Solo bug fixing y mejoras menores**

**Programador**:
- [ ] Bug fixing solo P0-critical
- [ ] NO tocar código que funciona
- [ ] Builds de respaldo frecuentes

**Todos**:
- [ ] Testing exhaustivo
- [ ] Reportar bugs en GitHub con prioridad
- [ ] Focus en bugs P0 únicamente

### Hora 42-45: Pre-Freeze Testing (12:00 - 15:00)
🎯 **Última ventana para fixes críticos**

**Todos**:
- [ ] Testing final
- [ ] Arreglar solo bugs game-breaking
- [ ] Preparar build candidato final

### Hora 45: ⏰ CODE FREEZE
🚨 **NO SE TOCA CÓDIGO DESPUÉS DE ESTE PUNTO**

**Programador**:
- [ ] Build final para Windows
- [ ] Build final para WebGL (si aplica)
- [ ] Verificar que builds funcionan

**Game Designer**:
- [ ] Screenshots del juego (5-10)
- [ ] GIF/Video corto de gameplay
- [ ] Escribir descripción del juego
- [ ] Documentar controles

**Todos**:
- [ ] Testing de builds finales
- [ ] Preparar submission materials

### Hora 45-48: Submission (15:00 - 18:00)
**Checklist**:
- [ ] Build subido a itch.io / plataforma
- [ ] Screenshots subidos
- [ ] Descripción clara y atractiva
- [ ] Controles documentados
- [ ] Créditos del equipo
- [ ] Link funcional testeado
- [ ] Submission ANTES del deadline

🏆 **DEADLINE: Hora 48 (18:00)**
```

### Paso 4: Sistema de Daily Stand-ups

Establece la rutina de comunicación.

#### Formato de Stand-up (15 minutos exactos)

```
Tiempo: Cada 6-8 horas durante la jam
Formato: Todos en canal de voz

Estructura por persona (3 minutos cada uno):
1. ¿Qué completaste desde el último stand-up?
   → "Completé issues #2 y #9, player se mueve"

2. ¿Qué harás en las próximas 6-8 horas?
   → "Voy a implementar #3 dash mechanic, estimado 2 horas,
      luego #8 crystal collectible"

3. ¿Tienes algún blocker?
   → "Necesito el player model (#5) para testing con animations"

4. Si hay blocker: ¿Cuál es el contingency?
   → "Si no está en 2 horas, uso cápsula placeholder"

Después de todos:
- Game Designer resume estado general
- Identificar si van on-track para milestone
- Ajustar plan si es necesario
```

**Reglas de Stand-up**:
- 15 minutos máximo (usar timer)
- No resolver problemas en stand-up (solo identificarlos)
- Después de stand-up, resolver blockers 1-on-1
- No saltarse stand-ups (crítico para coordinación)

#### Comunicación Fuera de Stand-ups

```
En canal de Discord/Slack:

Formato para reportar progreso:
"✅ Completado: Issue #X - [nombre]
   Detalles: [breve descripción]
   Próximo: Issue #Y"

Formato para reportar blocker:
"🚨 BLOCKER: [Descripción del problema]
   Bloqueado en: Issue #X
   Necesito: [Qué necesitas para desbloquearte]
   Contingency: [Plan B si no se resuelve rápido]
   @[persona que puede ayudar]"

Formato para pedir ayuda:
"❓ Pregunta: [Pregunta específica]
   Contexto: [Situación]
   @[persona relevante]"
```

### Paso 5: Contingency Plans

Para cada dependencia crítica, define el Plan B.

#### Template de Contingency

```
Dependencia: [Qué se necesita]
De quién: [Rol/persona]
Para qué: [Feature dependiente]
Deadline: [Hora X]

Contingency si no está listo:
- Plan A: [Primera alternativa]
- Plan B: [Segunda alternativa]
- Fallback: [Solución de emergencia]
```

**EJEMPLOS**:

```
Dependencia: Player model
De quién: Modelador
Para qué: Player movement & animations
Deadline: Hora 6

Contingency:
- Plan A: Usar cápsula de Unity con material de color
- Plan B: Descargar character de Mixamo
- Fallback: Cubo con ojos (en serio, funciona para testing)

---

Dependencia: Player animations
De quién: Animador
Para qué: Player movement polished
Deadline: Hora 8

Contingency:
- Plan A: Usar animaciones de Mixamo sin modificar
- Plan B: Usar animaciones básicas de Unity Asset Store
- Fallback: Sin animaciones, solo transformaciones (movement sin animation)

---

Dependencia: Background music
De quién: Game Designer
Para qué: Audio integration
Deadline: Hora 30

Contingency:
- Plan A: Usar tracks de Incompetech sin editing
- Plan B: Usar música de Kevin MacLeod
- Fallback: Juego sin música (solo SFX)
```

### Paso 6: Comunicar el Plan al Equipo

Presenta el plan completo de manera visual y clara.

**Estructura de presentación (5-10 minutos)**:

```
"Equipo, aquí está el plan operacional para los próximos 48 horas:

📅 CRONOGRAMA:
[Mostrar plan día por día]

🎯 MILESTONES:
- Hora 8: First Playable
- Hora 36: Feature Complete
- Hora 45: Code Freeze

📋 ISSUES:
- Creados en GitHub: [número] issues
- P0 (para First Playable): [número] issues
- P1 (para Feature Complete): [número] issues
- Todos asignados y con estimates

🔄 COMUNICACIÓN:
- Stand-ups cada 6-8 horas (Horas 6, 12, 18, 24, 30, 36)
- Reportar blockers inmediatamente en Discord
- TODO documentado en GitHub Issues

📱 CONTINGENCIES:
- Cada dependencia crítica tiene Plan B
- Placeholders listos para usar
- Assets gratuitos identificados

💡 REGLAS:
1. No agregar features después de Feature Complete
2. Integrar placeholders antes que esperar assets perfectos
3. Commits frecuentes (cada hora mínimo)
4. Testing continuo (no dejar para el final)
5. Si algo no funciona en 30 minutos, pedir ayuda

❓ PREGUNTAS sobre el plan?"
```

## Validación de la Fase

Antes de comenzar la ejecución (Fase 3), verifica:

✅ **GitHub Issues creados para P0 y P1**
✅ **Plan día por día comunicado y entendido**
✅ **Stand-ups agendados (con alarmas/recordatorios)**
✅ **Contingencies definidas para dependencias críticas**
✅ **Herramientas (Git, Discord, Unity) funcionando para todos**

## Errores Comunes en Esta Fase

❌ **Error**: Crear issues muy generales
```
Malo: "Implementar player"
Bueno: "[Feature] Player Movement (WASD) & Jump (Space) con Character Controller"
```

❌ **Error**: No vincular dependencies en issues
→ Resultado: Descubren blockers tarde
✅ **Correcto**: Cada issue lista sus dependencias y contingencies

❌ **Error**: "Vemos cómo va y nos coordinamos sobre la marcha"
→ Resultado: Caos, duplicación de trabajo, blockers no comunicados
✅ **Correcto**: Plan claro desde hora 0, stand-ups rigurosos

❌ **Error**: Optimismo en estimates ("2 horas máximo")
→ Resultado: Todo toma el doble
✅ **Correcto**: Estimates realistas + 50% buffer

## Output Final de Fase 2

Debes entregar al equipo:

1. **GitHub Issues completos** (P0 y P1 mínimo)
2. **GitHub Project board** configurado
3. **Plan día por día** (cronograma visual)
4. **Schedule de Stand-ups** (con recordatorios)
5. **Contingency plans** documentados
6. **Repositorio Git** configurado y funcional

Con esto, el equipo puede comenzar la ejecución sin confusión.

**Próximo Paso**: Fase 3 - Ejecución y Coordinación (asistencia en tiempo real durante la jam).
