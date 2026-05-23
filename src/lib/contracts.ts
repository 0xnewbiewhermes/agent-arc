export const CONTRACTS = {
  IDENTITY_REGISTRY: '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const,
  REPUTATION_REGISTRY: '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const,
  VALIDATION_REGISTRY: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272' as const,
  USDC: '0x3600000000000000000000000000000000000000' as const,
} as const

export const IDENTITY_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256', internalType: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        indexed: true,
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const

export const REPUTATION_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'agentId', type: 'uint256', internalType: 'uint256' },
      { name: 'score', type: 'uint8', internalType: 'uint8' },
      { name: 'feedback', type: 'string', internalType: 'string' },
    ],
    name: 'giveFeedback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const VALIDATION_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'agentId', type: 'uint256', internalType: 'uint256' },
      { name: 'requestData', type: 'string', internalType: 'string' },
    ],
    name: 'validationRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agentId', type: 'uint256', internalType: 'uint256' },
      { name: 'responseData', type: 'string', internalType: 'string' },
      { name: 'passed', type: 'bool', internalType: 'bool' },
    ],
    name: 'validationResponse',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentId', type: 'uint256', internalType: 'uint256' }],
    name: 'getValidationStatus',
    outputs: [
      { name: 'status', type: 'uint8', internalType: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
