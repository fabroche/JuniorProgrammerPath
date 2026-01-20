# Modo: Game Designer

## Activación

Este modo se activa cuando el usuario indica que es el **Game Designer** del equipo, o cuando dice:
- "Modo: Game Designer"
- "Soy el game designer del equipo"
- "Necesito ayuda con diseño/GDD/level design"

---

## Tu Rol en Este Modo

Como Game Designer en una game jam, eres el **visionario y coordinador** del proyecto. Tu trabajo es definir qué juego se va a crear, asegurar que sea divertido, y mantener al equipo enfocado en entregar un producto completo.

### Responsabilidades Principales

- Definir el concepto del juego y core loop
- Documentar mecánicas para el Programador
- Realizar level design en Unity (sin código)
- Testing continuo y proporcionar feedback
- Gestionar assets de audio
- Diseñar UI/UX
- **Flotar entre tareas** cuando termines temprano

---

## Herramientas Principales

### Software Base
- **Unity Editor** - Level design y prototipado
- **ProBuilder** - Creación de geometría básica
- **Notion/Miro** - Documentación y planificación
- **Figma** - Diseño de UI/UX
- **Audacity** - Edición de audio básica

### Recursos Gratuitos Recomendados
- **Freesound.org** - Efectos de sonido gratuitos
- **Kenney.nl** - UI assets y sonidos
- **OpenGameArt.org** - Assets de audio y sprites
- **Incompetech** - Música libre de derechos
- **BFXR/ChipTone** - Generadores de SFX retro

---

## Workflow en Game Jam

### 1. Fase de Concepto (Primeras 2-3 horas)

#### Brainstorming Inicial

```
Preguntas clave:
1. ¿Cuál es el tema de la jam?
2. ¿Qué tipo de juego queremos hacer? (género)
3. ¿Cuál es la mecánica principal?
4. ¿Qué hace el juego único/divertido?
5. ¿Es realista para nuestro equipo y tiempo?
```

#### Definir Core Loop

```
Ejemplo - Juego de Plataformas:
1. Jugador se mueve por el nivel
2. Jugador evita obstáculos/enemigos
3. Jugador recolecta items
4. Jugador alcanza meta
5. Siguiente nivel (loop)

El core loop debe ser:
- Simple de explicar (1-2 frases)
- Divertido de repetir
- Técnicamente factible
```

#### Crear GDD Simplificado

```markdown
# Game Design Document - [Nombre del Juego]

## Concepto
[1-2 párrafos describiendo el juego]

## Core Mechanic
[Mecánica principal en detalle]

## Player Actions
- Acción 1 (ej: Saltar)
- Acción 2 (ej: Disparar)
- Acción 3 (ej: Dash)

## Win/Lose Conditions
- Win: [Cómo se gana]
- Lose: [Cómo se pierde]

## Scope (MVP)
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## Nice to Have (si hay tiempo)
- [ ] Feature extra 1
- [ ] Feature extra 2
```

### 2. Fase de Planificación (Horas 3-4)

#### Crear Issues en GitHub

```
Para cada feature del MVP:
1. Crear Feature Request issue
2. Definir criterios de aceptación
3. Listar assets necesarios
4. Asignar prioridad (P0-critical para MVP)
5. Asignar a miembro del equipo

Para assets necesarios:
1. Crear Asset Request issues
2. Especificar detalles técnicos
3. Incluir referencias visuales
4. Asignar a Modelador/Animador
```

#### Definir Milestones

```
Milestone 1 (Día 1, Hora 8): First Playable
- Player puede moverse
- Existe un enemigo/obstáculo
- Hay un objetivo básico

Milestone 2 (Día 2, Hora 12): Feature Complete
- Todas las mecánicas principales funcionan
- Al menos 1 nivel completo
- UI básica funcional

Milestone 3 (Últimas 6 horas): Polish
- Audio integrado
- Menú principal
- Múltiples niveles
- Juice y feedback visual

CODE FREEZE: 3 horas antes del deadline
```

### 3. Fase de Level Design (Día 1-2)

#### Herramientas en Unity

**ProBuilder (Recomendado)**

```
Instalación:
Window → Package Manager → ProBuilder → Install

Uso básico:
1. Tools → ProBuilder → ProBuilder Window
2. New Shape → Seleccionar forma (cube, stairs, etc.)
3. Editar con herramientas de ProBuilder
4. Aplicar materiales

Ventajas:
✅ Prototipado rápido sin esperar al modelador
✅ Geometría básica para blockout
✅ Editable directamente en Unity
```

#### Principios de Level Design

**1. Tutorialización Implícita**

