import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { useSimulationStore } from '@/stores/simulationStore'
import { getScenario } from '@/features/scenarios/scenarioRegistry'
import { ChevronDown } from 'lucide-react'

export function MetadataView() {
  const { metadata, simulationStatus } = useRuntimeStore()
  const { activeScenarioId } = useSimulationStore()
  const scenario = getScenario(activeScenarioId)

  const isRunning = simulationStatus === 'Running'

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            Trace Inspection Panel
          </h2>
          <p className="text-xs font-mono text-neutral mt-1">
            {metadata?.correlationId || 'Awaiting Trace...'} | {scenario.name}
          </p>
        </div>
        {isRunning ? (
           <div className="px-2 py-1 bg-secondary/10 border border-secondary/20 text-secondary rounded text-xs flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
             Live Streaming
           </div>
        ) : (
          <div className="px-2 py-1 bg-neutral/10 border border-neutral/20 text-neutral-400 rounded text-xs flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-500"></div>
            Idle
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-[300px_1fr] gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-2">
          <MetadataPanel title="Identity Vectors">
            <div className="space-y-3">
              <Field label="Trace ID" value={metadata?.traceId || '---'} />
              <Field label="Span ID" value={metadata?.spanId || '---'} />
              <Field label="Correlation ID" value={metadata?.correlationId || '---'} active={isRunning} />
            </div>
          </MetadataPanel>

          <MetadataPanel title="Trace Relationships">
            <div className="relative pl-4 space-y-4 font-mono text-xs text-neutral-300">
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-surface/50"></div>
              {scenario.requestNodes.slice(0, 3).map((node, i) => (
                <div key={node.id} className="relative">
                  <div className={`absolute -left-[18px] top-1.5 w-1.5 h-1.5 rounded-full ${i === 1 && isRunning ? 'bg-secondary animate-pulse' : 'bg-neutral-500'}`}></div>
                  <span className={i === 1 && isRunning ? 'text-secondary' : ''}>{node.label}</span><br/><span className="text-neutral-500">span_{node.id.substring(0,4)}...</span>
                </div>
              ))}
            </div>
          </MetadataPanel>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin">
          <MetadataPanel title="Routing Metrics">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs text-neutral mb-1">Queue Depth</div>
                <div className="text-2xl font-mono text-white">{metadata?.queueDepth || '0'} req</div>
                <div className="h-4 flex items-end gap-0.5 mt-2 opacity-50">
                  <div className="w-full bg-surface h-[20%]"></div>
                  <div className="w-full bg-surface h-[40%]"></div>
                  <div className="w-full bg-secondary h-[80%]"></div>
                  <div className="w-full bg-surface h-[20%]"></div>
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral mb-1">Active Workers</div>
                <div className="text-2xl font-mono text-white">{metadata?.workers || '0'}</div>
              </div>
              <div>
                <div className="text-xs text-neutral mb-1">Node</div>
                <div className="text-2xl font-mono text-white">us-east-1a</div>
                <div className="text-xs font-mono text-neutral-400 mt-2">CPU: {isRunning ? '42%' : '5%'} | Mem: 62%</div>
              </div>
            </div>
          </MetadataPanel>

          <MetadataPanel title="Normalized Payload" rightAction={<div className="flex gap-2"><button className="px-2 py-0.5 text-[10px] border border-surface rounded text-neutral">RAW</button><button className="px-2 py-0.5 text-[10px] bg-secondary text-white rounded">JSON</button></div>}>
            <pre className="font-mono text-xs text-neutral-300 overflow-x-auto">
{isRunning ? `{
  "id": "${metadata?.correlationId || 'ch_new'}",
  "object": "charge",
  "status": "${metadata?.status || 'processing'}",
  "metadata": {
    "scenario": "${scenario.id}"
  }
}` : 'No active payload'}
            </pre>
          </MetadataPanel>
        </div>
      </div>
    </div>
  )
}

function MetadataPanel({ title, children, rightAction }: { title: string, children: React.ReactNode, rightAction?: React.ReactNode }) {
  return (
    <div className="border border-surface/50 rounded-lg overflow-hidden bg-background/50">
      <div className="px-4 py-2 border-b border-surface/50 flex justify-between items-center bg-surface/10">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
          {title}
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          <ChevronDown className="w-3.5 h-3.5 text-neutral" />
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, active }: { label: string, value: string, active?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-neutral mb-1">{label}</div>
      <div className={`text-xs font-mono border rounded px-3 py-1.5 ${active ? 'border-secondary text-secondary bg-secondary/5' : 'border-surface/50 text-neutral-300'}`}>
        {value}
      </div>
    </div>
  )
}

