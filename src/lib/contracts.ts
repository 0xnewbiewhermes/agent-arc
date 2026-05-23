export const CONTRACTS = {
  IDENTITY_REGISTRY: '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const,
  REPUTATION_REGISTRY: '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const,
  VALIDATION_REGISTRY: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272' as const,
  USDC: '0x3600000000000000000000000000000000000000' as const,
} as const

export const IDENTITY_REGISTRY_ABI = [
  {
    name: 'register',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }],
    outputs: [],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'Transfer',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
] as const

export const REPUTATION_REGISTRY_ABI = [
  {
    name: 'giveFeedback',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'score', type: 'int128' },
      { name: 'feedbackType', type: 'uint8' },
      { name: 'tag', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'evidenceURI', type: 'string' },
      { name: 'comment', type: 'string' },
      { name: 'feedbackHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'FeedbackGiven',
    type: 'event',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'agentId', type: 'uint256' },
      { indexed: true, name: 'validator', type: 'address' },
      { indexed: false, name: 'score', type: 'int128' },
      { indexed: false, name: 'tag', type: 'string' },
    ],
  },
] as const

export const VALIDATION_REGISTRY_ABI = [
  {
    name: 'validationRequest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'validator', type: 'address' },
      { name: 'agentId', type: 'uint256' },
      { name: 'requestURI', type: 'string' },
      { name: 'requestHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'validationResponse',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'requestHash', type: 'bytes32' },
      { name: 'response', type: 'uint8' },
      { name: 'responseURI', type: 'string' },
      { name: 'responseHash', type: 'bytes32' },
      { name: 'tag', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'getValidationStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'requestHash', type: 'bytes32' }],
    outputs: [
      { name: 'validatorAddress', type: 'address' },
      { name: 'agentId', type: 'uint256' },
      { name: 'response', type: 'uint8' },
      { name: 'responseHash', type: 'bytes32' },
      { name: 'tag', type: 'string' },
      { name: 'lastUpdate', type: 'uint256' },
    ],
  },
] as const
