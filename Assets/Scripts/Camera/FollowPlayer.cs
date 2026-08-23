using System;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class FollowPlayer : MonoBehaviour
{
    public GameObject player;
    private PlayerController _playerController;
    private Transform _playerTransform;

    [Header("Camera Settings")] [SerializeField]
    private Vector3 cameraOffset = new Vector3(0, 6, -9);

    [SerializeField] private float cameraPitch = 19f;
    [SerializeField, Range(0f, 1f)] private float cameraRollInfuence = 0.35f;
    [SerializeField] private float rotationStrength = 3f;
    [SerializeField] private float followStrength = 5f;
    [SerializeField] private float cameraFOV = 60f;
    [SerializeField] private float cameraHighSpeedFOV = 70f;

    private float _playerSpeed;
    private float _percentageOfPlayerSpeed;
    private Quaternion _targetRotation;
    
    private Camera _camera;

    [Tooltip(
        "The function that calculates the follow strength based on the player's speed and percentage of player speed")]
    private Func<float, Func<float, float>> _followStrengthCalculator = (playerSpeed) =>
        (percentageOfPlayerSpeed) => playerSpeed - (playerSpeed * percentageOfPlayerSpeed);


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        if (player == null) return;
        _playerController = player.GetComponent<PlayerController>();
        _playerTransform = player.GetComponent<Transform>();
        _percentageOfPlayerSpeed = 0.2f;
        _camera = GetComponent<Camera>();
    }

    // Update is called once per frame
    void Update()
    {
    }

    void LateUpdate()
    {
        // transform.position = player.transform.position + cameraOffset;
        if (player == null) return;

        _playerSpeed = _playerController.Speed;
        followStrength = _followStrengthCalculator(_playerSpeed)(_percentageOfPlayerSpeed);

        Vector3 blendedUp = Vector3.Lerp(Vector3.up, _playerTransform.up, cameraRollInfuence);
        Quaternion frame = Quaternion.LookRotation(_playerTransform.forward, blendedUp);
        
        transform.position = Vector3.Lerp(
            transform.position,
            _playerTransform.position + frame * cameraOffset,
            followStrength * Time.deltaTime
        );
        
        TurnCamera(frame);

        UpdateCameraFieldOfView();
        
    }

    private void UpdateCameraFieldOfView()
    {
        if (_playerSpeed > _playerController.GetMaximumPlayerNormalSpeed())
        {
            _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, cameraHighSpeedFOV, 2f * Time.deltaTime);
        }
        else _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, cameraFOV, 2f * Time.deltaTime);
    }

    void TurnCamera(Quaternion rotationFrame)
    {
        if (player.CompareTag("Plane")){
            
            _targetRotation = rotationFrame * Quaternion.Euler(cameraPitch, 0f, 0f);
        }
        else
        {
            _targetRotation = Quaternion.Euler(cameraPitch, _playerTransform.eulerAngles.y, 0f);
        }

        transform.rotation = Quaternion.Slerp(transform.rotation, _targetRotation, rotationStrength * Time.deltaTime);
    }
}