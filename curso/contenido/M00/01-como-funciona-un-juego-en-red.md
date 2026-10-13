---
modulo: 0
leccion: 1
tipo: concepto
titulo: "Cómo funciona un juego en red por dentro"
resumen: "Qué hay realmente en cada máquina cuando dos personas juegan juntas, y quién decide qué es verdad. Sin esto, el resto del curso son componentes que marcas sin saber por qué."
duracion: 20
objetivos:
  - Explicar por qué en un juego en red no existe un solo coche, sino una copia por máquina
  - Distinguir servidor, cliente y anfitrión, y decir cuál de los tres eres al pulsar «Create Session»
  - Nombrar las tres piezas de Netcode for GameObjects y qué aporta cada una
  - Leer tu propio `VehicleOwnership` y explicar por qué desactiva el controlador en las copias ajenas
video:
  - titulo: "Intro, Overview"
    inicio: "00:00:00"
    fin: "00:09:56"
  - titulo: "Final Game Preview"
    inicio: "00:09:56"
    fin: "00:15:03"
  - titulo: "What you Should Know"
    inicio: "00:15:03"
    fin: "00:17:24"
  - titulo: "Singleplayer Overview"
    inicio: "00:17:24"
    fin: "00:22:37"
fuentes:
  - titulo: "Netcode for GameObjects 2.13 · Manual"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/index.html
  - titulo: "Client-server topology"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/client-server.html
  - titulo: "Network topologies"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/network-topologies.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
  - titulo: "NetworkManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkmanager.html
  - titulo: "NetworkObject"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkobject.html
  - titulo: "NetworkBehaviour"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/networkbehaviour.html
  - titulo: "Code Monkey · Learn Unity Multiplayer (el vídeo que sigue este curso)"
    url: https://www.youtube.com/watch?v=7glCsF9fv3s
    secundaria: true
---

El vídeo empieza dando por hecho que ya sabes qué es un NetworkManager, un
anfitrión, un RPC y una NetworkVariable, porque su autor lo explicó en otro
vídeo anterior. Esta lección ocupa el lugar de ese requisito: primero el
mecanismo, y a partir de ahí cada componente que añadas tendrá un motivo.

Tú ya tienes dos coches moviéndose en red en la rama
`multiplayer-player-sync`. Aquí vas a entender qué hiciste.

## No hay un coche, hay una copia por máquina

::: natural
Cuando dos personas juegan juntas no comparten un juego. Cada una tiene **su
propio juego entero** abierto en su ordenador, con su propia escena y sus
propios objetos.

Si hay dos jugadores y cada uno conduce un coche, en total existen cuatro
coches: los dos que ve el primero y los dos que ve el segundo. Lo que llamamos
«el coche azul» son en realidad dos objetos distintos, en dos ordenadores, que
alguien se encarga de mantener parecidos.

Ese alguien es la librería de red. Su trabajo es que las copias no se
contradigan.
:::

::: tecnico
Cada participante ejecuta un proceso independiente de Unity con su propia
escena y su propio grafo de GameObjects. No hay memoria compartida: el estado
solo cruza de un proceso a otro serializado en mensajes.

Netcode for GameObjects asigna a cada objeto de red un identificador común a
todos los procesos y replica entre ellos lo que se le indique: transformaciones,
variables y llamadas a métodos. Lo que no se marca para replicar no sale de la
máquina donde ocurre.
:::

::: figura copias-por-maquina
:::

Mueve el puntero sobre la figura. El turismo blanco es el tuyo y responde al
instante. Mira el banco de la derecha: ahí hay **otro** turismo, que no conduce
nadie. Lo arrastra un motor hasta donde dice el cable, y llega tarde.

::: clave
Casi todos los fallos de un juego en red son el mismo: un dato que existe en
una máquina y que alguien dio por hecho que estaba en todas. Tu issue 16 es
exactamente esto: el giro del volante solo existe donde está el teclado.
:::

## Servidor, cliente y anfitrión

::: natural
Si cada máquina tiene su versión, hace falta que una mande cuando no se ponen de
acuerdo. Esa máquina es el **servidor**. Las demás son **clientes**: le cuentan
lo que quieren hacer y él les cuenta lo que ha pasado.

Los clientes no hablan entre sí. Todo pasa por el servidor.

Un servidor puede ser un ordenador en un centro de datos que no juega. Pero en
un juego pequeño lo normal es que uno de los jugadores haga de servidor mientras
juega. A ese jugador se le llama **anfitrión**.
:::

::: tecnico
En la topología cliente-servidor hay dos tipos de instancia. El servidor tiene
la autoridad y ejecuta la simulación principal; los clientes se conectan solo a
él, nunca entre sí.

Un *host* es una instancia que es servidor y cliente a la vez, en el mismo
proceso. En un `NetworkBehaviour` del anfitrión, `IsServer`, `IsClient` e
`IsHost` valen `true` los tres.

El coste de esta topología es latencia: un cambio de un cliente viaja al
servidor, se procesa y se reenvía al resto.
:::

En tu escena, el botón **Create Session** te convierte en anfitrión. Quien
entra desde **Session List** es cliente.

::: ojo
El anfitrión no tiene latencia consigo mismo: sus órdenes llegan al servidor al
instante porque son el mismo proceso. Un fallo de sincronización puede no verse
nunca desde el anfitrión y verse siempre desde un cliente. Por eso todo lo que
pruebes en este curso se mira **desde el cliente**, no solo desde quien creó la
sesión.
:::

::: hoy
El vídeo solo conoce la topología cliente-servidor. La versión que tienes
instalada (Netcode for GameObjects 2.13.3) ofrece además una segunda,
*distributed authority*, donde la autoridad se reparte entre los clientes.

