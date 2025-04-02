// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Staking {
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    uint256 public totalStaked;
    uint256 public rewardRate = 1; // 1% reward per period
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    function stake() external payable {
        require(msg.value > 0, "Cannot stake 0");
        
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender] >= amount, "Insufficient stake");

        calculateReward(msg.sender);
        
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        
        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }

    function calculateReward(address user) internal {
        uint256 reward = (stakes[user] * rewardRate) / 100;
        rewards[user] += reward;
    }

    function claimReward() external {
        calculateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");

        rewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        
        emit RewardClaimed(msg.sender, reward);
    }

    function getStake(address user) external view returns (uint256) {
        return stakes[user];
    }

    function getReward(address user) external view returns (uint256) {
        return rewards[user] + ((stakes[user] * rewardRate) / 100);
    }
}