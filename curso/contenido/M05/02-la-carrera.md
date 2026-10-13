---
modulo: 5
leccion: 2
tipo: lab
verificado: false
titulo: "La carrera"
resumen: "Darle una partida a tu juego: nadie arranca hasta que los dos estén listos, hay una cuenta atrás, se corre contra el reloj y se acaba para todos a la vez."
duracion: 90
objetivos:
  - Crear un gestor de partida como objeto de red colocado en la escena
  - Sincronizar su estado con una NetworkVariable enumerada
  - Llevar en el servidor la cuenta de quién está listo usando el remitente del RPC
  - Hacer que los vehículos solo respondan en la fase de carrera
fuentes:
  - titulo: "NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/networkvariable.html
  - titulo: "RPC params"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc-params.html
  - titulo: "In-scene placed NetworkObjects"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/inscene-placed-networkobjects.html
---

Hasta ahora, en cuanto alguien se conecta puede conducir. No hay principio ni
final. Este laboratorio añade las cuatro fases del vídeo, adaptadas: esperando
jugadores, cuenta atrás, carrera y fin.

Es el laboratorio más largo hasta aquí. Cada paso deja el juego funcionando.

::: prerrequisitos
- [ ] Los laboratorios de los módulos 2 y 4 terminados: has escrito ya un RPC y una NetworkVariable
- [ ] La lección 5.1 leída
- [ ] Un commit limpio antes de empezar
:::

:::: paso Crear el gestor en la escena

Crea `Assets/Scripts/Multiplayer/RaceManager.cs`, un `NetworkBehaviour` con el
enumerado de fases y su NetworkVariable. Pon un GameObject vacío en
`Prototype 1` con ese script y un **NetworkObject**.

```csharp
public enum RaceState { WaitingForPlayers, Countdown, Racing, Finished }

public NetworkVariable<RaceState> State = new NetworkVariable<RaceState>(RaceState.WaitingForPlayers);
```

::: porque
El estado de la partida es de todos y quien entre tarde tiene que conocerlo: es
una NetworkVariable. Y el gestor ya está en la escena, no nace al conectar. Con
la gestión de escenas activada, que es como está tu NetworkManager, Netcode
publica los objetos de red de la escena al arrancar el servidor.
:::

::: esperado
Al crear la sesión, el gestor aparece en la Hierarchy con identificador de red.
En el Inspector, `State` vale `WaitingForPlayers` en los dos jugadores.
:::
::::

:::: paso Que los coches esperen

Los vehículos solo deben responder en la fase `Racing`. El sitio natural es tu
`VehicleOwnership`, que ya decide si el controlador está activo.

Ahora depende de dos condiciones: ser el dueño **y** que la carrera esté en
marcha. Suscríbete al `OnValueChanged` del gestor para recalcularlo cuando
cambie la fase, y no olvides calcularlo también una vez al aparecer.

::: porque
Es el mismo arreglo que hace el vídeo: el jugador no se mueve si el juego no
está en la fase de jugar. La suscripción evita preguntar el estado en cada
fotograma, y el cálculo inicial cubre a quien entra con la carrera ya empezada:
`OnValueChanged` no se dispara por el valor que ya había.
:::

::: esperado
Tras crear la sesión, **ningún** coche responde al teclado, ni el del anfitrión
ni el del cliente. Todavía no hay forma de salir de la espera.
:::
::::

:::: paso Decir «estoy listo»

Añade al gestor un RPC hacia el servidor que registre al remitente en un
diccionario, y que el dueño de cada coche lo llame al pulsar una tecla.

```csharp
private readonly Dictionary<ulong, bool> _ready = new Dictionary<ulong, bool>();

[Rpc(SendTo.Server)]
public void PlayerReadyRpc(RpcParams rpcParams = default)
{
    ulong sender = rpcParams.Receive.SenderClientId;
    // marcar a `sender` como listo, y comprobar si lo están todos
}
```

Cuando todos los de `NetworkManager.ConnectedClientsIds` estén listos, el
servidor pone `State.Value` en `Countdown`.

::: porque
El gestor no es de ningún jugador, y aun así los clientes pueden llamarlo: el
`[Rpc]` de tu versión lo puede invocar cualquiera por defecto. El remitente se
lee de los parámetros, no se pasa como argumento, porque un argumento lo
escribe el cliente y podría decir que es otro.
:::

