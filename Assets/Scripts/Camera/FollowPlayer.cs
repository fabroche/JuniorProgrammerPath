using System;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Controllers;

public class FollowPlayer : MonoBehaviour
{
    [SerializeField] private TransportController playerController;
    private Transform _playerTransform;

    [Header("Camera Settings")] [SerializeField]
    private Vector3 localCameraOffset = new Vector3(0, 6, -9);

    [SerializeField] private float cameraPitchAngle = 19f;
    [SerializeField, Range(0f, 1f)] private float bankInfluence = 0.35f;
    [SerializeField] private float rotationFollowStrength = 3f;
    [SerializeField] private float defaultFieldOfView = 60f;
    [SerializeField] private float highSpeedFieldOfView = 70f;

    private float _playerSpeed;
    private float _followLagRatio;
    private float _currentPositionFollowStrength;
    
    private UnityEngine.Camera _camera;

    // Turns the player's speed into a follow strength, reduced by the follow lag ratio
    private Func<float, Func<float, float>> _followStrengthFromSpeed = (playerSpeed) =>
        (followLagRatio) => playerSpeed - (playerSpeed * followLagRatio);


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        if (playerController == null) return;
        _playerTransform = playerController.transform;
        _followLagRatio = 0.2f;
        _camera = GetComponent<UnityEngine.Camera>();
    }

    void LateUpdate()
    {
        // transform.position = playerController.transform.position + localCameraOffset;
        if (playerController == null) return;

        _playerSpeed = playerController.Speed;
        _currentPositionFollowStrength = _followStrengthFromSpeed(_playerSpeed)(_followLagRatio);

        Quaternion cameraOrientation = CalculateCameraOrientation();

        MoveCamera(cameraOrientation);

        TurnCamera(cameraOrientation);

        UpdateCameraFieldOfView();
        
    }

    private Quaternion CalculateCameraOrientation()
    {
        // El "arriba" de la camara mezcla el del mundo con el del avion:
        // 0 = horizonte siempre recto, 1 = la camara banquea igual que el avion.
        Vector3 cameraUpDirection = Vector3.Lerp(Vector3.up, _playerTransform.up, bankInfluence);

        return Quaternion.LookRotation(_playerTransform.forward, cameraUpDirection);
    }

    private void MoveCamera(Quaternion cameraOrientation)
    {
        // localCameraOffset es local, asi que hay que rotarlo para que la camara
        // quede detras del avion y no detras en coordenadas del mundo.
        transform.position = Vector3.Lerp(
            transform.position,
            _playerTransform.position + cameraOrientation * localCameraOffset,
            _currentPositionFollowStrength * Time.deltaTime
        );
    }

    private void UpdateCameraFieldOfView()
    {
        if (_playerSpeed > playerController.MaxSpeed)
        {
            _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, highSpeedFieldOfView, 2f * Time.deltaTime);
        }
        else _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, defaultFieldOfView, 2f * Time.deltaTime);
    }

    void TurnCamera(Quaternion cameraOrientation)
    {
        Quaternion targetRotation;

        if (playerController.CompareTag("Plane"))
        {
            targetRotation = cameraOrientation * Quaternion.Euler(cameraPitchAngle, 0f, 0f);
        }
        else
        {
            targetRotation = Quaternion.Euler(cameraPitchAngle, _playerTransform.eulerAngles.y, 0f);
        }

        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationFollowStrength * Time.deltaTime);
    }
}
