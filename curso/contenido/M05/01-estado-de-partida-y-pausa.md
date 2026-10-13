---
modulo: 5
leccion: 1
tipo: concepto
titulo: "Estado de partida y pausa"
resumen: "Una máquina de estados que comparten todos: esperar a que estén listos, cuenta atrás, jugar y terminar. Y qué significa pausar cuando hay más de un jugador."
duracion: 25
objetivos:
  - Sincronizar una máquina de estados con una NetworkVariable de tipo enumerado
  - Saber quién envió un RPC para llevar la cuenta de qué jugadores están listos
  - Separar lo que es estado de la partida de lo que es estado local de un jugador
  - Elegir una política de pausa y conocer el coste de cada una
video:
  - titulo: "Sync Game State"
    inicio: "02:45:04"
    fin: "03:01:34"
  - titulo: "Sync Pause"
    inicio: "03:01:34"
    fin: "03:11:16"
fuentes:
  - titulo: "NetworkVariable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/networkvariable.html
  - titulo: "RPC params"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/message-system/rpc-params.html
  - titulo: "In-scene placed NetworkObjects"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/inscene-placed-networkobjects.html
  - titulo: "Enum types"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/serialization/enum-types.html
---

El `KitchenGameManager` del vídeo lleva la partida con cuatro estados: esperando
para empezar, cuenta atrás, jugando y fin. En un jugador, pulsar una tecla
arrancaba la cuenta atrás. Con varios hay que contestar primero: ¿la tecla de
quién?

## El estado de la partida es de todos

::: natural
En qué fase está la partida no depende de ningún jugador: es lo mismo para
todos, dura en el tiempo, y quien entre tiene que saberlo.

Por la pregunta del módulo 4, eso es un valor compartido, y lo cambia el
servidor.
:::

::: tecnico
El estado es una `NetworkVariable` de tipo enumerado, que solo escribe el
servidor. Los temporizadores de la cuenta atrás y de la partida son otras dos
`NetworkVariable<float>`. Toda la lógica que avanza la máquina de estados queda
tras la guarda `if (!IsServer) return;`.

```csharp
public enum Estado { EsperandoJugadores, CuentaAtras, Jugando, Fin }

private readonly NetworkVariable<Estado> estado = new NetworkVariable<Estado>(Estado.EsperandoJugadores);
```

Los clientes no calculan nada. Reaccionan a `OnValueChanged` lanzando el mismo
evento de «el estado ha cambiado» que el juego ya usaba, de modo que la interfaz
no nota la diferencia.
:::

El gestor de la partida es un objeto que ya está en la escena, no uno que se
crea al conectar. Para que tenga red basta con ponerle un `NetworkObject`: con la
gestión de escenas activada, Netcode publica los objetos de red colocados en la
escena al arrancar el servidor.

## «Estoy listo» es de cada uno

Para empezar, el vídeo espera a que **todos** los jugadores pulsen la tecla. Eso
junta dos datos de naturaleza distinta:

| Dato | De quién es | Cómo viaja |
|---|---|---|
| Yo ya he pulsado | Local: solo le importa a mi interfaz | No viaja |
| Qué jugadores han pulsado | Del servidor | Cada cliente lo comunica con un RPC |
| Estamos todos listos | De la partida | Cambio de la NetworkVariable de estado |

::: natural
Cada jugador le dice al servidor «estoy listo». El servidor lleva una lista de
quién lo ha dicho. Cuando están todos, cambia el estado a cuenta atrás, y ese
cambio llega a todas las máquinas.
:::

::: tecnico
El servidor guarda un `Dictionary<ulong, bool>` indexado por identificador de
cliente. El identificador del remitente no se pasa como argumento: se lee de los
parámetros que Netcode añade al RPC, que el cliente no puede falsificar.

```csharp
[Rpc(SendTo.Server)]
private void EstoyListoRpc(RpcParams rpcParams = default)
{
    ulong quien = rpcParams.Receive.SenderClientId;
    listos[quien] = true;

    foreach (ulong id in NetworkManager.ConnectedClientsIds)
    {
        if (!listos.ContainsKey(id) || !listos[id]) return;
    }
    estado.Value = Estado.CuentaAtras;
}
```
:::

::: hoy
En el vídeo el parámetro es `ServerRpcParams serverRpcParams = default` y el
remitente se lee con `serverRpcParams.Receive.SenderClientId`. Con el atributo
`[Rpc]` de tu versión el tipo se llama `RpcParams`; el resto es igual.
:::

::: clave
El autor usa un diccionario y no una lista por un motivo que se le escapa a
cualquiera la primera vez: los identificadores de cliente no son consecutivos ni
estables. Si alguien se va y entra otro, los números no se reutilizan en orden.
Un diccionario por identificador no depende de eso.
:::

::: ojo
Fíjate en que el diccionario **no** es una NetworkVariable. Vive solo en el
servidor, porque solo él lo necesita para decidir. A los clientes les llega la
consecuencia, el cambio de estado, no el detalle. No todo lo que el servidor
sabe tiene que sincronizarse.
:::

## Pausar con más de un jugador

En un jugador, pausar era poner `Time.timeScale` a cero. Con varios es otra
decisión de diseño, y el autor expone las opciones antes de elegir:

| Política | Qué pasa | Dónde se usa |
|---|---|---|
| No se pausa | El menú se abre, la partida sigue para todos | Competitivos: nadie debe poder parar al rival |
| Pausa local | Se para solo tu máquina | Casi nunca: te desincronizas del resto |
| Pausa compartida | Si alguien pausa, se para para todos | Cooperativos entre amigos |

El vídeo implementa la tercera, con el mismo mecanismo que «estoy listo»: un
diccionario en el servidor de quién está en pausa, y una NetworkVariable
booleana `estaPausado` que vale verdadero mientras quede **al menos uno**.

::: natural
Cada máquina mira ese valor compartido. Cuando pasa a verdadero, detiene su
tiempo; cuando vuelve a falso, lo reanuda. Nadie reanuda por su cuenta: hasta
que no salga de la pausa el último, siguen todos parados.
:::

::: tecnico
`Time.timeScale` es local a cada proceso. Lo que se sincroniza es la decisión,
en una `NetworkVariable<bool>`, y cada instancia aplica el `timeScale` en su
`OnValueChanged`. El jugador distingue en su interfaz entre «he pausado yo», que
muestra el menú, y «ha pausado otro», que muestra un aviso de espera.
:::

::: ojo
Con `Time.timeScale` a cero, lo que dependa de `Time.deltaTime` se detiene, pero
la red sigue funcionando: los RPC llegan y las NetworkVariable se sincronizan.
Menos mal, porque si no nadie podría enviar el «ya no estoy en pausa».
:::

El autor deja un cabo suelto que recoge en el módulo siguiente: si el único
jugador en pausa se desconecta, su entrada del diccionario se queda en
verdadero y la partida no se reanuda nunca.

::: vocabulario
Máquina de estados
: Un conjunto cerrado de fases, con reglas para pasar de una a otra.

Estado local
: Un dato que solo importa a una máquina y no se sincroniza.

Remitente
: El cliente que envió un RPC. El servidor lo lee de los parámetros del mensaje.
:::

En el laboratorio tu juego gana una partida: esperar a los dos jugadores, cuenta
atrás, carrera con tiempo y final.
