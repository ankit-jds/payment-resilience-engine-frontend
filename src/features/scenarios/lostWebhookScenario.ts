import { ScenarioDefinition } from './types'

export const lostWebhookScenario: ScenarioDefinition = {
  id: 'lost_webhook',
  name: 'Lost Webhook Recovery',
  description: 'Webhook is permanently lost. Internal state remains stuck until a reconciliation worker recovers the true state from the provider.',
  
  stateNodes: [
    { id: 'payment_created', label: 'PAYMENT CREATED', sub: 'Pending', x: 50, y: 110, systemActor: 'backend' },
    { id: 'provider_success', label: 'PROVIDER SUCCESS', sub: 'Confirmed', x: 250, y: 110, systemActor: 'database' },
    { id: 'webhook_dropped', label: 'WEBHOOK DROPPED', sub: 'Lost', x: 450, y: 110, isDanger: true, systemActor: 'webhooks' },
    { id: 'payment_stuck', label: 'STUCK PENDING', sub: 'Orphaned', x: 650, y: 110, isWarning: true, systemActor: 'backend' },
    { id: 'recon_scan', label: 'RECONCILIATION', sub: 'Worker', x: 250, y: 310, systemActor: 'workers' },
    { id: 'status_check', label: 'STATUS CHECK', sub: 'API Sync', x: 450, y: 310, systemActor: 'backend' },
    { id: 'recovered', label: 'RECOVERED', sub: 'Healed', x: 650, y: 310, systemActor: 'backend' },
    { id: 'order_paid', label: 'ORDER PAID', sub: 'Final', x: 850, y: 210, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_create_succ', source: 'payment_created', target: 'provider_success', type: 'solid', path: 'M 150 150 L 250 150', systemActor: 'backend' },
    { id: 'e_succ_drop', source: 'provider_success', target: 'webhook_dropped', type: 'solid', path: 'M 350 150 L 450 150', systemActor: 'backend' },
    { id: 'e_drop_stuck', source: 'webhook_dropped', target: 'payment_stuck', type: 'solid', path: 'M 550 150 L 650 150', systemActor: 'backend' },
    { id: 'e_stuck_recon', source: 'payment_stuck', target: 'recon_scan', type: 'dashed', path: 'M 700 190 L 300 310', systemActor: 'workers' },
    { id: 'e_recon_check', source: 'recon_scan', target: 'status_check', type: 'solid', path: 'M 350 350 L 450 350', systemActor: 'backend' },
    { id: 'e_check_recov', source: 'status_check', target: 'recovered', type: 'solid', path: 'M 550 350 L 650 350', systemActor: 'backend' },
    { id: 'e_recov_paid', source: 'recovered', target: 'order_paid', type: 'solid', path: 'M 750 350 L 850 250', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_1', message: 'Payment created and sent to provider', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_1', message: 'Provider processes payment successfully', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'provider_success', status: 'active', edgeId: 'e_create_succ' },
    { type: 'STATE_TRANSITION', nodeId: 'provider_success', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_1', message: 'Webhook delivery failed permanently (e.g. 500s)', latency: 200 },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_dropped', status: 'active', edgeId: 'e_succ_drop' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_dropped', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_1', message: 'Internal state remains STUCK PENDING', latency: 100 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_stuck', status: 'active', edgeId: 'e_drop_stuck' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_stuck', status: 'completed' },

    // Reconciliation kicks in
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_recon', message: 'Scheduled reconciliation worker begins scan', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'recon_scan', status: 'active', edgeId: 'e_stuck_recon' },
    { type: 'STATE_TRANSITION', nodeId: 'recon_scan', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_recon', message: 'Checking true status from Provider API', latency: 60 },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'active', edgeId: 'e_recon_check' },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_recon', message: 'Discovered missing SUCCESS state. Healing internal state.', latency: 30 },
    { type: 'STATE_TRANSITION', nodeId: 'recovered', status: 'active', edgeId: 'e_check_recov' },
    { type: 'STATE_TRANSITION', nodeId: 'recovered', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_recon', message: 'Order accurately marked as PAID', latency: 20 },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'active', edgeId: 'e_recov_paid' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'completed' },
  ]
}
