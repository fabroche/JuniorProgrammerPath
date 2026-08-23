using System;
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    [Header("Player Acceleration Settings")]
    private float _speed = 0f;

    private float _maxSpeed = 10f;
    private float _nitroSpeed = 20f;

    [Header("Ritmos (unidades por segundo)")]
    private float _accelerationRate = 8f;

    private float _brakeRate = 20f;
    private float _dragRate = 4f;

    [Header("Player Movement Settings")] [SerializeField]
    private bool isMoving = false;

    [SerializeField] private float turnAngle = 45.0f;
    [SerializeField] private float rotationSmoothness = 5.0f;

    private float _horizontalInput;
    private float _smoothedInput;

    private float _verticalInput;
    private bool _isNitroActive = false;

    // Update is called once per frame
    void Update()
    {
        var kb = Keyboard.current;
        if (kb == null) return;

        ReadInput(kb);

        Accelerate();

        transform.Translate(Vector3.forward * (Time.deltaTime * _speed));

        TurnPlayer();

        isMoving = _speed != 0f;
    }

    private void ReadInput(Keyboard kb)
    {
        _verticalInput = 0f;
        if (kb.wKey.isPressed || kb.upArrowKey.isPressed) _verticalInput += 1f;
        if (kb.sKey.isPressed || kb.downArrowKey.isPressed) _verticalInput -= 1f;

        _horizontalInput = 0f;
        if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) _horizontalInput -= 1f;
        if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) _horizontalInput += 1f;

        _isNitroActive = UseNitro(kb);

        _smoothedInput = Mathf.Lerp(_smoothedInput, _horizontalInput, rotationSmoothness * Time.deltaTime);
    }

    private void TurnPlayer()
    {
        if (gameObject.CompareTag("Plane"))
        {
            transform.Rotate(Vector3.back, turnAngle * _smoothedInput * Time.deltaTime);
        }

        transform.Rotate(Vector3.up, turnAngle * _smoothedInput * Time.deltaTime);
    }

    private void Accelerate()
    {
        if (_verticalInput == 0f)
        {
            _speed = Mathf.MoveTowards(_speed, 0f, _dragRate * Time.deltaTime);
            return;
        }

        float topSpeed = _isNitroActive ? _nitroSpeed : _maxSpeed;
        float targetSpeed = _verticalInput * topSpeed;

        bool isBraking = isMoving && Mathf.Sign(_verticalInput) != Mathf.Sign(_speed);
        float movementRate = isBraking ? _brakeRate : _accelerationRate;

        _speed = Mathf.MoveTowards(_speed, targetSpeed, movementRate * Time.deltaTime);
    }

    private bool UseNitro(Keyboard kb)
    {
        return kb.shiftKey.isPressed;
    }

    public float GetMaximumPlayerNormalSpeed()
    {
        return _maxSpeed;
    }

    public float GetMaximumPlayerNitroSpeed()
    {
        return _nitroSpeed;
    }

    public float Speed
    {
        get => _speed;
    }

    public bool IsMoving
    {
        get => isMoving;
    }
}