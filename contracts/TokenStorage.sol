// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenStorage {
    uint256 public constant NUM_SLABS = 5;

    // Token decimal is 6
    uint256 public constant MAX_CAPACITY = 1500000000;
    uint256[5] private slabMax = [
        1500000000,
        1400000000,
        1200000000,
        900000000,
        500000000
    ];

    // depositer => token address => deposited amount
    mapping(address => mapping(address => uint256)) public deposited;

    function deposit(address token, uint256 amount) external {
        // Transfer the token from the depositor to this contract
        require(
            deposited[msg.sender][token] + amount <= MAX_CAPACITY,
            "transfer exceeds capacity"
        );

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        deposited[msg.sender][token] += amount;
    }

    function withdraw(address token, uint256 amount) external {
        require(deposited[msg.sender][token] >= amount, "insufficient balance");
        deposited[msg.sender][token] -= amount;

        // Transfer the token from this contract to the depositor
        IERC20(token).transfer(msg.sender, amount);
    }

    function getSlab(address token) external view returns (uint256) {
        require(deposited[msg.sender][token] != 0, "no slab found");
        uint256 slab;
        for (uint256 i = NUM_SLABS - 1; i >= 0; i--) {
            if (deposited[msg.sender][token] <= slabMax[i]) {
                slab = i;
                break;
            }
        }
        return slab;
    }
}
