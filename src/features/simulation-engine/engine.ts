import { useRuntimeStore } from './runtimeStore'
import { getScenario } from '../scenarios/scenarioRegistry'
import { useEventStore } from '@/stores/eventStore'
import { NodeStatus } from '../scenarios/types'

const generateId = () => Math.random().toString(36).substring(2, 9)

let simulationTimeout: NodeJS.Timeout | null = null
let currentStepIndex = 0

export const SimulationRuntimeEngine = {
  start(scenarioId: string) {
    this.cleanup()
    
    const sessionId = generateId()
    useRuntimeStore.getState().setSessionId(sessionId)
    useRuntimeStore.getState().setSimulationStatus('Running')
    useRuntimeStore.getState().setConnectionState('LIVE')
    
    const scenario = getScenario(scenarioId)
    currentStepIndex = 0
    
    this.scheduleNextStep(scenario, sessionId)
  },

  scheduleNextStep(scenario: any, sessionId: string) {
    if (currentStepIndex >= scenario.steps.length) {
      useRuntimeStore.getState().setSimulationStatus('Idle')
      useRuntimeStore.getState().setConnectionState('DISCONNECTED')
      return
    }

    const step = scenario.steps[currentStepIndex]
    
    simulationTimeout = setTimeout(() => {
      // Check if session changed or cleared
      if (useRuntimeStore.getState().simulationSessionId !== sessionId) return

      // Apply updates
      this.applyStep(step)
      
      currentStepIndex++
      this.scheduleNextStep(scenario, sessionId)
    }, step.delayMs)
  },

  applyStep(step: any) {
    const runtimeState = useRuntimeStore.getState()
    
    // Apply state updates with strict rules (can't go from completed to active)
    if (step.stateUpdates) {
      Object.entries(step.stateUpdates).forEach(([nodeId, status]) => {
        const currentStatus = runtimeState.nodeStates[nodeId] || 'inactive'
        if (this.isValidTransition(currentStatus, status as NodeStatus)) {
          runtimeState.updateNodeState(nodeId, status as NodeStatus)
        }
      })
    }
    
    // Apply service updates
    if (step.serviceUpdates) {
      Object.entries(step.serviceUpdates).forEach(([serviceId, status]) => {
        runtimeState.updateServiceState(serviceId, status as any)
      })
    }
    
    // Apply metadata
    if (step.metadataUpdates) {
      runtimeState.updateMetadata(step.metadataUpdates)
    }
    
    // Emit timeline event
    if (step.timelineEvent) {
      useEventStore.getState().addEvent({
        id: generateId(),
        timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
        severity: step.timelineEvent.severity,
        traceId: step.timelineEvent.traceId,
        message: step.timelineEvent.message,
        latency: step.timelineEvent.latency
      })
    }
  },

  isValidTransition(current: NodeStatus, next: NodeStatus): boolean {
    if (current === 'completed' && next === 'active') return false
    return true
  },

  cleanup() {
    if (simulationTimeout) {
      clearTimeout(simulationTimeout)
      simulationTimeout = null
    }
    useRuntimeStore.getState().clearState()
    useEventStore.getState().clearEvents()
  }
}
