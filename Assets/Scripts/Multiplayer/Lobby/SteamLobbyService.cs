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
