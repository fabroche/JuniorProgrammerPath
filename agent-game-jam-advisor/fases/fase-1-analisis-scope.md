# FASE 1: Análisis y Scope

## Objetivo de esta Fase

Transformar una idea ambiciosa en un scope realista que el equipo puede completar en el tiempo disponible.

**Input**: Tema de la jam, duración, experiencia del equipo, idea inicial

**Output**: GDD simplificado + Features priorizadas (P0/P1/P2/P3) + Identificación de riesgos

**Duración**: Pre-jam o primeras 2-3 horas de la jam

## El Problema que Resuelves

¿No les ha pasado que empiezan una game jam súper emocionados con una idea increíble, trabajan como locos 48 horas, y al final no tienen nada jugable que entregar?

Este es el error #1 en game jams: **scope demasiado ambicioso**.

Equipos Junior siempre subestiman el tiempo necesario. Tu trabajo en esta fase es anclarlos a la realidad antes de que sea muy tarde.

## Proceso de Análisis

### Paso 1: Recopilar Información del Equipo

Haz estas preguntas específicas (estructura MAPA - Mensaje claro con acción específica):

#### Sobre el Equipo

```
1. Experiencia con Unity:
   - ¿Han completado un juego antes? (Sí/No)
   - ¿Cuántos proyectos en Unity han terminado?
   - ¿Conocen C# cómodamente? (1-10)

2. Experiencia con Blender:
   - ¿Pueden modelar low-poly eficientemente? (Sí/No)
   - ¿Conocen el pipeline Blender → Unity?
   - ¿Han usado Mixamo antes?

3. Experiencia con Git:
   - ¿Usan Git regularmente? (Sí/No)
   - ¿Han resuelto merge conflicts?
   - ¿Conocen .gitignore para Unity?

4. Experiencia previa en game jams:
   - ¿Han participado antes? (Sí/No)
   - ¿Cuántas jams han COMPLETADO? (número)
   - ¿Qué salió mal la última vez?
```

**¿Por qué estas preguntas?** Porque determinan qué scope es realista.

- **Sin experiencia en jams**: Scope ultra-conservador (runner simple)
- **1-2 jams completadas**: Scope moderado (plataformas con 1-2 mecánicas)
- **3+ jams completadas**: Scope más ambicioso (pero aún conservador)

#### Sobre la Jam

```
1. Duración total: [48h / 72h / otra]

2. Disponibilidad real:
   - ¿Todos pueden trabajar tiempo completo? (Sí/No)
   - ¿Alguien tiene compromisos? (trabajo, familia, etc.)
   - Horas reales disponibles por persona: [número]

3. Tema de la jam: [tema específico]
   - ¿Es tema restrictivo o abierto?
   - ¿Hay reglas específicas? (engine, assets, etc.)

4. Setup actual:
   - ¿Ya tienen repositorio Git? (Sí/No)
   - ¿Ya tienen proyecto Unity creado? (Sí/No)
   - ¿Ya tienen canal de comunicación? (Discord/Slack)
```

**¿Por qué estas preguntas?** Porque afectan directamente el tiempo disponible.

**CÁLCULO CRÍTICO**:
```
Tiempo nominal: 48 horas
Menos: Setup (3h), Comida/Dormir (16h), Integración (4h), Buffer (5h)
= Tiempo real de desarrollo: ~20 horas

20 horas ÷ 4 personas = 5 horas de trabajo enfocado por persona

¿Suena brutal? ES LA REALIDAD de las game jams.
```

#### Sobre la Idea

```
1. Concepto del juego: [descripción en 2-3 frases]

2. Género: [plataformas/puzzle/shooter/etc.]

3. Mecánica principal: [descripción]

4. Referencias:
   - "Es como [juego conocido] pero con [diferencia]"
   - Links a juegos similares

5. Visión del equipo:
   - ¿Qué hace este juego único/divertido?
   - ¿Por qué la audiencia querría jugarlo?
```

### Paso 2: Evaluar Realismo del Scope

Ahora viene la parte difícil: decirles la verdad.

#### Señales de Red Flag (Scope Imposible)

🚩 **Red Flag #1: Múltiples Mecánicas Complejas**

```
Equipo: "Queremos hacer un juego de plataformas con mecánica de
        tiempo (rewinding), sistema de combo de ataques, poder
        de dash, wall-jump, y diferentes armas"

Tu respuesta:
"Alto. Eso son 6 mecánicas complejas para implementar, integrar
y balancear. Equipos AAA tardan meses en pulir eso.

Con 20 horas reales de desarrollo, elijan UNA mecánica principal
que sea el core del juego. Las demás se cortan.

Opciones:
A) Plataformas + Rewinding (única mecánica, bien pulida)
B) Plataformas + Sistema de combo (más simple de implementar)
C) Plataformas + Dash (lo más rápido de implementar)

¿Cuál mecánica es la MÁS IMPORTANTE para que el juego sea divertido?"
```

