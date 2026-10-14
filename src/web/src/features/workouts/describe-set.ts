import type { NewSet } from '@/lib/api'

export function describe(set: NewSet) {
  const parts: string[] = []
  if (set.weightKg != null) parts.push(`${set.weightKg} kg`)
  if (set.reps != null) parts.push(`${set.reps} reps`)
  if (set.distanceMeters != null) parts.push(`${set.distanceMeters} m`)
  if (set.durationSeconds != null) parts.push(`${set.durationSeconds} s`)
  return parts.join(' · ')
}
