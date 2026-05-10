import { ScenarioDefinition } from './types'

export const delayedWebhookScenario: ScenarioDefinition = {
  id: 'delayed_webhook',
  name: 'Delayed Webhook Recovery',
  description: 'Webhook is delayed. User retries before it arrives. Late webhook must correctly resolve and invalidate the second attempt.',
  
  stateNodes: [
    { id: 'order_created', label: 'ORDER CREATED', sub: 'Pending', x: 50, y: 110, systemActor: 'database' },
    
    // Attempt A
    { id: 'payment_a', label: 'PAYMENT A', sub: 'Attempt 1', x: 250, y: 50, systemActor: 'backend' },
    { id: 'success_a', label: 'SUCCESS A', sub: 'Provider', x: 450, y: 50, systemActor: 'database' },
    { id: 'webhook_delayed', label: 'WEBHOOK DELAYED', sub: 'Network', x: 650, y: 50, isWarning: true, systemActor: 'webhooks' },
    { id: 'webhook_arrives', label: 'WEBHOOK ARRIVES', sub: 'Late', x: 850, y: 50, isDanger: false, systemActor: 'webhooks' },
    { id: 'order_paid', label: 'ORDER PAID', sub: 'Final', x: 1050, y: 110, systemActor: 'database' },

    // Attempt B
    { id: 'payment_b', label: 'PAYMENT B', sub: 'Attempt 2', x: 250, y: 170, systemActor: 'backend' },
    { id: 'processing_b', label: 'PROCESSING B', sub: 'In Progress', x: 450, y: 170, systemActor: 'backend' },
    { id: 'duplicate_success', label: 'DUPLICATE SUCCESS', sub: 'Conflict', x: 650, y: 170, isWarning: true, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_create_pa', source: 'order_created', target: 'payment_a', type: 'solid', path: 'M 150 150 L 250 90', systemActor: 'backend' },
    { id: 'e_pa_sa', source: 'payment_a', target: 'success_a', type: 'solid', path: 'M 350 90 L 450 90', systemActor: 'backend' },
    { id: 'e_sa_wd', source: 'success_a', target: 'webhook_delayed', type: 'solid', path: 'M 550 90 L 650 90', systemActor: 'backend' },
    
    { id: 'e_create_pb', source: 'order_created', target: 'payment_b', type: 'solid', path: 'M 150 150 L 250 210', systemActor: 'backend' },
    { id: 'e_pb_procb', source: 'payment_b', target: 'processing_b', type: 'solid', path: 'M 350 210 L 450 210', systemActor: 'backend' },
    
    { id: 'e_wd_wa', source: 'webhook_delayed', target: 'webhook_arrives', type: 'solid', path: 'M 750 90 L 850 90', systemActor: 'backend' },
    { id: 'e_wa_paid', source: 'webhook_arrives', target: 'order_paid', type: 'solid', path: 'M 950 90 L 1050 150', systemActor: 'backend' },
    
    { id: 'e_pb_dup', source: 'processing_b', target: 'duplicate_success', type: 'dashed', path: 'M 550 210 L 650 210', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_1', message: 'Order created', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'completed' },

    // Attempt A
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_a', message: 'First payment attempt starts', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_a', status: 'active', edgeId: 'e_create_pa' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_a', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_a', message: 'Provider confirms payment success', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'success_a', status: 'active', edgeId: 'e_pa_sa' },
    { type: 'STATE_TRANSITION', nodeId: 'success_a', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_a', message: 'Webhook delivery delayed/failing', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_delayed', status: 'active', edgeId: 'e_sa_wd' },
    
    // Attempt B (User Retries)
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_b', message: 'User retries payment', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_b', status: 'active', edgeId: 'e_create_pb' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_b', status: 'completed' },
    
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_b', message: 'Second payment processing begins', latency: 30 },
    { type: 'STATE_TRANSITION', nodeId: 'processing_b', status: 'active', edgeId: 'e_pb_procb' },

    // Delayed webhook arrives
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_a', message: 'Delayed webhook finally arrives', latency: 80 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_delayed', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_arrives', status: 'active', edgeId: 'e_wd_wa' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_arrives', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_a', message: 'Order marked paid from delayed webhook', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'active', edgeId: 'e_wa_paid' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'completed' },

    // Attempt B finishes but order is paid
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_b', message: 'Second payment completes but order is already paid. Invalidating.', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'processing_b', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'active', edgeId: 'e_pb_dup' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'completed' },
  ]
}
