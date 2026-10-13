---
modulo: 4
leccion: 1
tipo: concepto
titulo: "Estado continuo: NetworkVariable frente a RPC"
resumen: "La segunda forma de cruzar la red: un valor compartido en vez de un aviso. Cuándo conviene cada una, y qué pasa cuando dos jugadores con autoridad propia chocan."
duracion: 30
objetivos:
  - Declarar una NetworkVariable y reaccionar a sus cambios
  - Elegir entre RPC y NetworkVariable para un dato concreto
  - Explicar los permisos de lectura y escritura y quién puede escribir por defecto
  - Describir por qué las colisiones entre jugadores son un problema de diseño y no solo de física
video:
  - titulo: "Sync Cutting Counter"
    inicio: "02:01:20"
    fin: "02:11:10"
  - titulo: "Sync Stove Counter"
    inicio: "02:11:10"
    fin: "02:28:52"
  - titulo: "Sync Plate Add Ingredients"
    inicio: "02:28:52"
    fin: "02:34:47"
  - titulo: "Player collisions"
    inicio: "02:34:47"
    fin: "02:45:04"
fuentes:
  - titulo: "NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/networkvariable.html
  - titulo: "RPC vs NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/learn/rpcvnetvar.html
  - titulo: "Physics"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/physics.html
  - titulo: "Ownership"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/terms-concepts/ownership.html
---

El autor sincroniza dos mostradores seguidos con herramientas distintas, y lo
hace a propósito para que se vea la diferencia. La tabla de cortar va con RPC.
El fogón, con `NetworkVariable`.

## Dos mostradores, dos herramientas

**La tabla de cortar** cuenta cortes: cada pulsación suma uno, y al llegar al
total el tomate se convierte en rodajas. Cada corte es un **suceso**. El cliente
pide el corte con un RPC, el servidor lo aplica y avisa a todos con otro.

**El fogón** tiene un temporizador que sube solo: la carne se hace, y si no la
retiras se quema. No hay pulsaciones. Hay un **valor que cambia continuamente**
y una barra de progreso que lo dibuja.

::: natural
Para el fogón, avisar de cada cambio sería enviar un mensaje por fotograma.
Tiene más sentido decir: «este número es compartido; cuando yo lo cambie, que
todos lo tengan».

Eso es una NetworkVariable. No avisas de nada. Escribes el valor, y la red se
encarga de que las demás máquinas acaben teniendo el mismo.
:::

::: tecnico
`NetworkVariable<T>` es un campo de un `NetworkBehaviour` cuyo valor replica
Netcode. La instancia con permiso de escritura asigna `.Value`; en cada tick, si
el valor cambió, se envía a las demás. Cada instancia expone `OnValueChanged`,
que se invoca con el valor anterior y el nuevo.

```csharp
private readonly NetworkVariable<float> tiempoCoccion = new NetworkVariable<float>(0f);

public override void OnNetworkSpawn()
{
    tiempoCoccion.OnValueChanged += AlCambiarTiempo;
}

public override void OnNetworkDespawn()
{
    tiempoCoccion.OnValueChanged -= AlCambiarTiempo;
}

private void AlCambiarTiempo(float anterior, float nuevo)
{
    // actualizar la barra de progreso
}
```

Se inicializa en la declaración, no en `Awake`. La suscripción va en
`OnNetworkSpawn` y se retira en `OnNetworkDespawn`.
:::

En el fogón, el servidor es el único que suma tiempo y cambia de estado. Los
clientes no calculan nada: escuchan `OnValueChanged` y lanzan los mismos eventos
que ya movían la barra y el sonido en un jugador. La parte visual del juego no
se entera de que ahora hay red.

## Cuál usar

| | RPC | NetworkVariable |
|---|---|---|
| Representa | Un suceso: «ha pasado esto» | Un estado: «esto vale tanto» |
| Quien llega tarde | No se entera | Recibe el valor actual al entrar |
| Si cambia varias veces en un tick | Llega cada llamada | Llega solo el último valor |
| Uso típico | Sonido, efecto, petición al servidor | Vida, temporizador, estado de una máquina |

