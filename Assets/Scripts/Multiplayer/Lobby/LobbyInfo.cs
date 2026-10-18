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
