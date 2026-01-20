# FASE 4: Polish y Submission

## Objetivo de esta Fase

Asegurar que el juego esté pulido, estable, y correctamente entregado antes del deadline.

**Input**: Juego feature-complete de Fase 3

**Output**: Juego completado + Build final + Submission exitoso + Post-mortem

**Duración**: Horas 42-48 (últimas 6 horas de la jam)

## El Problema que Resuelves

Muchos equipos llegan al final con un juego "casi listo" pero fallan en:
- Code Freeze → Siguen tocando código y rompen todo
- Build process → Nunca probaron hacer build hasta el último minuto
- Submission → No leyeron las reglas, suben archivo incorrecto, o llegan 5 minutos tarde

Tu rol es **asegurar que crucen la línea de meta exitosamente**.

## Timeline Detallado

### Hora 42-45: Pre-Freeze Testing y Fixes

Esta es la **última ventana** para tocar código.

#### Hora 42: Testing Sistemático

```
Tú: "Hora 42. 3 horas hasta Code Freeze.

     TESTING PROTOCOL:

     Cada persona testea COMPLETAMENTE el juego:

     Checklist de Testing:
     - [ ] Juego inicia sin errores
     - [ ] Controles responden correctamente
     - [ ] Player puede completar nivel 1
     - [ ] Player puede completar todos los niveles
     - [ ] Win condition funciona
     - [ ] Lose condition funciona
     - [ ] UI muestra información correcta
     - [ ] Audio funciona (música + SFX)
     - [ ] No hay bugs game-breaking visibles

     Reportar bugs en Discord con formato:
     🐛 BUG: [Descripción corta]
     Priority: P0 / P1 / P2
     Pasos: [Cómo reproducir]

     Time limit: 30 minutos de testing

     DESPUÉS del testing:
     - Priorizar bugs P0 únicamente
     - Ignorar bugs P1-P2 (documentarlos pero NO arreglar)"
```

#### Hora 42.5: Bug Triage

```
Tú: "OK, bugs reportados: [lista]

     TRIAGE:

     Bugs P0 (game-breaking):
     - [Bug 1]
     - [Bug 2]

     Estimación de fixes: [X horas]

     DECISIÓN:

     Si X < 2 horas:
     → Programador arregla bugs P0
     → Resto del equipo: Preparar assets de submission

     Si X > 2 horas:
     → Evaluar si bug es 'workaround-able'
     → Si es workaround: Documentar solución, NO arreglar código
     → Si NO es workaround: Arreglar el crítico, ignorar el resto

     Ejemplo de 'workaround':
     Bug: 'Player puede morir después de ganar si se mueve'
     Workaround: 'No muevas el player después de ganar'
     → Documentar en controles: 'Al ganar, espera a transición'

     Regla de oro:
     Build estable > Build con fix riesgoso"
```

#### Hora 43-45: Fixes Controlados

**Solo Programador toca código. Resto hace submission prep.**

```
Programador - Bug Fixing Protocol:

1. Hacer BACKUP de build actual
   - Commit: 'Stable build before final fixes'
   - Tag: 'v1.0-stable'

2. Por cada bug P0:
   - Crear branch de fix: bugfix/[nombre]
   - Implementar fix
   - Testing básico (5 minutos)
   - Si funciona: Merge a main
   - Si NO funciona: Revertir, seguir con siguiente

3. Cada 30 minutos: Build de testing
   - Jugar el juego completo
   - Verificar que nada se rompió

4. Hora 44.5: ÚLTIMO fix permitido
   - Hora 44.5 - 45: Solo testing, NO más changes

Otros roles:
- Game Designer: Screenshots, descripción, controles
- Modelador: Preparar trailer/GIF si hay tiempo
- Animador: Ayudar con screenshots y testing
```

### Hora 45: ⏰ CODE FREEZE

**REGLA ABSOLUTA: No se toca código después de hora 45**

```
Tú: "🚨 CODE FREEZE - HORA 45 🚨

     Programador:
     - [ ] Último commit: 'Code Freeze - v1.0 final'
     - [ ] Tag en Git: 'v1.0-final'
     - [ ] Build para Windows (si aplica)
     - [ ] Build para WebGL (si aplica)
     - [ ] Verificar que builds funcionan

     NADIE toca código después de este punto.

     Si encuentran bug después de freeze:
     → Anotar como 'Known Issue'
     → NO arreglar

     Siguiente fase: Build & Submission"
```

