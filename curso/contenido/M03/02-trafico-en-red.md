---
modulo: 3
leccion: 2
tipo: lab
verificado: false
titulo: "Tráfico en red"
resumen: "Convertir los camiones en objetos de red para que el cliente vea el mismo tráfico que el anfitrión, con el servidor conduciéndolos."
duracion: 75
objetivos:
  - Preparar un prefab para existir en red y registrarlo
  - Publicar un objeto desde el servidor con Spawn
  - Decidir en qué máquina corre el controlador de un objeto que no es de ningún jugador
  - Entender qué le pasa a tu pool cuando sus objetos son de red
fuentes:
  - titulo: "Object spawning"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/object-spawning.html
  - titulo: "NetworkTransform"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/helper/networktransform.html
  - titulo: "Object pooling"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/object-pooling.html
---

Partes de donde quedó el laboratorio 2.2: el servidor genera tráfico y el
cliente conduce por una carretera vacía. Aquí el cliente vuelve a ver camiones,
y esta vez son los mismos que ve el anfitrión.

::: prerrequisitos
- [ ] El laboratorio 2.2 terminado: el tráfico solo existe en el anfitrión
- [ ] La lección 3.1 leída
- [ ] Un commit limpio antes de empezar
:::

:::: paso Frenar el generador antes de ponerlo en red

Tu generador llama a `GetPooledObject()` en **cada** `FixedUpdate`. Antes de
seguir, haz que saque un camión cada cierto tiempo: un temporizador que acumule
`Time.fixedDeltaTime` y solo actúe al superar un intervalo.

::: porque
Sin red, sacar un objeto del pool cada 0,02 s es un derroche local. En red cada
camión es un mensaje de creación a cada cliente y un `NetworkTransform` enviando
30 veces por segundo. Es el mismo temporizador que usa el mostrador de platos
del vídeo, y por el mismo motivo.
:::

::: esperado
En el anfitrión sale un camión cada intervalo, no un chorro continuo. El cliente
sigue sin ver ninguno.
:::
::::

:::: paso Preparar el prefab del camión

En el prefab que usa el pool, añade:

- Un **NetworkObject**.
- Un **NetworkTransform** con `Authority Mode` en **Server**.

Regístralo en `Assets/DefaultNetworkPrefabs.asset`.

::: porque
El camión no es de ningún jugador: lo conduce el juego. Su dueño natural es el
servidor, así que aquí la autoridad correcta es la contraria a la de tu coche.
Y sin registro, el cliente recibiría la orden de crear «el prefab número tal» y
no sabría cuál es.
:::

::: esperado
El prefab tiene los dos componentes y aparece en la lista de prefabs de red.
Nada cambia todavía en el juego.
:::
::::

:::: paso Publicar cada camión

En el generador, justo después de sacar un camión del pool, publícalo:

```csharp
PooledObject camion = GetPooledObject();
camion.GetComponent<NetworkObject>().Spawn();
```

La guarda de servidor del laboratorio 2.2 sigue encima de estas líneas.

::: porque
Sacarlo del pool lo activa en el servidor. `Spawn()` es lo que hace que exista
en los clientes. Solo el servidor puede llamarlo, y la guarda ya garantiza que
estás en él.
:::

::: esperado
El cliente vuelve a ver camiones. En la Hierarchy del editor cada camión activo
tiene un identificador de red.

Mira con atención cómo se mueven en la ventana del cliente antes de pasar al
siguiente paso.
:::
::::

:::: paso Que el camión solo se conduzca en el servidor

`PooledCarWithWheelsController` acelera siempre de frente, en todas las copias.
Haz que solo esté activo en el servidor. Tienes el patrón en tu propio
`VehicleOwnership`: un `NetworkBehaviour` pequeño que, en `OnNetworkSpawn`,
activa el controlador según una condición.

Aquí la condición no es `IsOwner`. Piensa cuál es.

::: porque
En el cliente, el controlador local empuja el camión hacia delante y el
`NetworkTransform` lo recoloca donde dice el servidor: dos fuentes mandando
sobre el mismo transform. Es el cliente del laboratorio 1.2 pulsando teclas sin
autoridad, solo que aquí el que pulsa es la IA.
:::

::: esperado
La condición es `IsServer`. Con el controlador apagado en el cliente, los
camiones se mueven allí solo por lo que llega de la red, sin tirones.
:::
::::

:::: paso Entender qué pasa con el pool

Lee `ObjectPool.SetupPool()` y responde en tus notas:

1. `SetupPool` corre en `Start`, en **todas** las máquinas, antes de que exista
   la sesión. ¿Qué crea en el cliente? ¿Lo usa alguien?
2. Cuando el servidor publica un camión, ¿el cliente reutiliza uno de los suyos
   o crea otro nuevo?
3. Cuando un camión vuelva al pool, ¿qué hay que llamar para que desaparezca de
   los clientes sin destruirlo en el servidor?

::: porque
Tu pool ahorra instanciar, pero solo en la máquina que lo usa. En red, el
servidor reutiliza sus instancias y cada cliente sigue creando y destruyendo las
suyas, salvo que se lo enseñes. Saberlo evita creer que el pool está haciendo
algo que no hace.
:::

::: esperado
1. Crea camiones inactivos que nadie usará nunca: en el cliente el generador no
   pasa de la guarda. Son inofensivos y sobran.
2. Crea uno nuevo. Netcode instancia el prefab al recibir la orden.
3. `Despawn(false)`: lo retira de la red y lo deja vivo en el servidor para
   devolverlo al pool. En los clientes se destruye.

El pool en los clientes se resuelve con un manejador de instancias de prefab,
descrito en la página «Object pooling» de las fuentes. Queda fuera de este
laboratorio.
:::
::::

::: verificar
- [ ] El cliente ve camiones, y son los mismos que ve el anfitrión
- [ ] Los camiones se mueven sin tirones en la ventana del cliente
- [ ] El controlador del camión está desactivado en las copias del cliente
- [ ] Sé qué hace y qué no hace mi pool cuando hay red
:::

::: problema Error al publicar: el prefab no está registrado
El mensaje de Netcode nombra el prefab. Añádelo a `DefaultNetworkPrefabs`. Si ya
está, comprueba que el pool instancia ese prefab y no una variante.
:::

::: problema Error: solo el servidor puede hacer Spawn
La llamada a `Spawn()` se está ejecutando en un cliente. La guarda de servidor
tiene que estar antes, en el mismo método.
:::

::: problema Los camiones aparecen en el cliente pero no se mueven
Falta el `NetworkTransform` en el prefab, o su autoridad está en Owner. El dueño
de un objeto publicado con `Spawn()` es el servidor, así que con Owner también
debería moverse; si no lo hace, revisa que el controlador siga activo en el
servidor.
:::

::: nota
Tus issues 12 y 13, sobre el estado al reciclar y los camiones que nunca vuelven
al pool, siguen abiertos y ahora tienen una condición más: devolver un camión es
también retirarlo de la red.
:::
