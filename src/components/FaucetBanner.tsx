'use client'

import { ExternalLinkIcon } from 'lucide-react'

export default function FaucetBanner() {
  return (
    <a
      href="https://testnet.arc.network/faucet"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-600 hover:to-purple-700"
    >
      <span>Get USDC from Faucet</span>
      <ExternalLinkIcon className="h-4 w-4" />
    </a>
  )
}