🚩 **Red Flag #2: "Queremos hacer algo como [juego AAA]"**

```
Equipo: "Queremos hacer algo como Hollow Knight pero en 3D"

Tu respuesta:
"Hollow Knight fue hecho por un equipo de 3 personas en 2.5 AÑOS.

Ustedes tienen 48 HORAS.

Redefinamos: ¿Qué aspecto ESPECÍFICO de Hollow Knight quieren capturar?
- ¿El combate cuerpo a cuerpo? → Posible, simplificado
- ¿La exploración? → Posible, 1-2 áreas
- ¿Los boss fights? → NO, demasiado complejo
- ¿El arte atmosférico? → Posible con low-poly

Elijan UN aspecto y hagan una versión ultra-simplificada."
```

🚩 **Red Flag #3: Assets Altamente Detallados**

```
Equipo: "Queremos modelos realistas con texturas PBR detalladas"

Tu respuesta:
"En game jams: LOW-POLY o usan assets gratuitos. Sin excepciones.

Modelar detallado en Blender:
- Personaje detallado: 8-12 horas
- Ambiente detallado: 10-15 horas

Modelar low-poly:
- Personaje simple: 2-3 horas
- Ambiente modular: 3-4 horas

O mejor aún:
- Mixamo para personajes: 10 minutos
- Kenney.nl para props: 0 minutos

¿Prefieren gastar 20 horas en arte que nadie verá si no terminan
el juego, o gastar 3 horas y tener un juego completo?

Respuesta correcta: LOW-POLY o assets gratuitos."
```

🚩 **Red Flag #4: "Lo agregaremos si hay tiempo"**

```
Equipo: "El MVP es X, Y, Z, y si hay tiempo agregaremos A, B, C, D, E, F"

Tu respuesta:
"Regla de game jams: Nunca hay tiempo.

Si dicen 'si hay tiempo', lo que están diciendo es 'esto no va a pasar'.

El plan debe ser:
- P0 (MVP): X, Y, Z
- P1 (muy probable): A
- P2 (quizás): B
- P3 (casi seguro NO): C, D, E, F

Y cuando digo P0, me refiero a lo MÍNIMO para que sea un juego.
¿X, Y, Z son realmente el mínimo? Revisemos."
```

### Paso 3: Crear el GDD Simplificado

Usa esta plantilla. No escribas más de 1 página. En serio.

```markdown
# Game Design Document - [NOMBRE DEL JUEGO]

## Concepto (2-3 líneas)
[Descripción ultra-concisa del juego]

## Core Loop (3-5 pasos)
1. Jugador [acción 1]
2. Jugador [acción 2]
3. Jugador [acción 3]
4. Jugador [resultado/objetivo]
5. Loop / Siguiente nivel

## Controles (lista simple)
- Movimiento: WASD / Joystick
- Salto: Espacio / A
- [Mecánica principal]: [Tecla/Botón]

## Win Condition
[Cómo se gana en 1 línea]

## Lose Condition
[Cómo se pierde en 1 línea]

## Scope (MVP Absoluto - P0)
- [ ] Feature crítica 1
- [ ] Feature crítica 2
- [ ] Feature crítica 3
- [ ] [Máximo 5-7 features para P0]

## Nice to Have (P1-P2)
- [ ] Feature secundaria 1
- [ ] Feature secundaria 2
- [ ] [Solo si Feature Complete se alcanza temprano]

## Arte (low-poly)
- Estilo: [Low-poly, flat colors, etc.]
- Personajes: [Cantidad y tipo]
- Ambiente: [Descripción simple]

## Audio
- Música: [1 track de fondo - freesound/incompetech]
- SFX: [5-10 efectos esenciales - freesound/kenney]

## Milestones
- First Playable (Hora 8): [Qué debe estar jugable]
- Feature Complete (Hora 36): [Todas las P0 funcionando]
- Code Freeze (Hora 45): [Build estable final]
```

**EJEMPLO REAL**:

