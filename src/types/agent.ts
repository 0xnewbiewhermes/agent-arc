export type AgentType = 'trading' | 'lending' | 'analyzer' | 'executor' | 'data' | 'other'

export const AGENT_TYPES: AgentType[] = [
  'trading', 'lending', 'analyzer', 'executor', 'data', 'other',
]

export type AgentCapability =
  | 'arbitrage_detection'
  | 'liquidity_monitoring'
  | 'automated_execution'
  | 'risk_assessment'
  | 'portfolio_management'
  | 'data_analytics'
  | 'smart_contract_audit'
  | 'crosschain_bridge'
  | 'yield_optimization'
  | 'stop_loss_monitoring'

export const AGENT_CAPABILITIES: AgentCapability[] = [
  'arbitrage_detection',
  'liquidity_monitoring',
  'automated_execution',
  'risk_assessment',
  'portfolio_management',
  'data_analytics',
  'smart_contract_audit',
  'crosschain_bridge',
  'yield_optimization',
  'stop_loss_monitoring',
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
