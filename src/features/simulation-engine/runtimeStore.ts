import { create } from 'zustand'
import { NodeStatus, ServiceState } from '../scenarios/types'

interface RuntimeState {
  simulationSessionId: string | null
  simulationStatus: 'Idle' | 'Running' | 'Paused'
  connectionState: 'LIVE' | 'RECONNECTING' | 'DISCONNECTED'
  nodeStates: Record<string, NodeStatus>
  serviceStates: Record<string, ServiceState>
  metadata: Record<string, any>
  
  // Actions
  setSessionId: (id: string | null) => void
  setSimulationStatus: (status: 'Idle' | 'Running' | 'Paused') => void
  setConnectionState: (state: 'LIVE' | 'RECONNECTING' | 'DISCONNECTED') => void
  updateNodeState: (nodeId: string, status: NodeStatus) => void
  updateServiceState: (serviceId: string, status: ServiceState) => void
  updateMetadata: (data: Record<string, any>) => void
  clearState: () => void
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  simulationSessionId: null,
  simulationStatus: 'Idle',
  connectionState: 'DISCONNECTED',
  nodeStates: {},
  serviceStates: {},
  metadata: {},

  setSessionId: (id) => set({ simulationSessionId: id }),
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setConnectionState: (state) => set({ connectionState: state }),
  
  updateNodeState: (nodeId, status) => set((state) => ({
    nodeStates: { ...state.nodeStates, [nodeId]: status }
  })),
  
  updateServiceState: (serviceId, status) => set((state) => ({
    serviceStates: { ...state.serviceStates, [serviceId]: status }
  })),

  updateMetadata: (data) => set((state) => ({
    metadata: { ...state.metadata, ...data }
  })),

  clearState: () => set({
    nodeStates: {},
    serviceStates: {},
    metadata: {},
    simulationSessionId: null,
    simulationStatus: 'Idle',
    connectionState: 'DISCONNECTED'
  })
}))
