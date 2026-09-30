using UnityEngine;

namespace Controllers
{
    // La fisica de un carro con ruedas. No sabe de donde viene el input.
    // Lo visual de las ruedas vive aparte, en WheelsVisual.
    public abstract class CarWithWheelsController : TransportController
    {
        protected override void Turn()
        {
            // Un carro no gira detenido y en reversa el volante se invierte:
            // las dos cosas salen de escalar el giro por la velocidad normalizada.
            float speedRatio = Mathf.Clamp(_speed / maxSpeed, -1f, 1f);

            transform.Rotate(Vector3.up, turnAngle * _smoothedHorizontalInput * speedRatio * Time.deltaTime);
        }
    }
}