Tu `NetworkManager` está en cliente-servidor (`NetworkTopology: 0` en
`Prototype 1.unity`), igual que el vídeo, y el curso se queda ahí.
:::

## Las tres piezas

::: natural
Netcode se apoya en tres componentes, y cada uno responde a una pregunta:

- **NetworkManager**: ¿estamos conectados, y como qué? Hay uno solo en todo el
  juego.
- **NetworkObject**: ¿este objeto existe para todos? Es una etiqueta de
  identidad que se pone en el objeto.
- **NetworkBehaviour**: ¿qué hace este script distinto en cada máquina? Es un
  `MonoBehaviour` que además sabe en qué máquina está.
:::

::: tecnico
`NetworkManager` es un singleton que contiene la configuración de red, el
transporte y la lista de prefabs registrados, y expone el arranque como
servidor, anfitrión o cliente. El tuyo tiene `TickRate: 30` y un `PlayerPrefab`
que instancia por cada cliente que se conecta.

`NetworkObject` da al GameObject un identificador de red compartido por todos
los procesos. Sin él, un objeto es local por definición.

`NetworkBehaviour` hereda de `MonoBehaviour` y añade el contexto de red
(`IsOwner`, `IsServer`, `IsClient`, `IsHost`), el ciclo de vida
(`OnNetworkSpawn`) y los dos mecanismos de sincronización: RPC y
`NetworkVariable`. Exige un `NetworkObject` en el mismo objeto o en un padre.
:::

## Quién manda sobre cada objeto

::: natural
Que el servidor mande en general no significa que lo decida todo. Cada objeto
de red tiene un **dueño**, y al dueño se le puede prestar permiso para decidir
algunas cosas de ese objeto.

Lo habitual es que cada jugador sea dueño de su personaje. Así, cuando giras, tu
coche gira ya, sin esperar a que el servidor te dé permiso.
:::

::: tecnico
Por defecto el servidor tiene autoridad sobre todo. La propiedad
(*ownership*) concede al cliente dueño un subconjunto de esa autoridad, y solo
sobre las funciones configuradas para ello: un `NetworkTransform` con autoridad
del dueño, o una `NetworkVariable` con `NetworkVariableWritePermission.Owner`.

Lo que el dueño no puede hacer nunca: crear o destruir objetos de red ni cambiar
la propiedad. Eso sigue siendo del servidor.
:::

Esto ya lo has escrito tú. En `Assets/Scripts/Multiplayer/VehicleOwnership.cs`:

```csharp
public override void OnNetworkSpawn()
{
    controller.enabled = IsOwner;

    if (!IsOwner) return;

    TransportCameraFollow cameraFollow = FindFirstObjectByType<TransportCameraFollow>();
    if (cameraFollow) cameraFollow.SetTarget(controller);
}
```

Con la lección delante, cada línea tiene explicación:

- El script se ejecuta **en todas las copias** del coche, en todas las máquinas.
  No hay un `VehicleOwnership` del servidor y otro del cliente: es el mismo
  código, y `IsOwner` es lo único que cambia de una copia a otra.
- `controller.enabled = IsOwner` apaga la lectura del teclado en las copias
  ajenas. Sin eso, tus teclas moverían también la copia del coche del otro
  jugador que vive en tu máquina.
- La cámara solo se engancha en la copia propia, por el mismo motivo.
- Va en `OnNetworkSpawn` y no en `Start` porque `IsOwner` no es fiable hasta que
  el objeto se ha registrado en la red.

## Dos formas de cruzar la red

Todo lo que se sincroniza en el curso usa una de estas dos, y elegir entre ellas
es la decisión que más se repite en el vídeo.

::: vocabulario
RPC
: Un mensaje: «ha pasado esto». Se envía una vez y quien no estaba conectado en
  ese momento no lo recibe. Módulo 2.

NetworkVariable
: Un valor compartido: «esto vale tanto». Quien se conecta tarde recibe el valor
  actual. Módulo 4.
:::

El `NetworkTransform` que mueve tus coches es un tercer caso ya resuelto: un
componente que sincroniza posición y rotación por ti. Se ve en el módulo 1.

## Lo que plantea el vídeo antes de empezar

El autor parte de un juego de un jugador ya terminado, *Kitchen Chaos*, y lo
convierte a multijugador. En el último tramo explica que hay tres caminos:

- Terminar el juego para un jugador y convertirlo después. Sirve para juegos
  sencillos.
- Hacerlo multijugador desde el principio. Es lo mejor cuando la red es el
  centro del juego.
- Una mezcla: construir una mecánica, sincronizarla, y pasar a la siguiente.
  Dice que es lo que haría él trabajando solo.

Tu proyecto va por el tercer camino: tienes coches y aviones funcionando, y
vas a sincronizar mecánica a mecánica.

::: nota
No necesitas el proyecto de *Kitchen Chaos*. En cada módulo ves el capítulo
como caso resuelto y aplicas el concepto en tu juego de vehículos.
:::

::: vocabulario
Servidor
: La instancia que tiene la autoridad y ejecuta la simulación principal.

Cliente
: Una instancia conectada al servidor. No se conecta a otros clientes.

Anfitrión (*host*)
: Una instancia que es servidor y cliente a la vez.

Dueño (*owner*)
: El cliente al que se ha prestado parte de la autoridad sobre un objeto.

Autoridad
: El derecho a decidir el estado de algo. Lo que diga quien la tiene es lo que
  acaban viendo todos.
:::

En la lección siguiente montas el laboratorio: dos jugadores en tu propia
máquina con Multiplayer Play Mode, uno como anfitrión y otro como cliente, para
poder mirar siempre desde los dos lados.
