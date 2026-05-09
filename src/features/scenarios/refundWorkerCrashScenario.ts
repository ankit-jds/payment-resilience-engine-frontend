import { ScenarioDefinition } from './types'

export const refundWorkerCrashScenario: ScenarioDefinition = {
  id: 'refund_worker_crash',
  name: 'Refund Worker Crash Recovery',
  description: 'Worker crashes during refund execution. Job is safely requeued and picked up by a restored worker to complete the refund.',
  stateNodes: [
    { id: 'refund_queued', label: 'REFUND QUEUED', sub: 'Pending', x: 50, y: 110 },
    { id: 'worker_picked', label: 'WORKER PICKED', sub: 'Processing', x: 250, y: 110 },
    { id: 'worker_crashed', label: 'WORKER CRASHED', sub: 'Failed', x: 450, y: 110, isDanger: true },
    { id: 'job_requeued', label: 'JOB REQUEUED', sub: 'Preserved', x: 650, y: 110, isWarning: true },
    { id: 'worker_restarted', label: 'WORKER RESTORED', sub: 'Active', x: 450, y: 310 },
    { id: 'refund_completed', label: 'REFUND COMPLETED', sub: 'Compensated', x: 650, y: 310 },
  ],
  stateEdges: [
    { id: 'e_queue_pick', source: 'refund_queued', target: 'worker_picked', type: 'solid', path: 'M 150 150 L 250 150' },
    { id: 'e_pick_crash', source: 'worker_picked', target: 'worker_crashed', type: 'solid', path: 'M 350 150 L 450 150' },
    { id: 'e_crash_req', source: 'worker_crashed', target: 'job_requeued', type: 'solid', path: 'M 550 150 L 650 150' },
    { id: 'e_req_rest', source: 'job_requeued', target: 'worker_restarted', type: 'dashed', path: 'M 700 190 L 500 310' },
    { id: 'e_rest_comp', source: 'worker_restarted', target: 'refund_completed', type: 'solid', path: 'M 550 350 L 650 350' },
  ],
  requestNodes: [
    { id: 'job_queue', label: 'Job Queue', x: 50, y: 200 },
    { id: 'worker_instance_1', label: 'Worker Instance 1', x: 350, y: 100, isPrimary: true },
    { id: 'worker_instance_2', label: 'Worker Instance 2', x: 350, y: 300, isPrimary: true },
    { id: 'gateway_sim', label: 'Provider Gateway', x: 650, y: 200 },
  ],
  requestEdges: [
    { id: 're_1', source: 'job_queue', target: 'worker_instance_1', x1: 220, y1: 240, x2: 350, y2: 140 },
    { id: 're_2', source: 'job_queue', target: 'worker_instance_2', x1: 220, y1: 240, x2: 350, y2: 340 },
    { id: 're_3', source: 'worker_instance_2', target: 'gateway_sim', x1: 520, y1: 340, x2: 650, y2: 240 },
  ],
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Refund job queued', latency: 5 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'active', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'completed', metadata: { refundId: 'ref_job_1' } },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_ref_job', message: 'Worker Instance 1 picks job', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'active', edgeId: 'e_queue_pick', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'completed', metadata: { refundId: 'ref_job_1' } },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_ref_job', message: 'Worker Instance 1 crashed unexpectedly (OOM)', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'active', edgeId: 'e_pick_crash', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'completed', metadata: { refundId: 'ref_job_1' } },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_ref_job', message: 'Job lease expired. Requeuing job.', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'active', edgeId: 'e_crash_req', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'completed', metadata: { refundId: 'ref_job_1' } },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Worker Instance 2 restored and active. Picks up job.', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'active', edgeId: 'e_req_rest', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'completed', metadata: { refundId: 'ref_job_1' } },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_ref_job', message: 'Refund successfully processed by new worker.', latency: 100 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'active', edgeId: 'e_rest_comp', metadata: { refundId: 'ref_job_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'completed', metadata: { refundId: 'ref_job_1' } },
  ]
}
