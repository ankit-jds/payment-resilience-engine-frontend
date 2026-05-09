import { ScenarioDefinition } from './types'

export const duplicateRequestScenario: ScenarioDefinition = {
  id: 'duplicate_request',
  name: 'Duplicate Request Prevention',
  stateNodes: [
    { id: 'request_received', label: 'REQUEST RECEIVED', sub: 'API Gateway', x: 350, y: 50 },
    { id: 'idempotency_check', label: 'IDEMPOTENCY CHECK', sub: 'Redis Lock', x: 350, y: 170 },
    { id: 'order_created', label: 'ORDER CREATED', sub: 'Database Insert', x: 150, y: 300, isWarning: false },
    { id: 'existing_order_found', label: 'EXISTING ORDER', sub: 'Cache Hit', x: 550, y: 300, isWarning: true },
    { id: 'response_returned', label: 'RESPONSE RETURNED', sub: 'Client API', x: 350, y: 430 },
  ],
  stateEdges: [
    { id: 'e_req_idem', source: 'request_received', target: 'idempotency_check', type: 'solid', x1: 420, y1: 90, x2: 420, y2: 170 },
    { id: 'e_idem_create', source: 'idempotency_check', target: 'order_created', type: 'solid', path: 'M 350 210 L 220 300' },
    { id: 'e_idem_exist', source: 'idempotency_check', target: 'existing_order_found', type: 'dashed', path: 'M 490 210 L 620 300' },
    { id: 'e_create_res', source: 'order_created', target: 'response_returned', type: 'solid', path: 'M 220 340 L 350 430' },
    { id: 'e_exist_res', source: 'existing_order_found', target: 'response_returned', type: 'dashed', path: 'M 620 340 L 490 430' },
  ],
  requestNodes: [
    { id: 'frontend', label: 'Frontend', x: 50, y: 200 },
    { id: 'backend_api', label: 'Backend API', x: 350, y: 200, isPrimary: true },
    { id: 'gateway_sim', label: 'Gateway Sim', x: 650, y: 50 },
    { id: 'webhook_proc', label: 'Webhook Proc', x: 650, y: 200, isBlue: true },
    { id: 'recon_worker', label: 'Recon Worker', x: 650, y: 350 },
  ],
  requestEdges: [
    { id: 're_1', source: 'frontend', target: 'backend_api', x1: 220, y1: 240, x2: 350, y2: 240 },
    { id: 're_2', source: 'backend_api', target: 'gateway_sim', x1: 520, y1: 240, x2: 650, y2: 90 },
    { id: 're_3', source: 'backend_api', target: 'webhook_proc', x1: 520, y1: 240, x2: 650, y2: 240 },
    { id: 're_4', source: 'backend_api', target: 'recon_worker', x1: 520, y1: 240, x2: 650, y2: 390 },
  ],
  steps: [] // Driven by mockSSEService events now
}