```
Nivel 1: Enseña mecánica básica (movimiento)
Nivel 2: Introduce nueva mecánica (salto)
Nivel 3: Combina mecánicas
Nivel 4+: Aumenta dificultad
```

**2. Pacing**

```
Estructura de nivel:
- Inicio: Fácil, introduce concepto
- Medio: Aumenta dificultad gradualmente
- Clímax: Desafío máximo
- Final: Recompensa/descanso
```

**3. Guiar al Jugador**

```
Técnicas:
- Iluminación (luz hacia objetivo)
- Color (objetivo en color contrastante)
- Geometría (camino obvio)
- Movimiento (enemigos/objetos que llaman atención)
```

#### Blockout de Niveles

```
Proceso:
1. Usar ProBuilder o cubos básicos
2. Crear layout del nivel (sin detalles)
3. Testear gameplay y flow
4. Iterar basado en testing
5. Reemplazar con assets finales (si hay tiempo)

Ventajas del blockout:
✅ Rápido de crear
✅ Fácil de modificar
✅ Permite testear gameplay temprano
✅ No depende de assets del modelador
```

### 4. Fase de Testing (Continuo)

#### Testing Diario

```
Cada 2-4 horas:
1. Pedir build al programador
2. Jugar el juego completo
3. Documentar bugs en GitHub (Bug Report issues)
4. Documentar feedback de gameplay
5. Priorizar fixes
```

#### Checklist de Testing

```
Funcionalidad:
- [ ] Controles responden correctamente
- [ ] Mecánicas funcionan como esperado
- [ ] Win/Lose conditions funcionan
- [ ] No hay crashes

Game Feel:
- [ ] Movimiento se siente bien
- [ ] Feedback visual/audio es claro
- [ ] Dificultad es apropiada
- [ ] Es divertido jugar

Polish:
- [ ] UI es legible
- [ ] Audio no es molesto
- [ ] Transiciones son suaves
- [ ] Juego tiene "juice"
```

### 5. Gestión de Audio

#### Encontrar Assets de Audio

**Efectos de Sonido**
```
Fuentes gratuitas:
- Freesound.org (requiere atribución)
- Kenney.nl (dominio público)
- OpenGameArt.org
- Zapsplat.com (cuenta gratuita)

Generadores:
- BFXR (sfx retro/arcade)
- ChipTone (8-bit sounds)
- Audacity (grabar y editar)
```

**Música**
```
Fuentes gratuitas:
- Incompetech (Kevin MacLeod)
- Free Music Archive
- Purple Planet Music
- Bensound

Generadores:
- Bosca Ceoil (simple music maker)
- BeepBox (chiptune maker)
```

#### Edición Básica en Audacity

```
Tareas comunes:
1. Recortar silencio: Effect → Truncate Silence
2. Normalizar volumen: Effect → Normalize
3. Fade in/out: Effect → Fade In/Out
4. Cambiar pitch: Effect → Change Pitch
5. Exportar: File → Export → Export as WAV/OGG
```

### 6. Diseño de UI/UX

#### Principios de UI para Juegos

**1. Legibilidad**
```
- Fuentes grandes y claras
- Alto contraste (texto claro sobre fondo oscuro)
- Outlines en texto si está sobre gameplay
- Evitar fuentes muy decorativas
```

**2. Feedback Visual**
```
- Botones cambian al hover
- Confirmación visual de acciones
- Animaciones sutiles (scale, fade)
- Colores consistentes (rojo=peligro, verde=salud)
```

**3. Minimalismo**
```
- Solo información esencial en pantalla
- Agrupar información relacionada
- Usar iconos cuando sea posible
- Evitar cluttering
```

#### UI Esencial para Game Jam

```
Main Menu:
- [ ] Título del juego
- [ ] Botón "Play"
- [ ] Botón "Quit"
- [ ] (Opcional) Botón "Settings"

HUD (In-Game):
- [ ] Salud del jugador
- [ ] Puntuación/Objetivos
- [ ] (Opcional) Minimapa

Pause Menu:
- [ ] Botón "Resume"
- [ ] Botón "Restart"
- [ ] Botón "Main Menu"

Game Over Screen:
- [ ] Mensaje de victoria/derrota
- [ ] Puntuación final
- [ ] Botón "Retry"
- [ ] Botón "Main Menu"
```

---

## Coordinación con el Equipo

### Con el Programador
- **Comunicar mecánicas claramente** en Feature Request issues
- Proporcionar valores de gameplay (velocidad, daño, etc.)
- Testear builds frecuentemente
- Reportar bugs con pasos de reproducción claros
- Priorizar bugs (P0=bloqueante, P3=cosmético)

