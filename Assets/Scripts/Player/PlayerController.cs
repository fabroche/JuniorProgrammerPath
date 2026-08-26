using System;
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public Transform propellers;
    [Header("Player Acceleration Settings")]
    private float _speed = 0f;
    
    private float _maxSpeed = 10f;
    private float _nitroSpeed = 20f;
    
    [Header("Propellers Settings")]
    private float _propellersRpm = 0f;
    private float _maxPropellerRpm = 900f;
    private float _propellerRpmRate = 2000f;
    
    [Header("Bank Settings")]
    [SerializeField] private float _bankAngle = 0f;
    private float _maxBankAngle = 45f;
    private float _bankRotationRate = 90f;
    
    [Header("Ritmos (unidades por segundo)")]
    private float _accelerationRate = 8f;

    private float _brakeRate = 20f;
    private float _dragRate = 4f;

    [Header("Player Movement Settings")] [SerializeField]
    private bool isMoving = false;

    [SerializeField] private bool isAscendingOrDescending = false;

    [SerializeField] private float turnAngle = 45.0f;
    [SerializeField] private float rotationSmoothness = 5.0f;


    private float _verticalInput;
    private float _smoothedHorizontalInput;
    private float _horizontalInput;
    private float _smoothedVerticalInput;
    private float _ascendingOrDescendingInput;
    private float _smoothedAscendingOrDescendingInput;
    
    private bool _isNitroActive = false;
    
    
    // Update is called once per frame
    void Update()
    {
        var kb = Keyboard.current;
        if (kb == null) return;

        ReadInput(kb);

        Accelerate();
        RotatePropellers();

        transform.Translate(Vector3.forward * (Time.deltaTime * _speed));

        TurnPlayer();

        isMoving = _speed != 0f;
    }

    private void ReadInput(Keyboard kb)
    {
        _verticalInput = 0f;
        if (kb.wKey.isPressed) _verticalInput += 1f;
        if (kb.sKey.isPressed) _verticalInput -= 1f;

        _horizontalInput = 0f;
        if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) _horizontalInput -= 1f;
        if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) _horizontalInput += 1f;

        _isNitroActive = UseNitro(kb);

        _ascendingOrDescendingInput = 0f;
        if (kb.upArrowKey.isPressed) _ascendingOrDescendingInput += 1f;
        if (kb.downArrowKey.isPressed) _ascendingOrDescendingInput -= 1f;

        isAscendingOrDescending = kb.upArrowKey.isPressed || kb.downArrowKey.isPressed;


        _smoothedHorizontalInput =
            Mathf.Lerp(_smoothedHorizontalInput, _horizontalInput, rotationSmoothness * Time.deltaTime);
        _smoothedVerticalInput =
            Mathf.Lerp(_smoothedVerticalInput, _verticalInput, rotationSmoothness * Time.deltaTime);
        _smoothedAscendingOrDescendingInput =
            Mathf.Lerp(_smoothedAscendingOrDescendingInput, _ascendingOrDescendingInput, rotationSmoothness * Time.deltaTime);
    }

    private void TurnPlayer()
    {
        if (gameObject.CompareTag("Plane"))
        {
            float previousBankAngle = _bankAngle;
            
            float targetBankAngle = _horizontalInput * _maxBankAngle;
            _bankAngle = Mathf.MoveTowards(_bankAngle, targetBankAngle, _bankRotationRate * Time.deltaTime);
            
            transform.Rotate(Vector3.back, _bankAngle - previousBankAngle);
            transform.Rotate(Vector3.right, turnAngle * _smoothedAscendingOrDescendingInput * Time.deltaTime);
        }

        transform.Rotate(Vector3.up, turnAngle * _smoothedHorizontalInput * Time.deltaTime);
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
        var boostKey = kb.shiftKey;
        
        return kb.shiftKey.isPressed;
    }

    private void RotatePropellers()
    {
        if (propellers == null) return;
        float speedRatio = Mathf.Abs(_speed) / _maxSpeed;
        float targetRpm = _maxPropellerRpm * speedRatio;
        
        _propellersRpm = Mathf.MoveTowards(_propellersRpm, targetRpm, _propellerRpmRate * Time.deltaTime);
        
        propellers.Rotate(Vector3.forward, _propellersRpm * Time.deltaTime);
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