using UnityEngine;

namespace Controllers
{
    public class PooledCarWithWheelsController : CarWithWheelsController
    {
        // Este carro no se maneja: siempre acelera de frente y sin girar.
        protected override void ReadInput()
        {
            _verticalInput = 1f;
            _horizontalInput = 0f;

            _smoothedVerticalInput =
                Mathf.Lerp(_smoothedVerticalInput, _verticalInput, rotationSmoothness * Time.deltaTime);
            _smoothedHorizontalInput =
                Mathf.Lerp(_smoothedHorizontalInput, _horizontalInput, rotationSmoothness * Time.deltaTime);
        }
    }
}