### Hora 45-47: Build Process

#### Paso 1: Build para Windows

```
Tú: "Programador, Build para Windows:

     1. File → Build Settings
     2. Platform: Windows (si no está, Switch Platform)
     3. Scenes in Build:
        - [ ] Marcar Main Menu scene
        - [ ] Marcar todas las Game scenes
        - [ ] NO marcar Test scenes
     4. Player Settings:
        - Company Name: [Nombre del equipo]
        - Product Name: [Nombre del juego]
        - Version: 1.0
        - Icon: [Si tienen, si no, default OK]
     5. Build
        - Target: Windows (x86_64)
        - Create folder: Builds/Windows/
        - Nombre: [NombreJuego]-Windows
     6. Wait for build (2-10 minutos)

     Testing de build:
     1. Cierra Unity
     2. Ve a carpeta Builds/Windows/[NombreJuego]-Windows/
     3. Ejecuta el .exe
     4. Juega el juego completo
     5. ¿Funciona todo? [Verificar]

     Si hay errores:
     - Revisar consola de Unity por errores
     - Common issue: Paths rotas, assets faltantes
     - Si no se puede resolver en 10 minutos: Usar build anterior

     Una vez funciona:
     - Comprimir carpeta completa en .zip
     - Nombre: [NombreJuego]-Windows.zip
     - NO comprimir solo el .exe, comprimir TODA la carpeta"
```

#### Paso 2: Build para WebGL

```
Tú: "Build para WebGL (para itch.io):

     IMPORTANTE: WebGL toma MÁS TIEMPO que Windows (10-30 min)

     1. File → Build Settings
     2. Platform: WebGL
     3. Switch Platform (si es necesario)
     4. Player Settings → WebGL:
        - Compression Format: Gzip
        - Enable Exceptions: None (para size)
        - WebGL Template: Default
     5. Build
        - Create folder: Builds/WebGL/
        - Nombre: [NombreJuego]-WebGL
     6. Wait for build (10-30 minutos)
        - NO cerrar Unity
        - Pueden trabajar en otra cosa mientras
     7. Testing:
        - Necesitan servidor web local o subir a itch.io
        - NO funciona abriendo index.html directo

     Si build falla:
     - Error común: Memoria insuficiente → Cerrar otras apps
     - Error común: Assets no optimizados → Reducir quality
     - Si no se puede resolver: Entregar solo Windows build

     Nota: WebGL es opcional en muchas jams.
     Windows build es más importante."
```

#### Paso 3: Verificación de Builds

```
Checklist de Build Funcional:

- [ ] Build ejecuta sin errores
- [ ] Todos los niveles accesibles
- [ ] Controles funcionan
- [ ] Audio funciona
- [ ] Win/Lose conditions funcionan
- [ ] No hay bugs críticos nuevos
- [ ] Tamaño de archivo razonable (<500 MB preferentemente)

Si TODO marca ✅:
→ Este es tu build final

Si algo falla:
→ Usar build de respaldo de Hora 45"
```

### Hora 46-47.5: Submission Materials

Mientras el programador hace builds, **resto del equipo prepara submission**.

#### Screenshots (Game Designer + todos)

```
Tú: "Necesitan 5-10 screenshots buenos. Tips:

     QUÉ capturar:
     ✅ Gameplay action (player mid-jump, usando mechanic)
     ✅ Level overview (mostrar ambiente)
     ✅ UI visible (mostrar HUD, menu)
     ✅ Momento 'cool' (efecto visual, enemy interaction)
     ✅ Win screen o objetivo

     ❌ NO capturar:
     ❌ Bugs o glitches
     ❌ Pantalla en negro o loading
     ❌ Misma escena desde ángulo ligeramente diferente

     Cómo tomar:
     - En Unity: Game window maximizada
     - En play mode
     - F12 o screenshot tool

     Editing rápido (opcional):
     - Crop a 16:9 ratio
     - Aumentar brightness si está muy oscuro
     - NO agregar texto/watermarks (itch.io lo hace confuso)

     Goal: Que alguien vea el screenshot y quiera jugar"
```

#### GIF/Video Corto (Opcional pero muy recomendado)

