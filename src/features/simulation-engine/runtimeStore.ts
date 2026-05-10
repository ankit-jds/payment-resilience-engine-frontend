import { create } from 'zustand'
import { NodeStatus, ServiceState } from '../scenarios/types'

interface RuntimeState {
  simulationSessionId: string | null
  simulationStatus: 'Idle' | 'Running' | 'Paused'
  connectionState: 'LIVE' | 'RECONNECTING' | 'DISCONNECTED'
  nodeStates: Record<string, NodeStatus>
  serviceStates: Record<string, ServiceState>
  
  // Execution context for multi-traversal
  activeExecutionContext: string | null
  nodeExecutionCounts: Record<string, number>
  activeRequests: Record<string, string[]>
  activeTransitions: { edgeId: string, requestId: string }[]
  
  // Actions
  setSessionId: (id: string | null) => void
  setSimulationStatus: (status: 'Idle' | 'Running' | 'Paused') => void
  setConnectionState: (state: 'LIVE' | 'RECONNECTING' | 'DISCONNECTED') => void
  updateNodeState: (nodeId: string, status: NodeStatus) => void
  updateServiceState: (serviceId: string, status: ServiceState) => void
  
  // Context actions
  setActiveExecutionContext: (requestId: string | null) => void
  incrementNodeExecution: (nodeId: string) => void
  addActiveRequest: (nodeId: string, requestId: string) => void
  removeActiveRequest: (nodeId: string, requestId: string) => void
  activateEdge: (edgeId: string, requestId: string) => void
  
  clearState: () => void
}

export const useRuntimeStore = create<RuntimeState>((set) => ({
  simulationSessionId: null,
  simulationStatus: 'Idle',
  connectionState: 'DISCONNECTED',
  nodeStates: {},
  serviceStates: {},
  activeExecutionContext: null,
  nodeExecutionCounts: {},
  activeRequests: {},
  activeTransitions: [],

  setSessionId: (id) => set({ simulationSessionId: id }),
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setConnectionState: (state) => set({ connectionState: state }),
  
  updateNodeState: (nodeId, status) => set((state) => ({
    nodeStates: { ...state.nodeStates, [nodeId]: status }
  })),
  
  updateServiceState: (serviceId, status) => set((state) => ({
    serviceStates: { ...state.serviceStates, [serviceId]: status }
  })),

  setActiveExecutionContext: (requestId) => set({ activeExecutionContext: requestId }),
  
  incrementNodeExecution: (nodeId) => set((state) => ({
    nodeExecutionCounts: { 
      ...state.nodeExecutionCounts, 
      [nodeId]: (state.nodeExecutionCounts[nodeId] || 0) + 1 
    }
  })),

  addActiveRequest: (nodeId, requestId) => set((state) => {
    const active = state.activeRequests[nodeId] || []
    if (active.includes(requestId)) return state
    return {
      activeRequests: { ...state.activeRequests, [nodeId]: [...active, requestId] }
    }
  }),

  removeActiveRequest: (nodeId, requestId) => set((state) => {
    const active = state.activeRequests[nodeId] || []
    return {
      activeRequests: { ...state.activeRequests, [nodeId]: active.filter(id => id !== requestId) }
    }
  }),

  activateEdge: (edgeId, requestId) => set((state) => ({
    activeTransitions: [...state.activeTransitions, { edgeId, requestId }]
  })),

  clearState: () => set({
    nodeStates: {},
    serviceStates: {},
    simulationSessionId: null,
    simulationStatus: 'Idle',
    connectionState: 'DISCONNECTED',
    activeExecutionContext: null,
    nodeExecutionCounts: {},
    activeRequests: {},
    activeTransitions: [],
  })
}))
