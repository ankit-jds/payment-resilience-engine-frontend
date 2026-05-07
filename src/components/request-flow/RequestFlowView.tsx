import { useEventStore } from '@/stores/eventStore'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export function RequestFlowView() {
  const { events } = useEventStore()

  const isActive = events.length > 0

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 rounded-lg relative overflow-hidden flex items-center justify-center">

        {/* Graph Container */}
        <div className="relative w-[1000px] h-[600px]">

          {/* Service Nodes */}
          <ServiceNode
            label="Frontend"
            metric="4.2k req/s"
            subMetric="Ingress Active"
            x={50} y={200}
            active={isActive}
            latency="12ms"
          />

          <ServiceNode
            label="Backend API"
            metric="4.2k/s"
            subMetric="0.02%"
            subMetricLabel="ERROR RATE"
            x={350} y={200}
            active={isActive}
            latency="8ms"
            isPrimary
          />

          <ServiceNode
            label="Gateway Sim"
            metric="0 req/s"
            subMetric="Idle"
            x={650} y={50}
            active={false}
          />

          <ServiceNode
            label="Webhook Proc"
            metric="1.8k req/s"
            subMetric="Queue: 42 items"
            x={650} y={200}
            active={isActive}
            latency="2ms"
            isBlue
          />

          <ServiceNode
            label="Recon Worker"
            metric="45 batches/m"
            subMetric="Lag: 2.1s"
            x={650} y={350}
            active={events.length > 5}
          />

          {/* Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[-1]">
            <line x1="220" y1="240" x2="350" y2="240" stroke="#797676" strokeWidth="1" />
            <line x1="520" y1="240" x2="650" y2="240" stroke="#797676" strokeWidth="1" />
            <line x1="520" y1="240" x2="650" y2="90" stroke="#797676" strokeWidth="1" />
            <line x1="520" y1="240" x2="650" y2="390" stroke="#797676" strokeWidth="1" />

            {/* Active flow pulses */}
            {isActive && (
              <motion.circle r="3" fill="#3B82F6" initial={{ x: 220, y: 240 }} animate={{ x: 350, y: 240 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            )}
            {isActive && (
              <motion.circle r="3" fill="#3B82F6" initial={{ x: 520, y: 240 }} animate={{ x: 650, y: 240 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }} />
            )}
          </svg>
        </div>

        {/* Live Trace Log Panel */}
        <div className="absolute bottom-4 right-4 w-[400px] border border-surface/80 bg-background/90 backdrop-blur rounded p-4 font-mono text-[10px]">
          <div className="text-neutral font-bold mb-2 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Live Trace Log
          </div>
          <div className="space-y-1 text-neutral-400">
            <div>[14:02:11.452] TRC-9A82 - Webhook dispatched</div>
            <div>[14:02:11.460] TRC-9A82 - Recon validation pending</div>
            <div>[14:02:11.465] <span className="text-secondary">TRC-9A82 - Auth accepted (200 OK)</span></div>
            <div className="mt-2 flex items-center gap-1">
              <span className="w-1 h-3 bg-white animate-pulse"></span>
              Awaiting next payload...
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function ServiceNode({ label, metric, subMetric, subMetricLabel, x, y, active, latency, isPrimary, isBlue }: any) {
  return (
    <div
      className={clsx(
        "absolute w-[180px] border bg-surface/10 backdrop-blur p-4 rounded",
        isPrimary ? "border-secondary shadow-[0_0_15px_rgba(59,130,246,0.1)]" : isBlue ? "border-secondary/50" : "border-surface/80"
      )}
      style={{ left: x, top: y }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-bold text-neutral-200">{label}</div>
        <div className={clsx("w-1.5 h-1.5 rounded-full", active ? "bg-secondary" : "bg-neutral-600")}></div>
      </div>

      <div className="flex justify-between items-end mb-1">
        <div>
          {subMetricLabel && <div className="text-[9px] text-neutral mb-0.5">{subMetricLabel}</div>}
          <div className="text-xl font-mono text-white">{metric}</div>
        </div>
      </div>
      <div className={clsx("text-xs font-mono", subMetricLabel ? "text-danger" : "text-neutral-400")}>
        {subMetric}
      </div>

      {isPrimary && (
        <div className="mt-4 flex h-3 items-end gap-0.5 opacity-70">
          <div className="w-full bg-surface h-[30%]"></div>
          <div className="w-full bg-surface h-[40%]"></div>
          <div className="w-full bg-secondary h-[50%]"></div>
          <div className="w-full bg-secondary h-[60%]"></div>
          <div className="w-full bg-blue-300 h-[40%]"></div>
        </div>
      )}

      {latency && (
        <div className="absolute top-1/2 -translate-y-1/2 -left-12 border border-surface bg-background px-1.5 py-0.5 text-[10px] text-neutral-300 font-mono rounded">
          {latency}
        </div>
      )}
    </div>
  )
}