```
Tú: "Un GIF de 5-10 segundos aumenta clicks MASIVAMENTE.

     Opción A - GIF (más fácil):
     1. Juega el juego
     2. Captura con OBS o Windows Game Bar
     3. Exporta 5-10 segundos de gameplay
     4. Convierte a GIF: gifski o ezgif.com
     5. Tamaño: <5 MB

     Opción B - Video (mejor quality):
     1. Captura 30-60 segundos
     2. Edita highlights (jump, dash, ganar nivel)
     3. Música de fondo (la del juego)
     4. Upload a YouTube como unlisted

     QUÉ mostrar:
     - Primeros 5 segundos: Core mechanic
     - Siguientes 5 segundos: Gameplay challenge
     - Últimos 5 segundos: Win condition o efecto cool

     Tiempo límite: 30 minutos
     Si toma más: SKIP, no es crítico"
```

#### Descripción del Juego

```
Tú: "Descripción en itch.io. Template:

---

# [Nombre del Juego]

[Hook de 1 línea sobre qué hace el juego único]

## Gameplay

[2-3 líneas explicando qué haces en el juego]

## Controls

**Keyboard**:
- WASD / Arrow Keys: Move
- Space: Jump
- Shift: Dash
- ESC: Pause

**Controller** (si aplica):
- Left Stick: Move
- A Button: Jump
- B Button: Dash

## Features

- [Feature 1]
- [Feature 2]
- [Feature 3]

## Credits

**Game Designer**: [Nombre]
**Programmer**: [Nombre]
**3D Artist**: [Nombre]
**Animator**: [Nombre]

Made in 48 hours for [Nombre de Game Jam]

🤖 AI-assisted development coordination

---

Tips:
- Corto y claro
- No exagerar features que no están
- Controles DEBEN estar claros
- Créditos completos del equipo"
```

#### Reglas de la Jam

```
Tú: "ANTES de subir, LEAN las reglas de la jam:

     Verificar:
     - [ ] Plataforma correcta (itch.io, GameJolt, etc.)
     - [ ] Formato de archivo aceptado (zip, rar, etc.)
     - [ ] Tamaño máximo (típicamente 1 GB)
     - [ ] Build type permitido (Windows, Mac, Linux, WebGL)
     - [ ] Assets permitidos (algunos jams no permiten pre-hechos)
     - [ ] Tema incorporado (si es temática)
     - [ ] Deadline exacto (timezone! UTC?)

     Si algo no cumple reglas:
     → Ajustar ANTES de subir
     → No asuman, LEAN las reglas

     Common mistakes:
     - Subir solo .exe (necesitan toda la carpeta)
     - Timezone equivocado (+3 horas diferencia = llegar tarde)
     - Olvidar marcar 'This is a jam submission'"
```

### Hora 47.5-48: Submission

#### Upload a Plataforma

**Itch.io Process** (más común):

```
Tú: "Hora 47.5 - Comenzar upload a itch.io:

     PASO 1: Crear proyecto
     1. itch.io → Dashboard → Create new project
     2. Title: [Nombre exacto del juego]
     3. Project URL: [nombre-juego] (sin espacios, lowercase)
     4. Classification: Game
     5. Kind of project: HTML (si WebGL) o Downloadable (si Windows/Mac)

     PASO 2: Upload files
     1. Uploads section
     2. Upload [NombreJuego]-Windows.zip
        - Display name: 'Windows'
        - This file will be played in browser: NO
     3. Si tienen WebGL:
        - Upload carpeta WebGL como zip
        - This file will be played in browser: YES
     4. Wait for upload (puede tardar)

     PASO 3: Screenshots y descripción
     1. Cover image: Mejor screenshot
     2. Screenshots: Upload los 5-10 preparados
     3. Description: Pegar descripción preparada
     4. Genre: [Seleccionar apropiado]
     5. Tags: platformer, action, gamejam, etc. (relevantes)

     PASO 4: Jam settings
     1. Scroll abajo a 'Jams'
     2. Buscar su jam: [Nombre]
     3. Submit to jam
     4. Verificar que dice 'Submitted to [Jam Name]'

     PASO 5: Visibility
     1. Visibility: Restricted (o Public, según reglas)
     2. Save & view page

     PASO 6: TESTING FINAL
     1. Click en el link de la página
     2. Download el Windows build
     3. Ejecutar y verificar que funciona
     4. Si WebGL: Jugar en browser y verificar
     5. ¿Todo funciona? [Sí/No]

     Si algo falla:
     - Re-upload file correcto
     - Verificar que .zip incluye TODO

     CRÍTICO: Verificar timestamp de submission
     - Debe ser ANTES del deadline
     - Revisar timezone"
```

