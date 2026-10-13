---
modulo: 7
leccion: 2
tipo: lab
verificado: false
titulo: "Menú, selección de vehículo y juego"
resumen: "Partir tu única escena en tres, mover a todos los jugadores de una a otra, y dejar que cada uno elija con qué vehículo corre."
duracion: 150
objetivos:
  - Separar la conexión, la selección y la partida en tres escenas
  - Cargar una escena para todos desde el servidor
  - Sincronizar la elección de cada jugador con una NetworkList
  - Crear el vehículo de cada jugador a mano según lo que eligió
fuentes:
  - titulo: "Using NetworkSceneManager"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/using-networkscenemanager.html
  - titulo: "Scene events"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/basics/scenemanagement/scene-events.html
  - titulo: "INetworkSerializable"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/advanced-topics/serialization/inetworkserializable.html
  - titulo: "Player objects"
    url: https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.13/manual/components/core/playerobjects.html
---

Es el laboratorio más grande del curso, como sus dos capítulos son los más
largos del vídeo hasta aquí. Reorganiza el proyecto: hazlo en una rama, y haz
commit al final de cada paso. Cada uno deja el juego en un estado que funciona.

Tienes dos prefabs de vehículo de red, `Vehicle_NetworkObject` y
`Tank_NetworkObject`. Hasta ahora solo se usa uno. Aquí el jugador elige.

::: prerrequisitos
- [ ] Los laboratorios de los módulos 5 y 6 terminados
- [ ] La lección 7.1 leída
- [ ] Una rama nueva para este laboratorio
:::

:::: paso Tres escenas

Crea dos escenas nuevas y reparte lo que hoy está junto en `Prototype 1`:

| Escena | Qué contiene |
|---|---|
| `Menu` | El NetworkManager y los botones de sesión |
| `Seleccion` | La pantalla para elegir vehículo |
| `Prototype 1` | La carretera, el tráfico y el `RaceManager` |

Añade las tres a la lista de escenas del build, con `Menu` la primera.

::: porque
El NetworkManager tiene que estar en la primera escena, porque es la que
conecta, y sobrevive a los cambios porque se marca a sí mismo para no
destruirse. Y Netcode solo sabe cargar por red escenas que estén en la lista del
build.
:::

::: esperado
Al entrar en Play desde `Menu` puedes crear y unirte a una sesión. Todavía no
hay forma de salir de esa escena.
:::
::::

:::: paso Llevar a todos a la selección

Cuando el anfitrión cree la sesión, cárgale a todo el mundo la escena
`Seleccion`:

```csharp
NetworkManager.Singleton.SceneManager.LoadScene("Seleccion", LoadSceneMode.Single);
```

Engánchalo a `NetworkManager.OnServerStarted`, que avisa cuando esta máquina ha
arrancado como servidor.

::: porque
Si usaras el `SceneManager` de Unity, el anfitrión cambiaría de escena él solo.
El de la red se lo ordena a todos, y a quien se una después lo lleva
directamente a la escena en la que esté el servidor.
:::

::: esperado
El anfitrión crea la sesión y pasa a `Seleccion`. El cliente se une desde su
`Menu` y aparece en `Seleccion` sin pulsar nada más.
:::
::::

:::: paso Que no nazca ningún coche todavía

Quita el prefab del campo `PlayerPrefab` del NetworkManager.

::: porque
Mientras esté, el NetworkManager crea un coche en cuanto alguien se conecta, en
la escena de selección, donde no hay carretera. A partir de ahora los vehículos
los creas tú, cuando toque y del tipo que toque.
:::

::: esperado
Dos jugadores en `Seleccion` y ningún vehículo en la escena.
:::
::::

:::: paso Guardar quién ha elegido qué

Crea un `NetworkBehaviour` que viva toda la sesión, con una `NetworkList` de una
estructura como esta:

```csharp
public struct PlayerData : IEquatable<PlayerData>, INetworkSerializable
{
    public ulong clientId;
    public int vehicleId;
    public bool ready;
    // Equals y NetworkSerialize, como en la lección 7.1
}
```

El servidor añade una entrada al conectarse alguien y la quita al irse, con el
registro de conexiones que hiciste en el laboratorio 6.2.

Decide dónde vive este objeto para que sobreviva a los cambios de escena, y
ponle un `NetworkObject`.

::: porque
La elección de cada jugador la tienen que **ver todos** para dibujarla, y tiene
que seguir existiendo cuando se cargue la partida. Lo primero pide una lista
sincronizada en vez de un diccionario del servidor. Lo segundo, un objeto que no
se destruya con la escena.
:::

::: esperado
Con un log en `OnListChanged`: al unirse el segundo jugador, las **dos**
consolas informan de dos entradas.

El vídeo coloca un objeto equivalente en la escena y lo marca para no
destruirse. Comprueba que el tuyo sigue teniendo identificador de red tras el
primer cambio de escena, que es donde este diseño suele fallar.
:::
::::

