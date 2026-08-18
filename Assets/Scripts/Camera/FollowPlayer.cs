using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class FollowPlayer : MonoBehaviour
{
    public GameObject player;
    private PlayerController playerController;
    [SerializeField] private Vector3 cameraOffset = new Vector3(0, 5, -7);
    [SerializeField] private Vector3 cameraOffsetMoving = new Vector3(0, 6, -11);
	[SerializeField] private float followStrength = 5f;

    private Vector3 currentCameraOffset;
    
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        if (player == null) return;
        playerController = player.GetComponent<PlayerController>();
        currentCameraOffset = cameraOffset;
    }

    // Update is called once per frame
    void Update()
    {

    }

    void LateUpdate()
    {
        // transform.position = player.transform.position + cameraOffset;
        if (player == null) return;
        if (playerController.isMoving)
        {
            currentCameraOffset = cameraOffsetMoving;
        }
        else
        {
            currentCameraOffset = cameraOffset;
        }
        
        transform.position = Vector3.Lerp(
            transform.position,
            player.transform.position + currentCameraOffset,
            followStrength * Time.deltaTime
        );
    }

    void FixedUpdate()
    {
    }
}