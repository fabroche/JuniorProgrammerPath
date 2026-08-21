using System;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class FollowPlayer : MonoBehaviour
{
    public GameObject player;
    private PlayerController playerController;
    [SerializeField] private Vector3 cameraOffset = new Vector3(0, 5, -7);
    [SerializeField] private float followStrength = 5f;
    
    private float _playerSpeed;
    private float _percentageOfPlayerSpeed;
    
    [Tooltip("The function that calculates the follow strength based on the player's speed and percentage of player speed")]
    private Func<float, Func<float, float>> _followStrengthCalculator = (playerSpeed) =>
        (percentageOfPlayerSpeed) => playerSpeed - (playerSpeed * percentageOfPlayerSpeed);


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        if (player == null) return;
        playerController = player.GetComponent<PlayerController>();
        _playerSpeed = playerController.speed;
        _percentageOfPlayerSpeed = 0.2f;
        followStrength = _followStrengthCalculator(_playerSpeed)(_percentageOfPlayerSpeed);
    }

    // Update is called once per frame
    void Update()
    {
    }

    void LateUpdate()
    {
        // transform.position = player.transform.position + cameraOffset;
        if (player == null) return;

        transform.position = Vector3.Lerp(
            transform.position,
            player.transform.position + cameraOffset,
            followStrength * Time.deltaTime
        );
    }

    void FixedUpdate()
    {
    }
}