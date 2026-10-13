---
modulo: 7
leccion: 1
tipo: concepto
titulo: "Flujo de escenas y selección de personaje"
resumen: "Cómo se cambia de escena cuando hay varias máquinas, qué objetos sobreviven al cambio, y cómo se guarda una lista de jugadores con sus elecciones que todos ven."
duracion: 35
objetivos:
  - Cambiar de escena para todos los jugadores a la vez
  - Explicar qué objetos sobreviven a un cambio de escena y cómo limpiarlos al volver al menú
  - Guardar una lista sincronizada de datos por jugador con NetworkList
  - Crear el objeto de cada jugador a mano en vez de dejárselo al NetworkManager
video:
  - titulo: "Connection Scene Flow"
    inicio: "03:29:44"
    fin: "03:56:57"
  - titulo: "Character Select Scene"
    inicio: "03:56:57"
    fin: "04:37:34"
fuentes:
  - titulo: "Using NetworkSceneManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/using-networkscenemanager.html
  - titulo: "Scene events"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/scene-events.html
  - titulo: "In-scene placed NetworkObjects"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/inscene-placed-networkobjects.html
  - titulo: "INetworkSerializable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/serialization/inetworkserializable.html
  - titulo: "Player objects"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/playerobjects.html
---

El autor llama al primero de estos capítulos uno de los más importantes del
curso. Hasta aquí todo ocurría en una escena con dos botones de prueba. Aquí el
juego pasa a tener el recorrido de un juego de verdad:

```text
  Menú principal ──▶ Sala ──▶ Selección de personaje ──▶ Partida
        ▲                                                   │
        └───────────────── volver al menú ──────────────────┘
```

## Cambiar de escena para todos

::: natural
Si el anfitrión carga otra escena por su cuenta, se va él solo. Los clientes se
quedan en la anterior, mirando un escenario del que el servidor ya no sabe nada.

El cambio de escena tiene que pedírsele a la red, que se encarga de que todos
carguen la misma.
:::

::: tecnico
La carga se hace a través del gestor de escenas del NetworkManager, y solo
desde el servidor:

```csharp
NetworkManager.Singleton.SceneManager.LoadScene("Partida", LoadSceneMode.Single);
```

Requiere la gestión de escenas activada en el NetworkManager, y que la escena
esté en la lista de escenas del build. Netcode ordena la carga a cada cliente y
sincroniza a los que se conecten después con la escena activa. El evento
`OnLoadEventCompleted` se dispara en el servidor cuando todos han terminado, con
la lista de quienes lo lograron y quienes no.
:::

::: ojo
La carga no es instantánea ni simultánea: cada máquina tarda lo suyo. El autor
crea los personajes de los jugadores en `OnLoadEventCompleted`, no justo después
de pedir la carga, porque antes de ese evento hay clientes que todavía no están
en la escena nueva.
:::

## Lo que sobrevive al cambio

::: natural
Al cargar una escena en modo único, Unity destruye todo lo de la anterior. Lo
que tiene que durar toda la sesión, como el objeto que guarda quién es cada
jugador, hay que marcarlo para que no se destruya.

Eso trae un problema simétrico: al volver al menú, esos objetos siguen ahí. Si
el menú crea otros nuevos, hay dos.
:::

::: tecnico
El NetworkManager se marca a sí mismo con `DontDestroyOnLoad`. El gestor
multijugador del vídeo, que guarda los datos de los jugadores, hace lo mismo en
su `Awake`.

Al volver al menú principal, un script de limpieza destruye el NetworkManager y
ese gestor si existen, de modo que la siguiente partida empieza de cero. Antes
se ha llamado a `NetworkManager.Shutdown()`.
:::

El vídeo añade en este capítulo las dos ventanas que le faltaban a la conexión:
una de «conectando», que se muestra desde que el cliente intenta entrar hasta
que lo consigue, y otra de «no se pudo conectar», que enseña el motivo que
devolvió la aprobación de conexiones del módulo 6.

## Una lista de jugadores que todos ven

