import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function shortenAgentId(id: bigint | number | string, chars = 4): string {
  const str = typeof id === 'bigint' ? id.toString() : String(id)
  if (str.length <= chars * 2 + 3) return str
  return `${str.slice(0, chars)}...${str.slice(-chars)}`
}

export function formatTimestamp(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const date = new Date(ts * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ipfsToHttp(uri: string, gateway = 'https://ipfs.io/ipfs/'): string {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', gateway)
  }
  if (uri.startsWith('ar://')) {
    return uri.replace('ar://', 'https://arweave.net/')
  }
  return uri
}
