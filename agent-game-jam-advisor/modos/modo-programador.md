# Modo: Programador

## Activación

Este modo se activa cuando el usuario indica que es el **Programador** o **Developer** del equipo, o cuando dice:
- "Modo: Programador"
- "Soy el programador del equipo"
- "Necesito ayuda con código/Unity/C#"

---

## Tu Rol en Este Modo

Como Programador en una game jam, eres el **integrador técnico** del equipo. Tu trabajo es implementar las mecánicas del juego y asegurar que todos los assets del equipo funcionen juntos de manera cohesiva.

### Responsabilidades Principales

- Implementar mecánicas y sistemas de juego en C#
- Integrar assets 3D, animaciones y audio en Unity
- Configurar Animator Controllers y state machines
- Gestionar el build final del juego
- Resolver bugs técnicos y optimizar performance
- Configurar y mantener el repositorio Git

---

## Herramientas Principales

### Software Base
- **Unity 6** - Motor de juego principal
- **Visual Studio** o **Rider** - IDE para C#
- **Git** + **GitHub/GitLab** - Control de versiones

### Plugins y Assets Útiles
- **DOTween** - Tweening y animaciones procedurales
- **Cinemachine** - Sistema de cámaras avanzado
- **Unity Asset Store** - Assets gratuitos y herramientas
- **ProBuilder** - Prototipado de geometría en Unity
- **TextMesh Pro** - Sistema de texto avanzado

---

## Workflow en Game Jam

### 1. Fase de Setup (Día 1 - Primera hora)

- Crear proyecto Unity 6
- Configurar repositorio Git con .gitignore apropiado
- Instalar paquetes esenciales (Cinemachine, TextMesh Pro, Input System)
- Crear estructura de carpetas del proyecto
- Configurar escenas base (MainMenu, GameScene)
- **Crear Feature Request issues** para mecánicas principales

### 2. Fase de Implementación (Día 1-2)

**Prioridad 1 - Core Gameplay (Primeras 8 horas):**
- Player Controller (movimiento básico)
- Camera Controller
- Mecánica principal del juego
- Sistema de colisiones básico

**Prioridad 2 - Sistemas Secundarios (Horas 8-24):**
- Enemy AI básico
- Sistema de salud/daño
- UI básica (HUD)
- Sistema de puntuación/objetivos

**Prioridad 3 - Polish (Últimas 24 horas):**
- Efectos visuales (particles)
- Audio integration
- Menú principal
- Game over / Win conditions

### 3. Fase de Integración Continua

- Revisar Asset Request issues completados
- Integrar modelos 3D en prefabs
- Configurar Animator Controllers
- Testear funcionalidad con cada integración

---

## Estructura de Proyecto Recomendada

```
Assets/
├── _Scenes/
│   ├── MainMenu.unity
│   ├── GameScene.unity
│   └── TestScene.unity
├── Scripts/
│   ├── Player/
│   ├── Enemies/
│   ├── Managers/
│   └── Utils/
├── Prefabs/
│   ├── Player/
│   ├── Enemies/
│   ├── Props/
│   └── UI/
├── Materials/
├── Models/
├── Animations/
├── Audio/
│   ├── SFX/
│   └── Music/
└── UI/
```

---

## Arquitectura Simple para Game Jams

### 1. Singleton para Managers

```csharp
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
```

### 2. Player Controller Base

```csharp
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 10f;

    [Header("References")]
    [SerializeField] private Rigidbody rb;
    [SerializeField] private Animator animator;

    private Vector3 moveDirection;
    private bool isGrounded;

    private void Update()
    {
        // Input
        float horizontal = Input.GetAxisRaw("Horizontal");
        float vertical = Input.GetAxisRaw("Vertical");
        moveDirection = new Vector3(horizontal, 0, vertical).normalized;

        // Jump
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }

        // Animation
        animator.SetFloat("Speed", moveDirection.magnitude);
    }

    private void FixedUpdate()
    {
        rb.MovePosition(rb.position + moveDirection * moveSpeed * Time.fixedDeltaTime);
    }
}
```

### 3. Enemy AI Simple

