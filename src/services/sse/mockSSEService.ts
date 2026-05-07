import { useEventStore, SimulationEvent } from '@/stores/eventStore'
import { useSimulationStore } from '@/stores/simulationStore'

const DUPLICATE_SCENARIO_EVENTS: Omit<SimulationEvent, 'id'>[] = [
  {
    timestamp: '10:42:01.102',
    severity: 'TRACE',
    traceId: 'trc_88f2a1b9',
    message: 'Incoming payment request received. Generating idempotency lock.',
    latency: 12,
  },
  {
    timestamp: '10:42:01.114',
    severity: 'INFO',
    traceId: 'trc_88f2a1b9',
    message: 'Acquired distributed lock for req_id: req_x992m4',
    latency: 45,
  },
  {
    timestamp: '10:42:01.159',
    severity: 'INFO',
    traceId: 'trc_88f2a1b9',
    message: 'Initiating downstream processor call (Gateway_A).',
    latency: 142,
  },
  {
    timestamp: '10:42:01.301',
    severity: 'WARN',
    traceId: 'trc_88f2a1ba',
    message: 'Duplicate request detected for idempotency key: idk_9921_abc. Lock exists.',
    latency: 8,
  },
  {
    timestamp: '10:42:01.309',
    severity: 'ERROR',
    traceId: 'trc_88f2a1ba',
    message: 'Gateway_A timeout during initial phase. Connection dropped.',
    latency: 5002,
  },
  {
    timestamp: '10:42:06.311',
    severity: 'RECOVERY',
    traceId: 'trc_88f2a1ba',
    message: 'Executing fallback strategy. Re-routing to Gateway_B. Retaining original idempotency key.',
    latency: 45,
  },
  {
    timestamp: '10:42:06.356',
    severity: 'SUCCESS',
    traceId: 'trc_88f2a1ba',
    message: 'Transaction settled via fallback. Lock released.',
    latency: 210,
  },
]

let simulationInterval: number | null = null

export function startMockSSE() {
  const { addEvent } = useEventStore.getState()
  const { setSimulationStatus } = useSimulationStore.getState()
  
  let eventIndex = 0
  
  setSimulationStatus('Running')

  simulationInterval = window.setInterval(() => {
    if (eventIndex < DUPLICATE_SCENARIO_EVENTS.length) {
      addEvent({
        id: crypto.randomUUID(),
        ...DUPLICATE_SCENARIO_EVENTS[eventIndex],
      })
      eventIndex++
    } else {
      stopMockSSE()
    }
  }, 1000) // Emit one event every second
}

export function stopMockSSE() {
  const { setSimulationStatus } = useSimulationStore.getState()
  if (simulationInterval !== null) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
  setSimulationStatus('Idle')
}
