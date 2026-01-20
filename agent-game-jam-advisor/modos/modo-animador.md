# Modo: Animador

## Activación

Este modo se activa cuando el usuario indica que es el **Animador** del equipo, o cuando dice:
- "Modo: Animador"
- "Soy el animador del equipo"
- "Necesito ayuda con animaciones/rigging/Mixamo"

---

## Tu Rol en Este Modo

Como Animador en una game jam, eres responsable de **dar vida y movimiento** a los personajes y objetos del juego. Tu trabajo es crucial para que el juego se sienta dinámico y responsivo.

### Responsabilidades Principales

- Rigear personajes en Blender
- Crear animaciones esenciales (idle, walk, run, jump, attack)
- Exportar animaciones optimizadas para Unity
- Coordinar animation events con el Programador
- Asegurar transiciones fluidas entre animaciones

---

## Herramientas Principales

### Software Base
- **Blender** - Rigging y animación principal
- **Mixamo** - Rigging automático y biblioteca de animaciones
- **Unity Animation Rigging Package** - Rigging procedural en Unity

### Recursos Gratuitos Recomendados
- **Mixamo** - Personajes rigeados y animaciones gratuitas
- **Blender Cloud** - Tutoriales y assets de animación
- **Sketchfab** - Modelos rigeados (algunos gratuitos)

---

## Workflow en Game Jam

### 1. Fase de Planificación (Día 1 - Primeras 2 horas)

- Revisar qué personajes/objetos necesitan animación
- Priorizar animaciones críticas vs. nice-to-have
- Coordinar con el Modelador 3D sobre topología
- **Crear Asset Request issues** para cada set de animaciones

### 2. Fase de Rigging (Día 1 - Horas 2-6)

**Opción A: Rigging Manual en Blender**
- Crear armature (esqueleto)
- Posicionar bones
- Weight painting
- Testear deformación

**Opción B: Usar Mixamo (RECOMENDADO para game jams)**
- Subir modelo a Mixamo
- Auto-rig en 2 minutos
- Descargar con animaciones incluidas

### 3. Fase de Animación (Día 1-2)

**Prioridad 1 - Animaciones Core (Primeras 8 horas):**
- Idle (loop)
- Walk/Run (loop)
- Jump (start, air, land)

**Prioridad 2 - Animaciones de Gameplay (Horas 8-24):**
- Attack/Shoot
- Take Damage
- Death

**Prioridad 3 - Polish (Últimas 24 horas):**
- Animaciones de transición
- Gestos adicionales
- Animaciones de objetos/props

---

## Rigging Rápido con Mixamo

### Paso 1: Preparar Modelo en Blender

```
1. Asegurar que el modelo esté en T-Pose o A-Pose
2. Aplicar todas las transformaciones (Ctrl+A → All Transforms)
3. Exportar como FBX:
   - Scale: 1.00
   - Apply Scalings: FBX All
   - Forward: -Z, Up: Y
```

### Paso 2: Auto-Rig en Mixamo

```
1. Ir a mixamo.com (cuenta Adobe gratuita)
2. Upload Character
3. Colocar markers en: chin, wrists, elbows, knees, groin
4. Click "Next" → Auto-rigging completo en ~2 minutos
```

### Paso 3: Descargar Animaciones

```
1. Buscar animación (ej: "Idle", "Walking", "Running")
2. Ajustar parámetros si es necesario
3. Download:
   - Format: FBX for Unity
   - Skin: With Skin (para primera animación)
   - Skin: Without Skin (para animaciones adicionales)
   - FPS: 30
```

---

## Animación Manual en Blender

### Principios de Animación Esenciales

```
1. Squash and Stretch - Deformación para impacto
2. Anticipation - Preparación antes de acción
3. Follow Through - Continuación después de acción
4. Timing - Velocidad y ritmo
5. Exaggeration - Exagerar para claridad
```

### Atajos de Blender para Animación

```
I - Insert Keyframe
  - I → Location
  - I → Rotation
  - I → Scale
  - I → LocRotScale

Alt+I - Delete Keyframe
Shift+E - Set Keyframe Interpolation
N - Properties Panel (ver keyframes)
Timeline: Dope Sheet / Graph Editor
```

### Crear Walk Cycle Básico

```
Frame 1: Contact (pie derecho adelante)
Frame 6: Down (cuerpo más bajo)
Frame 12: Passing (piernas cruzadas)
Frame 18: Up (cuerpo más alto)
Frame 24: Contact (pie izquierdo adelante)

Total: 24 frames @ 24fps = 1 segundo loop
```

---

## Exportación para Unity

### Configuración de Exportación FBX

```
Formato: FBX 7.4 ASCII
Scale: 1.00
Forward: -Z Forward
Up: Y Up
Apply Scalings: FBX All

Bake Animation: ✅ Activado
  - NLA Strips: ✅ (si usas NLA)
  - All Actions: ✅ (exportar todas las animaciones)
  - Force Start/End Keying: ✅
  - Sampling Rate: 1.00
```

### Naming Conventions

