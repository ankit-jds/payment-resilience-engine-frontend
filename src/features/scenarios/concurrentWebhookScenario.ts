import { ScenarioDefinition } from './types'

export const concurrentWebhookScenario: ScenarioDefinition = {
  id: 'concurrent_webhook',
  name: 'Concurrent Webhook Race',
  problem: 'Two identical webhooks arrive at the exact same millisecond.',
  risk: 'Race condition causing the order to be processed twice simultaneously.',
  protection: 'Database row-level locking (SELECT FOR UPDATE) ensures sequential processing.',
  
  stateNodes: [
    { id: 'webhook_a_received', label: 'WEBHOOK A', sub: 'Arrived', x: 80, y: 165, systemActor: 'webhooks' },
    { id: 'lock_acquired', label: 'LOCK ACQUIRED', sub: 'DB Row', x: 480, y: 165, systemActor: 'backend' },
    { id: 'order_updated', label: 'ORDER UPDATED', sub: 'Success', x: 960, y: 165, systemActor: 'database' },
    
    { id: 'webhook_b_received', label: 'WEBHOOK B', sub: 'Arrived', x: 80, y: 465, systemActor: 'webhooks' },
    { id: 'lock_waiting', label: 'LOCK WAITING', sub: 'Blocked', x: 480, y: 465, isWarning: true, systemActor: 'backend' },
    { id: 'lock_released', label: 'LOCK RELEASED', sub: 'Unblocked', x: 960, y: 465, systemActor: 'backend' },
    { id: 'state_finalized', label: 'ALREADY FINALIZED', sub: 'No-op', x: 1360, y: 465, systemActor: 'backend' },
  ],
  stateEdges: [
    { id: 'e_wa_lock', source: 'webhook_a_received', target: 'lock_acquired', type: 'solid', label: 'acquire', path: 'M 150 150 L 300 150', systemActor: 'backend' },
    { id: 'e_lock_upd', source: 'lock_acquired', target: 'order_updated', type: 'solid', label: 'mutate', path: 'M 400 150 L 600 150', systemActor: 'backend' },
    
    { id: 'e_wb_wait', source: 'webhook_b_received', target: 'lock_waiting', type: 'solid', label: 'block', path: 'M 150 350 L 300 350', systemActor: 'backend' },
    { id: 'e_wait_rel', source: 'lock_waiting', target: 'lock_released', type: 'solid', label: 'unblock', path: 'M 400 350 L 600 350', systemActor: 'backend' },
    { id: 'e_rel_fin', source: 'lock_released', target: 'state_finalized', type: 'solid', label: 'read state', path: 'M 700 350 L 850 350', systemActor: 'backend' },
  ],
  
  
  events: [
    // Webhooks Arrive Concurrently
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_a', message: 'Webhook A received by API Server 1', latency: 8, metadata: { serverId: 'srv_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_a_received', status: 'active' },
    
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_b', message: 'Webhook B received by API Server 2', latency: 9, metadata: { serverId: 'srv_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_b_received', status: 'active' },
    
    // Server 1 acquires lock
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_a', message: 'Server 1 successfully acquires DB row lock', latency: 23, metadata: { serverId: 'srv_1', lockStatus: 'acquired' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_a_received', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'lock_acquired', status: 'active', edgeId: 'e_wa_lock' },
    
    // Server 2 tries and waits
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_wh_b', message: 'Server 2 blocked. Row is locked.', latency: 38, metadata: { serverId: 'srv_2', lockStatus: 'waiting' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_b_received', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'lock_waiting', status: 'active', edgeId: 'e_wb_wait' },

    // Server 1 finishes
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_wh_a', message: 'Server 1 finishes mutation. Order updated.', latency: 68, metadata: { serverId: 'srv_1', orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_acquired', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'active', edgeId: 'e_lock_upd' },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'completed' },

    // Server 2 unblocked
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_b', message: 'Lock released. Server 2 proceeds.', latency: 15, metadata: { serverId: 'srv_2', lockStatus: 'acquired' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_waiting', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'lock_released', status: 'active', edgeId: 'e_wait_rel' },

    // Server 2 realizes state is finalized
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_wh_b', message: 'Server 2 sees order is already paid. Returning 200 safely.', latency: 23, metadata: { serverId: 'srv_2', action: 'noop' } },
    { type: 'STATE_TRANSITION', nodeId: 'lock_released', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'state_finalized', status: 'active', edgeId: 'e_rel_fin' },
    { type: 'STATE_TRANSITION', nodeId: 'state_finalized', status: 'completed' },
  ]
}
