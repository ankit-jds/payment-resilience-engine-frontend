import { useEventStore } from '@/stores/eventStore'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'



export function StateMachineView() {
  const { events } = useEventStore()
  
  // Very simplistic state derivation based on the mock events
  // Very simplistic state derivation based on the mock events
  const state = {
    created: events.length > 0 ? 'success' : 'idle',
    processing: events.length > 1 ? (events.length >= 6 ? 'success' : 'active') : 'idle',
    duplicate: events.length >= 4 ? 'warning' : 'idle',
    refundQueued: events.length >= 6 ? 'active' : 'idle', // just an example mock path
    refunded: events.length >= 7 ? 'success' : 'idle',
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white tracking-wide">State Transition Graph</h2>
        <p className="text-xs font-mono text-neutral mt-1">Trace-ID: x-992-abc-44 | Conflict Mode: Active</p>
      </div>

      <div className="flex-1 border border-surface/50 rounded-lg bg-background/50 relative overflow-hidden flex items-center justify-center">
        {/* Graph Container */}
        <div className="relative w-[800px] h-[500px]">
          
          {/* Edges using SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#797676" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
              </marker>
              <marker id="arrow-warning" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-danger" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>
            
            {/* Created -> Processing */}
            <line x1="160" y1="250" x2="250" y2="250" stroke="#797676" strokeWidth="2" markerEnd="url(#arrow)" />
            {state.created !== 'idle' && (
              <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="160" y1="250" x2="250" y2="250" stroke="#3B82F6" strokeWidth="2" />
            )}

            {/* Processing -> Success */}
            <path d="M 390 230 L 520 180" stroke="#797676" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

            {/* Processing -> Duplicate Success */}
            <path d="M 390 270 Q 450 350 520 320" stroke="#797676" strokeWidth="2" strokeDasharray="4 4" fill="none" markerEnd="url(#arrow)" />
            {state.duplicate !== 'idle' && (
              <motion.path d="M 390 270 Q 450 350 520 320" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            )}

            {/* Duplicate Success -> Refund Queued */}
            <path d="M 660 320 Q 720 370 660 410" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" fill="none" markerEnd="url(#arrow-warning)" />

            {/* Refund Queued -> Refunded */}
            <line x1="520" y1="410" x2="430" y2="410" stroke="#797676" strokeWidth="2" markerEnd="url(#arrow)" />
          </svg>

          {/* Nodes */}
          <StateNode label="CREATED" sub="t=0ms" x={20} y={210} status={state.created} />
          <StateNode label="PROCESSING" sub="Retries: 2" x={250} y={210} status={state.processing} />
          <StateNode label="SUCCESS" sub="idempotency_key" x={520} y={140} status="idle" />
          <StateNode label="DUPLICATE_SUCCESS" sub="Conflict Detected" x={520} y={280} status={state.duplicate} isWarning />
          <StateNode label="REFUND_QUEUED" sub="Compensating Tx" x={520} y={370} status={state.refundQueued} isDanger />
          <StateNode label="REFUNDED" sub="State Settled" x={290} y={370} status={state.refunded} />
        </div>

        {/* Live Stream Overlay */}
        <div className="absolute bottom-0 right-0 w-96 border-t border-l border-surface/50 bg-background/80 backdrop-blur rounded-tl-lg overflow-hidden flex flex-col h-48">
          <div className="px-3 py-1.5 border-b border-surface/50 text-[10px] uppercase font-bold text-neutral flex justify-between">
            Event Stream
            <span>...</span>
          </div>
          <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto scrollbar-thin flex flex-col justify-end">
            {events.map(e => (
              <div key={e.id} className="mb-1">
                <span className="text-neutral-500">[{e.timestamp}]</span>{' '}
                <span className={e.severity === 'ERROR' ? 'text-danger' : e.severity === 'WARN' ? 'text-warning' : 'text-neutral-300'}>
                  {e.severity}: {e.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StateNode({ label, sub, x, y, status, isWarning, isDanger }: { label: string, sub: string, x: number, y: number, status: string, isWarning?: boolean, isDanger?: boolean }) {
  const isActive = status !== 'idle'
  
  let borderColor = 'border-surface/80'
  if (isActive) {
    if (isDanger) borderColor = 'border-danger/80 text-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]'
    else if (isWarning) borderColor = 'border-warning/80 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    else borderColor = 'border-secondary shadow-[0_0_15px_rgba(59,130,246,0.2)]'
  }

  return (
    <div 
      className={clsx(
        "absolute w-[140px] p-3 rounded flex flex-col items-center justify-center text-center transition-all duration-300 bg-surface/30 backdrop-blur",
        borderColor,
        "border"
      )}
      style={{ left: x, top: y }}
    >
      <div className={clsx("text-[10px] font-bold mb-1", isActive ? 'text-white' : 'text-neutral-300')}>{label}</div>
      <div className="text-[10px] font-mono text-neutral-400">{sub}</div>
    </div>
  )
}
