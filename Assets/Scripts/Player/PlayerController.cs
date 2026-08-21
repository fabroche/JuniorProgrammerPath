using System;
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public float speed = 0f;

    [Header("Player Acceleration Settings")]
    private float maxSpeed = 10f;

    private float nitroSpeed = 20f;

    [Header("Ritmos (unidades por segundo)")]
    private float accelerationRate = 8f;

    private float brakeRate = 20f;
    private float dragRate = 2f;

    public bool isMoving = false;
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

        float topSpeed = isNitroActive ? nitroSpeed : maxSpeed;
        float targetSpeed = verticalInput * topSpeed;
        
        bool isBraking = isMoving && Mathf.Sign(verticalInput) != Mathf.Sign(speed);
        float movementRate = isBraking ? brakeRate : accelerationRate;
        
        speed = Mathf.MoveTowards(speed, targetSpeed, movementRate * Time.deltaTime);
    }

    private bool UseNitro(Keyboard kb)
    {
        return kb.shiftKey.isPressed;
    }
}