#### Pre-Deadline Checklist

```
Tú: "30 minutos antes del deadline - Final checklist:

     - [ ] Build subido a plataforma
     - [ ] Link funcional verificado
     - [ ] Build testeado (descarga y ejecuta)
     - [ ] Screenshots visibles
     - [ ] Descripción completa
     - [ ] Controles documentados
     - [ ] Créditos del equipo
     - [ ] Marcado como jam submission
     - [ ] Timestamp de submission ANTES de deadline

     Si TODO está ✅:
     🎉 COMPLETADO! 🎉

     Último paso: Respirar.

     Opcionales pero recomendados:
     - [ ] Tweet con link al juego (@mention de la jam)
     - [ ] Post en Discord de la jam
     - [ ] Compartir con amigos para testeo

     Han terminado. Felicidades, equipo!"
```

## Post-Mortem (Después de Submission)

Una vez entregado, hacer un breve post-mortem (10-15 minutos).

### Template de Post-Mortem

```markdown
# Post-Mortem - [Nombre del Juego]

## Metadata

- **Jam**: [Nombre]
- **Theme**: [Tema]
- **Duration**: 48 hours
- **Team**: 4 (Designer, Programmer, 3D Artist, Animator)
- **Engine**: Unity 6
- **Link**: [URL a itch.io]

## What We Achieved

**MVP Completed**: [X] / [Y] features

**P0 Features (Critical)**:
- [x] [Feature 1]
- [x] [Feature 2]
- [ ] [Feature 3 - cut]

**P1 Features (High)**:
- [x] [Feature 4]
- [ ] [Feature 5 - cut]

**Final Scope**: [Descripción de qué quedó en el juego]

**Milestones**:
- First Playable (Target: Hour 8): ✅ Achieved at Hour [X]
- Feature Complete (Target: Hour 36): ✅/❌ Achieved at Hour [Y]
- Code Freeze (Hour 45): ✅ On time

## What Went Well ✅

1. **[Aspecto positivo 1]**
   - Ejemplo: "Scope management - cortamos features agresivamente temprano"
   - Impact: Logramos entregar juego completo

2. **[Aspecto positivo 2]**
   - Ejemplo: "Uso de Mixamo - ahorramos 6 horas en rigging"
   - Impact: Animaciones listas en 1 hora vs 7

3. **[Aspecto positivo 3]**
   - Ejemplo: "Communication - stand-ups cada 6 horas funcionaron bien"
   - Impact: Cero blockers descubiertos tarde

## What Didn't Go Well ⚠️

1. **[Problema 1]**
   - Ejemplo: "Git conflicts en escenas"
   - Impact: Perdimos 2 horas resolviendo merges
   - Fix para próxima: Trabajar en escenas separadas

2. **[Problema 2]**
   - Ejemplo: "Perfeccionismo en models"
   - Impact: Modelador rehizo assets que ya funcionaban
   - Fix para próxima: "Done > Perfect" más estricto

3. **[Problema 3]**
   - Ejemplo: "No testeamos builds hasta última hora"
   - Impact: Encontramos bug de build a hora 46
   - Fix para próxima: Test build a hora 30

## Key Learnings 💡

1. **Scope Management**
   - [Learning específico]

2. **Technical**
   - [Learning específico]

3. **Team Coordination**
   - [Learning específico]

## For Next Jam

**Keep Doing**:
- [Práctica 1]
- [Práctica 2]

**Start Doing**:
- [Nueva práctica 1]
- [Nueva práctica 2]

**Stop Doing**:
- [Práctica ineficiente 1]
- [Práctica ineficiente 2]

## Final Thoughts

[1-2 párrafos sobre la experiencia, qué aprendieron, y si están orgullosos del resultado]

---

**Team Satisfaction**: [X] / 10
**Would Jam Again**: Yes / No
```

## Errores Comunes en Esta Fase

### Error #1: "Un fix más y listo"

