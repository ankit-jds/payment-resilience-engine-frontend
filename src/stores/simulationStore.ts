import { create } from 'zustand'
import { SimulationRuntimeEngine } from '@/features/simulation-engine/engine'

export type EngineStatus = 'Operational' | 'Degraded' | 'Offline'
export type SimulationStatus = 'Idle' | 'Running' | 'Paused'

interface SimulationState {
  engineStatus: EngineStatus
  simulationStatus: SimulationStatus
  activeScenarioId: string
  setSimulationStatus: (status: SimulationStatus) => void
  setActiveScenario: (id: string) => void
  resetSimulation: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  engineStatus: 'Operational',
  simulationStatus: 'Idle',
  activeScenarioId: 'duplicate_request', // default scenario
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setActiveScenario: (id) => {
    SimulationRuntimeEngine.cleanup()
    set({ activeScenarioId: id, simulationStatus: 'Idle' })
  },
  resetSimulation: () => {
    SimulationRuntimeEngine.cleanup()
    set({ simulationStatus: 'Idle' })
  },
}))