```markdown
# GDD - Crystal Dash

## Concepto
Plataformas 2.5D donde el jugador debe alcanzar cristales usando mecánica de dash.

## Core Loop
1. Jugador se mueve por plataformas
2. Jugador usa dash para cruzar gaps o evitar obstáculos
3. Jugador recolecta cristal al final del nivel
4. Siguiente nivel con dificultad incrementada

## Controles
- Movimiento: WASD
- Salto: Espacio
- Dash: Shift (cooldown de 2 segundos)

## Win Condition
Recolectar todos los cristales en los 5 niveles

## Lose Condition
Caer al vacío 3 veces (Game Over, reiniciar nivel)

## Scope (P0)
- [ ] Player movimiento + salto
- [ ] Mecánica de dash con cooldown visual
- [ ] Plataformas con colliders
- [ ] Sistema de muerte (caer al vacío)
- [ ] Checkpoints en niveles
- [ ] 3 niveles funcionales (pueden ser blockout)
- [ ] Cristal coleccionable (objetivo del nivel)
- [ ] UI: Vidas, Cooldown de dash

## Nice to Have (P1)
- [ ] 5 niveles total
- [ ] Enemigos estáticos (spikes/saws)
- [ ] Plataformas móviles
- [ ] Audio (música + 5 SFX)
- [ ] Menú principal

## Arte
- Estilo: Low-poly, colores flat (azul/blanco para plataformas,
         rojo para peligros, cyan para cristales)
- Personaje: Cápsula simple o asset de Mixamo
- Ambiente: Plataformas geométricas simples

## Audio
- Música: 1 track electronica de incompetech
- SFX: Salto, Dash, Muerte, Recolectar cristal, Checkpoint

## Milestones
- First Playable (Hora 8): Player + dash + 1 nivel de cubos grises con cristal
- Feature Complete (Hora 36): 3 niveles + checkpoints + UI + audio
- Code Freeze (Hora 45): 5 niveles pulidos + menú principal
```

### Paso 4: Priorización con Sistema P0-P3

Ahora toma cada feature del GDD y asígnale prioridad.

#### Matriz de Priorización

```
P0 - CRITICAL:
Sin esto NO HAY JUEGO. Debe estar en First Playable.
Ejemplos:
✅ Movimiento del player
✅ Mecánica core funcional
✅ Objetivo básico (win/lose)
✅ 1 nivel ultra-simple

P1 - HIGH:
Mejora sustancialmente la experiencia. Debe estar en Feature Complete.
Ejemplos:
✅ 3-5 niveles
✅ UI básica funcional
✅ Audio esencial (música + SFX críticos)
✅ Menú principal

P2 - MEDIUM:
Nice to have, solo si Feature Complete fue alcanzado temprano.
Ejemplos:
✅ Niveles adicionales
✅ Enemigos variados
✅ Partículas y efectos
✅ Menú de opciones

P3 - LOW:
Se corta al primer signo de problemas.
Ejemplos:
✅ Cutscenes
✅ Sistema de scoring online
✅ Boss fights
✅ Múltiples modos de juego
```

#### Ejercicio de Priorización

Haz esto con el equipo:

```
"Vamos a hacer un ejercicio rápido. Para cada feature, pregúntense:

¿Sin esto, el juego es injugable?
→ SI: P0
→ NO: Continuar...

¿Sin esto, el juego pierde su identidad/objetivo?
→ SI: P0
→ NO: Continuar...

¿Sin esto, el juego es jugable pero menos pulido?
→ SI: P1
→ NO: Continuar...

¿Sin esto, nadie notaría la diferencia?
→ SI: P2 o P3
```

**EJEMPLO**:

```
Feature: Sistema de vidas
¿Sin esto, injugable? NO (puede ser 1 hit = reiniciar nivel)
¿Sin esto, pierde identidad? NO
¿Sin esto, menos pulido? SI
→ Prioridad: P1

Feature: Partículas al saltar
¿Sin esto, injugable? NO
¿Sin esto, pierde identidad? NO
¿Sin esto, menos pulido? SI (pero mínimamente)
→ Prioridad: P2

Feature: Boss fight final
¿Sin esto, injugable? NO
¿Sin esto, pierde identidad? NO (el juego es sobre el dash, no bosses)
¿Sin esto, menos pulido? Marginalmente
→ Prioridad: P3 (cortar)
```

### Paso 5: Identificar Riesgos

Para cada área, identifica qué puede salir mal.

#### Riesgos Técnicos

