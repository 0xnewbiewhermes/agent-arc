'use client'

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

function getPinataJwt(): string {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
  if (!jwt) {
    throw new Error('NEXT_PUBLIC_PINATA_JWT environment variable is not set')
  }
  return jwt
}

export async function uploadToIPFS(data: Record<string, unknown>): Promise<string> {
  const jwt = getPinataJwt()

  const response = await fetch(PINATA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: {
        name: `agent-metadata-${Date.now()}`,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Pinata upload failed: ${response.status} ${errorBody}`)
  }

  const result = (await response.json()) as { IpfsHash: string }
  return `ipfs://${result.IpfsHash}`
}

export function ipfsUriToHttp(uri: string, gateway = IPFS_GATEWAY): string {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', gateway)
  }
  return uri
}

export function httpToIpfsUri(url: string): string {
  if (!url) return ''
  // Handle various gateway URL patterns
  const ipfsRegex = /https?:\/\/[^/]+\/ipfs\/([a-zA-Z0-9]+)/
  const match = url.match(ipfsRegex)
  if (match) {
    return `ipfs://${match[1]}`
  }
  return url
}
