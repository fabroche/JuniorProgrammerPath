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
