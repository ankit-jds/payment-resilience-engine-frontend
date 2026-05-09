const DUPLICATE_SCENARIO_EVENTS: any[] = [
  // Traversal A: Request 1 (req_1) - Misses cache, creates order
  {
    type: 'TIMELINE_EVENT',
    severity: 'TRACE',
    traceId: 'trc_1',
    message: '[req_1] Incoming payment request received.',
    latency: 12,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'request_received',
    status: 'active',
    metadata: { requestId: 'req_1', orderId: null }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'idempotency_check',
    status: 'active',
    edgeId: 'e_req_idem',
    metadata: { requestId: 'req_1' }
  },
  {
    type: 'TIMELINE_EVENT',
    severity: 'INFO',
    traceId: 'trc_1',
    message: '[req_1] Idempotency lock acquired. Cache MISS.',
    latency: 45,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'request_received',
    status: 'completed',
    metadata: { requestId: 'req_1' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'order_created',
    status: 'active',
    edgeId: 'e_idem_create',
    metadata: { requestId: 'req_1', orderId: 'ord_123' }
  },
  {
    type: 'TIMELINE_EVENT',
    severity: 'SUCCESS',
    traceId: 'trc_1',
    message: '[req_1] Order created successfully (ord_123).',
    latency: 142,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'idempotency_check',
    status: 'completed',
    metadata: { requestId: 'req_1' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'response_returned',
    status: 'active',
    edgeId: 'e_create_res',
    metadata: { requestId: 'req_1', orderId: 'ord_123' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'order_created',
    status: 'completed',
    metadata: { requestId: 'req_1' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'response_returned',
    status: 'completed',
    metadata: { requestId: 'req_1' }
  },

  // Traversal B: Request 2 (req_2) - Duplicate arrives, hits cache, returns existing
  {
    type: 'TIMELINE_EVENT',
    severity: 'WARN',
    traceId: 'trc_2',
    message: '[req_2] Duplicate payment request detected.',
    latency: 8,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'request_received',
    status: 'active',
    metadata: { requestId: 'req_2', orderId: null }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'idempotency_check',
    status: 'active',
    edgeId: 'e_req_idem',
    metadata: { requestId: 'req_2' }
  },
  {
    type: 'TIMELINE_EVENT',
    severity: 'INFO',
    traceId: 'trc_2',
    message: '[req_2] Idempotency lock exists. Cache HIT.',
    latency: 15,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'request_received',
    status: 'completed',
    metadata: { requestId: 'req_2' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'existing_order_found',
    status: 'active',
    edgeId: 'e_idem_exist',
    metadata: { requestId: 'req_2', orderId: 'ord_123' }
  },
  {
    type: 'TIMELINE_EVENT',
    severity: 'RECOVERY',
    traceId: 'trc_2',
    message: '[req_2] Resolved to existing order (ord_123). Resolving safely.',
    latency: 30,
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'idempotency_check',
    status: 'completed',
    metadata: { requestId: 'req_2' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'response_returned',
    status: 'active',
    edgeId: 'e_exist_res',
    metadata: { requestId: 'req_2', orderId: 'ord_123' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'existing_order_found',
    status: 'completed',
    metadata: { requestId: 'req_2' }
  },
  {
    type: 'STATE_TRANSITION',
    nodeId: 'response_returned',
    status: 'completed',
    metadata: { requestId: 'req_2' }
  }
]

let simulationInterval: number | null = null

export function startMockSSE(scenarioId: string, onEvent: (event: any) => void) {
  let eventIndex = 0
  let events = DUPLICATE_SCENARIO_EVENTS // Default to duplicate request scenario
  
  // In a real app, we'd fetch different event arrays based on scenarioId
  
  simulationInterval = window.setInterval(() => {
    if (eventIndex < events.length) {
      onEvent(events[eventIndex])
      eventIndex++
    } else {
      stopMockSSE()
    }
  }, 800) // Emit slightly faster for better visual pace
}

export function stopMockSSE() {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}
