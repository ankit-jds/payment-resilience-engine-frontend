import { ScenarioDefinition } from './types'

export const providerTimeoutScenario: ScenarioDefinition = {
  id: 'provider_timeout',
  name: 'Provider Timeout Retry',
  description: 'Provider times out. System verifies actual status before safely retrying with the same idempotency key.',
  stateNodes: [
    { id: 'payment_created', label: 'PAYMENT CREATED', sub: 'Intent', x: 50, y: 110 },
    { id: 'request_sent', label: 'REQUEST SENT', sub: 'Attempt 1', x: 250, y: 110 },
    { id: 'timeout', label: 'TIMEOUT', sub: 'No Response', x: 450, y: 110, isDanger: true },
    { id: 'status_check', label: 'STATUS CHECK', sub: 'Verify', x: 650, y: 110 },
    { id: 'retry_decision', label: 'RETRY DECISION', sub: 'Safe Retry', x: 450, y: 310, isWarning: true },
    { id: 'retry_sent', label: 'RETRY SENT', sub: 'Attempt 2', x: 650, y: 310 },
    { id: 'success', label: 'SUCCESS', sub: 'Confirmed', x: 850, y: 310 },
  ],
  stateEdges: [
    { id: 'e_create_sent', source: 'payment_created', target: 'request_sent', type: 'solid', path: 'M 150 150 L 250 150' },
    { id: 'e_sent_timeout', source: 'request_sent', target: 'timeout', type: 'solid', path: 'M 350 150 L 450 150' },
    { id: 'e_time_check', source: 'timeout', target: 'status_check', type: 'solid', path: 'M 550 150 L 650 150' },
    { id: 'e_check_dec', source: 'status_check', target: 'retry_decision', type: 'dashed', path: 'M 700 190 L 500 310' },
    { id: 'e_dec_retry', source: 'retry_decision', target: 'retry_sent', type: 'solid', path: 'M 550 350 L 650 350' },
    { id: 'e_retry_succ', source: 'retry_sent', target: 'success', type: 'solid', path: 'M 750 350 L 850 350' },
  ],
  requestNodes: [
    { id: 'frontend', label: 'Frontend', x: 50, y: 200 },
    { id: 'backend_api', label: 'Backend API', x: 350, y: 200, isPrimary: true },
    { id: 'gateway_sim', label: 'Provider Gateway', x: 650, y: 200 },
  ],
  requestEdges: [
    { id: 're_1', source: 'frontend', target: 'backend_api', x1: 220, y1: 240, x2: 350, y2: 240 },
    { id: 're_2', source: 'backend_api', target: 'gateway_sim', x1: 520, y1: 240, x2: 650, y2: 240 },
  ],
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_to_1', message: 'Payment intent created', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'active', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_to_1', message: 'Forwarding request to Provider Gateway', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'request_sent', status: 'active', edgeId: 'e_create_sent', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'request_sent', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_to_1', message: 'Provider Gateway connection timed out (30s)', latency: 500 },
    { type: 'STATE_TRANSITION', nodeId: 'timeout', status: 'active', edgeId: 'e_sent_timeout', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'timeout', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_to_1', message: 'Verifying actual status before blindly retrying', latency: 80 },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'active', edgeId: 'e_time_check', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_to_1', message: 'Provider reports payment NOT processed. Safe to retry.', latency: 40 },
    { type: 'STATE_TRANSITION', nodeId: 'retry_decision', status: 'active', edgeId: 'e_check_dec', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'retry_decision', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_to_1', message: 'Retrying payment with SAME idempotency key', latency: 25 },
    { type: 'STATE_TRANSITION', nodeId: 'retry_sent', status: 'active', edgeId: 'e_dec_retry', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'retry_sent', status: 'completed', metadata: { paymentId: 'pay_to_1' } },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_to_1', message: 'Retry succeeded. Payment confirmed.', latency: 150 },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'active', edgeId: 'e_retry_succ', metadata: { paymentId: 'pay_to_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'completed', metadata: { paymentId: 'pay_to_1' } },
  ]
}
