import { create } from 'zustand'
import { SimulationRuntimeEngine } from '@/features/simulation-engine/engine'

export type EngineStatus = 'Operational' | 'Degraded' | 'Offline'
export type SimulationStatus = 'Idle' | 'Running' | 'Paused'

interface SimulationState {
  engineStatus: EngineStatus
  activeScenarioId: string
  setActiveScenario: (id: string) => void
  resetSimulation: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  engineStatus: 'Operational',
  activeScenarioId: 'duplicate_request', // default scenario
  setActiveScenario: (id) => {
    SimulationRuntimeEngine.cleanup()
    set({ activeScenarioId: id })
  },
  resetSimulation: () => {
    SimulationRuntimeEngine.cleanup()
  },
}))
