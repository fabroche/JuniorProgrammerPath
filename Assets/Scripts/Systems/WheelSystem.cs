using System;
using UnityEngine;

namespace Systems
{
    [Serializable]
    public class WheelSystem
    {
        [Header("Wheels Settings")]
        [Tooltip("Ruedan y doblan. Su rotacion local debe estar en (0,0,0): el sistema la sobreescribe entera cada frame.")]
        [SerializeField] private Transform[] _frontWheelsTransforms;

        [Tooltip("Solo ruedan. Su rotacion local debe estar en (0,0,0): el sistema la sobreescribe entera cada frame.")]
        [SerializeField] private Transform[] _rearWheelsTransforms;

        [Header("Roll Settings")]
        [SerializeField] private float _maxWheelRpm = 600f;
        [SerializeField] private float _wheelRpmRate = 1200f;

        [Header("Steering Settings")]
        [SerializeField] private float _maxSteeringAngle = 30f;
        [SerializeField] private float _steeringRate = 120f;

        private float _wheelsRpm = 0f;
        private float _rollAngle = 0f;
        private float _steeringAngle = 0f;

        public void Rotate(float transportSpeed, float transportMaxSpeed, float steeringInput)
        {
            UpdateRollAngle(transportSpeed, transportMaxSpeed);
            UpdateSteeringAngle(steeringInput);

            ApplyRotations();
        }

        private void UpdateRollAngle(float transportSpeed, float transportMaxSpeed)
        {
            // El ratio conserva el signo, asi que en reversa las ruedas giran hacia atras.
            float speedRatio = transportSpeed / transportMaxSpeed;
            float targetRpm = _maxWheelRpm * speedRatio;

            _wheelsRpm = Mathf.MoveTowards(_wheelsRpm, targetRpm, _wheelRpmRate * Time.deltaTime);

            _rollAngle = Mathf.Repeat(_rollAngle + _wheelsRpm * Time.deltaTime, 360f);
        }

        private void UpdateSteeringAngle(float steeringInput)
        {
            float targetSteeringAngle = steeringInput * _maxSteeringAngle;

            _steeringAngle = Mathf.MoveTowards(_steeringAngle, targetSteeringAngle, _steeringRate * Time.deltaTime);
        }

        private void ApplyRotations()
        {
            // Se reconstruye la rotacion en vez de acumularla con Rotate(): asi el rodar
            // y el doblar quedan independientes. Euler(x,y,z) compone como Ry * Rx, o sea
            // primero el volante en el espacio del carro y despues el rodar en el de la rueda.
            foreach (Transform wheel in _frontWheelsTransforms)
            {
                wheel.localRotation = Quaternion.Euler(_rollAngle, _steeringAngle, 0f);
            }

            foreach (Transform wheel in _rearWheelsTransforms)
            {
                wheel.localRotation = Quaternion.Euler(_rollAngle, 0f, 0f);
            }
        }
    }
}
