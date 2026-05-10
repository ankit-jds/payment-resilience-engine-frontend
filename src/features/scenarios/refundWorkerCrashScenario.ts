import { ScenarioDefinition } from './types'

export const refundWorkerCrashScenario: ScenarioDefinition = {
  id: 'refund_worker_crash',
  name: 'Refund Worker Crash Recovery',
  problem: 'Worker node crashes due to out-of-memory error while processing a refund.',
  risk: 'Customer refund is dropped and never processed.',
  protection: 'Jobs are leased. If a worker dies, the lease expires and the job is requeued safely for another worker.',
  
  stateNodes: [
    { id: 'refund_queued', label: 'REFUND QUEUED', sub: 'Pending', x: 80, y: 165, systemActor: 'workers' },
    { id: 'worker_picked', label: 'WORKER PICKED', sub: 'Processing', x: 400, y: 165, systemActor: 'workers' },
    { id: 'worker_crashed', label: 'WORKER CRASHED', sub: 'Failed', x: 720, y: 165, isDanger: true, systemActor: 'workers' },
    { id: 'job_requeued', label: 'JOB REQUEUED', sub: 'Preserved', x: 1040, y: 165, isWarning: true, systemActor: 'backend' },
    { id: 'worker_restarted', label: 'WORKER RESTORED', sub: 'Active', x: 720, y: 465, systemActor: 'workers' },
    { id: 'refund_completed', label: 'REFUND COMPLETED', sub: 'Compensated', x: 1040, y: 465, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_queue_pick', source: 'refund_queued', target: 'worker_picked', type: 'solid', label: 'lease job', path: 'M 150 150 L 250 150', systemActor: 'backend' },
    { id: 'e_pick_crash', source: 'worker_picked', target: 'worker_crashed', type: 'solid', label: 'OOM', path: 'M 350 150 L 450 150', systemActor: 'backend' },
    { id: 'e_crash_req', source: 'worker_crashed', target: 'job_requeued', type: 'solid', label: 'expire lease', path: 'M 550 150 L 650 150', systemActor: 'backend' },
    { id: 'e_req_rest', source: 'job_requeued', target: 'worker_restarted', type: 'dashed', label: 're-lease', path: 'M 700 190 L 500 310', systemActor: 'backend' },
    { id: 'e_rest_comp', source: 'worker_restarted', target: 'refund_completed', type: 'solid', label: 'complete', path: 'M 550 350 L 650 350', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Refund job queued', latency: 8, metadata: { jobId: 'job_ref_02' } },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_ref_job', message: 'Worker Instance 1 picks job', latency: 23, metadata: { workerId: 'wrk_1' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'active', edgeId: 'e_queue_pick' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'ERROR', traceId: 'trc_ref_job', message: 'Worker Instance 1 crashed unexpectedly (OOM)', latency: 75, metadata: { error: 'OOM' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'active', edgeId: 'e_pick_crash' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_crashed', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_ref_job', message: 'Job lease expired. Requeuing job.', latency: 180, metadata: { lease: 'expired' } },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'active', edgeId: 'e_crash_req' },
    { type: 'STATE_TRANSITION', nodeId: 'job_requeued', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_job', message: 'Worker Instance 2 restored and active. Picks up job.', latency: 68, metadata: { workerId: 'wrk_2' } },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'active', edgeId: 'e_req_rest' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_restarted', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_ref_job', message: 'Refund successfully processed by new worker.', latency: 150, metadata: { status: 'refunded' } },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'active', edgeId: 'e_rest_comp' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'completed' },
  ]
}
