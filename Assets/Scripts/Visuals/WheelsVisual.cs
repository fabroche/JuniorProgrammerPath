using Controllers;
using Systems;
using UnityEngine;

namespace Visuals
{
    // Hace rodar las ruedas segun lo que el vehiculo se mueve de verdad, no segun
    // el input. Asi vale igual para el vehiculo propio, para la copia remota que
    // mueve el NetworkTransform y para el trafico de IA, sin saber nada de red.
    public class WheelsVisual : MonoBehaviour
    {
        [SerializeField] private WheelSystem wheels;

        [Tooltip("Solo se le lee MaxSpeed, para normalizar las vueltas de las ruedas.")]
        [SerializeField] private TransportController controller;

        private Vector3 _previousPosition;

        private void Start()
        {
            _previousPosition = transform.position;
        }

        private void Update()
        {
            float deltaTime = Time.deltaTime;
            if (deltaTime <= 0f) return;

            // Se proyecta el desplazamiento sobre el morro: conserva el signo, asi
            // que en reversa las ruedas giran hacia atras.
            Vector3 displacement = transform.position - _previousPosition;
            float speed = Vector3.Dot(displacement, transform.forward) / deltaTime;

            // El volante va en cero de momento: desde la camara de 3ra persona las
            // delanteras quedan tapadas, y deducirlo del giro no da un valor fiable.
            wheels.Rotate(speed, controller.MaxSpeed, 0f);

            _previousPosition = transform.position;
        }
    }
}
