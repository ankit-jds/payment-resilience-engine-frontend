import { ScenarioDefinition } from './types'

export const delayedWebhookScenario: ScenarioDefinition = {
  id: 'delayed_webhook',
  name: 'Delayed Webhook Recovery',
  problem: 'Webhook arrives late. User retries before confirmation.',
  risk: 'Second attempt is processed, causing double charge.',
  protection: 'First success wins. Duplicate success is refunded.',
  
  stateNodes: [
    { id: 'order_created', label: 'ORDER CREATED', sub: 'Pending', x: 80, y: 165, systemActor: 'database' },
    
    // Attempt A
    { id: 'payment_a', label: 'PAYMENT ATTEMPT 1', sub: 'Attempt 1', x: 400, y: 75, systemActor: 'backend' },
    { id: 'success_a', label: 'SUCCESS', sub: 'Provider', x: 720, y: 75, systemActor: 'database' },
    { id: 'webhook_delayed', label: 'WEBHOOK DELAYED', sub: 'Network', x: 1040, y: 75, isWarning: true, systemActor: 'webhooks' },
    { id: 'webhook_arrives', label: 'WEBHOOK ARRIVES', sub: 'Late', x: 1360, y: 75, isDanger: false, systemActor: 'webhooks' },
    { id: 'order_paid', label: 'ORDER PAID', sub: 'Final', x: 1680, y: 165, systemActor: 'database' },

    // Attempt B
    { id: 'payment_b', label: 'PAYMENT ATTEMPT 2', sub: 'Attempt 2', x: 400, y: 255, systemActor: 'backend' },
    { id: 'processing_b', label: 'PROCESSING', sub: 'In Progress', x: 720, y: 255, systemActor: 'backend' },
    { id: 'duplicate_success', label: 'DUPLICATE SUCCESS', sub: 'Conflict', x: 1040, y: 255, isWarning: true, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_create_pa', source: 'order_created', target: 'payment_a', type: 'solid', label: 'initiate 1', path: 'M 150 150 L 250 90', systemActor: 'backend' },
    { id: 'e_pa_sa', source: 'payment_a', target: 'success_a', type: 'solid', label: 'success', path: 'M 350 90 L 450 90', systemActor: 'backend' },
    { id: 'e_sa_wd', source: 'success_a', target: 'webhook_delayed', type: 'solid', label: 'delay', path: 'M 550 90 L 650 90', systemActor: 'backend' },
    
    { id: 'e_create_pb', source: 'order_created', target: 'payment_b', type: 'solid', label: 'retry', path: 'M 150 150 L 250 210', systemActor: 'backend' },
    { id: 'e_pb_procb', source: 'payment_b', target: 'processing_b', type: 'solid', label: 'route', path: 'M 350 210 L 450 210', systemActor: 'backend' },
    
    { id: 'e_wd_wa', source: 'webhook_delayed', target: 'webhook_arrives', type: 'solid', label: 'arrives', path: 'M 750 90 L 850 90', systemActor: 'backend' },
    { id: 'e_wa_paid', source: 'webhook_arrives', target: 'order_paid', type: 'solid', label: 'mark paid', path: 'M 950 90 L 1050 150', systemActor: 'backend' },
    
    { id: 'e_pb_dup', source: 'processing_b', target: 'duplicate_success', type: 'dashed', label: 'already paid', path: 'M 550 210 L 650 210', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_1', message: 'Order created', latency: 15, metadata: { orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'completed' },

    // Attempt A
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_a', message: 'First payment attempt starts', latency: 23, metadata: { attempt: 1 } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_a', status: 'active', edgeId: 'e_create_pa' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_a', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_a', message: 'Provider confirms payment success', latency: 68, metadata: { attempt: 1 } },
    { type: 'STATE_TRANSITION', nodeId: 'success_a', status: 'active', edgeId: 'e_pa_sa' },
    { type: 'STATE_TRANSITION', nodeId: 'success_a', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_a', message: 'Webhook delivery delayed/failing', latency: 180, metadata: { attempt: 1 } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_delayed', status: 'active', edgeId: 'e_sa_wd' },
    
    // Attempt B (User Retries)
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_b', message: 'User retries payment', latency: 15, metadata: { attempt: 2 } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_b', status: 'active', edgeId: 'e_create_pb' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_b', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_b', message: 'Second payment processing begins', latency: 45, metadata: { attempt: 2 } },
    { type: 'STATE_TRANSITION', nodeId: 'processing_b', status: 'active', edgeId: 'e_pb_procb' },

    // Delayed webhook arrives
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_a', message: 'Delayed webhook finally arrives', latency: 120, metadata: { attempt: 1 } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_delayed', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_arrives', status: 'active', edgeId: 'e_wd_wa' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_arrives', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_a', message: 'Order marked paid from delayed webhook', latency: 15, metadata: { orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'active', edgeId: 'e_wa_paid' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'completed' },

    // Attempt B finishes but order is paid
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_b', message: 'Second payment completes but order is already paid. Invalidating.', latency: 75, metadata: { attempt: 2 } },
    { type: 'STATE_TRANSITION', nodeId: 'processing_b', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'active', edgeId: 'e_pb_dup' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'completed' },
  ]
}
