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
            GUILayout.BeginArea(new Rect(10, 10, 300, 400), GUI.skin.box);

            if (_lobby == null)
                GUILayout.Label(MultiplayerBootstrap.StartupError ?? "No hay MultiplayerBootstrap en la escena");
            else if (_lobby.CurrentLobby == null)
                DrawOutside();
            else
                DrawInside(_lobby.CurrentLobby);

            if (!string.IsNullOrEmpty(_status)) GUILayout.Label(_status);

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
            GUILayout.Label($"{(lobby.IsHost ? "Host" : "Cliente")} · {lobby.Members.Count}/{lobby.MaxPlayers}");
            GUILayout.Label($"Id: {lobby.Id}");

            foreach (string member in lobby.Members)
                GUILayout.Label($"  • {member}");

            if (GUILayout.Button("Copiar id")) GUIUtility.systemCopyBuffer = lobby.Id;
            if (GUILayout.Button("Invitar amigos")) _lobby.InviteFriends();
            if (GUILayout.Button("Salir")) _lobby.Leave();
        }
    }
}
