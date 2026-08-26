using System;
using Systems;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;

namespace Controllers
{
    [Serializable]
    public class PlaneWithPropellerController : TransportController, IPropellers
    {
        private bool _isFlying = false;

        // Bank Settings
        private float _bankAngle = 0f;
        private float _maxBankAngle = 45f;
        private float _bankRotationRate = 90f;

        private bool _isAscending = false;
        private bool _isDescending = false;

        // Ascending/Descending Settings
        private float _ascendingOrDescendingInput;
        private float _smoothedAscendingOrDescendingInput;
        
        // Propellers Settings
        [SerializeField] private PropellerSystem _propellers;

        // Buttons Settings
        [Header("Input Bindings")]
        [SerializeField] private Key moveForwardButton;
        [SerializeField] private Key moveBackwardButton;
        [SerializeField] private Key moveRightButton;
        [SerializeField] private Key moveLeftButton;
        [SerializeField] private Key moveUpButton;
        [SerializeField] private Key moveDownButton;
        [SerializeField] private Key boostSpeedButton;
        
        protected virtual void ReadYAxisInput(ButtonControl moveUpInputKey, ButtonControl moveDownInputKey)
        {
            _ascendingOrDescendingInput = 0f;
            if (moveUpInputKey.isPressed) _ascendingOrDescendingInput += 1f;
            if (moveDownInputKey.isPressed) _ascendingOrDescendingInput -= 1f;
            
            _smoothedAscendingOrDescendingInput =
                Mathf.Lerp(_smoothedAscendingOrDescendingInput, _ascendingOrDescendingInput, _rotationSmoothness * Time.deltaTime);
        } 
        
        private void TurnPlane()
        {
            float previousBankAngle = _bankAngle;

            float targetBankAngle = _horizontalInput * _maxBankAngle;
            _bankAngle = Mathf.MoveTowards(_bankAngle, targetBankAngle, _bankRotationRate * Time.deltaTime);

            transform.Rotate(Vector3.back, _bankAngle - previousBankAngle);
            transform.Rotate(Vector3.right, _turnAngle * _smoothedAscendingOrDescendingInput * Time.deltaTime);


            transform.Rotate(Vector3.up, _turnAngle * _smoothedHorizontalInput * Time.deltaTime);
        }

        public void RotatePropellers()
        {
            _propellers.Rotate(_speed, _maxSpeed);
        }

        private void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;
            
            ReadBoostSpeedInput(kb[boostSpeedButton]);
            ReadZAxisInput(kb[moveForwardButton], kb[moveBackwardButton]);
            ReadXAxisInput(kb[moveRightButton], kb[moveLeftButton]);
            ReadYAxisInput(kb[moveUpButton], kb[moveDownButton]);
            
            Accelerate();
            TurnPlane();
            RotatePropellers();
            
            transform.Translate(Vector3.forward * (Time.deltaTime * _speed));
            
            _isMoving = _speed != 0f;
        }
    }
}