:::: paso Elegir vehículo

En `Seleccion`, dos botones: coche y tanque. Al pulsar uno, el cliente pide el
cambio con un RPC al servidor; el servidor localiza la entrada del remitente y
cambia su `vehicleId`.

Recuerda el aviso de la lección 7.1: lee la entrada, modifica la copia, y
**vuelve a asignarla** en su posición.

::: porque
Es el patrón de ida y vuelta del módulo 2, pero la vuelta no es un RPC: es la
propia lista, que se sincroniza sola. El cliente no escribe en la lista porque
no tiene permiso, y no debe tenerlo: el servidor es quien valida.
:::

::: esperado
Cada jugador ve en pantalla su elección y la del otro, y cambian en las dos
ventanas al pulsar cualquiera de los dos.

Si cambia en la ventana de quien pulsa pero no en la otra, has modificado la
copia sin reasignarla.
:::
::::

:::: paso Listos, y a la carretera

Añade el botón «listo», que marca `ready` por el mismo camino. Cuando todas las
entradas estén listas, el servidor carga `Prototype 1`.

::: porque
Es el «estoy listo» del módulo 5, guardado ahora en la lista en vez de en un
diccionario porque aquí los demás sí necesitan verlo. La comprobación de «están
todos» sigue siendo cosa del servidor.
:::

::: esperado
Cuando los dos pulsan «listo», los dos pasan a `Prototype 1`. No hay vehículos
todavía.
:::
::::

:::: paso Crear el vehículo de cada uno

En `Prototype 1`, cuando todos hayan cargado, el servidor crea un vehículo por
jugador según su `vehicleId` y se lo entrega:

```csharp
NetworkManager.Singleton.SceneManager.OnLoadEventCompleted += AlCargarTodos;

// dentro, por cada cliente conectado:
GameObject vehiculo = Instantiate(prefabs[datos.vehicleId], puntoDeSalida.position, puntoDeSalida.rotation);
vehiculo.GetComponent<NetworkObject>().SpawnAsPlayerObject(datos.clientId, true);
```

Tu escena ya tiene `Spawn_A` y `Spawn_B`: usa uno por jugador.

::: porque
Es lo que antes hacía el NetworkManager a ciegas. Ahora lo haces tú, en el
momento correcto y sabiendo qué eligió cada uno. Se espera a
`OnLoadEventCompleted` porque antes hay clientes que aún no están en la escena.
Y de paso se resuelve que los dos nazcan en el mismo punto.
:::

::: esperado
Cada jugador aparece con el vehículo que eligió, en su punto de salida, y la
cámara de cada ventana sigue al suyo. La carrera del módulo 5 funciona encima.
:::
::::

:::: paso Volver al menú sin dejar restos

Al terminar la carrera, un botón para volver a `Menu`. Antes de cargarla, cierra
la conexión y sal de la sesión. En `Menu`, destruye el objeto de la lista de
jugadores si sigue vivo.

Después juega **dos partidas seguidas** sin salir de Play.

::: porque
Los objetos marcados para no destruirse siguen ahí al volver. La segunda partida
los encuentra duplicados, y los fallos que eso produce no señalan a su causa. El
vídeo le dedica un script solo a esta limpieza.
:::

::: esperado
La segunda partida se comporta exactamente como la primera: una entrada por
jugador en la lista, un vehículo por jugador, un solo NetworkManager en la
Hierarchy.
:::
::::

::: verificar
- [ ] El cliente llega a la selección sin hacer nada más que unirse
- [ ] Cada jugador ve la elección del otro cambiar en directo
- [ ] Cada uno corre con el vehículo que eligió y nace en su punto de salida
- [ ] Dos partidas seguidas funcionan igual
- [ ] No queda ningún `PlayerPrefab` en el NetworkManager
:::

::: problema La escena no se carga y sale un aviso sobre la lista de escenas
La escena no está en la lista del build, o el nombre no coincide exactamente.
:::

::: problema El cliente se queda en el menú mientras el anfitrión cambia
La carga se está haciendo con el `SceneManager` de Unity en vez de con
`NetworkManager.Singleton.SceneManager`, o la gestión de escenas está
desactivada en el NetworkManager.
:::

::: problema La lista de jugadores está vacía en el cliente
La lista se está creando en `OnNetworkSpawn`. Tiene que crearse en la
declaración o en `Awake`.
:::

::: problema En la segunda partida hay jugadores repetidos en la lista
El objeto que guarda la lista sobrevivió a la vuelta al menú y no se limpió.
:::

::: problema La cámara no sigue al vehículo
`VehicleOwnership` busca la cámara al aparecer el vehículo. Comprueba que la
cámara está en `Prototype 1` y que el vehículo se crea después de cargarla.
:::
