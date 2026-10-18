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
