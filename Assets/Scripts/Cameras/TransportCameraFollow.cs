using System;
using Controllers;
using Unity.VisualScripting;
using UnityEngine;

namespace Cameras
{
    public abstract class TransportCameraFollow : MonoBehaviour
    {
        [SerializeField] protected TransportController targetController;
        protected Transform _targetTransform;
        
        [Header("Camera Settings")]
        [SerializeField] protected Vector3 localCameraOffset = new Vector3(0, 6, -9);
        [SerializeField] private float cameraPitchAngle = 19f;
        [SerializeField, Range(0f, 1f)] private float followLagRatio = 0.2f;
        [SerializeField] private float rotationFollowStrength = 3f;
        [SerializeField] private float defaultFieldOfView = 60f;
        [SerializeField] private float highSpeedFieldOfView = 70f;

        private float _targetTransportSpeed;
        private float _currentPositionFollowStrength;
        private Camera _camera;
        
        // Turns the player's speed into a follow strength, reduced by the follow lag ratio
        private Func<float, Func<float, float>> _followStrengthFromSpeed = (playerSpeed) =>
            (lagRatio) => playerSpeed - (playerSpeed * lagRatio);

        // Cada transporte define su propio marco de referencia
        protected abstract Quaternion CalculateCameraOrientation();

        protected virtual void Start()
        {
            if (!targetController) return;
            
            _targetTransform = targetController.transform;
            _camera = GetComponent<Camera>();
            
        }

        protected virtual void LateUpdate()
        {
            if (!targetController) return;
            
            _targetTransportSpeed = targetController.Speed;
            _currentPositionFollowStrength = _followStrengthFromSpeed(_targetTransportSpeed)(followLagRatio);
            
            Quaternion cameraOrientation = CalculateCameraOrientation();
            
            MoveCamera(cameraOrientation);
            TurnCamera(cameraOrientation);
            UpdateCameraFieldOfView();
        }
        
        private void MoveCamera(Quaternion cameraOrientation)
        {
            // localCameraOffset es local, asi que hay que rotarlo para que la camara
            // quede detras del avion y no detras en coordenadas del mundo.
            transform.position = Vector3.Lerp(
                transform.position,
                _targetTransform.position + cameraOrientation * localCameraOffset,
                _currentPositionFollowStrength * Time.deltaTime
            );
        }
        private void TurnCamera(Quaternion cameraOrientation)
        {
            // El pitch se aplica en el espacio local de la orientacion, asi que
            // acompaña el banqueo en vez de inclinarse siempre respecto al mundo.  
            Quaternion targetRotation = cameraOrientation * Quaternion.Euler(cameraPitchAngle, 0f, 0f);

            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                targetRotation,
                rotationFollowStrength * Time.deltaTime
            );
        }

        private void UpdateCameraFieldOfView()
        {
            if (_targetTransportSpeed > targetController.MaxSpeed)
            {
                _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, highSpeedFieldOfView, 2f * Time.deltaTime);
            }
            else _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, defaultFieldOfView, 2f * Time.deltaTime);
        }

    }
}