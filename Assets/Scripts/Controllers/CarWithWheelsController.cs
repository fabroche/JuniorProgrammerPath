using Systems;
using UnityEngine;

namespace Controllers
{
    public class CarWithWheelsController : TransportController, IWheels
    {
        // Wheels Settings
        [SerializeField] private WheelSystem _wheels;

        protected override void Turn()
        {
            // Un carro no gira detenido y en reversa el volante se invierte:
            // las dos cosas salen de escalar el giro por la velocidad normalizada.
            float speedRatio = Mathf.Clamp(_speed / maxSpeed, -1f, 1f);

            transform.Rotate(Vector3.up, turnAngle * _smoothedHorizontalInput * speedRatio * Time.deltaTime);
        }

        public void RotateWheels()
        {
            _wheels.Rotate(_speed, maxSpeed, _smoothedHorizontalInput);
        }

        protected override void Update()
        {
            base.Update();
            RotateWheels();
        }
    }
}
