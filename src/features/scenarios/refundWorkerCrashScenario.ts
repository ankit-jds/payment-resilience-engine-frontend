import { ScenarioDefinition } from './types'

export const refundWorkerCrashScenario: ScenarioDefinition = {
  id: 'refund_worker_crash',
  name: 'Refund Worker Crash Recovery',
  description: 'Worker crashes during refund execution. Job is safely requeued and picked up by a restored worker to complete the refund.',
  
  stateNodes: [
    { id: 'refund_queued', label: 'REFUND QUEUED', sub: 'Pending', x: 50, y: 110, systemActor: 'workers' },
    { id: 'worker_picked', label: 'WORKER PICKED', sub: 'Processing', x: 250, y: 110, systemActor: 'workers' },
    { id: 'worker_crashed', label: 'WORKER CRASHED', sub: 'Failed', x: 450, y: 110, isDanger: true, systemActor: 'workers' },
    { id: 'job_requeued', label: 'JOB REQUEUED', sub: 'Preserved', x: 650, y: 110, isWarning: true, systemActor: 'backend' },
    { id: 'worker_restarted', label: 'WORKER RESTORED', sub: 'Active', x: 450, y: 310, systemActor: 'workers' },
    { id: 'refund_completed', label: 'REFUND COMPLETED', sub: 'Compensated', x: 650, y: 310, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_queue_pick', source: 'refund_queued', target: 'worker_picked', type: 'solid', path: 'M 150 150 L 250 150', systemActor: 'backend' },
    { id: 'e_pick_crash', source: 'worker_picked', target: 'worker_crashed', type: 'solid', path: 'M 350 150 L 450 150', systemActor: 'backend' },
    { id: 'e_crash_req', source: 'worker_crashed', target: 'job_requeued', type: 'solid', path: 'M 550 150 L 650 150', systemActor: 'backend' },
    { id: 'e_req_rest', source: 'job_requeued', target: 'worker_restarted', type: 'dashed', path: 'M 700 190 L 500 310', systemActor: 'backend' },
    { id: 'e_rest_comp', source: 'worker_restarted', target: 'refund_completed', type: 'solid', path: 'M 550 350 L 650 350', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Refund job queued', latency: 5 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_ref_job', message: 'Worker Instance 1 picks job', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'active', edgeId: 'e_queue_pick' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_ref_job', message: 'Worker Instance 1 crashed unexpectedly (OOM)', latency: 50 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'active', edgeId: 'e_pick_crash' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_ref_job', message: 'Job lease expired. Requeuing job.', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'active', edgeId: 'e_crash_req' },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Worker Instance 2 restored and active. Picks up job.', latency: 45 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'active', edgeId: 'e_req_rest' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_ref_job', message: 'Refund successfully processed by new worker.', latency: 100 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'active', edgeId: 'e_rest_comp' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'completed' },
  ]
}
