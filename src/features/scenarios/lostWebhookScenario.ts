import { ScenarioDefinition } from './types'

export const lostWebhookScenario: ScenarioDefinition = {
  id: 'lost_webhook',
  name: 'Lost Webhook Recovery',
  problem: 'Webhook is dropped by the network and permanently lost.',
  risk: 'Customer paid, but order is never fulfilled.',
  protection: 'Background reconciliation worker periodically sweeps pending orders and syncs state from the provider API.',
  
  stateNodes: [
    { id: 'payment_created', label: 'PAYMENT CREATED', sub: 'Pending', x: 80, y: 165, systemActor: 'backend' },
    { id: 'provider_success', label: 'PROVIDER SUCCESS', sub: 'Confirmed', x: 400, y: 165, systemActor: 'database' },
    { id: 'webhook_dropped', label: 'WEBHOOK DROPPED', sub: 'Lost', x: 720, y: 165, isDanger: true, systemActor: 'webhooks' },
    { id: 'payment_stuck', label: 'STUCK PENDING', sub: 'Orphaned', x: 1040, y: 165, isWarning: true, systemActor: 'backend' },
    { id: 'recon_scan', label: 'RECONCILIATION', sub: 'Worker', x: 400, y: 465, systemActor: 'workers' },
    { id: 'status_check', label: 'STATUS CHECK', sub: 'API Sync', x: 720, y: 465, systemActor: 'backend' },
    { id: 'recovered', label: 'RECOVERED', sub: 'Healed', x: 1040, y: 465, systemActor: 'backend' },
    { id: 'order_paid', label: 'ORDER PAID', sub: 'Final', x: 1360, y: 315, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_create_succ', source: 'payment_created', target: 'provider_success', type: 'solid', label: 'redirect', path: 'M 150 150 L 250 150', systemActor: 'backend' },
    { id: 'e_succ_drop', source: 'provider_success', target: 'webhook_dropped', type: 'solid', label: 'send', path: 'M 350 150 L 450 150', systemActor: 'backend' },
    { id: 'e_drop_stuck', source: 'webhook_dropped', target: 'payment_stuck', type: 'solid', label: 'timeout', path: 'M 550 150 L 650 150', systemActor: 'backend' },
    { id: 'e_stuck_recon', source: 'payment_stuck', target: 'recon_scan', type: 'dashed', label: 'sweep', path: 'M 700 190 L 300 310', systemActor: 'workers' },
    { id: 'e_recon_check', source: 'recon_scan', target: 'status_check', type: 'solid', label: 'fetch API', path: 'M 350 350 L 450 350', systemActor: 'backend' },
    { id: 'e_check_recov', source: 'status_check', target: 'recovered', type: 'solid', label: 'detect diff', path: 'M 550 350 L 650 350', systemActor: 'backend' },
    { id: 'e_recov_paid', source: 'recovered', target: 'order_paid', type: 'solid', label: 'mark paid', path: 'M 750 350 L 850 250', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_1', message: 'Payment created and sent to provider', latency: 15, metadata: { paymentId: 'pay_99' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_1', message: 'Provider processes payment successfully', latency: 68, metadata: { status: 'succeeded' } },
    { type: 'STATE_TRANSITION', nodeId: 'provider_success', status: 'active', edgeId: 'e_create_succ' },
    { type: 'STATE_TRANSITION', nodeId: 'provider_success', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_1', message: 'Webhook delivery failed permanently (e.g. 500s)', latency: 300, metadata: { error: 'Network timeout' } },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_dropped', status: 'active', edgeId: 'e_succ_drop' },
    { type: 'STATE_TRANSITION', nodeId: 'webhook_dropped', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_1', message: 'Internal state remains STUCK PENDING', latency: 150, metadata: { state: 'pending' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_stuck', status: 'active', edgeId: 'e_drop_stuck' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_stuck', status: 'completed' },

    // Reconciliation kicks in
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_recon', message: 'Scheduled reconciliation worker begins scan', latency: 75, metadata: { workerId: 'wrk_01' } },
    { type: 'STATE_TRANSITION', nodeId: 'recon_scan', status: 'active', edgeId: 'e_stuck_recon' },
    { type: 'STATE_TRANSITION', nodeId: 'recon_scan', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_recon', message: 'Checking true status from Provider API', latency: 90, metadata: { paymentId: 'pay_99' } },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'active', edgeId: 'e_recon_check' },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_recon', message: 'Discovered missing SUCCESS state. Healing internal state.', latency: 45, metadata: { action: 'heal_state' } },
    { type: 'STATE_TRANSITION', nodeId: 'recovered', status: 'active', edgeId: 'e_check_recov' },
    { type: 'STATE_TRANSITION', nodeId: 'recovered', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_recon', message: 'Order accurately marked as PAID', latency: 30, metadata: { orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'active', edgeId: 'e_recov_paid' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'completed' },
  ]
}
