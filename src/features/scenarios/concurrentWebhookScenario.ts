import { ScenarioDefinition } from './types'

export const concurrentWebhookScenario: ScenarioDefinition = {
  id: 'concurrent_webhook',
  name: 'Concurrent Webhook Race',
  description: 'Two identical webhooks arrive simultaneously. Database locking ensures safe ordering and prevents race conditions.',
  stateNodes: [
    { id: 'webhook_a_received', label: 'WEBHOOK A', sub: 'Arrived', x: 50, y: 110 },
    { id: 'lock_acquired', label: 'LOCK ACQUIRED', sub: 'DB Row', x: 300, y: 110 },
    { id: 'order_updated', label: 'ORDER UPDATED', sub: 'Success', x: 600, y: 110 },
    
    { id: 'webhook_b_received', label: 'WEBHOOK B', sub: 'Arrived', x: 50, y: 310 },
    { id: 'lock_waiting', label: 'LOCK WAITING', sub: 'Blocked', x: 300, y: 310, isWarning: true },
    { id: 'lock_released', label: 'LOCK RELEASED', sub: 'Unblocked', x: 600, y: 310 },
    { id: 'state_finalized', label: 'ALREADY FINALIZED', sub: 'No-op', x: 850, y: 310 },
  ],
  stateEdges: [
    { id: 'e_wa_lock', source: 'webhook_a_received', target: 'lock_acquired', type: 'solid', path: 'M 150 150 L 300 150' },
    { id: 'e_lock_upd', source: 'lock_acquired', target: 'order_updated', type: 'solid', path: 'M 400 150 L 600 150' },
    
    { id: 'e_wb_wait', source: 'webhook_b_received', target: 'lock_waiting', type: 'solid', path: 'M 150 350 L 300 350' },
    { id: 'e_wait_rel', source: 'lock_waiting', target: 'lock_released', type: 'solid', path: 'M 400 350 L 600 350' },
    { id: 'e_rel_fin', source: 'lock_released', target: 'state_finalized', type: 'solid', path: 'M 700 350 L 850 350' },
  ],
  requestNodes: [
    { id: 'provider', label: 'Payment Provider', x: 50, y: 200 },
    { id: 'api_server_1', label: 'API Server 1', x: 350, y: 100, isPrimary: true },
    { id: 'api_server_2', label: 'API Server 2', x: 350, y: 300, isPrimary: true },
    { id: 'database', label: 'Database', x: 650, y: 200 },
  ],
  requestEdges: [
    { id: 're_1a', source: 'provider', target: 'api_server_1', x1: 220, y1: 240, x2: 350, y2: 140 },
    { id: 're_1b', source: 'provider', target: 'api_server_2', x1: 220, y1: 240, x2: 350, y2: 340 },
    { id: 're_2a', source: 'api_server_1', target: 'database', x1: 520, y1: 140, x2: 650, y2: 240 },
    { id: 're_2b', source: 'api_server_2', target: 'database', x1: 520, y1: 340, x2: 650, y2: 240 },
  ],
  events: [
    // Webhooks Arrive Concurrently
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_a', message: 'Webhook A received by API Server 1', latency: 5 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_a_received', status: 'active', metadata: { webhookId: 'wh_A' } },
    
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_b', message: 'Webhook B received by API Server 2', latency: 6 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_b_received', status: 'active', metadata: { webhookId: 'wh_B' } },
    
    // Server 1 acquires lock
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_a', message: 'Server 1 successfully acquires DB row lock', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_a_received', status: 'completed', metadata: { webhookId: 'wh_A' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_acquired', status: 'active', edgeId: 'e_wa_lock', metadata: { webhookId: 'wh_A' } },
    
    // Server 2 tries and waits
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_wh_b', message: 'Server 2 blocked. Row is locked.', latency: 25 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_b_received', status: 'completed', metadata: { webhookId: 'wh_B' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_waiting', status: 'active', edgeId: 'e_wb_wait', metadata: { webhookId: 'wh_B' } },

    // Server 1 finishes
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_wh_a', message: 'Server 1 finishes mutation. Order updated.', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'lock_acquired', status: 'completed', metadata: { webhookId: 'wh_A' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'active', edgeId: 'e_lock_upd', metadata: { webhookId: 'wh_A' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'completed', metadata: { webhookId: 'wh_A' } },

    // Server 2 unblocked
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_b', message: 'Lock released. Server 2 proceeds.', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'lock_waiting', status: 'completed', metadata: { webhookId: 'wh_B' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_released', status: 'active', edgeId: 'e_wait_rel', metadata: { webhookId: 'wh_B' } },

    // Server 2 realizes state is finalized
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_wh_b', message: 'Server 2 sees order is already paid. Returning 200 safely.', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'lock_released', status: 'completed', metadata: { webhookId: 'wh_B' } },
    { type: 'STATE_TRANSITION', nodeId: 'state_finalized', status: 'active', edgeId: 'e_rel_fin', metadata: { webhookId: 'wh_B' } },
    { type: 'STATE_TRANSITION', nodeId: 'state_finalized', status: 'completed', metadata: { webhookId: 'wh_B' } },
  ]
}
