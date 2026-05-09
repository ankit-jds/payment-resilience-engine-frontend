import { useRuntimeStore } from './runtimeStore'
import { useEventStore } from '@/stores/eventStore'
import { NodeStatus } from '../scenarios/types'

const generateId = () => Math.random().toString(36).substring(2, 9)

export const SimulationRuntimeEngine = {
  start(_scenarioId: string) {
    this.cleanup()
    
    const sessionId = generateId()
    const runtimeState = useRuntimeStore.getState()
    
    runtimeState.setSessionId(sessionId)
    runtimeState.setSimulationStatus('Running')
    runtimeState.setConnectionState('LIVE')
  },

  processEvent(event: any) {
    const runtimeState = useRuntimeStore.getState()
    
    if (event.type === 'STATE_TRANSITION') {
      const { nodeId, status, metadata, edgeId } = event
      
      // Update metadata and execution context
      if (metadata) {
        runtimeState.updateMetadata(metadata)
        if (metadata.requestId) {
          runtimeState.setActiveExecutionContext(metadata.requestId)
        }
      }

      const currentStatus = runtimeState.nodeStates[nodeId] || 'inactive'
      
      // Only process valid transitions
      if (this.isValidTransition(currentStatus, status as NodeStatus)) {
        runtimeState.updateNodeState(nodeId, status as NodeStatus)
        
        // Track execution counts and active requests
        if (status === 'active') {
          runtimeState.incrementNodeExecution(nodeId)
          if (metadata?.requestId) {
            runtimeState.addActiveRequest(nodeId, metadata.requestId)
          }
        } else if (status === 'completed' || status === 'failed' || status === 'skipped') {
          if (metadata?.requestId) {
            runtimeState.removeActiveRequest(nodeId, metadata.requestId)
          }
        }
      }
      
      // Activate edges for animation
      if (edgeId && status === 'active') {
        runtimeState.activateEdge(edgeId, metadata?.requestId || 'unknown')
      }
      
      // Optionally handle serviceUpdates if we want services to be driven by events too
      if (event.serviceId && event.serviceStatus) {
        runtimeState.updateServiceState(event.serviceId, event.serviceStatus)
      }
    } 
    else if (event.type === 'TIMELINE_EVENT') {
      useEventStore.getState().addEvent({
        id: generateId(),
        timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
        severity: event.severity || 'INFO',
        traceId: event.traceId || runtimeState.activeExecutionContext || 'system',
        message: event.message,
        latency: event.latency || 0
      })
    }
    // Handle old format if accidentally triggered (fallback)
    else if (event.stateUpdates || event.timelineEvent) {
       // Ignore legacy scenario formats
    }
  },

  isValidTransition(_current: NodeStatus, _next: NodeStatus): boolean {
    // In an event-sourced simulation, trust the incoming events
    // Allow nodes to be re-entered (e.g. completed -> active) for multi-traversal
    return true
  },

  cleanup() {
    useRuntimeStore.getState().clearState()
    useEventStore.getState().clearEvents()
  }
}