::: esperado
Con dos jugadores: pulsa la tecla en uno y no pasa nada visible. Púlsala en el
otro y `State` cambia a `Countdown` en **los dos** Inspectores a la vez.

Con un solo jugador conectado, basta con que pulse él.
:::
::::

:::: paso La cuenta atrás y el reloj

Añade dos `NetworkVariable<float>`: los segundos que quedan de cuenta atrás y
los que quedan de carrera. En el `Update` del gestor, **solo en el servidor**,
réstales tiempo según la fase y avanza el estado cuando lleguen a cero.

::: porque
El tiempo de la partida es un valor que cambia de forma continua y que debe ser
el mismo para todos: el fogón del módulo 4. Si cada máquina llevara su propio
reloj, acabarían la carrera en momentos distintos.
:::

::: esperado
Tras estar los dos listos: tres segundos de cuenta atrás, los coches empiezan a
responder los dos a la vez, corre el tiempo de carrera, y al acabar se quedan
los dos parados.
:::
::::

:::: paso Enseñarlo en pantalla

Muestra la fase y el tiempo. Un `TextMeshPro` en un Canvas, que lea las
NetworkVariable del gestor, es suficiente.

Decide tú si lo actualizas con `OnValueChanged` o leyendo `.Value` en `Update`,
y anota por qué.

::: porque
La interfaz es local: cada máquina dibuja la suya a partir de los datos
compartidos. No hay nada de red en ella, y esa separación es la que hace que el
vídeo pueda reutilizar toda su interfaz de un jugador sin tocarla.
:::

::: esperado
Los dos jugadores ven el mismo texto de fase y el mismo tiempo, con una
diferencia de como mucho un par de décimas en el del cliente.
:::
::::

:::: paso Llegar tarde

Con la carrera en marcha, cierra Player 2 y vuelve a unirte.

Predice antes: ¿en qué fase verá el juego el que entra? ¿Podrá conducir?

::: porque
Es la comprobación de que elegiste bien la herramienta. Una NetworkVariable
entrega su valor actual a quien se conecta; un RPC no.
:::

::: esperado
El jugador que entra ve la fase `Racing` y el tiempo que queda de verdad, y su
coche responde. Si no responde, falta el cálculo inicial del segundo paso.

Queda una pregunta abierta que es el módulo 6: ¿debería poder entrar con la
carrera empezada?
:::
::::

:::: paso Opcional: la pausa

Si quieres llegar hasta donde llega el vídeo, añade la pausa compartida: otro
diccionario en el servidor de quién está en pausa, una `NetworkVariable<bool>`,
y `Time.timeScale` aplicado en su `OnValueChanged`.

Antes de hacerlo, decide qué política de la lección 5.1 quieres para un juego de
carreras.

::: porque
En una carrera, que alguien pueda parar a todos es discutible. Es justo el caso
en el que el autor dice que muchos juegos optan por no pausar.
:::

::: esperado
Una decisión anotada, y la implementación solo si elegiste pausa compartida.
:::
::::

::: verificar
- [ ] Nadie puede conducir hasta que todos han dicho que están listos
- [ ] La cuenta atrás y el final ocurren a la vez en las dos ventanas
- [ ] El tiempo solo lo resta el servidor
- [ ] Quien entra con la carrera empezada ve la fase y el tiempo correctos
- [ ] La interfaz no contiene ninguna llamada de red
:::

::: problema El gestor no tiene identificador de red al crear la sesión
Le falta el `NetworkObject`, o el objeto está desactivado en la escena.
:::

::: problema Solo arranca el coche del anfitrión
`VehicleOwnership` no está reaccionando al cambio de fase en el cliente. Revisa
que te suscribes a `OnValueChanged` en `OnNetworkSpawn`, y que el gestor ya
existe cuando lo buscas.
:::

::: problema Error de permiso al cambiar el estado
Un cliente está intentando escribir `State.Value`. Todo lo que avanza la fase
tiene que estar tras `if (!IsServer) return;`.
:::

::: problema La cuenta atrás va el doble de rápido
El `Update` del gestor está restando tiempo también en el cliente, o hay dos
gestores en la escena.
:::
