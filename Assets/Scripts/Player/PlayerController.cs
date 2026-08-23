using System;
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{

    [Header("Player Acceleration Settings")]
    private float speed = 0f;
    private float _maxSpeed = 10f;
    private float _nitroSpeed = 20f;

    [Header("Ritmos (unidades por segundo)")]
    private float accelerationRate = 8f;
    private float brakeRate = 20f;
    private float dragRate = 4f;
    
    [Header("Player Movement Settings")] 
    [SerializeField] private bool isMoving = false;
    [SerializeField] private float turnAngle = 45.0f;
    [SerializeField] private float rotationSmoothness = 5.0f;

    private float horizontalInput;
    private float smoothedInput;

    private float verticalInput;
    private bool isNitroActive = false;

    // Update is called once per frame
    void Update()
    {
        var kb = Keyboard.current;
        if (kb == null) return;

        ReadInput(kb);

        Accelerate();

        transform.Translate(Vector3.forward * (Time.deltaTime * speed));
        
        TurnPlayer();

        isMoving = speed != 0f;
    }

    private void ReadInput(Keyboard kb)
    {
        verticalInput = 0f;
        if (kb.wKey.isPressed || kb.upArrowKey.isPressed) verticalInput += 1f;
        if (kb.sKey.isPressed || kb.downArrowKey.isPressed) verticalInput -= 1f;

        horizontalInput = 0f;
        if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) horizontalInput -= 1f;
        if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) horizontalInput += 1f;

        isNitroActive = UseNitro(kb);

        smoothedInput = Mathf.Lerp(smoothedInput, horizontalInput, rotationSmoothness * Time.deltaTime);
    }

    private void TurnPlayer()
    {
        transform.Rotate(Vector3.up, turnAngle * smoothedInput * Time.deltaTime);
    }

    private void Accelerate()
    {
        if (verticalInput == 0f)
        {
            speed = Mathf.MoveTowards(speed, 0f, dragRate * Time.deltaTime);
            return;
        }

        float topSpeed = isNitroActive ? _nitroSpeed : _maxSpeed;
        float targetSpeed = verticalInput * topSpeed;
        
        bool isBraking = isMoving && Mathf.Sign(verticalInput) != Mathf.Sign(speed);
        float movementRate = isBraking ? brakeRate : accelerationRate;
        
        speed = Mathf.MoveTowards(speed, targetSpeed, movementRate * Time.deltaTime);
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
        get => speed;
    }
    
    public bool IsMoving
    {
        get => isMoving;
    }
    
    
}