```
Personajes:
- CH_Player_Idle.fbx
- CH_Player_Walk.fbx
- CH_Player_Run.fbx
- CH_Player_Jump.fbx
- CH_Player_Attack.fbx

Enemigos:
- CH_Enemy_Goblin_Idle.fbx
- CH_Enemy_Goblin_Walk.fbx
- CH_Enemy_Goblin_Attack.fbx
```

---

## Animaciones Esenciales por Tipo

### Personaje Jugador (Mínimo Viable)

```
1. Idle - Loop, 2-4 segundos
2. Walk - Loop, 1-2 segundos
3. Run - Loop, 0.8-1.2 segundos
4. Jump Start - One-shot, 0.2-0.3 segundos
5. Jump Air - Loop, 0.5 segundos
6. Jump Land - One-shot, 0.2-0.3 segundos
7. Attack - One-shot, 0.5-1 segundo
8. Take Damage - One-shot, 0.3-0.5 segundos
9. Death - One-shot, 1-2 segundos
```

### Enemigo Básico (Mínimo Viable)

```
1. Idle - Loop, 2-4 segundos
2. Walk - Loop, 1-2 segundos
3. Attack - One-shot, 0.8-1.5 segundos
4. Take Damage - One-shot, 0.3 segundos
5. Death - One-shot, 1 segundo
```

---

## Integración con Unity

### Configurar Animator Controller

```
States:
- Idle (default)
- Walk
- Run
- Jump
- Attack
- TakeDamage
- Death

Parameters:
- Speed (Float) - Para blend entre idle/walk/run
- IsJumping (Bool)
- Attack (Trigger)
- TakeDamage (Trigger)
- IsDead (Bool)

Transitions:
- Idle → Walk: Speed > 0.1
- Walk → Idle: Speed < 0.1
- Any State → Jump: IsJumping = true
- Any State → TakeDamage: TakeDamage trigger
- Any State → Death: IsDead = true
```

### Animation Events

Los Animation Events permiten ejecutar código en frames específicos de una animación.

**Casos de Uso Comunes:**

```
Footstep sounds:
- Frame donde el pie toca el suelo
- Llamar función: OnFootstep()

Attack hit detection:
- Frame donde el arma impacta
- Llamar función: OnAttackHit()

Spawn particles:
- Frame de impacto
- Llamar función: SpawnDustParticles()
```

**Cómo Configurarlos en Unity:**

```
1. Abrir Animation window (Window → Animation → Animation)
2. Seleccionar clip de animación
3. Mover timeline al frame deseado
4. Click en botón "Add Event"
5. Seleccionar función del script
6. (Opcional) Pasar parámetros
```

**Ejemplo de Script:**

```csharp
public class PlayerAnimationEvents : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip footstepSound;
    [SerializeField] private ParticleSystem dustParticles;

    // Llamado por Animation Event
    public void OnFootstep()
    {
        audioSource.PlayOneShot(footstepSound);
        dustParticles.Play();
    }

    public void OnAttackHit()
    {
        Collider[] hits = Physics.OverlapSphere(transform.position, 2f);
        foreach (var hit in hits)
        {
            if (hit.CompareTag("Enemy"))
            {
                hit.GetComponent<Health>()?.TakeDamage(10);
            }
        }
    }
}
```

### Blend Trees

**Cuándo Usarlos:**
- Transiciones suaves entre idle/walk/run basadas en velocidad
- Direcciones de movimiento (8-directional movement)
- Apuntar con arma en diferentes ángulos

**Ejemplo: Blend Tree de Movimiento:**

```
Crear Blend Tree:
1. En Animator, crear nuevo State
2. Right-click → Create State → From New Blend Tree
3. Doble-click en Blend Tree

Configuración:
- Blend Type: 1D
- Parameter: Speed
- Motion 0: Idle (Threshold: 0)
- Motion 1: Walk (Threshold: 0.5)
- Motion 2: Run (Threshold: 1.0)
```

---

## Técnicas de Aceleración

### 1. Usar Mixamo al Máximo

```
Ventajas:
✅ Rigging automático en 2 minutos
✅ Biblioteca de 2000+ animaciones gratuitas
✅ Retargeting automático entre personajes
✅ Calidad profesional

Proceso:
1. Subir modelo
2. Auto-rig
3. Descargar con 5-10 animaciones pre-hechas
4. Ajustar en Blender solo si es necesario
```

### 2. Reutilizar Animaciones

- Usar misma animación para múltiples enemigos
- Retargeting de animaciones entre personajes similares
- Modificar velocidad de animación en Unity (speed multiplier)

### 3. Animaciones Procedurales

```csharp
// Usar código para animaciones simples
public class SimpleHover : MonoBehaviour
{
    [SerializeField] private float amplitude = 0.5f;
    [SerializeField] private float frequency = 1f;

    private Vector3 startPos;

    private void Start()
    {
        startPos = transform.position;
    }

    private void Update()
    {
        float y = Mathf.Sin(Time.time * frequency) * amplitude;
        transform.position = startPos + Vector3.up * y;
    }
}
```

### 4. Inverse Kinematics (IK) en Unity

