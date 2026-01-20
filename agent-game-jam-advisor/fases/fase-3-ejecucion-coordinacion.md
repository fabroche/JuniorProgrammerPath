# FASE 3: Ejecución y Coordinación

## Objetivo de esta Fase

Asesorar al equipo en tiempo real, resolver problemas técnicos, gestionar dependencias, y asegurar que alcancen los milestones.

**Input**: Plan operacional de Fase 2 + Equipo ejecutando

**Output**: Soluciones específicas + Ajustes al plan + Alertas de milestone + Juego feature-complete

**Duración**: Horas 3-45 de la jam (toda la ejecución hasta Code Freeze)

## El Problema que Resuelves

Durante la ejecución es cuando TODO se puede descarrilar:
- Bugs inesperados que bloquean progreso
- Dependencies que no se comunican
- Scope creep silencioso
- Perfeccionismo que retrasa entregas
- Pánico cuando se acerca el deadline

Tu rol es ser el **piloto que mantiene el barco en curso** incluso cuando hay tormentas.

## Estructura de Asesoría

Esta fase no es lineal como las anteriores. Trabajas en modo **reactivo + proactivo**:

- **Reactivo**: Responder preguntas técnicas, resolver blockers, debugging
- **Proactivo**: Alertar sobre delays, verificar milestones, cortar scope cuando sea necesario

## Asesoría por Rol

### Programador: Troubleshooting Técnico

El programador es el rol con más potencial de bloquearse. Tu conocimiento técnico aquí es crítico.

#### Problema Común #1: "Unity no compila"

**Síntomas**:
```
- Errores de compilación
- Scripts que no se pueden adjuntar a GameObjects
- "Assembly-CSharp not found"
```

**Diagnóstico y Solución**:

```
Tú: "¿Qué error específico muestra la consola?"

Programador: "[Error de compilación X]"

Paso 1: Ver el error completo
Tú: "Copia el error completo incluyendo la línea y archivo"

Errores comunes:

ERROR: "Missing ;"
→ Solución: Agregar punto y coma en línea indicada

ERROR: "Cannot find type or namespace"
→ Solución: Agregar using statement (using UnityEngine; using System.Collections;)

ERROR: "Method not found"
→ Solución: Verificar nombre de método, parámetros, mayúsculas

Paso 2: Si el error persiste después de fix obvio
Tú: "1. Cierra Unity
      2. Borra carpetas Library/ y Temp/
      3. Reabre Unity
      4. Espera que recompile (puede tardar 2-5 minutos)
      5. ¿Sigue el error?"

Paso 3: Si TODAVÍA persiste
Tú: "¿Hiciste git pull recientemente? [Sí]
      Puede ser merge conflict en .csproj

      1. Git status
      2. Si hay .csproj con conflictos, bórralos (Unity los regenera)
      3. Restart Unity"
```

**Prevención**:
```
- Commits frecuentes (cada feature funcional)
- Nunca hacer git pull en medio de escribir código
- Compilar frecuentemente (cada 10-15 minutos)
```

#### Problema Común #2: "Physics no funcionan como espero"

**Ejemplo**: Player atraviesa paredes, o se queda pegado, o salta inconsistente.

**Diagnóstico**:

```
Tú: "Describe exactamente qué está pasando"

Programador: "El player a veces atraviesa las paredes"

Tú: "OK, checklist de physics:
     1. ¿Player tiene Collider? [Sí]
     2. ¿Paredes tienen Collider? [Sí]
     3. ¿Player tiene Rigidbody? [Sí]
     4. ¿Rigidbody está en modo Continuous? [No...]

     AJÁ. Collision Detection mode.

     Cambios a hacer:
     1. Player Rigidbody → Collision Detection: Continuous
     2. Paredes → Static (no mover en runtime)
     3. Si paredes se mueven → Rigidbody Kinematic

     Esto debería resolver el atravesar paredes.

     ¿Sigue el problema? [Prueba y reporta]"
```

**Soluciones Comunes**:

```
Player se queda pegado en paredes:
→ Physics Material con friction = 0
→ Agregar a player collider

Salto inconsistente:
→ No usar Input.GetKey para salto (usa GetKeyDown)
→ Verificar que isGrounded funcione correctamente
→ Usar Raycast o overlap para detectar suelo

Player se desliza en slopes:
→ Ajustar friction en Physics Material
→ O desactivar movimiento en Y cuando está en suelo

Objects pasan a través a velocidad alta:
→ Collision Detection: Continuous (no Discrete)
→ O reducir Time.fixedDeltaTime (más costly)
```

#### Problema Común #3: "Animations no se reproducen"

**Diagnóstico**:

```
Tú: "Checklist de animaciones:
     1. ¿Animator component está en el GameObject? [Sí]
     2. ¿Animator Controller está asignado? [Sí]
     3. ¿Las animaciones están en el Animator? [Sí]
     4. ¿Los parámetros coinciden con el código? [Hmm...]

     Muéstrame tu código:

Programador: animator.SetFloat("speed", moveSpeed);

Tú: "OK, ahora abre el Animator Controller.
     ¿El parámetro se llama 'speed' o 'Speed'?

     Ah, se llama 'Speed' con mayúscula.

     Cambio: animator.SetFloat('Speed', moveSpeed);

     Unity es case-sensitive. Ese era el problema."
```

**Soluciones Comunes**:

```
Animación no se ve:
→ Verificar que el modelo tiene el Animator en el GameObject correcto
→ A veces está en el parent en vez del modelo visual

Transiciones no ocurren:
→ Verificar condiciones de transición
→ Verificar que el parámetro se esté actualizando (Debug.Log)
→ Verificar "Has Exit Time" (desactivar si necesitas transición inmediata)

Animaciones se ven "choppy":
→ Bajar speed multiplier del Animator
→ O es problema de framerate (optimizar)

Model se deforma raro:
→ Weight painting problem (volver al Animador)
→ O scale del modelo no es uniforme (aplicar scale en Blender)
```

#### Problema Común #4: "Git merge conflict en escena"

**Síntomas**:
```
- git pull muestra conflicto en archivo .unity (escena)
- Unity no puede abrir la escena
- Pérdida de trabajo
```

**Solución (Recuperación)**:

```
Tú: "OK, conflicto en escena. Paso a paso:

     OPCIÓN 1 - Usar tu versión:
     git checkout --ours path/to/scene.unity
     git add .
     git commit -m 'Resolved scene conflict - kept our version'

     Luego: Pide a la otra persona que re-aplique sus cambios manualmente

     OPCIÓN 2 - Usar la versión de ellos:
     git checkout --theirs path/to/scene.unity
     git add .
     git commit -m 'Resolved scene conflict - kept their version'

     Luego: Tú re-aplicas tus cambios manualmente

     MEJOR OPCIÓN - Prevenir este problema:
     Trabajen en ESCENAS SEPARADAS cuando sea posible.

     Ejemplo:
     - Programador en TestScene
     - Game Designer en Level1, Level2, Level3

     Solo merges cuando necesiten combinarse."
```

**Prevención**:
```
Reglas de Escenas en jams:
1. Cada persona trabaja en su propia escena siempre que sea posible
2. Si deben compartir escena, comunicar ANTES de hacer cambios
3. Una persona hace cambios a la vez (no simultáneos)
4. Commits frecuentes + pull antes de cada sesión
```

### Game Designer: Level Design y Testing

El Game Designer tiene menos riesgo técnico pero puede perder mucho tiempo en perfeccionamiento innecesario.

#### Asesoría #1: Blockout eficiente

**Situación**: Game Designer gastando mucho tiempo en un nivel

