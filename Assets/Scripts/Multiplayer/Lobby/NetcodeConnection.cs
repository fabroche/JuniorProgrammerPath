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
