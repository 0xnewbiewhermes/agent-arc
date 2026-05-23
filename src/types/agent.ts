export type AgentType = 'assistant' | 'tool' | 'workflow' | 'autonomous' | 'custom'

export const AGENT_TYPES: AgentType[] = [
  'assistant',
  'tool',
  'workflow',
  'autonomous',
  'custom',
]

export type AgentCapability =
  | 'chat'
  | 'analysis'
  | 'code-generation'
  | 'image-generation'
  | 'data-processing'
  | 'automation'
  | 'integration'
  | 'search'
  | 'translation'
  | 'summarization'

export const AGENT_CAPABILITIES: AgentCapability[] = [
  'chat',
  'analysis',
  'code-generation',
  'image-generation',
  'data-processing',
  'automation',
  'integration',
  'search',
  'translation',
  'summarization',
]

export type ValidationStatus = 'pending' | 'validated' | 'failed'

export interface ReputationEntry {
  validator: string
  score: number
  tags?: string[]
  comment?: string
  timestamp?: number
}

export interface ValidationEntry {
  validator: string
  passed: boolean
  data: string
  comment?: string
  timestamp: number
}

export interface Agent {
  /** On-chain token ID */
  id: bigint
  /** Owner address */
  owner: `0x${string}`
  /** Agent name (flattened from metadata) */
  name: string
  /** Agent description (flattened from metadata) */
  description: string
  /** Agent avatar image URL (flattened from metadata) */
  image: string
  /** Agent type (flattened from metadata) */
  type: AgentType
  /** Capabilities list (flattened from metadata) */
  capabilities: AgentCapability[]
  /** Version string (flattened from metadata) */
  version: string
  /** Raw metadata URI on IPFS */
  metadataUri: string
  /** Reputation entries from ReputationRegistry */
  reputation: ReputationEntry[] | null
  /** Validation entries */
  validations: ValidationEntry[] | null
  /** Current validation status */
  validationStatus: ValidationStatus
  /** Block timestamp of creation */
  createdAt: number
  /** Block timestamp of last update */
  updatedAt: number
}
