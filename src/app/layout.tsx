import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Providers from './providers'
import NavHeader from '@/components/NavHeader'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Agent Arc — AI Agent Registry on ARC',
  description: 'Discover and manage AI agents on ARC Testnet',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <NavHeader />
          <main className="flex-1 flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
