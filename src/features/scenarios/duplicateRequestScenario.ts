import { ScenarioDefinition } from './types'

export const duplicateRequestScenario: ScenarioDefinition = {
  id: 'duplicate_request',
  name: 'Duplicate Request Prevention',
  stateNodes: [
    { id: 'request_received', label: 'REQUEST RECEIVED', sub: 'API Gateway', x: 350, y: 50, systemActor: 'backend' },
    { id: 'idempotency_check', label: 'IDEMPOTENCY CHECK', sub: 'Redis Lock', x: 350, y: 170, systemActor: 'backend' },
    { id: 'order_created', label: 'ORDER CREATED', sub: 'Database Insert', x: 150, y: 300, isWarning: false, systemActor: 'database' },
    { id: 'existing_order_found', label: 'EXISTING ORDER', sub: 'Cache Hit', x: 550, y: 300, isWarning: true, systemActor: 'database' },
    { id: 'response_returned', label: 'RESPONSE RETURNED', sub: 'Client API', x: 350, y: 430, systemActor: 'backend' },
  ],
  stateEdges: [
    { id: 'e_req_idem', source: 'request_received', target: 'idempotency_check', type: 'solid', x1: 420, y1: 90, x2: 420, y2: 170, systemActor: 'backend' },
    { id: 'e_idem_create', source: 'idempotency_check', target: 'order_created', type: 'solid', path: 'M 350 210 L 220 300', systemActor: 'backend' },
    { id: 'e_idem_exist', source: 'idempotency_check', target: 'existing_order_found', type: 'dashed', path: 'M 490 210 L 620 300', systemActor: 'backend' },
    { id: 'e_create_res', source: 'order_created', target: 'response_returned', type: 'solid', path: 'M 220 340 L 350 430', systemActor: 'backend' },
    { id: 'e_exist_res', source: 'existing_order_found', target: 'response_returned', type: 'dashed', path: 'M 620 340 L 490 430', systemActor: 'backend' },
  ],
  
  
  description: 'Simulates handling of duplicate requests using idempotency caching to prevent double orders.',
  
  events: [
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
      status: 'active'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'idempotency_check',
      status: 'active',
      edgeId: 'e_req_idem'
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
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'order_created',
      status: 'active',
      edgeId: 'e_idem_create'
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
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'response_returned',
      status: 'active',
      edgeId: 'e_create_res'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'order_created',
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'response_returned',
      status: 'completed'
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
      status: 'active'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'idempotency_check',
      status: 'active',
      edgeId: 'e_req_idem'
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
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'existing_order_found',
      status: 'active',
      edgeId: 'e_idem_exist'
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
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'response_returned',
      status: 'active',
      edgeId: 'e_exist_res'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'existing_order_found',
      status: 'completed'
    },
    {
      type: 'STATE_TRANSITION',
      nodeId: 'response_returned',
      status: 'completed'
    }
  ]
}
