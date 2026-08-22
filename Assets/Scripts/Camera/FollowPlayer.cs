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
    [SerializeField] private float rotationStrength = 3f;
    [SerializeField] private float followStrength = 5f;
    [SerializeField] private float cameraFOV = 60f;

    private float _playerSpeed;
    private float _percentageOfPlayerSpeed;

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

        _playerSpeed = _playerController.speed;
        followStrength = _followStrengthCalculator(_playerSpeed)(_percentageOfPlayerSpeed);

        transform.position = Vector3.Lerp(
            transform.position,
            _playerTransform.TransformPoint(cameraOffset),
            followStrength * Time.deltaTime
        );
        Quaternion targetRotation = Quaternion.Euler(cameraPitch, _playerTransform.eulerAngles.y, 0f);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationStrength * Time.deltaTime);

        if (_playerSpeed > _playerController.GetMaximumPlayerNormalSpeed())
        {
            _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, cameraFOV + 10f, 2f * Time.deltaTime);
        }
        else _camera.fieldOfView = Mathf.Lerp(_camera.fieldOfView, cameraFOV, 2f * Time.deltaTime);
    }

    void FixedUpdate()
    {
    }
}