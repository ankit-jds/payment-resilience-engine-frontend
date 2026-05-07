import { create } from 'zustand'

export type EngineStatus = 'Operational' | 'Degraded' | 'Offline'
export type SimulationStatus = 'Idle' | 'Running' | 'Paused'

interface SimulationState {
  engineStatus: EngineStatus
  simulationStatus: SimulationStatus
  activeScenarioId: string | null
  setSimulationStatus: (status: SimulationStatus) => void
  setActiveScenario: (id: string) => void
  resetSimulation: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  engineStatus: 'Operational',
  simulationStatus: 'Idle',
  activeScenarioId: 'duplicate_request', // default scenario
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setActiveScenario: (id) => set({ activeScenarioId: id, simulationStatus: 'Idle' }),
  resetSimulation: () => set({ simulationStatus: 'Idle' }),
}))
