export type TrackingType = 'WeightReps' | 'BodyweightReps' | 'DistanceTime' | 'TimeHold'

export interface Exercise {
  id: number
  name: string
  trackingType: TrackingType
}

export interface PersonalRecord {
  id: number
  exerciseId: number
  recordType: string
  value: number
  achievedOn: string
}

export interface NewSet {
  exerciseId: number
  setNumber: number
  weightKg?: number
  reps?: number
  durationSeconds?: number
  distanceMeters?: number
}

export interface LogSetResult {
  id: number
  newPersonalRecords: { recordType: string; value: number }[]
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  getExercises: () => request<Exercise[]>('/exercises'),
  getRecords: (userId: number) => request<PersonalRecord[]>(`/users/${userId}/records`),
  startSession: (userId: number) =>
    request<{ id: number }>(`/users/${userId}/sessions`, { method: 'POST' }),
  logSet: (sessionId: number, set: NewSet) =>
    request<LogSetResult>(`/sessions/${sessionId}/sets`, {
      method: 'POST',
      body: JSON.stringify(set),
    }),
}