```csharp
public class EnemyAI : MonoBehaviour
{
    [SerializeField] private float detectionRange = 10f;
    [SerializeField] private float moveSpeed = 3f;
    [SerializeField] private float attackRange = 2f;

    private Transform player;
    private enum State { Idle, Chase, Attack }
    private State currentState = State.Idle;

    private void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player").transform;
    }

    private void Update()
    {
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        switch (currentState)
        {
            case State.Idle:
                if (distanceToPlayer < detectionRange)
                    currentState = State.Chase;
                break;

            case State.Chase:
                if (distanceToPlayer < attackRange)
                    currentState = State.Attack;
                else if (distanceToPlayer > detectionRange)
                    currentState = State.Idle;
                else
                    ChasePlayer();
                break;

            case State.Attack:
                if (distanceToPlayer > attackRange)
                    currentState = State.Chase;
                else
                    AttackPlayer();
                break;
        }
    }

    private void ChasePlayer()
    {
        Vector3 direction = (player.position - transform.position).normalized;
        transform.position += direction * moveSpeed * Time.deltaTime;
        transform.LookAt(player);
    }

    private void AttackPlayer()
    {
        // Implement attack logic
    }
}
```

### 4. Sistema de Salud

```csharp
public class Health : MonoBehaviour
{
    [SerializeField] private float maxHealth = 100f;
    private float currentHealth;

    public event System.Action OnDeath;
    public event System.Action<float> OnHealthChanged;

    private void Start()
    {
        currentHealth = maxHealth;
    }

    public void TakeDamage(float damage)
    {
        currentHealth -= damage;
        OnHealthChanged?.Invoke(currentHealth / maxHealth);

        if (currentHealth <= 0)
        {
            Die();
        }
    }

    public void Heal(float amount)
    {
        currentHealth = Mathf.Min(currentHealth + amount, maxHealth);
        OnHealthChanged?.Invoke(currentHealth / maxHealth);
    }

    private void Die()
    {
        OnDeath?.Invoke();
    }
}
```

---

## Git Workflow para Game Jams

### .gitignore Esencial

```
# Unity generated
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# Visual Studio cache
.vs/
*.csproj
*.sln
*.suo
*.user

# OS generated
.DS_Store
Thumbs.db
```

### Comandos Git Básicos

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <url>
git push -u origin main

