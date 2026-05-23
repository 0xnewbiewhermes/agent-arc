'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface NavLinkProps {
  href: string
  label: string
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      {label}
    </Link>
  )
}

export default function NavHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
            A
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Agent Arc
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/explore" label="Explore" />
          <NavLink href="/dashboard" label="Dashboard" />
        </nav>

        {/* Connect Button */}
        <ConnectButton />
      </div>
    </header>
  )
}
