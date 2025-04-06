import { useState } from 'react'
import { useAccount, useContractWrite, useContractRead } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import './App.css'

const STAKING_CONTRACT_ADDRESS = '0x10060b36670552c9c731586ca814fe0442dc5ff5'
const RVD_TOKEN_ADDRESS = '0x4dBe2E9bCefB065CbA4ffB212296AFD61e4395e5'

const stakingABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_rewardToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Unstaked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getStake",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lastRewardTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardRatePerSecond",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [
      {
        "internalType": "contract IReturnVoid",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "rewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

function App() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { data: stakedBalance, refetch: refetchStakedBalance } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'getStake',
    args: [address],
    enabled: !!address,
    watch: true,
  })

  const { data: rewardBalance, refetch: refetchRewardBalance } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'getReward',
    args: [address],
    enabled: !!address,
    watch: true,
  })

  const { write: stake, isLoading: stakeLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'stake',
    onSuccess: () => {
      refetchStakedBalance()
      refetchRewardBalance()
      setStakeAmount('')
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const { write: unstake, isLoading: unstakeLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'unstake',
    onSuccess: () => {
      refetchStakedBalance()
      refetchRewardBalance()
      setUnstakeAmount('')
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const { write: claimReward, isLoading: claimLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingABI,
    functionName: 'claimReward',
    onSuccess: () => {
      refetchStakedBalance()
      refetchRewardBalance()
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
  })

  const handleStake = () => {
    setIsLoading(true)
    stake({
      value: parseEther(stakeAmount),
    })
  }

  const handleUnstake = () => {
    setIsLoading(true)
    unstake({
      args: [parseEther(unstakeAmount)],
    })
  }

  const handleClaimReward = () => {
    setIsLoading(true)
    claimReward()
  }

  return (
    <div className="App">
      <div className="wallet-button">
        <ConnectButton />
      </div>

      {!isConnected && (
        <div>
          <p>Please connect your wallet to proceed.</p>
        </div>
      )}

      {isConnected && (
        <div>
          <h2>Tea Staking Dashboard</h2>

          <div className="input-group">
            <h3>Stake</h3>
            <input
              type="text"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Amount to stake"
            />
            <button onClick={handleStake} disabled={isLoading || !stakeAmount}>
              {stakeLoading ? 'Staking...' : 'Stake'}
            </button>
          </div>

          <div className="input-group">
            <h3>Unstake</h3>
            <input
              type="text"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="Amount to unstake"
            />
            <button onClick={handleUnstake} disabled={isLoading || !unstakeAmount}>
              {unstakeLoading ? 'Unstaking...' : 'Unstake'}
            </button>
          </div>

          <div className="input-group">
            <h3>Claim Rewards</h3>
            <p>Available rewards: {rewardBalance && formatEther(rewardBalance)}</p>
            <button onClick={handleClaimReward} disabled={claimLoading}>
              {claimLoading ? 'Claiming...' : 'Claim Rewards'}
            </button>
          </div>

          <div className="stats">
            <p>Your Stake: {stakedBalance && formatEther(stakedBalance)} TEA</p>
            <p>Your Rewards: {rewardBalance && formatEther(rewardBalance)} RVD</p>
            <p>Creator - Retrunvoid</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