# Workflow diario
git pull                    # Antes de empezar a trabajar
git add .                   # Añadir cambios
git commit -m "mensaje"     # Commit con mensaje descriptivo
git push                    # Subir cambios
```

### Convenciones de Commit

```
feat: Add player jump mechanic
fix: Fix enemy pathfinding bug
art: Integrate new player model
audio: Add background music
ui: Create main menu
refactor: Optimize enemy spawning
```

---

## Integración de Assets

### Configurar Animator Controller

```
1. Crear Animator Controller en Assets/Animations/
2. Arrastrar animaciones desde FBX importado
3. Crear transiciones entre estados
4. Configurar parámetros (Speed, IsJumping, etc.)
5. Asignar Animator Controller al prefab del personaje
```

### Animation Events

```csharp
public class PlayerAnimationEvents : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip footstepSound;

    // Llamado por Animation Event
    public void OnFootstep()
    {
        audioSource.PlayOneShot(footstepSound);
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

### AudioManager

```csharp
public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [SerializeField] private AudioSource musicSource;
    [SerializeField] private AudioSource sfxSource;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void PlaySFX(AudioClip clip)
    {
        sfxSource.PlayOneShot(clip);
    }

    public void PlayMusic(AudioClip clip)
    {
        musicSource.clip = clip;
        musicSource.Play();
    }
}
```

---

## Técnicas de Aceleración

### Code Snippets Útiles

#### Singleton Genérico

```csharp
public class Singleton<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T instance;
    public static T Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<T>();
                if (instance == null)
                {
                    GameObject obj = new GameObject(typeof(T).Name);
                    instance = obj.AddComponent<T>();
                }
            }
            return instance;
        }
    }
}
```

#### Object Pooling Simple

```csharp
public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int poolSize = 10;

    private Queue<GameObject> pool = new Queue<GameObject>();

    private void Start()
    {
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject GetObject()
    {
        if (pool.Count > 0)
        {
            GameObject obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        return Instantiate(prefab);
    }

    public void ReturnObject(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

---

## Coordinación con Otros Roles

### Con el Modelador 3D
- Revisar Asset Request issues completados
- Validar que los modelos se importen correctamente
- Configurar colliders y rigidbodies
- Crear prefabs con componentes necesarios
- Reportar problemas de escala o importación

### Con el Animador
- Configurar Animator Controllers
- Implementar Animation Events
- Coordinar transiciones de animación con código
- Testear animaciones en gameplay

### Con el Game Designer
- Implementar mecánicas según especificaciones
- Proveer builds frecuentes para testing
- Ajustar valores de gameplay según feedback
- Comunicar limitaciones técnicas temprano

---

## Gestión de Tiempo

### Estimaciones Realistas (para desarrolladores Junior)

```
Player Controller básico: 2-3 horas
Enemy AI simple: 2-4 horas
Sistema de salud: 1-2 horas
UI básica (HUD): 2-3 horas
Menú principal: 1-2 horas
Integración de audio: 1-2 horas
Sistema de puntuación: 1-2 horas
Build y deployment: 1 hora
```

### Milestones Críticos

**Día 1 - Hora 8: First Playable**
- Player puede moverse
- Existe al menos un enemigo
- Hay un objetivo básico

**Día 2 - Hora 12: Feature Complete**
- Todas las mecánicas principales funcionan
- UI completa
- Audio integrado

**Últimas 6 horas: Polish Only**
- NO agregar features nuevas
- Solo ajustes y bug fixes

**3 horas antes: CODE FREEZE**
- Solo builds y testing
- NO tocar código

---

## Troubleshooting Común

### Animaciones no se reproducen
- Verificar que Animator Controller esté asignado
- Revisar transiciones y condiciones
- Verificar que los parámetros coincidan con el código
- Comprobar que las animaciones estén en el Animator

### Modelos importados con escala incorrecta
- Seleccionar FBX → Inspector → Model → Scale Factor = 1
- O ajustar en el prefab con transform.localScale

### Git conflicts en escenas
- Usar Scene Management: dividir en múltiples escenas
- Comunicar antes de editar escenas compartidas
- En caso de conflicto, recrear cambios manualmente

### Build falla
- Verificar que todas las escenas estén en Build Settings
- Revisar errores en la consola
- Verificar que no haya referencias rotas
- Probar en una build de desarrollo primero

---

## Build y Deployment

### Build Settings

```
File → Build Settings
- Agregar todas las escenas necesarias
- Seleccionar plataforma (Windows/Mac/WebGL)
- Player Settings:
  - Company Name
  - Product Name
  - Version
  - Icon
```

### WebGL Build (para itch.io)

```
- Compression Format: Gzip
- Enable Exceptions: None
- Optimization Level: Master
- Stripping Level: Medium
```

---

## Checklist de Feature Completa

Antes de marcar una feature como "Done":

- [ ] Código implementado y testeado
- [ ] Assets integrados correctamente
- [ ] Animaciones funcionando (si aplica)
- [ ] Audio integrado (si aplica)
- [ ] UI actualizada (si aplica)
- [ ] Sin errores en consola
- [ ] Performance aceptable (>30 FPS)
- [ ] Código commiteado a Git
- [ ] Issue de Feature Request actualizado
- [ ] Comunicado al Game Designer para testing

---

## Filosofía para Game Jams

> **"Make it work, then make it good"**

En una game jam, código funcional y simple es mejor que código elegante sin terminar. Prioriza la funcionalidad sobre la arquitectura perfecta.

### Principios Clave

1. **KISS (Keep It Simple, Stupid)**: No sobre-ingenierizar
2. **Evita optimización prematura**: Optimiza solo si hay problemas
3. **Hardcodea cuando sea necesario**: Valores mágicos están OK en jams
4. **Comenta código complejo**: Tu yo del futuro te lo agradecerá
5. **Commits frecuentes**: Commit cada feature funcional
6. **Builds frecuentes**: Build cada 4-6 horas para testing

---

**Recuerda**: Tu objetivo no es escribir el código más elegante, sino crear un juego funcional y divertido. Done is better than perfect.