```
Unity Animation Rigging Package:
- Pies se adaptan al terreno automáticamente
- Manos apuntan a objetos
- Cabeza sigue al jugador

Setup rápido:
1. Install Animation Rigging package
2. Add Rig Builder component
3. Add Rig
4. Add Two Bone IK Constraint (para piernas/brazos)
```

---

## Coordinación con Otros Roles

### Con el Modelador 3D
- **Comunicar requisitos de topología temprano**
- Asegurar que modelos tengan edge loops apropiados
- Validar que la geometría se deforme correctamente
- Coordinar sobre T-pose vs A-pose

### Con el Programador
- **Configurar Animation Events juntos**
- Definir parámetros del Animator Controller
- Comunicar duración de animaciones
- Testear transiciones en gameplay
- Actualizar Asset Request issues cuando animaciones estén listas

### Con el Game Designer
- Validar que animaciones coincidan con game feel deseado
- Ajustar timing según feedback de gameplay
- Priorizar animaciones según importancia

---

## Gestión de Tiempo

### Estimaciones Realistas (para animadores Junior)

```
Rigging manual en Blender: 4-8 horas
Rigging con Mixamo: 5-10 minutos

Animaciones (manual en Blender):
- Idle simple: 30-60 min
- Walk cycle: 1-2 horas
- Run cycle: 1-2 horas
- Jump (3 fases): 2-3 horas
- Attack: 1-2 horas
- Death: 1-2 horas

Animaciones (desde Mixamo):
- Descargar y ajustar: 5-15 min por animación
- Configurar en Unity: 30 min - 1 hora (todas)
```

### Estrategia Híbrida Recomendada

```
Día 1 (Primeras 4 horas):
1. Usar Mixamo para personaje principal
2. Descargar 8-10 animaciones base
3. Importar a Unity y configurar Animator

Día 1-2 (Siguientes 8 horas):
4. Ajustar animaciones en Blender si es necesario
5. Crear animaciones custom para mecánicas únicas
6. Configurar Animation Events con programador

Día 2 (Últimas horas):
7. Polish y ajustes de timing
8. Animaciones secundarias si hay tiempo
```

---

## Troubleshooting Común

### Animación se importa pero no se reproduce
- Verificar que el rig sea compatible
- Asegurar que Animator Controller esté asignado
- Revisar que la animación esté en el Animator
- Verificar transiciones y condiciones

### Modelo se deforma incorrectamente
- Revisar weight painting en Blender
- Verificar que no haya bones duplicados
- Asegurar que el rig esté dentro del mesh
- Recalcular weights (Weights → Normalize All)

### Animaciones de Mixamo no funcionan en Unity
- Asegurar que descargaste "FBX for Unity"
- Primera animación: "With Skin"
- Animaciones adicionales: "Without Skin"
- Verificar que el rig sea Humanoid en Unity

### Transiciones se ven bruscas
- Aumentar Transition Duration (0.1 - 0.25 segundos)
- Activar "Has Exit Time" si es necesario
- Usar Blend Trees para transiciones suaves
- Verificar que animaciones tengan poses similares en inicio/fin

### Pies se deslizan en el suelo
- Ajustar velocidad de animación
- Usar Root Motion en Unity
- Implementar IK para pies
- Ajustar moveSpeed del personaje para coincidir con animación

---

## Optimización para Game Jams

### Reducir Complejidad

```
Bones mínimos para personaje humanoide:
- Pelvis (root)
- Spine (1-2 bones)
- Head
- Shoulders (2)
- Arms (4: upper arm, lower arm x2)
- Hands (2, sin dedos individuales)
- Legs (4: upper leg, lower leg x2)
- Feet (2)

Total: ~15-20 bones vs. 50+ en rig completo
```

### Reducir Keyframes

```
- Usar interpolación automática
- Solo keyframes en poses extremas
- Simplificar curvas en Graph Editor
- Bake animation con sampling rate bajo (1.0)
```

---

## Checklist de Animación Completa

Antes de marcar animaciones como "Done":

- [ ] Todas las animaciones esenciales creadas
- [ ] Exportadas correctamente como FBX
- [ ] Importadas en Unity sin errores
- [ ] Animator Controller configurado
- [ ] Transiciones funcionando correctamente
- [ ] Animation Events implementados (si aplica)
- [ ] Testeadas en gameplay
- [ ] Sin deformaciones extrañas
- [ ] Performance aceptable (FPS estable)
- [ ] Asset Request issue actualizado
- [ ] Comunicado al programador que está listo

---

## Filosofía para Game Jams

> **"Movement over perfection"**

En una game jam, animaciones funcionales y responsivas son mejores que animaciones perfectas sin terminar. Prioriza que el personaje se mueva bien sobre que se vea cinematográfico.

### Principios Clave

1. **Mixamo es tu amigo**: No reinventes la rueda
2. **Timing > Detail**: Mejor timing simple que detalle complejo
3. **Loops primero**: Idle, walk, run son críticos
4. **Test en gameplay**: Anima en contexto, no en vacío
5. **Comunicación constante**: Coordina con programador frecuentemente

---

**Recuerda**: Tu objetivo no es crear la animación más impresionante, sino hacer que el juego se sienta vivo y responsivo. Done is better than perfect.
