import type { TrackingType } from '@/lib/api'

export const trackingLabels: Record<TrackingType, string> = {
  WeightReps: 'Weight & reps',
  BodyweightReps: 'Bodyweight & reps',
  DistanceTime: 'Distance & time',
  TimeHold: 'Time hold',
}
