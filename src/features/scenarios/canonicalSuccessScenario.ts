import { ScenarioDefinition } from './types'

export const canonicalSuccessScenario: ScenarioDefinition = {
  id: 'canonical_success',
  name: 'Canonical Success Winner',
  stateNodes: [
    { id: 'order_created', label: 'ORDER CREATED', sub: 't=0ms', x: 80, y: 315, systemActor: 'database' },
    { id: 'payment_attempt', label: 'PAYMENT ATTEMPT', sub: 'Intent', x: 400, y: 315, systemActor: 'backend' },
    { id: 'processing', label: 'PROCESSING', sub: 'Gateway', x: 720, y: 315, systemActor: 'backend' },
    { id: 'success', label: 'SUCCESS', sub: 'Provider', x: 1040, y: 165, systemActor: 'database' },
    { id: 'order_paid', label: 'ORDER PAID', sub: 'Locked', x: 1360, y: 165, systemActor: 'database' },
    { id: 'duplicate_success', label: 'DUPLICATE SUCCESS', sub: 'Conflict', x: 1040, y: 465, isWarning: true, systemActor: 'database' },
    { id: 'refund_queued', label: 'REFUND QUEUED', sub: 'Compensation', x: 1360, y: 465, isDanger: true, systemActor: 'workers' },
  ],
  stateEdges: [
    { id: 'e_create_att', source: 'order_created', target: 'payment_attempt', type: 'solid', label: 'initiate', path: 'M 150 250 L 250 250', systemActor: 'backend' },
    { id: 'e_att_proc', source: 'payment_attempt', target: 'processing', type: 'solid', label: 'route', path: 'M 350 250 L 450 250', systemActor: 'backend' },
    { id: 'e_proc_succ', source: 'processing', target: 'success', type: 'solid', label: 'provider OK', path: 'M 500 210 L 650 150', systemActor: 'backend' },
    { id: 'e_succ_paid', source: 'success', target: 'order_paid', type: 'solid', label: 'mark paid', path: 'M 750 150 L 850 150', systemActor: 'backend' },
    { id: 'e_proc_dup', source: 'processing', target: 'duplicate_success', type: 'dashed', label: 'already paid', path: 'M 500 290 L 650 350', systemActor: 'backend' },
    { id: 'e_dup_ref', source: 'duplicate_success', target: 'refund_queued', type: 'solid', label: 'auto refund', path: 'M 750 350 L 850 350', systemActor: 'backend' },
  ],
  
  problem: 'Multiple successful payment attempts arrive for the same order.',
  risk: 'Customer is charged multiple times for one order.',
  protection: 'First success wins. Subsequent successes are automatically refunded.',
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_301', message: 'Order created', latency: 15, metadata: { orderId: 'ord_123' } },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'order_created', status: 'completed' },

    // Attempt 1
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_302', message: 'Payment 1 starts', latency: 23, metadata: { paymentId: 'pay_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_attempt', status: 'active', edgeId: 'e_create_att' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_attempt', status: 'completed' },
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_302', message: 'Gateway processing begins', latency: 68, metadata: { paymentId: 'pay_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'processing', status: 'active', edgeId: 'e_att_proc' },
    { type: 'STATE_TRANSITION', nodeId: 'processing', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'active', edgeId: 'e_proc_succ' },
    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_302', message: 'Provider confirms payment. Order is paid.', latency: 180, metadata: { paymentId: 'pay_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'active', edgeId: 'e_succ_paid' },
    { type: 'STATE_TRANSITION', nodeId: 'order_paid', status: 'completed' },

    // Attempt 2
    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_303', message: 'Second payment starts', latency: 15, metadata: { paymentId: 'pay_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_attempt', status: 'active', edgeId: 'e_create_att' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_attempt', status: 'completed' },
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_303', message: 'Gateway processing begins', latency: 60, metadata: { paymentId: 'pay_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'processing', status: 'active', edgeId: 'e_att_proc' },
    { type: 'STATE_TRANSITION', nodeId: 'processing', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'active', edgeId: 'e_proc_dup' },
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_303', message: 'Provider success, but order already paid. Duplicate.', latency: 128, metadata: { paymentId: 'pay_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'completed' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'active', edgeId: 'e_dup_ref' },
    { type: 'TIMELINE_EVENT', severity: 'RECOVERY', traceId: 'trc_303', message: 'Queuing refund for duplicate success.', latency: 23, metadata: { paymentId: 'pay_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'completed' }
  ]
}
