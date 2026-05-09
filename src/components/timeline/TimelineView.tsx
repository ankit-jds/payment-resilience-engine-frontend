import { useEventStore, EventSeverity } from '@/stores/eventStore'
import { useSimulationStore } from '@/stores/simulationStore'
import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { getScenario } from '@/features/scenarios/scenarioRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { Filter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const severityColors: Record<EventSeverity, string> = {
  INFO: 'text-neutral-300',
  WARN: 'text-warning bg-warning/10',
  ERROR: 'text-danger bg-danger/10',
  SUCCESS: 'text-success bg-success/10',
  RECOVERY: 'text-recovery bg-recovery/10',
  TRACE: 'text-neutral-400',
}

export function TimelineView() {
  const { events } = useEventStore()
  const { activeScenarioId } = useSimulationStore()
  const { simulationStatus } = useRuntimeStore()
  const scenario = getScenario(activeScenarioId)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Smart auto-scroll logic
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20
    setAutoScroll(isBottom)
  }

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [events, autoScroll])

  return (
    <div className="h-full flex flex-col">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-neutral px-2 py-0.5 border border-surface rounded bg-surface/50">
              SCENARIO: ACTIVE
            </span>
            <div className={clsx(
              "flex items-center gap-1.5 text-xs font-mono",
              simulationStatus === 'Running' ? "text-secondary" : "text-neutral"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full",
                simulationStatus === 'Running' ? "bg-secondary animate-pulse" : "bg-neutral-600"
              )} />
              {simulationStatus === 'Running' ? 'Streaming Live' : 'Idle'}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">{scenario.name}</h1>
          <p className="text-sm font-mono text-neutral mt-1">
            Monitoring idempotency keys and race conditions during high-concurrency payment retries.
          </p>
        </div>

        <div className="flex items-center gap-2 relative w-72">
          <Filter className="w-4 h-4 text-neutral absolute left-3" />
          <input 
            type="text" 
            placeholder="Filter by trc_id, status, or keyword..." 
            className="w-full bg-background border border-surface rounded-md pl-9 pr-3 py-1.5 text-sm font-mono text-neutral-200 placeholder-neutral/50 focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
      </div>

      {/* Table container */}
      <div className="flex-1 border border-surface/50 rounded-lg overflow-hidden flex flex-col bg-background/80 backdrop-blur relative">
        <div className="grid grid-cols-[120px_100px_140px_1fr_80px] gap-4 px-4 py-3 border-b border-surface/50 text-[10px] font-bold text-neutral uppercase tracking-wider">
          <div>Timestamp</div>
          <div>Severity</div>
          <div>Trace ID</div>
          <div>Message / Payload</div>
          <div className="text-right">Latency</div>
        </div>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin relative"
        >
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "grid grid-cols-[120px_100px_140px_1fr_80px] gap-4 px-4 py-2.5 text-[13px] font-mono border-b border-surface/30 hover:bg-surface/30 transition-colors",
                  event.severity === 'WARN' && 'bg-warning/5 border-l-2 border-l-warning',
                  event.severity === 'ERROR' && 'bg-danger/5 border-l-2 border-l-danger',
                  event.severity === 'RECOVERY' && 'bg-recovery/5 border-l-2 border-l-recovery',
                  event.severity === 'SUCCESS' && 'bg-success/5 border-l-2 border-l-success'
                )}
              >
                <div className="text-neutral-400">{event.timestamp}</div>
                <div className={clsx("font-semibold", severityColors[event.severity])}>
                  {event.severity}
                </div>
                <div className="text-neutral-300">{event.traceId}</div>
                <div className="text-neutral-200 truncate pr-4">{event.message}</div>
                <div className="text-right text-neutral-400">{event.latency ? `${event.latency}ms` : '-'}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div ref={bottomRef} className="h-1" />

          {events.length === 0 && (
            <div className="h-32 flex items-center justify-center text-sm font-mono text-neutral/50 italic">
              Waiting for events to stream...
            </div>
          )}
        </div>
        
        {!autoScroll && events.length > 0 && (
          <button 
            onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-surface/80 text-white px-3 py-1 rounded-full text-xs font-mono shadow-lg hover:bg-surface/80 transition-colors"
          >
            ↓ Scroll to bottom
          </button>
        )}
      </div>
    </div>
  )
}

