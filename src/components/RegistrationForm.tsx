'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { uploadToIPFS } from '@/lib/ipfs'
import { CONTRACTS, IDENTITY_REGISTRY_ABI } from '@/lib/contracts'
import { AGENT_TYPES, AGENT_CAPABILITIES } from '@/types/agent'
import type { AgentType, AgentCapability } from '@/types/agent'
import { cn } from '@/lib/utils'

interface FormData {
  name: string
  description: string
  image: string
  agentType: AgentType
  capabilities: AgentCapability[]
  version: string
}

const initialFormData: FormData = {
  name: '',
  description: '',
  image: '',
  agentType: 'assistant',
  capabilities: [],
  version: '1.0.0',
}

export default function RegistrationForm() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ipfsUri, setIpfsUri] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(null)
  }

  const toggleCapability = (cap: AgentCapability) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }))
  }

  const metadataPreview = {
    name: formData.name || '<name>',
    description: formData.description || '<description>',
    image: formData.image || '',
    agentType: formData.agentType,
    capabilities: formData.capabilities,
    version: formData.version || '1.0.0',
  }

  const handleUploadToIPFS = async () => {
    if (!formData.name) {
      setError('Name is required')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uri = await uploadToIPFS(metadataPreview as Record<string, unknown>)
      setIpfsUri(uri)
      setSuccess('Metadata uploaded to IPFS successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload to IPFS')
    } finally {
      setUploading(false)
    }
  }

  const handleRegister = async () => {
    if (!walletClient || !publicClient || !address) {
      setError('Wallet not connected')
      return
    }

    if (!ipfsUri) {
      setError('Please upload metadata to IPFS first')
      return
    }

    if (!formData.name) {
      setError('Name is required')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // The register function takes (to, tokenId) — we use our address and a new token ID
      // In a real scenario, the contract might auto-assign or we'd compute the next ID
      const hash = await walletClient.writeContract({
        address: CONTRACTS.IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'register',
        args: [address, BigInt(Math.floor(Math.random() * 1000000) + 1)],
      })

      setSuccess(`Registration submitted! Tx: ${hash}`)
      setFormData(initialFormData)
      setIpfsUri(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Connect your wallet to register an agent
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="My Awesome Agent"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what your agent does..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            placeholder="https://... or ipfs://..."
            value={formData.image}
            onChange={(e) => updateField('image', e.target.value)}
          />
        </div>

        {/* Agent Type */}
        <div className="space-y-2">
          <Label htmlFor="agentType">Agent Type</Label>
          <Select
            id="agentType"
            value={formData.agentType}
            onChange={(e) => updateField('agentType', e.target.value as AgentType)}
            options={AGENT_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
          />
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <Label>Capabilities</Label>
          <div className="flex flex-wrap gap-2">
            {AGENT_CAPABILITIES.map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCapability(cap)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  formData.capabilities.includes(cap)
                    ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'
                )}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            placeholder="1.0.0"
            value={formData.version}
            onChange={(e) => updateField('version', e.target.value)}
          />
        </div>

        {/* Metadata Preview */}
        <div className="space-y-2">
          <Label>Metadata Preview</Label>
          <pre className="overflow-auto rounded-lg bg-zinc-50 p-4 text-xs dark:bg-zinc-900">
            {JSON.stringify(metadataPreview, null, 2)}
          </pre>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleUploadToIPFS}
            disabled={uploading || !formData.name}
          >
            {uploading ? 'Uploading...' : 'Upload to IPFS'}
          </Button>
          <Button
            onClick={handleRegister}
            disabled={submitting || !ipfsUri || !formData.name}
          >
            {submitting ? 'Registering...' : 'Register on Chain'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
