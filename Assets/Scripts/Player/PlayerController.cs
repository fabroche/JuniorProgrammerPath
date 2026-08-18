using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public float speed = 20.0f;
    public bool isMoving = false;
    [SerializeField] private float turnAngle = 45.0f;
    [SerializeField] private float rotationSmoothness = 5.0f;

    private float horizontalInput;
    private float smoothedInput;

    // Update is called once per frame
    void Update()
    {
        var kb = Keyboard.current;
        if (kb == null) return;

        isMoving = speed != 0f;

        SetHorizontalInput(kb);
        transform.Translate(Vector3.forward * (Time.deltaTime * speed));
        TurnPlayer();
    }

    private void SetHorizontalInput(Keyboard kb)
    {
        horizontalInput = 0f;
        if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) horizontalInput -= 1f;
        if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) horizontalInput += 1f;

        smoothedInput = Mathf.Lerp(smoothedInput, horizontalInput, rotationSmoothness * Time.deltaTime);
    }

    private void TurnPlayer()
    {
        transform.Rotate(Vector3.up, turnAngle * smoothedInput * Time.deltaTime);
    }
}