```
Tú: "¿Cuánto tiempo llevas en ese nivel? [3 horas]

     OK, para game jams:
     - Blockout de un nivel: 30 minutos máximo
     - Polish de ese nivel: Después de Feature Complete

     Regla: Gray boxes primero, arte después.

     Workflow correcto:
     1. ProBuilder cubos grises (10 min)
     2. Colocar player spawn y objetivo (5 min)
     3. Testing: ¿Es divertido navegar? (10 min)
     4. Ajustar layout (5 min)

     Total: 30 minutos por nivel en blockout

     DESPUÉS de Feature Complete, si hay tiempo:
     - Reemplazar cubos con assets del modelador
     - Agregar iluminación
     - Agregar decoraciones

     ¿Tu nivel actual es jugable? [Sí]
     Entonces pasa al siguiente nivel. No pulas este todavía."
```

#### Asesoría #2: Audio Integration rápida

**Situación**: Game Designer sin experiencia en implementar audio en Unity

```
Tú: "Audio en Unity, versión rápida:

PASO 1: Importar assets de audio
- Arrastra archivos .wav o .ogg a Assets/Audio/
- Unity los importa automáticamente

PASO 2: Background Music
1. Crea GameObject vacío: 'AudioManager'
2. Agrega componente: Audio Source
3. Arrastra tu música al campo 'AudioClip'
4. Check: Loop = ✅
5. Check: Play On Awake = ✅
6. Ajusta Volume: 0.3-0.5 (no muy fuerte)

PASO 3: Sound Effects (SFX)
Opción A - Simple (para jams):
- Agrega AudioSource al player
- En tu script:

```csharp
public AudioClip jumpSound;
public AudioSource audioSource;

void Jump()
{
    // código de salto
    audioSource.PlayOneShot(jumpSound);
}
```

Opción B - Con Audio Manager (mejor pero más tiempo):
[Solo si tienen tiempo y quieren sistema centralizado]

PASO 4: Testing
- Juega el juego
- ¿La música está muy fuerte? Ajusta volume
- ¿Los SFX no se oyen? Verificar que estén asignados en Inspector

Tiempo total: 30-45 minutos para audio básico funcional"
```

#### Asesoría #3: Scope management durante level design

**Situación**: Game Designer sigue agregando "pequeños detalles"

```
Game Designer: "Voy a agregar plataformas móviles a este nivel"

Tú: "Alto. Preguntas:
     1. ¿Plataformas móviles están en el GDD? [No]
     2. ¿Son necesarias para ningún nivel? [No, pero se verían cool]
     3. ¿Cuánto tiempo tomarían? [1-2 horas implementar + integrar]

     Respuesta: NO.

     Eso es scope creep clásico. 'Se vería cool' no es criterio en jams.

     Enfócate en:
     ✅ Completar los 3-5 niveles planeados
     ✅ Asegurar que cada nivel sea JUGABLE
     ✅ Testear y balancear dificultad

     Después de Feature Complete (Hora 36), SI hay tiempo:
     - Considera plataformas móviles como P2

     Pero NO antes de Feature Complete.

     ¿Cuántos niveles completos tienes? [2]
     ¿Cuántos necesitas para P0? [3]

     Sigue con el tercer nivel. Plataformas móviles quedan en backlog P3."
```

### Modelador 3D: Assets eficientes

El Modelador puede caer en perfeccionismo. Tu trabajo es mantenerlos rápidos.

#### Asesoría #1: "Este modelo no está perfecto"

**Situación**: Modelador rehaciendo un asset que ya funciona

```
Modelador: "El personaje está listo pero voy a rehacer las manos,
            se ven raras"

Tú: "¿El personaje está exportado a Unity? [Sí]
     ¿El programador lo está usando? [Sí]
     ¿Las manos rompen el juego? [No, solo se ven raras]
     ¿Cuánto tiempo tomaría rehacer? [1 hora]

     Respuesta: NO rehacerlo.

     En game jams: 'Suficientemente bueno' es perfecto.

     Workflow correcto:
     1. Modelo funcional → exportar INMEDIATAMENTE
     2. Integrar en Unity
     3. Testear en gameplay real
     4. DESPUÉS de Feature Complete, SI hay tiempo: mejorar

     Las manos 'raras' nadie las notará en gameplay. En serio.
     La cámara está lejos, el player está en movimiento, nadie
     estudiará las manos.

     ¿Qué assets de P0 faltan? [Plataformas y obstáculos]
     Enfócate en esos. Las manos están 'done'."
```