```
❌ Programador: "Encontré cómo arreglar este bug, déjame hacer un fix rápido"
                 [Hora 47, 1h para deadline]

Tú: "NO. Code Freeze fue hora 45.

     Ese fix puede:
     - Romper algo que funciona
     - Introducir bugs nuevos
     - Dejar el build en estado roto

     Si el bug es cosmético o workaround-able:
     → Documentar como Known Issue
     → NO tocar código

     Si el bug es game-breaking:
     → Usar build de backup de Hora 45

     Regla: Code Freeze es final. Sin excepciones."
```

### Error #2: "Subamos el proyecto completo"

```
❌ Equipo: "Vamos a comprimir la carpeta del proyecto y subirla"

Tú: "NO. Eso incluye Library/, Temp/, .git/, etc.

     Tamaño:
     - Proyecto completo: 2-5 GB
     - Build solo: 50-200 MB

     Además, subir proyecto completo:
     - Muestra código/assets desordenados
     - No es ejecutable directamente
     - Puede violar reglas de algunas jams

     Subir: Build compilado únicamente
     - Windows: La carpeta [Nombre]_Data + .exe en un .zip
     - WebGL: Carpeta Build/ completa

     NO subir: Proyecto Unity completo"
```

### Error #3: "Entregamos con 2 minutos para el deadline"

```
❌ Equipo: [Hora 47:58, deadline 48:00]
           "OK casi listo para subir"

Tú: "TOO LATE.

     Submission debió estar completo a Hora 47:30 MÍNIMO.

     Razones:
     - Upload tarda 5-15 minutos
     - Testing tarda 5-10 minutos
     - Si algo falla, no hay tiempo para arreglar

     Si ahora son Hora 47:58:
     - Upload lo más rápido posible
     - NO testear (no hay tiempo)
     - Orar que el upload termine a tiempo

     Lección para próxima jam:
     Buffer de 30 minutos MÍNIMO antes de deadline"
```

### Error #4: "Olvidamos el tema de la jam"

```
❌ [Después de upload]
   Equipo: "Oh no, el tema era 'Time' y no lo incorporamos"

Tú: "Esto debió verificarse en Fase 1 (Análisis y Scope).

     Ahora es demasiado tarde para cambiar el juego.

     Opciones:
     1. En descripción, explicar cómo el juego relaciona al tema
        (aunque sea tangencial)
     2. Aceptar penalización de jueces si la hay

     Ejemplo: Si el tema es 'Time' y su juego es plataformas:
     - 'Racing against time to collect crystals'
     - 'Time-based challenges'
     - Cualquier justificación creativa

     No es ideal, pero mejor que no mencionar el tema.

     CRITICAL LEARNING: Verificar tema en planning phase"
```

## Validación Final

Antes de dar por terminada la jam:

✅ **Build funcionando subido a plataforma**
✅ **Link verificado y testeado**
✅ **Submission marcada oficialmente en la jam**
✅ **Timestamp de submission ANTES del deadline**
✅ **Screenshots y descripción publicados**
✅ **Reglas de la jam cumplidas**

Si todos los checks están ✅:

```
Tú: "🏆 FELICIDADES, EQUIPO! 🏆

     Han completado la game jam exitosamente.

     Métricas finales:
     - Scope planeado: [X features]
     - Scope entregado: [Y features]
     - % Completado: [Y/X]%
     - Milestones alcanzados: [X/3]
     - Build funcional: ✅
     - Entregado a tiempo: ✅

     Logros:
     - Transformaron una idea en un juego jugable
     - Gestionaron scope efectivamente
     - Coordinaron como equipo bajo presión
     - TERMINARON (la mayoría de equipos no lo hacen)

     Esto es lo que importa: TERMINARON.

     Independiente de si ganan o no, aprendieron
     sobre gestión de proyectos, coordinación de equipo,
     y lo más importante: pueden apuntar a un juego
     funcional que USTEDES hicieron.

     Descansen. Lo merecen.

     Cuando reciban feedback de jugadores y jueces,
     úsenlo para la próxima jam.

     ¡Excelente trabajo! 🎉"
```

## Output Final de Fase 4

El equipo termina con:

1. **Juego completado** publicado en plataforma
2. **Build funcional** testeado y verificado
3. **Submission exitoso** antes del deadline
4. **Post-mortem** documentando learnings
5. **Experiencia valiosa** para futuras jams

**Fin del proceso**. Has guiado exitosamente al equipo de idea a producto entregado.
