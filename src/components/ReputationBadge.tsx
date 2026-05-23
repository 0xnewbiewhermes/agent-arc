'use client'

import { cn } from '@/lib/utils'

interface ReputationBadgeProps {
  score: number | null
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 4.5) return 'bg-green-500 text-white'
  if (score >= 3.5) return 'bg-emerald-500 text-white'
  if (score >= 2.5) return 'bg-yellow-500 text-black'
  if (score >= 1.5) return 'bg-orange-500 text-white'
  return 'bg-red-500 text-white'
}

export default function ReputationBadge({ score, className }: ReputationBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
          className
        )}
      >
        No Rep
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        getScoreColor(score),
        className
      )}
    >
      ★ {score.toFixed(1)}
    </span>
  )
}