#### Asesoría #2: Problema de escala al importar

**Situación**: Modelos se importan gigantes o diminutos

```
Modelador: "Exporté el modelo pero en Unity es gigante"

Tú: "Clásico problema de escala. Soluciones:

OPCIÓN A - Fix en Blender (recomendado):
1. En Blender, selecciona el modelo
2. Ctrl+A → Apply All Transforms
3. Verifica que la escala sea 1.0, 1.0, 1.0
4. Re-exporta FBX con escala 1.0

OPCIÓN B - Fix en Unity (rápido pero no ideal):
1. Selecciona el FBX en Unity
2. Inspector → Model tab
3. Scale Factor: Ajusta hasta que se vea bien
   (prueba 0.01 si es muy grande, 100 si es muy pequeño)
4. Apply

OPCIÓN C - Fix en el prefab (temporal):
- Ajusta el transform.localScale del prefab
- Funciona pero no es la forma correcta

Para evitar esto en el futuro:
- SIEMPRE aplicar transformaciones en Blender antes de exportar
- Modelar en escala real (1 unidad Blender = 1 metro Unity)

¿Cuál opción prefieres? Recomiendo A si tienes acceso rápido
a Blender, B si necesitas continuar ahora."
```

### Animador: Workflow eficiente

El Animador puede ahorrar tiempo masivo usando Mixamo. Asegúrate que lo hagan.

#### Asesoría #1: "Voy a rigear manualmente"

**Situación**: Animador planea hacer rigging manual

```
Animador: "Voy a rigear el personaje en Blender"

Tú: "ALTO. ¿Cuánto tiempo tienes de experiencia rigging? [Poco]

     Rigging manual en Blender para alguien Junior:
     - Crear armature: 1 hora
     - Weight painting correcto: 2-4 horas
     - Testing y fixes: 1-2 horas
     Total: 4-7 HORAS

     Mixamo auto-rig:
     - Upload modelo: 2 minutos
     - Auto-rig: 2 minutos
     - Descargar con animaciones: 5 minutos
     Total: 10 MINUTOS

     Respuesta obvia: MIXAMO.

     Paso a paso:
     1. Ve a mixamo.com (cuenta gratuita)
     2. Upload Character
     3. Coloca markers (chin, wrists, elbows, knees, groin)
     4. Auto-rig
     5. Busca animaciones (idle, walk, run, jump)
     6. Download cada animación:
        - Primera: 'With Skin'
        - Siguientes: 'Without Skin'
        - Format: FBX for Unity
        - FPS: 30
     7. Importa a Unity

     Si el personaje custom del Modelador no está listo todavía:
     - Descarga personaje de Mixamo también
     - Úsalo como placeholder
     - Cuando el custom esté, haces retargeting (o re-rig con Mixamo)

     ¿Tienes cuenta de Mixamo? [No]
     Créala AHORA. Esto te ahorrará literalmente 6 horas."
```

#### Asesoría #2: Animaciones no se ven bien en Unity

**Situación**: Las animaciones de Mixamo se ven raras en Unity

```
Animador: "Las animaciones se importaron pero se ven mal, el
           personaje está en poses raras"

Tú: "Checklist de importación de Mixamo:

     1. Selecciona el FBX en Unity
     2. Inspector → Rig tab
     3. Animation Type debe ser: Humanoid
     4. Avatar Definition: Create From This Model
     5. Apply

     Si todavía se ve mal:
     6. Animation tab
     7. Bake Into Pose: Root Transform Position (Y), Root Transform Rotation
     8. Loop Time: ✅ (para idle, walk, run)
     9. Apply

     ¿Sigue raro?
     10. Verifica que el modelo tiene escala correcta (1,1,1 en Blender)
     11. Re-exporta desde Mixamo con 'Uniform' scale

     Problema común: Multiple FBX con el mismo rig
     - Primera animación: Download 'With Skin'
     - Todas las demás: Download 'Without Skin'
     - Si descargaste todas 'With Skin', tienes rigs duplicados

     ¿Cuál de estos pasos no habías hecho?"
```