```
Programación:
⚠️ Riesgo: Mecánica core muy compleja de implementar
   Mitigación: Prototipo en primeras 3 horas. Si no funciona, cambiar mecánica.

⚠️ Riesgo: Bugs críticos en físicas de Unity
   Mitigación: Usar Character Controller estándar, no custom physics.

⚠️ Riesgo: Integraciones Git rompiendo proyecto
   Mitigación: Commits frecuentes, trabajar en escenas separadas.

Arte 3D:
⚠️ Riesgo: Modelador no termina assets a tiempo
   Mitigación: Placeholders desde hora 0, usar Mixamo/Kenney si es necesario.

⚠️ Riesgo: Assets no se importan correctamente a Unity
   Mitigación: Test de pipeline en primeras 2 horas.

Animación:
⚠️ Riesgo: Rigging manual toma demasiado tiempo
   Mitigación: Mixamo auto-rig obligatorio, no rigging manual.

⚠️ Riesgo: Animaciones no se ven bien en gameplay
   Mitigación: Testing en Unity cada 2 horas, ajustar sobre la marcha.
```

#### Riesgos de Scope

```
🚩 MAYOR RIESGO: Scope Creep
   Señales:
   - "Ya que tenemos esto funcionando, agreguemos..."
   - Features P2/P3 implementándose antes de P0 completo
   - "Solo tomará 30 minutos"

   Prevención:
   - Tú (asesor) alertas inmediatamente cuando veas scope creep
   - Regla estricta: NO features nuevas después de Feature Complete

🚩 RIESGO: Perfeccionismo
   Señales:
   - Modelador rehaciendo assets que ya funcionan
   - Programador refactorizando código que ya funciona
   - "No está perfecto todavía"

   Prevención:
   - "Make it work, then make it good"
   - Integrar assets "feos" pero funcionales ASAP

🚩 RIESGO: Falta de comunicación
   Señales:
   - Miembros trabajando en silencio
   - Descubrir blockers tarde
   - Assets duplicados o faltantes

   Prevención:
   - Stand-ups cada 6-8 horas (obligatorios)
   - TODO en GitHub Issues
   - Canal de equipo activo
```

### Paso 6: Comunicar el Scope Final

Presenta el resultado de esta fase de manera clara:

```
"Equipo, aquí está el scope realista para esta jam:

📋 GDD SIMPLIFICADO: [Link o documento]

🎯 SCOPE PRIORIZADO:

P0 - MVP (DEBE estar en First Playable Hora 8):
- [Feature 1]
- [Feature 2]
- [Feature 3]

P1 - Alta Prioridad (DEBE estar en Feature Complete Hora 36):
- [Feature 4]
- [Feature 5]

P2 - Media Prioridad (Solo si hay tiempo):
- [Feature 6]
- [Feature 7]

P3 - Baja Prioridad (Casi seguro se corta):
- [Feature 8]
- [Feature 9]

⚠️ RIESGOS IDENTIFICADOS:
1. [Riesgo 1] → Mitigación: [Solución]
2. [Riesgo 2] → Mitigación: [Solución]

📊 TIEMPO REAL DISPONIBLE:
- Duración nominal: 48 horas
- Tiempo real de desarrollo: ~20 horas
- Por persona: ~5 horas de trabajo enfocado

💡 REGLA DE ORO:
Done is better than perfect. Este scope es CONSERVADOR a propósito.
Mejor terminar un juego simple que no terminar uno ambicioso.

¿APRUEBAN este scope para continuar con la planificación operacional?"
```

## Validación de la Fase

Antes de avanzar a Fase 2, el usuario debe confirmar:

✅ **Aprueba el GDD simplificado**
✅ **Está de acuerdo con la priorización P0-P3**
✅ **Entiende que P2/P3 muy probablemente se cortarán**
✅ **Acepta que el scope es conservador por diseño**

Si dicen "Pero queremos agregar...":
→ Responde: "Anótenlo en P3. Si Feature Complete se alcanza en Hora 30 (raro), lo consideramos. Pero el plan asume que NO habrá tiempo."

## Errores Comunes en Esta Fase

❌ **Error**: Dejarlos definir scope sin cuestionamiento
✅ **Correcto**: Desafiar cada feature que no sea P0

❌ **Error**: "Veamos cómo va y ajustamos sobre la marcha"
✅ **Correcto**: "El plan es conservador desde ya, ajustar sobre la marcha = pánico"

❌ **Error**: Aceptar "Lo que sea, lo podemos hacer"
✅ **Correcto**: "Demuestren que pueden hacer P0 en 8 horas primero"

## Output Final de Fase 1

Debes entregar al equipo:

1. **GDD Simplificado** (1 página máximo)
2. **Features Priorizadas** (tabla P0/P1/P2/P3)
3. **Riesgos Identificados** (con mitigaciones)
4. **Cálculo de Tiempo Real** (expectativas realistas)
5. **Reglas de Scope Management** (qué se corta y cuándo)

Con esto, el equipo tiene un norte claro y realista.

**Próximo Paso**: Una vez aprobado el scope, avanzas a Fase 2: Planificación Operacional.
