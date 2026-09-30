using Cameras;
using Controllers;
using Unity.Netcode;
using UnityEngine;

namespace Multiplayer
{
    // Decide que copia del vehiculo manda. Solo el dueno lee input y mueve el
    // transform; en las demas copias la posicion llega por el NetworkTransform.
    [RequireComponent(typeof(NetworkObject))]
    public class VehicleOwnership : NetworkBehaviour
    {
        [SerializeField] private TransportController controller;

        public override void OnNetworkSpawn()
        {
            // Va aqui y no en Start porque IsOwner no tiene valor fiable hasta que
            // el objeto se ha spawneado en la red y se le ha asignado dueno.
            controller.enabled = IsOwner;

            if (!IsOwner) return;

            // La camara vive en la escena y el vehiculo nace en runtime, asi que no
            // se pueden enlazar desde el Inspector: se busca la de esta maquina.
            TransportCameraFollow cameraFollow = FindFirstObjectByType<TransportCameraFollow>();
            if (cameraFollow) cameraFollow.SetTarget(controller);
        }
    }
}
