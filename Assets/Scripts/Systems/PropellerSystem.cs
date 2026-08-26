using System;
using UnityEngine;

namespace Systems
{
    [Serializable]
    public class PropellerSystem
    {
        [Header("Propellers Settings")] [SerializeField]
        private Transform[] _propellersTransforms;

        [SerializeField] private float _maxPropellerRpm = 900f;
        [SerializeField] private float _propellerRpmRate = 2000f;
        private float _propellersRpm = 0f;

        public void Rotate(float transportSpeed, float transportMaxSpeed)
        {
            if (_propellersTransforms.Length == 0) return;
            
            float speedRatio = Mathf.Abs(transportSpeed) / transportMaxSpeed;
            float targetRpm = _maxPropellerRpm * speedRatio;

            _propellersRpm = Mathf.MoveTowards(_propellersRpm, targetRpm, _propellerRpmRate * Time.deltaTime);

            foreach (Transform propeller in _propellersTransforms)
            {
                propeller.Rotate(Vector3.forward, _propellersRpm * Time.deltaTime);
            }
        }
    }
}