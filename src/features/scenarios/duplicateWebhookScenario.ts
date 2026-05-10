import { ScenarioDefinition } from './types'

export const duplicateWebhookScenario: ScenarioDefinition = {
  id: 'duplicate_webhook',
  name: 'Duplicate Webhook Handling',
  problem: 'Payment provider sends the same webhook multiple times.',
  risk: 'Order is fulfilled twice, or metrics are double-counted.',
  protection: 'Webhook signatures and event IDs are checked against a processed cache before execution.',
  
  stateNodes: [
    { id: 'payment_success', label: 'PAYMENT SUCCESS', sub: 'Provider', x: 80, y: 315, systemActor: 'database' },
    { id: 'webhook_received', label: 'WEBHOOK RECEIVED', sub: 'Ingress', x: 480, y: 315, systemActor: 'webhooks' },
    { id: 'webhook_processed', label: 'WEBHOOK PROCESSED', sub: 'Mutation', x: 880, y: 165, systemActor: 'webhooks' },
    { id: 'order_updated', label: 'ORDER UPDATED', sub: 'Paid', x: 1280, y: 165, systemActor: 'database' },
    { id: 'duplicate_detected', label: 'DUPLICATE DETECTED', sub: 'Idempotent', x: 880, y: 465, isWarning: true, systemActor: 'backend' },
    { id: 'ignored', label: 'IGNORED', sub: 'Safe', x: 1280, y: 465, systemActor: 'backend' },
  ],
  stateEdges: [
    { id: 'e_succ_recv', source: 'payment_success', target: 'webhook_received', type: 'solid', label: 'trigger', path: 'M 150 250 L 300 250', systemActor: 'backend' },
    { id: 'e_recv_proc', source: 'webhook_received', target: 'webhook_processed', type: 'solid', label: 'process', path: 'M 400 210 L 550 150', systemActor: 'backend' },
    { id: 'e_proc_upd', source: 'webhook_processed', target: 'order_updated', type: 'solid', label: 'mutate', path: 'M 650 150 L 800 150', systemActor: 'backend' },
    { id: 'e_recv_dup', source: 'webhook_received', target: 'duplicate_detected', type: 'dashed', label: 'conflict', path: 'M 400 290 L 550 350', systemActor: 'backend' },
    { id: 'e_dup_ign', source: 'duplicate_detected', target: 'ignored', type: 'solid', label: 'drop', path: 'M 650 350 L 800 350', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Payment succeeds at provider', latency: 0, metadata: { providerId: 'prov_99' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'completed' },

    // First Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_1', message: 'Webhook received', latency: 23, metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Processing webhook', latency: 45, metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'active', edgeId: 'e_recv_proc' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_wh_1', message: 'Order marked as PAID', latency: 75, metadata: { webhookId: 'wh_1', orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'active', edgeId: 'e_proc_upd' },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'completed' },

    // Duplicate Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_2', message: 'Duplicate webhook received', latency: 180, metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_wh_2', message: 'Duplicate signature detected', latency: 15, metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'active', edgeId: 'e_recv_dup' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_wh_2', message: 'Webhook ignored safely (200 OK returned)', latency: 8, metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'active', edgeId: 'e_dup_ign' },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'completed' },
  ]
}
