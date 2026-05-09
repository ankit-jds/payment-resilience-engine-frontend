import { ScenarioDefinition } from './types'

export const duplicateWebhookScenario: ScenarioDefinition = {
  id: 'duplicate_webhook',
  name: 'Duplicate Webhook Handling',
  description: 'Payment providers retry webhooks. System must process the first and safely ignore duplicates.',
  stateNodes: [
    { id: 'payment_success', label: 'PAYMENT SUCCESS', sub: 'Provider', x: 50, y: 210 },
    { id: 'webhook_received', label: 'WEBHOOK RECEIVED', sub: 'Ingress', x: 300, y: 210 },
    { id: 'webhook_processed', label: 'WEBHOOK PROCESSED', sub: 'Mutation', x: 550, y: 110 },
    { id: 'order_updated', label: 'ORDER UPDATED', sub: 'Paid', x: 800, y: 110 },
    { id: 'duplicate_detected', label: 'DUPLICATE DETECTED', sub: 'Idempotent', x: 550, y: 310, isWarning: true },
    { id: 'ignored', label: 'IGNORED', sub: 'Safe', x: 800, y: 310 },
  ],
  stateEdges: [
    { id: 'e_succ_recv', source: 'payment_success', target: 'webhook_received', type: 'solid', path: 'M 150 250 L 300 250' },
    { id: 'e_recv_proc', source: 'webhook_received', target: 'webhook_processed', type: 'solid', path: 'M 400 210 L 550 150' },
    { id: 'e_proc_upd', source: 'webhook_processed', target: 'order_updated', type: 'solid', path: 'M 650 150 L 800 150' },
    { id: 'e_recv_dup', source: 'webhook_received', target: 'duplicate_detected', type: 'dashed', path: 'M 400 290 L 550 350' },
    { id: 'e_dup_ign', source: 'duplicate_detected', target: 'ignored', type: 'solid', path: 'M 650 350 L 800 350' },
  ],
  requestNodes: [
    { id: 'provider', label: 'Payment Provider', x: 50, y: 200 },
    { id: 'webhook_ingress', label: 'Webhook Ingress', x: 350, y: 200, isPrimary: true },
    { id: 'database', label: 'Database', x: 650, y: 200 },
  ],
  requestEdges: [
    { id: 're_1', source: 'provider', target: 'webhook_ingress', x1: 220, y1: 240, x2: 350, y2: 240 },
    { id: 're_2', source: 'webhook_ingress', target: 'database', x1: 520, y1: 240, x2: 650, y2: 240 },
  ],
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Payment succeeds at provider', latency: 0 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'active', metadata: { paymentId: 'pay_wh' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_success', status: 'completed', metadata: { paymentId: 'pay_wh' } },

    // First Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_1', message: 'Webhook [wh_1] received', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv', metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed', metadata: { webhookId: 'wh_1' } },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_wh_1', message: 'Processing webhook [wh_1]', latency: 30 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'active', edgeId: 'e_recv_proc', metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_processed', status: 'completed', metadata: { webhookId: 'wh_1' } },
    
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_wh_1', message: 'Order marked as PAID', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'active', edgeId: 'e_proc_upd', metadata: { webhookId: 'wh_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_updated', status: 'completed', metadata: { webhookId: 'wh_1' } },

    // Duplicate Webhook
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_wh_2', message: 'Duplicate webhook [wh_1] received', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'active', edgeId: 'e_succ_recv', metadata: { webhookId: 'wh_1_dup' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_received', status: 'completed', metadata: { webhookId: 'wh_1_dup' } },
    
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_wh_2', message: 'Duplicate signature detected', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'active', edgeId: 'e_recv_dup', metadata: { webhookId: 'wh_1_dup' } },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_detected', status: 'completed', metadata: { webhookId: 'wh_1_dup' } },
    
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_wh_2', message: 'Webhook ignored safely (200 OK returned)', latency: 5 },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'active', edgeId: 'e_dup_ign', metadata: { webhookId: 'wh_1_dup' } },
    { type: 'STATE_TRANSITION', nodeId: 'ignored', status: 'completed', metadata: { webhookId: 'wh_1_dup' } },
  ]
}
