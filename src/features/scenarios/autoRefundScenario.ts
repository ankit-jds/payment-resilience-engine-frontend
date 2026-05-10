import { ScenarioDefinition } from './types'

export const autoRefundScenario: ScenarioDefinition = {
  id: 'auto_refund',
  name: 'Automatic Refund Processing',
  description: 'A duplicate success triggers an automatic refund. The compensation pipeline safely returns funds to the user.',
  
  stateNodes: [
    { id: 'duplicate_success', label: 'DUPLICATE SUCCESS', sub: 'Detected', x: 50, y: 210, isWarning: true, systemActor: 'database' },
    { id: 'refund_queued', label: 'REFUND QUEUED', sub: 'Job Created', x: 250, y: 210, systemActor: 'workers' },
    { id: 'worker_picked', label: 'WORKER PICKED', sub: 'Execution', x: 450, y: 210, systemActor: 'workers' },
    { id: 'refund_processing', label: 'REFUND PROCESSING', sub: 'Gateway', x: 650, y: 210, systemActor: 'workers' },
    { id: 'refund_completed', label: 'REFUND COMPLETED', sub: 'Compensated', x: 850, y: 210, systemActor: 'database' },
  ],
  stateEdges: [
    { id: 'e_dup_queue', source: 'duplicate_success', target: 'refund_queued', type: 'solid', path: 'M 150 250 L 250 250', systemActor: 'backend' },
    { id: 'e_queue_pick', source: 'refund_queued', target: 'worker_picked', type: 'solid', path: 'M 350 250 L 450 250', systemActor: 'backend' },
    { id: 'e_pick_proc', source: 'worker_picked', target: 'refund_processing', type: 'solid', path: 'M 550 250 L 650 250', systemActor: 'backend' },
    { id: 'e_proc_comp', source: 'refund_processing', target: 'refund_completed', type: 'solid', path: 'M 750 250 L 850 250', systemActor: 'backend' },
  ],
  
  
  events: [
    { type: 'TIMELINE_EVENT', severity: 'WARN', traceId: 'trc_ref_1', message: 'Duplicate payment success detected', latency: 10 },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'active' },
    { type: 'STATE_TRANSITION', nodeId: 'duplicate_success', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_1', message: 'Creating refund compensation job', latency: 25 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'active', edgeId: 'e_dup_queue' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_queued', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'TRACE', traceId: 'trc_ref_1', message: 'Worker picks up refund job', latency: 40 },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'active', edgeId: 'e_queue_pick' },
    { type: 'STATE_TRANSITION', nodeId: 'worker_picked', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'INFO', traceId: 'trc_ref_1', message: 'Communicating with Provider Gateway for refund', latency: 120 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_processing', status: 'active', edgeId: 'e_pick_proc' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_processing', status: 'completed' },

    { type: 'TIMELINE_EVENT', severity: 'SUCCESS', traceId: 'trc_ref_1', message: 'Refund successfully finalized', latency: 15 },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'active', edgeId: 'e_proc_comp' },
    { type: 'STATE_TRANSITION', nodeId: 'refund_completed', status: 'completed' },
  ]
}
