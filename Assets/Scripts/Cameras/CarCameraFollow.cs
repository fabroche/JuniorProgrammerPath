using UnityEngine;

namespace Cameras
{
    public class CarCameraFollow : TransportCameraFollow
    {
        protected override Quaternion CalculateCameraOrientation()
        {
            // Yaw puro: la camara no se inclina aunque el carro suba una rampa.
            return Quaternion.Euler(0f, _targetTransform.eulerAngles.y, 0f);
        }
    }
}