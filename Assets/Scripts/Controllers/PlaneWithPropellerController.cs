using System;
using Systems;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;

namespace Controllers
{
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
        [Header("Plane Input Bindings")]
        [SerializeField] private Key moveUpButton;
        [SerializeField] private Key moveDownButton;
        
        private void ReadYAxisInput(ButtonControl moveUpInputKey, ButtonControl moveDownInputKey)
        {
            _ascendingOrDescendingInput = 0f;
            if (moveUpInputKey.isPressed) _ascendingOrDescendingInput += 1f;
            if (moveDownInputKey.isPressed) _ascendingOrDescendingInput -= 1f;
            
            _smoothedAscendingOrDescendingInput =
                Mathf.Lerp(_smoothedAscendingOrDescendingInput, _ascendingOrDescendingInput, _rotationSmoothness * Time.deltaTime);
        } 
        
        protected override void Turn()
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

        protected override void ReadInput(Keyboard kb)
        {
            base.ReadInput(kb);
            ReadYAxisInput(kb[moveUpButton], kb[moveDownButton]);
        }

        protected override void Update()
        {
            base.Update();
            RotatePropellers();
        }
    }
}