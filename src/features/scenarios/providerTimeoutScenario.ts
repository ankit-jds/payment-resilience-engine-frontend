import { ScenarioDefinition } from './types'

export const providerTimeoutScenario: ScenarioDefinition = {
  id: 'provider_timeout',
  name: 'Provider Timeout Retry',
  problem: 'Payment provider gateway times out during a request.',
  risk: 'Blindly retrying could cause a double charge if the first request actually succeeded but the response was lost.',
  protection: 'System verifies actual status before safely retrying with the same idempotency key.',
  
  stateNodes: [
    { id: 'payment_created', label: 'PAYMENT CREATED', sub: 'Intent', x: 80, y: 165, systemActor: 'backend' },
    { id: 'request_sent', label: 'REQUEST SENT', sub: 'Attempt 1', x: 400, y: 165, systemActor: 'backend' },
    { id: 'timeout', label: 'TIMEOUT', sub: 'No Response', x: 720, y: 165, isDanger: true, systemActor: 'gateway' },
    { id: 'status_check', label: 'STATUS CHECK', sub: 'Verify', x: 1040, y: 165, systemActor: 'backend' },
    { id: 'retry_decision', label: 'RETRY DECISION', sub: 'Safe Retry', x: 720, y: 465, isWarning: true, systemActor: 'backend' },
    { id: 'retry_sent', label: 'RETRY SENT', sub: 'Attempt 2', x: 1040, y: 465, systemActor: 'backend' },
    { id: 'success', label: 'SUCCESS', sub: 'Confirmed', x: 1360, y: 465, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_create_sent', source: 'payment_created', target: 'request_sent', type: 'solid', label: 'send', path: 'M 150 150 L 250 150', systemActor: 'backend' },
    { id: 'e_sent_timeout', source: 'request_sent', target: 'timeout', type: 'solid', label: 'timeout', path: 'M 350 150 L 450 150', systemActor: 'gateway' },
    { id: 'e_time_check', source: 'timeout', target: 'status_check', type: 'solid', label: 'verify', path: 'M 550 150 L 650 150', systemActor: 'backend' },
    { id: 'e_check_dec', source: 'status_check', target: 'retry_decision', type: 'dashed', label: 'evaluate', path: 'M 700 190 L 500 310', systemActor: 'backend' },
    { id: 'e_dec_retry', source: 'retry_decision', target: 'retry_sent', type: 'solid', label: 'retry', path: 'M 550 350 L 650 350', systemActor: 'backend' },
    { id: 'e_retry_succ', source: 'retry_sent', target: 'success', type: 'solid', label: 'confirm', path: 'M 750 350 L 850 350', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_to_1', message: 'Payment intent created', latency: 23, metadata: { intentId: 'pi_555' } },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'payment_created', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_to_1', message: 'Forwarding request to Provider Gateway', latency: 68, metadata: { attempt: 1 } },
    { type: 'STATE_TRANSITION', nodeId: 'request_sent', status: 'active', edgeId: 'e_create_sent' },
    { type: 'STATE_TRANSITION', nodeId: 'request_sent', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_to_1', message: 'Provider Gateway connection timed out (30s)', latency: 750, metadata: { error: 'ECONNRESET' } },
    { type: 'STATE_TRANSITION', nodeId: 'timeout', status: 'active', edgeId: 'e_sent_timeout' },
    { type: 'STATE_TRANSITION', nodeId: 'timeout', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_to_1', message: 'Verifying actual status before blindly retrying', latency: 120, metadata: { action: 'verify_status' } },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'active', edgeId: 'e_time_check' },
    { type: 'STATE_TRANSITION', nodeId: 'status_check', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_to_1', message: 'Provider reports payment NOT processed. Safe to retry.', latency: 60, metadata: { providerStatus: 'not_found' } },
    { type: 'STATE_TRANSITION', nodeId: 'retry_decision', status: 'active', edgeId: 'e_check_dec' },
    { type: 'STATE_TRANSITION', nodeId: 'retry_decision', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_to_1', message: 'Retrying payment with SAME idempotency key', latency: 38, metadata: { attempt: 2, idemKey: 'idem_999' } },
    { type: 'STATE_TRANSITION', nodeId: 'retry_sent', status: 'active', edgeId: 'e_dec_retry' },
    { type: 'STATE_TRANSITION', nodeId: 'retry_sent', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_to_1', message: 'Retry succeeded. Payment confirmed.', latency: 225, metadata: { status: 'succeeded' } },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'active', edgeId: 'e_retry_succ' },
    { type: 'STATE_TRANSITION', nodeId: 'success', status: 'completed' },
  ]
}
