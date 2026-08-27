using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;

namespace Controllers
{
    public abstract class TransportController : MonoBehaviour
    {
        [Header("Speed Settings")]
        [SerializeField] protected float maxSpeed = 10f;
        [SerializeField] private float maxBoostSpeed = 20f;

        // Speed State
        protected float _speed = 0f;
        protected bool _isBoostSpeedActive = false;
        
        [Header("Acceleration Settings")]
        [SerializeField] private float accelerationRate = 8f;
        [SerializeField] private float brakeRate = 20f;
        [SerializeField] private float dragRate = 4f;

        // Movement State
        protected bool _isMoving = false;
        
        [Header("Rotation Settings")]
        [SerializeField] protected float turnAngle = 45f;
        [SerializeField] protected float rotationSmoothness = 5f;

        // Input Settings
        protected float _verticalInput;
        protected float _horizontalInput;
        protected float _smoothedVerticalInput;
        protected float _smoothedHorizontalInput;

        // Buttons Settings
        [Header("Input Bindings")]
        [SerializeField] private Key moveForwardButton;
        [SerializeField] private Key moveBackwardButton;
        [SerializeField] private Key moveRightButton;
        [SerializeField] private Key moveLeftButton;
        [SerializeField] private Key boostSpeedButton;

        // Getters
        public float Speed
        {
            get => _speed;
        }
        
        public float MaxSpeed
        {
            get => maxSpeed;
        }

        public bool IsMoving
        {
            get => _isMoving;
        }
        
        // Setters
        
        
        protected virtual void Update()
        {
            Keyboard kb = Keyboard.current;
            if (kb == null) return;

            ReadInput(kb);

            Accelerate();
            Turn();
            Move();

            _isMoving = _speed != 0f;
        }

        protected virtual void ReadInput(Keyboard kb)
        {
            ReadBoostSpeedInput(kb[boostSpeedButton]);
            ReadZAxisInput(kb[moveForwardButton], kb[moveBackwardButton]);
            ReadXAxisInput(kb[moveRightButton], kb[moveLeftButton]);
        }

        // Cada transporte gira a su manera
        protected abstract void Turn();

        protected virtual void Move()
        {
            transform.Translate(Vector3.forward * (Time.deltaTime * _speed));
        }

        protected virtual void Accelerate()
        {
            if (_verticalInput == 0f)
            {
                _speed = Mathf.MoveTowards(_speed, 0f, dragRate * Time.deltaTime);
                return;
            }

            float topSpeed = _isBoostSpeedActive ? maxBoostSpeed : maxSpeed;
            float targetSpeed = _verticalInput * topSpeed;

            bool isBraking = _isMoving && Mathf.Sign(_verticalInput) != Mathf.Sign(_speed);
            float movementRate = isBraking ? brakeRate : accelerationRate;
        
            _speed = Mathf.MoveTowards(_speed, targetSpeed, movementRate * Time.deltaTime);
        }

        protected virtual void ReadBoostSpeedInput(ButtonControl boostSpeedButton)
        {
            _isBoostSpeedActive = boostSpeedButton.isPressed;
        }
        
        protected virtual void ReadZAxisInput(ButtonControl moveForwardInputKey, ButtonControl moveBackwardInputKey)
        {
            _verticalInput = 0f;
            if (moveForwardInputKey.isPressed) _verticalInput += 1f;
            if (moveBackwardInputKey.isPressed) _verticalInput -= 1f;
            
            _smoothedVerticalInput =
                Mathf.Lerp(_smoothedVerticalInput, _verticalInput, rotationSmoothness * Time.deltaTime);
        }
        
        protected virtual void ReadXAxisInput(ButtonControl moveRightInputKey, ButtonControl moveLeftInputKey)
        {
            _horizontalInput = 0f;
            if (moveRightInputKey.isPressed) _horizontalInput += 1f;
            if (moveLeftInputKey.isPressed) _horizontalInput -= 1f;
            
            _smoothedHorizontalInput =
                Mathf.Lerp(_smoothedHorizontalInput, _horizontalInput, rotationSmoothness * Time.deltaTime);
        }
    }
}