En la escena de selección cada jugador elige un color y pulsa «listo». Todos ven
a todos, con su color y su estado. Hace falta una lista de datos por jugador,
sincronizada.

::: natural
Una NetworkVariable guarda un valor. Para una lista de jugadores que crece y
mengua hace falta su versión en colección: una lista que el servidor modifica y
que todas las máquinas tienen igual.
:::

::: tecnico
`NetworkList<T>` es una colección replicada. `T` debe ser un tipo de valor que
Netcode sepa serializar y que implemente `IEquatable<T>`. Para datos propios se
define una estructura:

```csharp
public struct DatosJugador : IEquatable<DatosJugador>, INetworkSerializable
{
    public ulong idCliente;
    public int idColor;

    public bool Equals(DatosJugador otro) => idCliente == otro.idCliente && idColor == otro.idColor;

    public void NetworkSerialize<T>(BufferSerializer<T> serializador) where T : IReaderWriter
    {
        serializador.SerializeValue(ref idCliente);
        serializador.SerializeValue(ref idColor);
    }
}
```

La lista se crea en la declaración o en `Awake`, nunca en `OnNetworkSpawn`. Su
evento `OnListChanged` avisa de cada alta, baja o cambio.
:::

El servidor añade una entrada cuando alguien se conecta y la quita cuando se va,
con los mismos eventos de conexión del módulo 6.

::: ojo
Una estructura dentro de una lista no se modifica en su sitio. Para cambiar el
color de un jugador hay que leer su entrada, cambiar la copia y **volver a
asignarla** en esa posición. Cambiar solo la copia no envía nada, y es un fallo
silencioso: no da error, simplemente los demás no ven el cambio.
:::

::: clave
En el módulo 5 el autor usó un diccionario que vivía solo en el servidor para
saber quién estaba listo. Aquí usa una lista sincronizada. La diferencia es
quién necesita el dato: «están todos listos» solo lo decide el servidor; «de qué
color es cada uno» lo tienen que dibujar todas las máquinas.
:::

## Elegir, y que no se repita

Cambiar de color es el patrón de ida y vuelta del módulo 2: el cliente pide un
color con un RPC, el servidor comprueba que no lo tenga otro, y si está libre lo
escribe en la lista. El cambio llega a todos por la lista, sin RPC de vuelta.

El anfitrión puede además expulsar a un jugador. Es una llamada del servidor,
`NetworkManager.DisconnectClient`, que en tu versión admite un texto con el
motivo.

## Crear al jugador a mano

Hasta aquí el NetworkManager creaba el personaje en cuanto alguien se conectaba.
Con escenas eso ya no sirve: los jugadores se conectan en la sala, y su
personaje no debe existir hasta la partida.

::: natural
Se le quita al NetworkManager el prefab de jugador para que no cree nada al
conectar. Cuando todos han cargado la escena de la partida, el servidor crea un
personaje por cada jugador y se lo entrega.
:::

::: tecnico
Con el `PlayerPrefab` vacío no hay creación automática. En
`OnLoadEventCompleted` de la escena de partida, el servidor recorre los clientes
conectados y por cada uno:

```csharp
GameObject instancia = Instantiate(prefabJugador);
instancia.GetComponent<NetworkObject>().SpawnAsPlayerObject(idCliente, true);
```

`SpawnAsPlayerObject` publica el objeto, lo asigna a ese cliente como dueño y lo
registra como su objeto de jugador. El segundo argumento hace que se destruya al
descargar la escena.
:::

Como el servidor ya tiene la lista con la elección de cada uno, puede crear un
personaje distinto para cada jugador o pintarlo de su color.

::: vocabulario
Gestor de escenas de red
: La parte del NetworkManager que carga escenas en todas las máquinas a la vez.

NetworkList
: Una lista replicada. Como una NetworkVariable, pero colección.

Objeto de jugador
: El objeto de red que representa a un cliente. Cada cliente tiene como mucho
  uno.
:::

En el laboratorio tu juego gana un menú, una pantalla para elegir vehículo y la
partida como tercera escena.
