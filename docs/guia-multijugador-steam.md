# Guía: multijugador con adaptador de lobby y Steam

Esta guía explica cómo está hecho el multijugador de JuniorProgrammerPath y te
lleva paso a paso a construirlo **desde un proyecto vacío**. Al terminar tendrás
un juego donde un jugador crea una sala de Steam, invita a un amigo, y los dos
ven moverse al otro. Lo importante es que **el juego no sabe que detrás está
Steam**: cambiar a otro proveedor es cambiar un valor en el Inspector.

Escribe el código a mano en lugar de copiarlo. Cada bloque viene con el porqué,
y es al teclearlo cuando aparecen las preguntas útiles.

**Contenido**

1. [La idea en cinco minutos](#1-la-idea-en-cinco-minutos)
2. [Antes de empezar](#2-antes-de-empezar)
3. [Paso 1: proyecto y jugador de red](#paso-1-proyecto-y-jugador-de-red)
4. [Paso 2: el contrato](#paso-2-el-contrato)
5. [Paso 3: esperar a que el cliente conecte](#paso-3-esperar-a-que-el-cliente-conecte)
6. [Paso 4: el adaptador local](#paso-4-el-adaptador-local)
7. [Paso 5: el bootstrap](#paso-5-el-bootstrap)
8. [Paso 6: el menú](#paso-6-el-menú)
9. [Paso 7: montar la escena y probar en local](#paso-7-montar-la-escena-y-probar-en-local)
10. [Paso 8: el transporte de Steam](#paso-8-el-transporte-de-steam)
11. [Paso 9: el adaptador de Steam](#paso-9-el-adaptador-de-steam)
12. [Paso 10: probar con Steam](#paso-10-probar-con-steam)
13. [Tropiezos reales](#tropiezos-reales)
14. [Ejercicios para afianzar](#ejercicios-para-afianzar)
15. [Vocabulario](#vocabulario)

---

## 1. La idea en cinco minutos

### Un "lobby" son tres trabajos distintos

| Trabajo | Qué resuelve | Quién lo hace aquí |
|---|---|---|
| **Encontrarse** | Una sala con miembros, invitaciones, un id para unirse | Lobby de Steam |
| **Conectarse** | Que dos PCs en casas distintas se hablen sin abrir puertos | Relays de Steam, vía `FacepunchTransport` |
| **Sincronizar el juego** | Posiciones, RPCs, quién es dueño de qué | Netcode for GameObjects (NGO) |

El tercero **no cambia nunca**. Tus `NetworkBehaviour` hablan con NGO, y NGO no
sabe si los bytes viajan por Steam o por una IP. Lo que cambia según el
proveedor son los dos primeros.

### El patrón adaptador

El juego habla con una interfaz, `ILobbyService`. Cada proveedor tiene una clase
que la cumple. Un único objeto de la escena, el bootstrap, decide cuál se usa.

```
LobbyMenu (UI) ──► ILobbyService ◄── lo único que ve el juego
                      ├── LocalLobbyService   UnityTransport, IP directa
                      └── SteamLobbyService   lobby de Steam + FacepunchTransport

MultiplayerBootstrap: elige el adaptador y pone su transporte en el NetworkManager

Gameplay (NetworkBehaviour, NetworkTransform…) ──► NGO   ← no se toca
```

### La decisión que hace funcionar el adaptador

En esta interfaz, `CreateAsync` significa "sala creada **y** esta máquina ya es
host", y `JoinAsync` significa "dentro de la sala **y** ya conectado al host".

¿Por qué no separar "crear sala" de "arrancar la red"? Porque cada proveedor
tiene **su propio orden**:

- **Steam:** primero se entra al lobby, de ahí se lee el SteamID del dueño, y
  solo entonces se conecta a esa persona.
- **Unity Sessions:** el SDK arranca el `NetworkManager` él solo cuando la
  sesión está lista.

Si la interfaz separara los dos pasos, el menú tendría que saber en qué orden
llamarlos según el proveedor. Ese conocimiento es justo lo que el adaptador
debe esconder.

**Regla general:** una interfaz de adaptador se define por **lo que el juego
necesita** ("quiero jugar con mis amigos"), no por **las operaciones que ofrece
el proveedor** ("CreateLobby", "SetLobbyData", "ConnectP2P").

### Lo que el contrato nunca expone

`LobbyInfo` son datos propios del juego (id, si soy host, cupo, nombres). Nunca
el `Lobby` de Steam ni el `ISession` de Unity. En cuanto el menú lea un tipo de
Steam, el menú queda atado a Steam y el adaptador deja de servir.

Una prueba rápida que puedes hacer en cualquier momento: **ningún archivo fuera
de los adaptadores y el bootstrap puede tener `using Steamworks`**.

---

## 2. Antes de empezar

- Unity 6 (esta guía se probó con 6000.1.13f1).
- Steam instalado, abierto y con tu sesión iniciada.
- Para la prueba final: **un amigo con otra cuenta de Steam en otro PC**. Una
  misma cuenta no puede ser host y cliente a la vez (lo comprobamos: Steam
  devuelve `Invalid Connection` al conectarte a tu propio SteamID).
- Usaremos el AppID **480 (Spacewar)**, el de pruebas de Valve. No necesitas
  cuenta de desarrollador de Steamworks.

---

## Paso 1: proyecto y jugador de red

1. Crea un proyecto **Universal 3D** con Unity Hub.
2. En *Window → Package Manager → Unity Registry*, instala **Netcode for
   GameObjects** y **Multiplayer Play Mode**.
3. Crea un GameObject vacío llamado `NetworkManager` y añádele los componentes
   **NetworkManager** y **UnityTransport**. En el NetworkManager, arrastra el
   UnityTransport al campo *Network Transport*.
4. Crea el jugador: un **Cube** con los componentes **NetworkObject**,
   **NetworkTransform** (con *Authority Mode* en **Owner**) y este script:

```csharp
using Unity.Netcode;
using UnityEngine;
using UnityEngine.InputSystem;

// Solo el dueno lee el teclado; el NetworkTransform (Owner) reparte la posicion.
public class SimplePlayerMover : NetworkBehaviour
{
    [SerializeField] private float speed = 5f;

    public override void OnNetworkSpawn()
    {
        // Para distinguir tu cubo del de los demas
        if (IsOwner) GetComponent<Renderer>().material.color = Color.green;
    }

    private void Update()
    {
        if (!IsOwner || Keyboard.current == null) return;

        Keyboard k = Keyboard.current;
        float x = (k.dKey.isPressed ? 1 : 0) - (k.aKey.isPressed ? 1 : 0);
        float z = (k.wKey.isPressed ? 1 : 0) - (k.sKey.isPressed ? 1 : 0);
        transform.position += new Vector3(x, 0, z).normalized * speed * Time.deltaTime;
    }
}
```

5. Conviértelo en prefab, bórralo de la escena y asígnalo en
   *NetworkManager → Player Prefab*.

**Por qué**

**¿Por qué Authority Mode en Owner?** Cada jugador mueve su propio cubo sin
esperar al host, y el `NetworkTransform` reparte su posición a los demás. Es la
misma decisión que tomamos con los vehículos en `VehicleOwnership`. El host no
valida nada, así que un cliente podría hacer trampa; para un juego cooperativo
entre amigos es un precio aceptable.

**Verificar:** dale a Play. No aparece ningún cubo y no hay errores en la
consola. Es correcto: todavía nadie ha arrancado la red.

---

## Paso 2: el contrato

Crea la carpeta `Assets/Scripts/Multiplayer/Lobby/` y dentro estos dos archivos.

`ILobbyService.cs`

```csharp
using System;
using System.Threading.Tasks;

namespace Multiplayer.Lobby
{
    // Lo unico que el juego sabe del multijugador. Detras puede haber Steam, Unity
    // Sessions o una conexion local, y ni el menu ni el gameplay lo notan.
    //
    // Crear y unirse incluyen arrancar la red a proposito: cada proveedor tiene su
    // propio orden (Steam entra al lobby y luego conecta al dueno; Sessions arranca
    // el NetworkManager por su cuenta). Si el contrato los separara, el juego
    // tendria que conocer ese orden y el adaptador dejaria de servir.
    public interface ILobbyService : IDisposable
    {
        // null mientras no se esta en ninguna sala
        LobbyInfo CurrentLobby { get; }

        // Se entro, se salio, o entro o salio alguien. Llega null al salir.
        event Action<LobbyInfo> LobbyChanged;

        // Llego una invitacion desde fuera del juego (overlay, lista de amigos).
        // Trae el id que hay que pasarle a JoinAsync.
        event Action<string> JoinRequested;

        // Termina con la sala creada y esta maquina como host
        Task<bool> CreateAsync(int maxPlayers);

        // Termina con esta maquina dentro de la sala y conectada al host
        Task<bool> JoinAsync(string lobbyId);

        void Leave();

        // Abre la forma de invitar que tenga el proveedor
        void InviteFriends();

        // Algunos proveedores necesitan que se les atienda cada frame
        void Tick();
    }
}
```

`LobbyInfo.cs`

```csharp
using System.Collections.Generic;

namespace Multiplayer.Lobby
{
    // Foto de la sala en tipos del juego. Nunca expone el Lobby de Steam ni el
    // ISession de Unity: si lo hiciera, quien la lee quedaria atado al proveedor.
    public sealed class LobbyInfo
    {
        public string Id { get; }
        public bool IsHost { get; }
        public int MaxPlayers { get; }
        public IReadOnlyList<string> Members { get; }

        public LobbyInfo(string id, bool isHost, int maxPlayers, IReadOnlyList<string> members)
        {
            Id = id;
            IsHost = isHost;
            MaxPlayers = maxPlayers;
            Members = members;
        }
    }
}
```

**Por qué**

- **`Task<bool>`.** Crear un lobby es una llamada a los servidores de Valve y
  tarda. `await` deja escribir "espera y sigue" sin callbacks anidados.
  Devuelve `bool` y no lanza excepciones para los fallos normales (lobby lleno,
  amigo que ya cerró), porque el menú solo necesita saber si salió bien.
- **`JoinRequested`.** Con Steam, la invitación llega **desde fuera del
  juego**: tu amigo pulsa "Unirse a la partida" en su lista de amigos. El juego
  no la pidió, así que necesita un evento para enterarse.
- **`Tick()`.** Steam no avisa por su cuenta: hay que preguntarle cada frame si
  hay novedades. Otros proveedores no lo necesitan y lo dejan vacío. Es la
  única concesión del contrato a un proveedor concreto, y es genérica (muchos
  sistemas de red se "bombean").
- **`IDisposable`.** Steam se enciende y se apaga. Alguien tiene que apagarlo
  al salir del juego.
- **`LobbyInfo` es `sealed` e inmutable.** Es una foto. Cuando la sala cambia
  se publica una foto nueva con `LobbyChanged`, nunca se modifica la vieja.

**Verificar:** compila. Busca `Steamworks` y `Unity.Services` en los dos
archivos: no debe aparecer ninguno.

---

## Paso 3: esperar a que el cliente conecte

`NetcodeConnection.cs`

```csharp
using System.Threading.Tasks;
using Unity.Netcode;

namespace Multiplayer.Lobby
{
    // Lo que todos los adaptadores hacen igual con Netcode, sea cual sea el transporte.
    internal static class NetcodeConnection
    {
        // StartClient solo empieza a conectar: el resultado llega frames despues por
        // los callbacks del NetworkManager. Esto lo convierte en algo que se espera.
        public static Task<bool> StartClientAsync(NetworkManager networkManager)
        {
            var result = new TaskCompletionSource<bool>();

            void OnConnected(ulong clientId)
            {
                if (clientId == networkManager.LocalClientId) Finish(true);
            }

            // Si el host no responde o rechaza, el transporte desconecta y Netcode
            // apaga el cliente: no hace falta un temporizador propio.
            void OnStopped(bool wasHost) => Finish(false);

            void Finish(bool connected)
            {
                networkManager.OnClientConnectedCallback -= OnConnected;
                networkManager.OnClientStopped -= OnStopped;
                result.TrySetResult(connected);
            }

            networkManager.OnClientConnectedCallback += OnConnected;
            networkManager.OnClientStopped += OnStopped;

            if (!networkManager.StartClient()) Finish(false);

            return result.Task;
        }
    }
}
```

**Por qué**

`NetworkManager.StartClient()` devuelve `true` en cuanto **empieza** a
conectar, no cuando lo consigue. El resultado real llega varios frames
después, por `OnClientConnectedCallback` (lo logró) o por `OnClientStopped` (el
host no respondió o rechazó).

`TaskCompletionSource` convierte esos dos eventos en una `Task` que se puede
esperar con `await`. Este patrón sirve para cualquier API de eventos que quieras
usar con `async`.

Las funciones locales `OnConnected` y `OnStopped` se desuscriben en `Finish`.
Si no lo hicieran, cada intento de unirse dejaría suscripciones colgadas, y en
el segundo intento `Finish` se llamaría dos veces.

---

## Paso 4: el adaptador local

`LocalLobbyService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;

namespace Multiplayer.Lobby
{
    // Adaptador sin servicios externos: conexion directa por IP con UnityTransport.
    // Sirve para probar el contrato y el menu con Multiplayer Play Mode, donde
    // Steam no puede (todas las ventanas comparten tu cuenta).
    // La "sala" es la propia partida y su id es la direccion del host.
    public class LocalLobbyService : ILobbyService
    {
        private const string DefaultAddress = "127.0.0.1";

        private readonly NetworkManager _networkManager;
        private readonly UnityTransport _transport;
        private readonly ushort _port;

        private int _maxPlayers;
        private string _lobbyId;

        public LobbyInfo CurrentLobby { get; private set; }

        public event Action<LobbyInfo> LobbyChanged;

        // Sin overlay ni amigos: aqui nunca llega una invitacion de fuera
        public event Action<string> JoinRequested { add { } remove { } }

        public LocalLobbyService(NetworkManager networkManager, UnityTransport transport, ushort port)
        {
            _networkManager = networkManager;
            _transport = transport;
            _port = port;

            _networkManager.OnClientConnectedCallback += OnMembersChanged;
            _networkManager.OnClientDisconnectCallback += OnMembersChanged;
            _networkManager.OnClientStopped += OnNetworkStopped;
        }

        public Task<bool> CreateAsync(int maxPlayers)
        {
            // Escucha en todas las interfaces para que tambien entre otro PC de la red local
            _transport.SetConnectionData(DefaultAddress, _port, "0.0.0.0");

            if (!_networkManager.StartHost()) return Task.FromResult(false);

            _maxPlayers = maxPlayers;
            _lobbyId = $"{DefaultAddress}:{_port}";
            Publish();
            return Task.FromResult(true);
        }

        public async Task<bool> JoinAsync(string lobbyId)
        {
            ParseAddress(lobbyId, out string address, out ushort port);
            _transport.SetConnectionData(address, port);

            if (!await NetcodeConnection.StartClientAsync(_networkManager)) return false;

            _lobbyId = $"{address}:{port}";
            Publish();
            return true;
        }

        public void Leave()
        {
            // OnNetworkStopped se encarga de limpiar y avisar
            if (_networkManager.IsListening) _networkManager.Shutdown();
        }

        public void InviteFriends()
        {
            UnityEngine.Debug.Log($"[LocalLobbyService] Comparte esta direccion: {CurrentLobby?.Id}");
        }

        public void Tick() { }

        public void Dispose()
        {
            _networkManager.OnClientConnectedCallback -= OnMembersChanged;
            _networkManager.OnClientDisconnectCallback -= OnMembersChanged;
            _networkManager.OnClientStopped -= OnNetworkStopped;
        }

        private void OnMembersChanged(ulong clientId)
        {
            if (CurrentLobby != null) Publish();
        }

        private void OnNetworkStopped(bool wasHost)
        {
            if (CurrentLobby == null) return;

            CurrentLobby = null;
            LobbyChanged?.Invoke(null);
        }

        private void Publish()
        {
            // Solo el host conoce a todos los conectados; el cliente solo se conoce a si mismo
            IEnumerable<ulong> ids = _networkManager.IsServer
                ? _networkManager.ConnectedClientsIds
                : new[] { _networkManager.LocalClientId };

            List<string> members = ids.Select(id => $"Jugador {id}").ToList();

            CurrentLobby = new LobbyInfo(_lobbyId, _networkManager.IsServer, _maxPlayers, members);
            LobbyChanged?.Invoke(CurrentLobby);
        }

        // Acepta "ip:puerto", solo "ip" o nada
        private void ParseAddress(string lobbyId, out string address, out ushort port)
        {
            address = DefaultAddress;
            port = _port;
            if (string.IsNullOrWhiteSpace(lobbyId)) return;

            string[] parts = lobbyId.Trim().Split(':');
            address = parts[0];
            if (parts.Length > 1 && ushort.TryParse(parts[1], out ushort parsed)) port = parsed;
        }
    }
}
```

**Por qué**

**¿Para qué un adaptador que no es Steam, si el objetivo es Steam?** Por tres
razones:

1. **Se prueba en un solo PC.** Con Multiplayer Play Mode abres dos ventanas en
   tu máquina. Con Steam no puedes, porque las dos compartirían tu cuenta.
2. **Separa los problemas.** Si el menú o el contrato fallan aquí, el fallo es
   tuyo y no de Steam. Cuando metas Steam, ya sabes que todo lo demás funciona.
3. **Demuestra el adaptador.** Si el menú funciona igual con dos
   implementaciones distintas, el contrato está bien diseñado.

Detalles:

- **`"0.0.0.0"` como dirección de escucha.** El host acepta conexiones de
  cualquier interfaz de red, así que otro PC de tu casa puede unirse escribiendo
  tu IP local.
- **`event JoinRequested { add { } remove { } }`.** La interfaz exige el
  evento, pero aquí nunca ocurre. Esta forma lo implementa sin guardar
  suscriptores, y el compilador no avisa de un evento que no se usa.
- **`OnNetworkStopped` limpia el estado.** El host puede irse en cualquier
  momento. Quien se entera es el `NetworkManager`, no el menú, así que es el
  adaptador quien publica `LobbyChanged(null)`.

---

## Paso 5: el bootstrap

`MultiplayerBootstrap.cs`. Escríbelo primero **sin las líneas de Steam**: quita
el `using Netcode.Transports.Facepunch`, el campo `facepunchTransport`, el
`case Provider.Steam` y deja el enum solo con `Local`. Las añadirás en el paso 9.

```csharp
using System;
using Netcode.Transports.Facepunch;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;
using UnityEngine;

namespace Multiplayer.Lobby
{
    // El unico sitio que sabe que adaptadores existen. Elige uno, le pone al
    // NetworkManager el transporte que ese adaptador necesita y lo mantiene vivo.
    // El resto del juego pide el servicio por Lobby y solo ve ILobbyService.
    [DefaultExecutionOrder(-100)]
    public class MultiplayerBootstrap : MonoBehaviour
    {
        public enum Provider { Local, Steam }

        [SerializeField] private Provider provider = Provider.Local;
        [SerializeField] private NetworkManager networkManager;

        [Header("Local")]
        [SerializeField] private UnityTransport unityTransport;
        [SerializeField] private ushort localPort = 7777;

        [Header("Steam")]
        [SerializeField] private FacepunchTransport facepunchTransport;
        [Tooltip("480 es Spacewar, el AppID de pruebas de Valve")]
        [SerializeField] private uint steamAppId = 480;

        public static ILobbyService Lobby { get; private set; }

        // Para que el menu pueda explicar por que no hay servicio (por ejemplo, Steam cerrado)
        public static string StartupError { get; private set; }

        private void Awake()
        {
            StartupError = null;
            provider = ReadProviderArgument() ?? provider;

            try
            {
                Lobby = CreateService();
            }
            catch (Exception e)
            {
                StartupError = provider == Provider.Steam
                    ? "No se pudo iniciar Steam. Abre Steam con tu sesion iniciada y vuelve a darle a Play."
                    : e.Message;
                Debug.LogException(e);
                return;
            }

            Debug.Log($"[MultiplayerBootstrap] Proveedor: {provider}");
        }

        private void Start()
        {
            string lobbyId = ReadConnectLobbyArgument();
            if (Lobby != null && lobbyId != null) _ = Lobby.JoinAsync(lobbyId);
        }

        private void Update()
        {
            Lobby?.Tick();
        }

        // OnDestroy llega despues de que el NetworkManager se apague en OnApplicationQuit,
        // asi que aqui ya se puede soltar el proveedor sin cortar la red a medias.
        private void OnDestroy()
        {
            Lobby?.Dispose();
            Lobby = null;
        }

        private ILobbyService CreateService()
        {
            switch (provider)
            {
                case Provider.Steam:
                    networkManager.NetworkConfig.NetworkTransport = facepunchTransport;
                    return new SteamLobbyService(networkManager, facepunchTransport, steamAppId);
                default:
                    networkManager.NetworkConfig.NetworkTransport = unityTransport;
                    return new LocalLobbyService(networkManager, unityTransport, localPort);
            }
        }

        // Un mismo build sirve para los dos proveedores: Juego.exe -provider local
        private static Provider? ReadProviderArgument()
        {
            string value = ReadArgument("-provider");
            if (Enum.TryParse(value, true, out Provider parsed)) return parsed;
            return null;
        }

        // Si Steam abrio el juego desde una invitacion, el lobby llega como argumento
        private static string ReadConnectLobbyArgument() => ReadArgument("+connect_lobby");

        private static string ReadArgument(string name)
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length - 1; i++)
            {
                if (args[i] == name) return args[i + 1];
            }

            return null;
        }
    }
}
```

**Por qué**

- **Es el único que conoce las clases concretas.** Todos los `new` de
  adaptadores están aquí. El resto pide `MultiplayerBootstrap.Lobby` y recibe
  un `ILobbyService`. Esto es una *composition root*: el punto donde se arma el
  sistema.
- **Cambia el transporte del NetworkManager.** Cada adaptador necesita el suyo,
  y los dos componentes viven en el mismo GameObject. Asignar
  `NetworkConfig.NetworkTransport` antes de arrancar la red es todo lo que hace
  falta.
- **`[DefaultExecutionOrder(-100)]`.** Su `Awake` corre antes que el `Start` de
  cualquier otro script, así que el menú siempre encuentra el servicio creado.
- **`OnDestroy` y no `OnApplicationQuit`.** Al cerrar, Unity llama primero a
  todos los `OnApplicationQuit`, y el `NetworkManager` apaga la red en el suyo.
  `OnDestroy` llega después, cuando ya se puede apagar Steam sin cortar la red
  a medias.
- **`-provider` y `+connect_lobby`.** El primero deja usar un mismo build con
  los dos proveedores. El segundo existe porque, si tu amigo acepta una
  invitación con el juego cerrado, Steam lo abre y le pasa el lobby como
  argumento.

---

## Paso 6: el menú

`LobbyMenu.cs`

```csharp
using System;
using System.Threading.Tasks;
using UnityEngine;

namespace Multiplayer.Lobby
{
    // Menu de prueba con IMGUI: cero configuracion de escena, y lo que importa aqui
    // es que no sabe que proveedor hay detras. No tiene ni un using de Steam ni de
    // Unity Services; un menu de verdad con uGUI deberia cumplir lo mismo.
    public class LobbyMenu : MonoBehaviour
    {
        [SerializeField] private int maxPlayers = 4;
        [SerializeField] private float scale = 1.5f;

        private ILobbyService _lobby;
        private string _joinId = "";
        private string _status = "";
        private bool _busy;

        private void Start()
        {
            _lobby = MultiplayerBootstrap.Lobby;
            if (_lobby == null) return;

            _lobby.LobbyChanged += OnLobbyChanged;
            _lobby.JoinRequested += OnJoinRequested;
        }

        private void OnDestroy()
        {
            if (_lobby == null) return;

            _lobby.LobbyChanged -= OnLobbyChanged;
            _lobby.JoinRequested -= OnJoinRequested;
        }

        private void OnLobbyChanged(LobbyInfo lobby)
        {
            if (lobby == null) _status = "Fuera de la sala";
        }

        // Una invitacion aceptada en Steam se trata igual que escribir el id a mano
        private void OnJoinRequested(string lobbyId)
        {
            _joinId = lobbyId;

            // Netcode tarda un frame en apagarse, asi que no se encadena salir + unirse
            if (_lobby.CurrentLobby != null)
            {
                _status = "Invitacion recibida: sal de esta sala y pulsa Unirse";
                return;
            }

            Run("Uniendose por invitacion...", () => _lobby.JoinAsync(lobbyId));
        }

        private async void Run(string pending, Func<Task<bool>> action)
        {
            if (_busy) return;

            _busy = true;
            _status = pending;
            try
            {
                _status = await action() ? "" : "No se pudo. Mira la consola.";
            }
            catch (Exception e)
            {
                _status = e.Message;
                Debug.LogException(e);
            }
            finally
            {
                _busy = false;
            }
        }

        private void OnGUI()
        {
            GUI.matrix = Matrix4x4.Scale(new Vector3(scale, scale, 1f));
            GUILayout.BeginArea(new Rect(10, 10, 300, Screen.height / scale - 20));
            GUILayout.BeginVertical(GUI.skin.box);

            if (_lobby == null)
                GUILayout.Label(MultiplayerBootstrap.StartupError ?? "No hay MultiplayerBootstrap en la escena");
            else if (_lobby.CurrentLobby == null)
                DrawOutside();
            else
                DrawInside(_lobby.CurrentLobby);

            if (!string.IsNullOrEmpty(_status)) GUILayout.Label(_status);

            GUILayout.EndVertical();
            GUILayout.EndArea();
        }

        private void DrawOutside()
        {
            GUI.enabled = !_busy;

            if (GUILayout.Button("Hospedar"))
                Run("Creando sala...", () => _lobby.CreateAsync(maxPlayers));

            GUILayout.Space(8);
            GUILayout.Label("Id de la sala:");
            _joinId = GUILayout.TextField(_joinId);
            if (GUILayout.Button("Unirse"))
                Run("Uniendose...", () => _lobby.JoinAsync(_joinId));

            GUI.enabled = true;
        }

        private void DrawInside(LobbyInfo lobby)
        {
            // MaxPlayers 0 = el proveedor no lo sabe (el cliente local no recibe el cupo)
            string capacity = lobby.MaxPlayers > 0 ? $"/{lobby.MaxPlayers}" : "";
            GUILayout.Label($"{(lobby.IsHost ? "Host" : "Cliente")} · {lobby.Members.Count}{capacity}");
            GUILayout.Label($"Id: {lobby.Id}");

            foreach (string member in lobby.Members)
                GUILayout.Label($"  • {member}");

            if (GUILayout.Button("Copiar id")) GUIUtility.systemCopyBuffer = lobby.Id;
            if (GUILayout.Button("Invitar amigos")) _lobby.InviteFriends();
            if (GUILayout.Button("Salir")) _lobby.Leave();
        }
    }
}
```

**Por qué**

- **IMGUI (`OnGUI`).** No necesita Canvas, prefabs ni enlazar botones en el
  Inspector: un script y listo. Para un menú de prueba es lo más rápido.
  El menú definitivo será con uGUI o UI Toolkit, y seguirá la misma regla: solo
  conocer `ILobbyService`.
- **`async void Run(...)`.** Los botones de IMGUI no pueden esperar, así que
  `Run` lanza la tarea y la vigila. `async void` solo es aceptable en un punto
  de entrada como este, y por eso lleva su propio `try/catch`: una excepción en
  un `async void` no la recoge nadie más.
- **`_busy`.** Evita que dos clics rápidos lancen dos `CreateAsync` a la vez.
- **La invitación no encadena "salir + unirse".** `NetworkManager.Shutdown()`
  no apaga en el momento: marca la red para apagarse al final del frame. Si
  justo después llamas a `StartClient`, NGO todavía está encendido y falla.

**Verificar:** el archivo no tiene ningún `using` de Steam ni de Unity
Services. Es la prueba de que el adaptador funciona.

---

## Paso 7: montar la escena y probar en local

1. Crea un GameObject vacío `Multiplayer` y añádele **MultiplayerBootstrap** y
   **LobbyMenu**.
2. En el bootstrap, arrastra el `NetworkManager` y su `UnityTransport`. Deja
   *Provider* en **Local**.
3. *Window → Multiplayer → Multiplayer Play Mode* y activa **Player 2**.
4. Play. En la ventana principal pulsa **Hospedar**. En la de Player 2 deja el
   campo vacío (usa `127.0.0.1:7777`) y pulsa **Unirse**.

**Esperado:** los dos menús pasan a mostrar "Host" y "Cliente". Hay dos cubos.
Con WASD cada ventana mueve el suyo y la otra lo ve moverse. Al pulsar **Salir**
en el host, el cliente vuelve al menú inicial.

> Si en tu escena hay otro sistema que arranca la red (por ejemplo los
> *Multiplayer Widgets*), desactívalo. Dos sistemas llamando a `StartHost`
> compiten y el segundo falla.

---

## Paso 8: el transporte de Steam

Usaremos el **FacepunchTransport** del repositorio comunitario de Unity, la
misma pieza que usa Lethal Company. Trae dentro la biblioteca
`Facepunch.Steamworks` y la `steam_api64.dll` de Valve.

### 8.1 Por qué lo embebemos en vez de instalarlo por URL

Se puede instalar con *Package Manager → + → Install package from git URL*:

```
https://github.com/Unity-Technologies/multiplayer-community-contributions.git?path=/Transports/com.community.netcode.transport.facepunch
```

Pero un paquete instalado así vive en `Library/PackageCache` y **no se puede
modificar**. Y necesitamos modificarlo (ver 8.3). Un paquete *embebido* es una
carpeta dentro de `Packages/` del proyecto: Unity lo trata como paquete y tú
puedes editarlo y versionarlo.

### 8.2 Descargarlo

Desde la carpeta del proyecto, en Git Bash:

```bash
git config --global core.longpaths true   # en Windows, si no, faltan archivos .meta
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/Unity-Technologies/multiplayer-community-contributions.git /c/tmp/mcc
git -C /c/tmp/mcc sparse-checkout set --no-cone Transports/com.community.netcode.transport.facepunch
cp -r /c/tmp/mcc/Transports/com.community.netcode.transport.facepunch Packages/
```

Esta guía se hizo con el commit `0fab6384` (8 de septiembre de 2026).

**Verificar:** al volver a Unity, *Package Manager → In Project* muestra
"Facepunch Transport for Netcode for GameObjects" con la etiqueta *Custom*.

### 8.3 El parche: Steam tiene un solo dueño

Abre `Packages/com.community.netcode.transport.facepunch/Runtime/FacepunchTransport.cs`
y busca `Shutdown()`. Borra la línea `SteamClient.Shutdown();`:

```diff
     connectionManager?.Close();
     socketManager?.Close();
-    SteamClient.Shutdown();
+    // El cliente de Steam lo apaga SteamLobbyService.
```

**Por qué**

El transporte, tal como viene, enciende Steam al arrancar la red y lo **apaga
al cerrarla**. Pero en nuestro diseño Steam vive más que la red: el lobby se
crea **antes** de `StartHost`, y las invitaciones tienen que seguir llegando
cuando estás en el menú, sin red. Si el transporte apagara Steam, al salir de
una partida se cerraría el lobby y dejarías de recibir invitaciones.

La regla: **un recurso compartido tiene un solo dueño**, el que vive más
tiempo. Aquí es `SteamLobbyService`. El transporte lo usa pero no lo apaga.
Anótalo en el `CHANGELOG.md` del paquete para que quien lo actualice sepa que
hay un parche.

### 8.4 Añadirlo al NetworkManager

Añade el componente **FacepunchTransport** al GameObject `NetworkManager`, junto
al `UnityTransport`. Deja *Steam App Id* en 480. No hace falta tocar el campo
*Network Transport* del NetworkManager: lo asigna el bootstrap.

---

## Paso 9: el adaptador de Steam

`SteamLobbyService.cs`

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Netcode.Transports.Facepunch;
using Steamworks;
using Steamworks.Data;
using Unity.Netcode;
using UnityEngine;
// El namespace Multiplayer.Lobby tapa el tipo Lobby de Steam: se nombra por alias
using SteamLobby = Steamworks.Data.Lobby;

namespace Multiplayer.Lobby
{
    // Adaptador de Steam, la receta de Lethal Company: el lobby de Steam es la sala y
    // FacepunchTransport lleva el trafico de Netcode por los relays de Valve.
    // El lobby no transporta el juego; solo le dice al invitado a que SteamID conectarse.
    public class SteamLobbyService : ILobbyService
    {
        // Con el AppID 480 compartimos espacio con todo el que prueba con Spacewar,
        // asi que el lobby lleva una marca propia para reconocerlo.
        private const string GameKey = "game";
        private const string GameValue = "JuniorProgrammerPath";

        private readonly NetworkManager _networkManager;
        private readonly FacepunchTransport _transport;

        private SteamLobby? _lobby;

        public LobbyInfo CurrentLobby { get; private set; }

        public event Action<LobbyInfo> LobbyChanged;
        public event Action<string> JoinRequested;

        public SteamLobbyService(NetworkManager networkManager, FacepunchTransport transport, uint appId)
        {
            _networkManager = networkManager;
            _transport = transport;

            // Este servicio es el unico dueno del cliente de Steam. El transporte se
            // parcheo para que no lo apague (ver CHANGELOG del paquete embebido).
            // Si Steam no esta abierto, Init lanza y el bootstrap lo informa.
            if (!SteamClient.IsValid) SteamClient.Init(appId, false);

            // Calcula de antemano la ruta a los relays: la primera conexion tarda menos
            SteamNetworkingUtils.InitRelayNetworkAccess();

            SteamFriends.OnGameLobbyJoinRequested += OnGameLobbyJoinRequested;
            SteamMatchmaking.OnLobbyMemberJoined += OnMembersChanged;
            SteamMatchmaking.OnLobbyMemberLeave += OnMembersChanged;
            SteamMatchmaking.OnLobbyMemberDisconnected += OnMembersChanged;
            _networkManager.OnClientStopped += OnNetworkStopped;

            Debug.Log($"[SteamLobbyService] Steam listo como {SteamClient.Name} ({SteamClient.SteamId})");
        }

        public async Task<bool> CreateAsync(int maxPlayers)
        {
            SteamLobby? created = await SteamMatchmaking.CreateLobbyAsync(maxPlayers);
            if (created == null)
            {
                Debug.LogWarning("[SteamLobbyService] Steam no pudo crear el lobby");
                return false;
            }

            SteamLobby lobby = created.Value;
            lobby.SetFriendsOnly();
            lobby.SetJoinable(true);
            lobby.SetData(GameKey, GameValue);

            // El host no necesita targetSteamId: escucha y los demas llegan a el
            if (!_networkManager.StartHost())
            {
                lobby.Leave();
                return false;
            }

            _lobby = lobby;
            Publish();
            return true;
        }

        public async Task<bool> JoinAsync(string lobbyId)
        {
            if (!ulong.TryParse(lobbyId?.Trim(), out ulong id))
            {
                Debug.LogWarning($"[SteamLobbyService] '{lobbyId}' no es un id de lobby de Steam");
                return false;
            }

            SteamLobby? joined = await SteamMatchmaking.JoinLobbyAsync(id);
            if (joined == null)
            {
                Debug.LogWarning("[SteamLobbyService] No se pudo entrar al lobby (lleno, cerrado o inexistente)");
                return false;
            }

            SteamLobby lobby = joined.Value;
            if (lobby.GetData(GameKey) != GameValue)
            {
                Debug.LogWarning("[SteamLobbyService] Ese lobby es de otro juego de Spacewar");
                lobby.Leave();
                return false;
            }

            // Aqui se cruzan las dos capas: la sala dice quien es el host y el
            // transporte se conecta a esa persona, no a una IP.
            _lobby = lobby;
            _transport.targetSteamId = lobby.Owner.Id;

            if (!await NetcodeConnection.StartClientAsync(_networkManager))
            {
                LeaveLobby();
                return false;
            }

            Publish();
            return true;
        }

        public void Leave()
        {
            // Primero el lobby, para que los demas dejen de verte dentro aunque la red tarde en cerrar
            LeaveLobby();
            if (_networkManager.IsListening) _networkManager.Shutdown();
        }

        public void InviteFriends()
        {
            // El overlay no existe dentro del editor de Unity: esto solo se ve en un build
            if (_lobby.HasValue) SteamFriends.OpenGameInviteOverlay(_lobby.Value.Id);
        }

        public void Tick()
        {
            // Sin esto no llega ningun aviso de Steam: ni el lobby creado ni las invitaciones
            if (SteamClient.IsValid) SteamClient.RunCallbacks();
        }

        public void Dispose()
        {
            SteamFriends.OnGameLobbyJoinRequested -= OnGameLobbyJoinRequested;
            SteamMatchmaking.OnLobbyMemberJoined -= OnMembersChanged;
            SteamMatchmaking.OnLobbyMemberLeave -= OnMembersChanged;
            SteamMatchmaking.OnLobbyMemberDisconnected -= OnMembersChanged;
            _networkManager.OnClientStopped -= OnNetworkStopped;

            LeaveLobby();
            if (SteamClient.IsValid) SteamClient.Shutdown();
        }

        // Llega al aceptar una invitacion o al pulsar "Unirse a la partida" sobre un amigo
        private void OnGameLobbyJoinRequested(SteamLobby lobby, SteamId friend)
        {
            JoinRequested?.Invoke(lobby.Id.ToString());
        }

        private void OnMembersChanged(SteamLobby lobby, Friend member)
        {
            if (_lobby.HasValue && lobby.Id == _lobby.Value.Id) Publish();
        }

        // El host cerro, se cayo la conexion o se llamo a Leave
        private void OnNetworkStopped(bool wasHost)
        {
            LeaveLobby();
        }

        private void LeaveLobby()
        {
            if (_lobby.HasValue)
            {
                _lobby.Value.Leave();
                _lobby = null;
            }

            if (CurrentLobby == null) return;
            CurrentLobby = null;
            LobbyChanged?.Invoke(null);
        }

        private void Publish()
        {
            SteamLobby lobby = _lobby.Value;
            var members = lobby.Members.Select(friend => friend.Name).ToList();

            CurrentLobby = new LobbyInfo(lobby.Id.ToString(), lobby.IsOwnedBy(SteamClient.SteamId), lobby.MaxMembers, members);
            LobbyChanged?.Invoke(CurrentLobby);
        }
    }
}
```

Ahora devuelve al bootstrap lo que quitaste en el paso 5 (`Provider.Steam`, el
campo `facepunchTransport` y su `case`), y en la escena arrastra el
FacepunchTransport a ese campo.

**Por qué**

**El cruce de las dos capas está en una línea:**

```csharp
_transport.targetSteamId = lobby.Owner.Id;
```

El lobby (la capa "encontrarse") dice quién es el host. El transporte (la capa
"conectarse") se conecta a esa **persona**, no a una IP. Steam enruta el
tráfico por sus relays y nadie ve la IP de nadie.

Detalles:

- **`using SteamLobby = Steamworks.Data.Lobby;`.** Nuestro namespace se llama
  `Multiplayer.Lobby`, y dentro de él la palabra `Lobby` se refiere al
  namespace, no al tipo de Steam. El compilador da `CS0118: 'Lobby' is a
  namespace but is used like a type`. El alias lo resuelve sin renombrar nada.
- **`SetFriendsOnly()` y `SetJoinable(true)`.** Solo tus amigos ven el lobby, y
  Steam les ofrece "Unirse a la partida" en tu perfil.
- **`SetData("game", "JuniorProgrammerPath")`.** Con el AppID 480 compartes
  espacio con todo el que prueba con Spacewar. La marca permite rechazar
  lobbies ajenos al unirse.
- **`SteamClient.Init(appId, false)`.** El `false` significa "yo bombeo los
  callbacks", y lo hacemos en `Tick()`. Sin ese bombeo, `CreateLobbyAsync` no
  termina nunca: la respuesta de Valve llega, pero nadie la procesa.
- **`InitRelayNetworkAccess()`** calcula de antemano la ruta a los relays de
  Valve. La primera conexión tarda menos.
- **`Leave()` sale del lobby antes de apagar la red.** Así los demás dejan de
  verte dentro aunque la red tarde un frame en cerrar.
- **`Dispose()` es el único sitio que llama a `SteamClient.Shutdown()`.** Es el
  dueño del paso 8.3.

**Verificar:** con Steam abierto, pon *Provider* en **Steam**, dale a Play y
pulsa **Hospedar**. En la consola aparece
`[SteamLobbyService] Steam listo como <tu nombre>`. El menú muestra "Host", tu
nombre de Steam como miembro y un id largo de 18 cifras. Ese id es el lobby.

---

## Paso 10: probar con Steam

El overlay de Steam (Shift+Tab) **no existe dentro del editor**, así que para
invitar hace falta un build. Para que te sigan los dos, haz el build y que
**ambos** lo usen:

1. *File → Build Profiles → Windows*, añade la escena y pulsa **Build**.
2. Comprime la carpeta (puedes excluir `*_BurstDebugInformation_DoNotShip`) y
   pásasela a tu amigo.
3. Los dos abrís Steam con sesión iniciada y ejecutáis el `.exe`.
4. Tú pulsas **Hospedar**.
5. Para que tu amigo entre, tres caminos, de más fiable a más cómodo:
   - **Id a mano:** pulsas **Copiar id**, se lo mandas por Discord, lo pega en
     el campo y pulsa **Unirse**.
   - **Lista de amigos:** con su juego abierto, en Steam hace clic derecho
     sobre ti → **Unirse a la partida**.
   - **Invitación:** pulsas **Invitar amigos**, se abre el overlay y lo eliges.
     Él acepta en Steam.

**Esperado:** los dos menús muestran los dos nombres de Steam. Cada uno mueve
su cubo y ve moverse el del otro. Al pulsar **Salir** en el host, tu amigo
vuelve al menú inicial.

> Si el overlay no se abre al ejecutar el `.exe` directamente, usa el id a
> mano. El overlay a veces solo se inyecta en juegos lanzados desde la
> biblioteca de Steam.

---

## Tropiezos reales

Todos ocurrieron al construir esto en JuniorProgrammerPath.

| Síntoma | Causa | Solución |
|---|---|---|
| `CS0118: 'Lobby' is a namespace but is used like a type` | El namespace `Multiplayer.Lobby` tapa el tipo `Steamworks.Data.Lobby` | Alias `using SteamLobby = Steamworks.Data.Lobby;` |
| Al clonar el transporte faltan `.meta` en `redistributable_bin` (`Filename too long`) | Windows limita las rutas a 260 caracteres | `git config --global core.longpaths true`, o clonar en una ruta corta como `C:\tmp` |
| Al salir de una partida, el lobby se cierra y no llegan invitaciones | El transporte original apaga Steam en `Shutdown()` | Parche del paso 8.3: Steam tiene un solo dueño |
| `CreateAsync` nunca termina | Nadie llama a `SteamClient.RunCallbacks()` | `Tick()` desde el `Update` del bootstrap |
| Unirse justo después de salir falla | `NetworkManager.Shutdown()` es diferido: apaga al final del frame | No encadenar salir + unirse en el mismo frame |
| `ArgumentException: Invalid Connection` en `ConnectRelay` | Intentaste unirte a tu propio lobby con la misma cuenta | Hace falta otra cuenta de Steam en otro PC |
| "Invitar amigos" no hace nada | El overlay no existe en el editor | Probar invitaciones en un build |
| El build se queda parado sin avanzar | Unity espera respuesta en un diálogo "Scene(s) Have Been Modified" oculto detrás de otra ventana | Guardar la escena antes de compilar |
| Dos sistemas arrancan la red y uno falla | Los *Multiplayer Widgets* también llaman a `StartHost` | Desactivarlos: de la red solo se encarga el adaptador |

---

## Ejercicios para afianzar

Ordenados de menos a más difícil. Cada uno refuerza una idea de la guía.

1. **Cupo real en local.** Activa *Connection Approval* en el NetworkManager y
   rechaza conexiones cuando ya hay `maxPlayers`. ¿En qué clase va ese código,
   y por qué no en el menú?
2. **Rechazar si la partida empezó.** Como hace Lethal Company: al empezar,
   `SetJoinable(false)` en el lobby de Steam. ¿Cómo lo pides desde el juego sin
   que el juego sepa que existe Steam? (Pista: el contrato necesita un método
   nuevo, y el adaptador local también tiene que implementarlo.)
3. **Menú con uGUI.** Rehaz `LobbyMenu` con Canvas y botones. Comprueba que
   sigue sin ningún `using` de Steam.
4. **Tercer adaptador: `UnitySessionsLobbyService`.** Con
   `MultiplayerService.Instance.CreateSessionAsync(...).WithRelayNetwork()`.
   Es el ejercicio definitivo: si consigues añadir un proveedor **sin tocar ni
   el menú ni el gameplay**, has entendido el patrón.

---

## Vocabulario

- **Adaptador:** clase que traduce una interfaz que tú defines a la API de un
  proveedor concreto.
- **Composition root:** el único lugar donde se crean las clases concretas y
  se conectan entre sí. Aquí, `MultiplayerBootstrap`.
- **Host:** jugador que hace de servidor desde su PC y además juega.
- **Lobby de Steam:** objeto en los servidores de Valve con miembros y datos
  clave-valor. No transporta el juego.
- **Relay:** servidor intermedio que reenvía el tráfico. Evita abrir puertos y
  oculta las IPs.
- **SteamID:** número de 17 cifras que identifica una cuenta de Steam. El
  transporte se conecta a un SteamID en lugar de a una IP.
- **Transporte:** la pieza de NGO que mueve bytes entre máquinas
  (`NetworkTransport`). NGO no sabe cuál hay debajo.
- **Paquete embebido:** paquete de Unity que vive en `Packages/` del proyecto y
  se puede modificar.
- **AppID 480:** Spacewar, el juego de pruebas de Valve. Cualquier cuenta de
  Steam puede usarlo para probar lobbies y redes.
