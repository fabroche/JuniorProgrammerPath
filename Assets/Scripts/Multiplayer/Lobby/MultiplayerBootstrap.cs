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