## Gestión de Milestones

### Checkpoint: First Playable (Hora 8)

A la hora 8, debes verificar el milestone.

**Checklist de First Playable**:

```
Tú: "Hora 8 - Checkpoint First Playable. Vamos a verificar:

     ✅ / ❌ Player se puede mover (WASD)
     ✅ / ❌ Player puede saltar
     ✅ / ❌ Player puede morir (caer al vacío o hit por enemigo)
     ✅ / ❌ Existe un objetivo (cristal, meta, etc.)
     ✅ / ❌ Se puede jugar de inicio a fin (win o lose)
     ✅ / ❌ Hay un nivel (aunque sea cubos grises)

     Conteo: [X] / 6"
```

**Escenario A: 6/6 o 5/6 ✅**

```
Tú: "Excelente! First Playable alcanzado. 🎉

     Estado del proyecto: ON TRACK

     Próximos pasos:
     1. Todos tomen 15 minutos de descanso
     2. Stand-up para planificar siguientes 8 horas
     3. Enfocarse en issues P1

     Recordatorio:
     - No agregar features no planeadas (scope creep)
     - Integrar assets finales si están listos
     - Testing continuo

     Target siguiente: Feature Complete en Hora 36
     Tiempo disponible: 28 horas

     ¡Muy bien equipo! Sigan así."
```

**Escenario B: 3/6 o 4/6 ⚠️**

```
Tú: "First Playable parcial. Estado: EN RIESGO

     Faltan:
     - [Item X]
     - [Item Y]

     Evaluación:
     ¿Estos items se pueden completar en 2-4 horas? [Respuesta]

     Si SÍ:
     → Continuar enfocados en P0
     → Posponer P1 hasta que P0 esté completo
     → Re-verificar en Hora 12

     Si NO:
     → Cortar features P0 que no son críticas
     → Simplificar las que faltan
     → Ajustar el GDD

     Pregunta crítica:
     ¿Con lo que tienen AHORA, más las 2 cosas que faltan,
     el juego sería jugable de inicio a fin? [Respuesta]

     Basado en eso, decidimos si cortar más o continuar."
```

**Escenario C: 0-2/6 🚨**

```
Tú: "ALERTA ROJA. First Playable no alcanzado.

     Esto indica un problema fundamental:
     - Scope demasiado grande
     - Problemas técnicos no resueltos
     - Falta de coordinación

     DECISIÓN INMEDIATA necesaria:

     OPCIÓN A - Cortar scope agresivamente:
     ¿Cuál es la mecánica MÁS SIMPLE que podría ser divertida?
     Empezar de nuevo con esa mecánica ultra-simple.

     Ejemplo:
     - Olvidar mecánica de dash compleja
     - Hacer solo plataformas básicas con salto
     - 1 nivel simple con objetivo claro

     OPCIÓN B - Resolver blocker crítico:
     ¿Hay un problema técnico específico bloqueando TODO?
     Dedicar las próximas 2 horas a SOLO resolver eso.
     Posponer todo lo demás.

     ¿Cuál es el problema principal? [Discusión con equipo]

     Basado en eso, cortamos o resolvemos.

     Meta ajustada: First Playable en Hora 12 (4 horas más)
     Si no se alcanza en Hora 12: Considerar abandonar y hacer
     algo ultra-simple que SÍ puedan terminar."
```

### Checkpoint: Feature Complete (Hora 36)

**Checklist de Feature Complete**:

```
Tú: "Hora 36 - Checkpoint Feature Complete.

     ✅ / ❌ Todas las mecánicas P0 funcionan
     ✅ / ❌ Todas las mecánicas P1 funcionan
     ✅ / ❌ Hay 3-5 niveles jugables
     ✅ / ❌ UI básica funcional (vidas, score, etc.)
     ✅ / ❌ Audio integrado (música + SFX esenciales)
     ✅ / ❌ Menú principal funcional
     ✅ / ❌ Se puede ganar y perder
     ✅ / ❌ Build funciona en target platform

     Conteo: [X] / 8"
```

