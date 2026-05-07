import { create } from 'zustand'

export type EventSeverity = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'RECOVERY' | 'TRACE'

export interface SimulationEvent {
  id: string
  timestamp: string
  severity: EventSeverity
  traceId: string
  message: string
  latency?: number
}

interface EventState {
  events: SimulationEvent[]
  addEvent: (event: SimulationEvent) => void
  clearEvents: () => void
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  clearEvents: () => set({ events: [] }),
}))
