import { ScenarioDefinition } from './types'

export const duplicateRequestScenario: ScenarioDefinition = {
  id: 'duplicate_request',
  name: 'Duplicate Request Prevention',
  stateNodes: [
    { id: 'created', label: 'CREATED', sub: 't=0ms', x: 20, y: 210 },
    { id: 'processing', label: 'PROCESSING', sub: 'Retries: 2', x: 250, y: 210 },
    { id: 'success', label: 'SUCCESS', sub: 'idempotency_key', x: 520, y: 140 },
    { id: 'duplicate_success', label: 'DUPLICATE_SUCCESS', sub: 'Conflict Detected', x: 520, y: 280, isWarning: true },
    { id: 'refund_queued', label: 'REFUND_QUEUED', sub: 'Compensating Tx', x: 520, y: 370, isDanger: true },
    { id: 'refunded', label: 'REFUNDED', sub: 'State Settled', x: 290, y: 370 },
  ],
  stateEdges: [
    { id: 'e_create_proc', source: 'created', target: 'processing', type: 'solid', x1: 160, y1: 250, x2: 250, y2: 250 },
    { id: 'e_proc_succ', source: 'processing', target: 'success', type: 'solid', path: 'M 390 230 L 520 180' },
    { id: 'e_proc_dup', source: 'processing', target: 'duplicate_success', type: 'dashed', path: 'M 390 270 Q 450 350 520 320' },
    { id: 'e_dup_req', source: 'duplicate_success', target: 'refund_queued', type: 'dashed', path: 'M 660 320 Q 720 370 660 410' },
    { id: 'e_req_ref', source: 'refund_queued', target: 'refunded', type: 'solid', x1: 520, y1: 410, x2: 430, y2: 410 },
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
  steps: [
    {
      delayMs: 400,
      timelineEvent: { severity: 'INFO', traceId: 'trc_1101', message: 'Initial payment request received', latency: 45 },
      stateUpdates: { created: 'completed', processing: 'active' },
      serviceUpdates: { frontend: 'active', backend_api: 'active' },
    },
    {
      delayMs: 600,
      timelineEvent: { severity: 'INFO', traceId: 'trc_1101', message: 'Gateway call initiated', latency: 120 },
      serviceUpdates: { gateway_sim: 'active' },
    },
    {
      delayMs: 500,
      timelineEvent: { severity: 'SUCCESS', traceId: 'trc_1101', message: 'Payment authorized successfully', latency: 310 },
      stateUpdates: { success: 'completed' },
      serviceUpdates: { gateway_sim: 'completed' },
    },
    {
      delayMs: 800,
      timelineEvent: { severity: 'WARN', traceId: 'trc_1102', message: 'Duplicate network retry detected', latency: 10 },
      stateUpdates: { duplicate_success: 'active', success: 'skipped' },
      serviceUpdates: { frontend: 'active', backend_api: 'degraded' },
    },
    {
      delayMs: 500,
      timelineEvent: { severity: 'ERROR', traceId: 'trc_1102', message: 'Idempotency conflict, marking for refund', latency: 40 },
      stateUpdates: { duplicate_success: 'completed', refund_queued: 'active' },
      serviceUpdates: { backend_api: 'active', recon_worker: 'active' },
    },
    {
      delayMs: 700,
      timelineEvent: { severity: 'RECOVERY', traceId: 'trc_1102', message: 'Refund processed for duplicate', latency: 850 },
      stateUpdates: { refund_queued: 'completed', refunded: 'completed' },
      serviceUpdates: { recon_worker: 'completed', backend_api: 'completed', frontend: 'completed' },
    }
  ]
}