::: clave
La pregunta que decide es: **si alguien se conecta ahora, ¿necesita saberlo?**

Que sonó un claxon hace diez segundos, no. Que el fogón lleva la carne a medio
hacer, sí. Lo primero es un RPC. Lo segundo, una NetworkVariable.
:::

::: ojo
Una NetworkVariable no garantiza que veas todos los valores intermedios. Si el
servidor la pone a 1, a 2 y a 3 dentro del mismo tick, los clientes solo reciben
el 3. Para contar sucesos, eso pierde sucesos. Por eso los cortes de la tabla
van con RPC.
:::

## Quién puede escribir

::: natural
Por defecto solo el servidor escribe en una NetworkVariable, y todos la leen. Es
lo que quieres para el fogón.

Pero hay datos que solo conoce un jugador. El giro de tu volante solo existe en
tu teclado. Para eso se le puede dar el permiso de escritura al dueño del
objeto.
:::

::: tecnico
El constructor acepta los dos permisos:

```csharp
new NetworkVariable<float>(
    0f,
    NetworkVariableReadPermission.Everyone,
    NetworkVariableWritePermission.Owner);
```

Con `WritePermission.Owner`, escribe el cliente dueño y el valor llega al resto
a través del servidor. Una instancia sin permiso que asigne `.Value` provoca un
error. El tipo `T` debe ser un tipo de valor serializable: primitivos,
enumerados, vectores, o estructuras propias que implementen la serialización de
Netcode.
:::

Esta es la solución que propone tu issue 16, y es el laboratorio.

## Añadir ingredientes al plato

El capítulo corto del plato repite lo ya visto: el cliente pide añadir un
ingrediente con un RPC que lleva la posición del ingrediente en la lista, y el
servidor avisa a todos. No hay idea nueva; es el patrón de ida y vuelta aplicado
una vez más.

## Cuando dos jugadores chocan

El último capítulo es una decisión de diseño, y el autor la presenta así. Con
autoridad del cliente, cada jugador mueve su personaje sin preguntar. ¿Qué pasa
si dos quieren estar en el mismo sitio?

::: natural
Cada máquina es la que manda sobre su propio personaje, y del otro solo tiene
una copia que va un poco por detrás. Cuando chocan, cada máquina resuelve el
choque **contra la copia retrasada** del otro. Las dos resuelven algo
ligeramente distinto.

En la práctica funciona bastante bien a baja velocidad, y se nota más cuanto
más rápido se mueven y peor es la conexión.
:::

::: tecnico
En el vídeo el movimiento no usa física: comprueba con un `BoxCast` si puede
avanzar. El autor añade a esa comprobación la capa de los demás jugadores, de
modo que cada cliente trata las copias ajenas como obstáculos. No hay
autoridad compartida: cada dueño se bloquea a sí mismo contra lo que ve.

Con `Rigidbody`, Netcode ofrece `NetworkRigidbody`, que vuelve cinemáticos los
cuerpos en las instancias sin autoridad para que la física solo se simule donde
está la autoridad.
:::

El mismo capítulo arregla que los jugadores nazcan uno encima de otro: una lista
de posiciones de salida, y cada jugador toma la suya según su orden de entrada.

::: hoy
Tu coche se mueve con `transform.Translate`, sin física, igual que el personaje
del vídeo. El problema es el mismo, con una diferencia que lo agrava: un coche
va mucho más rápido que un cocinero, así que la copia del otro está más lejos
de donde está en realidad.
:::

::: vocabulario
NetworkVariable
: Un valor replicado. Quien tiene permiso lo escribe y los demás lo reciben,
  incluido quien se conecta después.

Permiso de escritura
: Quién puede cambiar el valor: el servidor, por defecto, o el dueño del objeto.

Cuerpo cinemático
: Un `Rigidbody` que no responde a fuerzas. Lo mueve el código, no la física.
:::

En el laboratorio cierras tu issue 16 con una NetworkVariable que escribe el
dueño, y haces chocar dos coches para ver el problema del último capítulo.
