using UnityEngine;

namespace Cameras
{
    public class PlaneCameraFollow : TransportCameraFollow
    {
        [Header("Plane Camera Settings")] [SerializeField, Range(0f, 1f)]
        private float
            bankInfluence = 0.35f;

        protected override Quaternion
            CalculateCameraOrientation()
        {
            // El "arriba" de la camara mezcla el del mundo con el del avion:
            // 0 = horizonte siempre recto, 1 = la camara banquea igual que el avion.
            Vector3 cameraUpDirection = Vector3.Lerp(
                Vector3.up,
                _targetTransform.up,
                bankInfluence
            );

            return Quaternion.LookRotation(
                _targetTransform.forward,
                cameraUpDirection
            );
        }
    }
}