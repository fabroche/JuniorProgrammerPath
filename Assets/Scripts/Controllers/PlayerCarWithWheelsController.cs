using UnityEngine;
using UnityEngine.InputSystem;

namespace Controllers
{
    public class PlayerCarWithWheelsController : CarWithWheelsController
    {
        // Buttons Settings
        [Header("Input Bindings")]
        [SerializeField] private Key moveForwardButton;
        [SerializeField] private Key moveBackwardButton;
        [SerializeField] private Key moveRightButton;
        [SerializeField] private Key moveLeftButton;
        [SerializeField] private Key boostSpeedButton;

        protected override void ReadInput()
        {
            Keyboard kb = Keyboard.current;
            if (kb == null)
            {
                ResetInput();
                return;
            }

            ReadBoostSpeedInput(kb[boostSpeedButton]);
            ReadZAxisInput(kb[moveForwardButton], kb[moveBackwardButton]);
            ReadXAxisInput(kb[moveRightButton], kb[moveLeftButton]);
        }
    }
}
