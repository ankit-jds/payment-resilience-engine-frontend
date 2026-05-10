import { create } from 'zustand'

export type EventSeverity = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'RECOVERY' | 'TRACE'

export interface SimulationEvent {
  id: string
  timestamp: string
  severity: EventSeverity
  traceId: string
  message: string
  latency?: number
  metadata?: Record<string, string | number>
}

interface EventState {
  events: SimulationEvent[]
  addEvent: (event: SimulationEvent) => void
  clearEvents: () => void
}

const MAX_EVENTS = 150

export const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event) => set((state) => {
    const nextEvents = [...state.events, event]
    if (nextEvents.length > MAX_EVENTS) {
      return { events: nextEvents.slice(nextEvents.length - MAX_EVENTS) }
    }
    return { events: nextEvents }
  }),
  clearEvents: () => set({ events: [] }),
}))