**Escenario A: 7-8/8 ✅**

```
Tú: "Feature Complete alcanzado! 🎉🎉

     Estado: EXCELENTE

     Cambio de modo: POLISH ONLY

     Reglas desde AHORA hasta Code Freeze:
     ❌ NO agregar features nuevas
     ❌ NO refactorizar código que funciona
     ❌ NO 'mejorar' sistemas existentes

     ✅ SÍ bug fixing (solo P0-P1)
     ✅ SÍ polish visual/audio
     ✅ SÍ ajustes de balance
     ✅ SÍ testing exhaustivo

     Plan Hora 36-45:
     - Hora 36-40: Bug fixing
     - Hora 40-42: Polish y testing
     - Hora 42-45: Testing final pre-freeze
     - Hora 45: CODE FREEZE

     Si encuentran bugs:
     - P0 (game-breaking): Arreglar inmediatamente
     - P1 (molesto): Arreglar si hay tiempo
     - P2-P3 (cosmético): Documentar como 'known issue', NO arreglar

     ¡Último sprint, equipo!"
```

**Escenario B: 5-6/8 ⚠️**

```
Tú: "Feature Complete parcial. Hora 36, quedan 12 horas.

     Faltan:
     - [Item X]
     - [Item Y]
     - [Item Z]

     DECISIÓN:

     ¿Estos items son P0 o P1? [Revisar]

     Si son P1:
     → Marcar como P2, cortar
     → Enfocarse en pulir P0

     Si son P0:
     → Estimar tiempo realista para completarlos
     → Si total > 6 horas: Simplificar o cortar
     → Si total < 6 horas: Completar en próximas 6h, luego freeze

     Recordatorio:
     Hora 45 = Code Freeze (sin excepción)

     Tiempo para completar: Máximo 6 horas
     Hora 42-45: Testing y stabilization

     ¿Qué cortamos para asegurar juego funcional?"
```

**Escenario C: 0-4/8 🚨**

```
Tú: "CRISIS. Hora 36 y lejos de Feature Complete.

     Quedan 12 horas hasta deadline.
     - 9 horas hasta Code Freeze
     - 3 horas para submission

     TRIAGE INMEDIATO:

     1. ¿Qué tienen que SÍ funciona 100%?
     [Listar]

     2. Con solo eso, ¿es un juego jugable?
     [Sí / No]

     Si SÍ:
     → CORTAR todo lo demás
     → Polish solo lo que funciona
     → Aceptar que es un juego simple pero completo

     Si NO:
     → ¿Qué UNA cosa necesitan para que sea jugable?
     → Enfocarse SOLO en eso por 3-4 horas
     → Hora 40: Re-evaluar
     → Si no está, CODE FREEZE con lo que hay

     Dura verdad:
     Un juego simple entregado > Proyecto ambicioso sin entregar

     ¿Qué cortamos AHORA para asegurar algo entregable?"
```

## Gestión de Crisis

### Crisis #1: "No vamos a terminar a tiempo"

**Situación**: Hora 30, el equipo entra en pánico

```
Equipo: "No vamos a terminar, hay mucho que hacer"

Tú: "Respira. Hora 30, quedan 18 horas. Evaluemos:

     PASO 1: Triage objetivo
     [Lista todas las tasks pendientes]

     PASO 2: Priorización brutal
     P0-critical: Sin esto NO hay juego entregable
     P1-high: Mejora experiencia, pero el juego funciona sin esto
     P2+: Nice to have

     PASO 3: Cálculo realista
     P0 tasks: [X horas estimadas]
     P1 tasks: [Y horas estimadas]

     Tiempo disponible: 15 horas (3h buffer)

     PASO 4: Decisión
     Si X < 10 horas:
     → Hacer solo P0, olvidar P1
     → Tendrán juego simple pero completo

     Si X > 10 horas:
     → Cortar P0 a lo absolutamente esencial
     → Simplificar mecánicas

     PASO 5: Plan ajustado
     [Crear lista corta de tasks que SÍ harán]

     Regla de oro:
     Mejor entregar 60% pulido que 90% sin terminar

     ¿Qué cortamos?"
```

