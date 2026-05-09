import { ScenarioDefinition } from './types'

export const canonicalSuccessScenario: ScenarioDefinition = {
  id: 'canonical_success',
  name: 'Canonical Success Winner',
  stateNodes: [
    { id: 'created', label: 'CREATED', sub: 't=0ms', x: 20, y: 210 },
    { id: 'processing', label: 'PROCESSING', sub: 'Retries: 0', x: 250, y: 210 },
    { id: 'success', label: 'SUCCESS', sub: 'idempotency_key', x: 520, y: 210 },
  ],
  stateEdges: [
    { id: 'e_create_proc', source: 'created', target: 'processing', type: 'solid', x1: 160, y1: 250, x2: 250, y2: 250 },
    { id: 'e_proc_succ', source: 'processing', target: 'success', type: 'solid', x1: 390, y1: 250, x2: 520, y2: 250 },
  ],
  requestNodes: [
    { id: 'frontend', label: 'Frontend', x: 50, y: 200 },
    { id: 'backend_api', label: 'Backend API', x: 350, y: 200, isPrimary: true },
    { id: 'gateway_sim', label: 'Gateway Sim', x: 650, y: 200 },
  ],
  requestEdges: [
    { id: 're_1', source: 'frontend', target: 'backend_api', x1: 220, y1: 240, x2: 350, y2: 240 },
    { id: 're_2', source: 'backend_api', target: 'gateway_sim', x1: 520, y1: 240, x2: 650, y2: 240 },
  ],
  steps: [
    {
      delayMs: 300,
      timelineEvent: { severity: 'INFO', traceId: 'trc_2201', message: 'Payment intent created', latency: 25 },
      stateUpdates: { created: 'completed', processing: 'active' },
      serviceUpdates: { frontend: 'active', backend_api: 'active' },
    },
    {
      delayMs: 400,
      timelineEvent: { severity: 'INFO', traceId: 'trc_2201', message: 'Forwarded to external gateway', latency: 85 },
      serviceUpdates: { gateway_sim: 'active' },
    },
    {
      delayMs: 600,
      timelineEvent: { severity: 'SUCCESS', traceId: 'trc_2201', message: 'Payment successful', latency: 300 },
      stateUpdates: { processing: 'completed', success: 'completed' },
      serviceUpdates: { gateway_sim: 'completed', backend_api: 'completed', frontend: 'completed' },
    }
  ]
}