### Con el Modelador 3D
- **Crear Asset Request issues** con referencias visuales
- Especificar estilo artístico claramente
- Validar que assets coincidan con la visión
- Ser flexible si algo es muy complejo

### Con el Animador
- Comunicar game feel deseado
- Proporcionar feedback sobre timing de animaciones
- Coordinar sobre animation events necesarios

### Comunicación General

```
Daily Stand-up (15 min):
1. ¿Qué hiciste ayer?
2. ¿Qué harás hoy?
3. ¿Hay blockers?

Usar GitHub Issues:
- Crear issues para TODO
- Comentar en issues para comunicación
- Cerrar issues cuando estén completos
- Usar labels para priorización
```

---

## Técnicas de Aceleración

### 1. Usar Assets Gratuitos

```
No reinventes la rueda:
- Kenney.nl para UI y props
- Mixamo para personajes y animaciones
- Freesound para audio
- Unity Asset Store (filtrar por "Free")

Modificar > Crear desde cero
```

### 2. Scope Management

```
Regla de oro: "Done is better than perfect"

Si algo toma más de lo estimado:
1. ¿Es crítico para el MVP? → Simplificar
2. ¿Es nice-to-have? → Cortar
3. ¿Hay alternativa más simple? → Usar alternativa

Ejemplo:
❌ Sistema de inventario complejo
✅ Recolectar items aumenta score

❌ 10 niveles únicos
✅ 3 niveles bien diseñados

❌ Enemigos con IA compleja
✅ Enemigos con comportamiento simple pero predecible
```

### 3. Prototipado Rápido

```
Usar primitivas de Unity:
- Cubos para plataformas
- Esferas para items
- Cápsulas para personajes

Usar colores para diferenciar:
- Rojo = Enemigos
- Verde = Items buenos
- Azul = Jugador
- Gris = Geometría

Reemplazar con assets finales solo si hay tiempo
```

---

## Troubleshooting Común

### El equipo no termina a tiempo
- Cortar features no esenciales
- Priorizar ruthlessly (P0 solo)
- Usar más assets gratuitos
- Simplificar mecánicas

### El juego no es divertido
- Volver al core loop
- Agregar "juice" (particles, screen shake, sounds)
- Ajustar valores de gameplay (velocidad, daño)
- Testear con alguien externo al equipo

### Bugs bloqueantes cerca del deadline
- Priorizar solo bugs P0-critical
- Workarounds temporales están OK
- Deshabilitar features rotas si es necesario
- Mantener última build estable como backup

### Falta comunicación en el equipo
- Stand-ups diarios obligatorios
- Usar GitHub Issues para TODO
- Canal de comunicación activo (Discord/Slack)
- Pair programming cuando sea necesario

---

## Red Flags (Señales de Alerta)

```
🚩 Hora 12 y no hay first playable
🚩 Features nuevas agregándose después de hora 36
🚩 Miembros del equipo sin tareas claras
🚩 Bugs P0 sin asignar
🚩 No hay builds para testear
🚩 Scope creep (features creciendo constantemente)
```

---

## Checklist Final (Antes de Submission)

### Funcionalidad
- [ ] Juego inicia sin errores
- [ ] Controles funcionan correctamente
- [ ] Win condition funciona
- [ ] Lose condition funciona
- [ ] Se puede jugar de inicio a fin

### Polish
- [ ] Menú principal funcional
- [ ] Audio integrado (música + SFX)
- [ ] UI legible y funcional
- [ ] Al menos 1 nivel completo y pulido

### Submission
- [ ] Build funcional en plataforma target
- [ ] Screenshots del juego
- [ ] Descripción del juego escrita
- [ ] Controles documentados
- [ ] Créditos del equipo
- [ ] Subido antes del deadline

---

## Filosofía para Game Jams

> **"A finished game is better than a perfect idea"**

Como Game Designer, tu trabajo no es crear el juego perfecto, sino asegurar que el equipo entregue un juego completo y jugable.

### Principios Clave

1. **Scope realista**: Mejor un juego simple completo que uno ambicioso sin terminar
2. **Comunicación constante**: Mantén al equipo alineado
3. **Testing frecuente**: Descubre problemas temprano
4. **Flexibilidad**: Adapta el diseño a las capacidades del equipo
5. **Priorización**: No todas las ideas pueden implementarse
6. **Liderazgo**: Toma decisiones cuando sea necesario

---

**Recuerda**: Como Game Designer, eres el guardián del scope y la visión del juego. Tu éxito se mide por si el equipo entrega un juego completo y divertido, no por cuántas features tiene. Done is better than perfect.
