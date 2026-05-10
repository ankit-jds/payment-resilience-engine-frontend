import { ScenarioDefinition } from './types'

export const duplicateWebhookScenario: ScenarioDefinition = {
  id: 'duplicate_webhook',
  name: 'Duplicate Webhook Handling',
  description: 'Payment providers retry webhooks. System must process the first and safely ignore duplicates.',
  
  stateNodes: [
    { id: 'payment_success', label: 'PAYMENT SUCCESS', sub: 'Provider', x: 50, y: 210, systemActor: 'database' },
    { id: 'webhook_received', label: 'WEBHOOK RECEIVED', sub: 'Ingress', x: 300, y: 210, systemActor: 'webhooks' },
    { id: 'webhook_processed', label: 'WEBHOOK PROCESSED', sub: 'Mutation', x: 550, y: 110, systemActor: 'webhooks' },
    { id: 'order_updated', label: 'ORDER UPDATED', sub: 'Paid', x: 800, y: 110, systemActor: 'database' },
    { id: 'duplicate_detected', label: 'DUPLICATE DETECTED', sub: 'Idempotent', x: 550, y: 310, isWarning: true, systemActor: 'backend' },
    { id: 'ignored', label: 'IGNORED', sub: 'Safe', x: 800, y: 310, systemActor: 'backend' },
  ],
  stateEdges: [
    { id: 'e_succ_recv', source: 'payment_success', target: 'webhook_received', type: 'solid', path: 'M 150 250 L 300 250', systemActor: 'backend' },
    { id: 'e_recv_proc', source: 'webhook_received', target: 'webhook_processed', type: 'solid', path: 'M 400 210 L 550 150', systemActor: 'backend' },
    { id: 'e_proc_upd', source: 'webhook_processed', target: 'order_updated', type: 'solid', path: 'M 650 150 L 800 150', systemActor: 'backend' },
    { id: 'e_recv_dup', source: 'webhook_received', target: 'duplicate_detected', type: 'dashed', path: 'M 400 290 L 550 350', systemActor: 'backend' },
    { id: 'e_dup_ign', source: 'duplicate_detected', target: 'ignored', type: 'solid', path: 'M 650 350 L 800 350', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Payment succeeds at provider', latency: 0 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'completed' },

    // First Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_1', message: 'Webhook [wh_1] received', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Processing webhook [wh_1]', latency: 30 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'active', edgeId: 'e_recv_proc' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_wh_1', message: 'Order marked as PAID', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'active', edgeId: 'e_proc_upd' },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'completed' },

    // Duplicate Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_2', message: 'Duplicate webhook [wh_1] received', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_wh_2', message: 'Duplicate signature detected', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'active', edgeId: 'e_recv_dup' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_wh_2', message: 'Webhook ignored safely (200 OK returned)', latency: 5 },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'active', edgeId: 'e_dup_ign' },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'completed' },
  ]
}
