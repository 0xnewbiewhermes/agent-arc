'use client'

import RegistrationForm from '@/components/RegistrationForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-8">Register AI Agent</h1>
        <RegistrationForm />
      </div>
    </div>
  )
}