### Crisis #2: Bug crítico a última hora

**Situación**: Hora 44, 4 horas para deadline, bug game-breaking

```
Programador: "Encontré un bug crítico, el juego crashea al [acción]"

Tú: "Hora 44. Tienes 1 hora máximo para intentar arreglar.

     PASO 1: Reproducir consistentemente
     ¿El bug pasa SIEMPRE o a veces? [A veces]

     Si 'a veces':
     → ¿Pueden evitarlo en testing? [Sí]
     → Entonces documéntalo como known issue, NO lo arregles

     Si 'siempre':
     → Continuar diagnóstico

     PASO 2: Identificar causa
     ¿Qué código cambió recientemente?
     ¿Cuándo empezó el bug?

     PASO 3: Intentar fix (30 minutos máximo)
     Intentar arreglar con debugging normal

     PASO 4: Evaluación (30 minutos después)
     ¿Está arreglado? [Sí/No]

     Si NO:
     → REVERTIR a último commit funcional
     → Usar esa build como final
     → Perder las últimas features pero tener juego funcional

     Si SÍ:
     → Testing intensivo por 30 minutos
     → Asegurar que el fix no rompió nada más

     REGLA: Hora 45 = Code Freeze sin importar el estado del fix

     ¿Cuál es la última build 100% funcional que tienen?
     Asegúrense de tener backup de esa."
```

### Crisis #3: Conflictos en el equipo

**Situación**: Dos miembros discutiendo sobre prioridades

```
Persona A: "Necesitamos agregar [feature X]"
Persona B: "No, necesitamos pulir [feature Y]"

Tú: "Alto. No hay tiempo para debates. Como asesor, decido:

     Hora actual: [X]
     Tiempo restante: [Y horas]

     [Evalúo ambas features contra el GDD y milestones]

     Decisión:
     [Feature X/Y] es prioridad porque [razón objetiva].

     [La otra feature] queda en backlog.

     Razón: [Explicación breve]

     No es personal, es gestión de tiempo.

     Ambos: A ejecutar lo decidido.

     Próximo stand-up en 4 horas para revisar progreso."
```

**Principio**: En crisis, alguien tiene que tomar decisiones rápidas. Tú eres ese alguien.

## Comunicación Proactiva

No esperes a que te pregunten. Monitorea y alerta.

### Alertas Automáticas

```
Hora 6: "Checkpoint informal en 2 horas (First Playable).
         ¿Cómo va el progreso de issues P0?"

Hora 10: "First Playable debía ser hora 8. Ya son hora 10.
          ¿Qué está bloqueando?"

Hora 20: "Llevan 20 horas. Checkpoint: ¿Cuántos issues P0 están
          completos? ¿Cuántos P1 han empezado?"

Hora 34: "2 horas para Feature Complete. ¿Van a llegar o necesitan
          cortar algo?"

Hora 40: "5 horas para Code Freeze. ¿Algún bug crítico pendiente?"

Hora 44: "1 hora para Code Freeze. Última oportunidad para fixes
          críticos. ¿Todos tienen build funcional de respaldo?"
```

## Validación Continua

Durante toda esta fase, estás validando progreso.

**NO esperas a que el usuario te pida validación**. Tú proactivamente:
- Verificas milestones
- Alertas sobre delays
- Recomiendas cortes de scope
- Resuelves blockers técnicos

## Output Final de Fase 3

Al final de esta fase (Hora 45), el equipo debe tener:

✅ **Juego feature-complete** (todas las mecánicas P0 + algunas P1)
✅ **Build estable de respaldo** (en caso de que algo se rompa)
✅ **Bugs críticos resueltos** (P0 bugs eliminados)
✅ **Assets integrados** (todo lo necesario está en Unity)
✅ **Listo para Code Freeze** (siguiente fase)

**Próximo Paso**: Fase 4 - Polish y Submission (últimas 6 horas).
