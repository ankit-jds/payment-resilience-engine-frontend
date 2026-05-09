import { useState } from 'react'
import { useSimulationStore } from '@/stores/simulationStore'
import { ChevronDown, ChevronRight, RefreshCw, Play } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getScenario } from '@/features/scenarios/scenarioRegistry'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

type ScenarioGroup = {
  id: string
  label: string
  items: { id: string; label: string }[]
}

const groups: ScenarioGroup[] = [
  {
    id: 'request_consistency',
    label: 'Request Consistency',
    items: [
      { id: 'duplicate_request', label: 'Duplicate Request Prevention' },
    ],
  },
  {
    id: 'payment_race_conditions',
    label: 'Payment Race Conditions',
    items: [
      { id: 'canonical_success', label: 'Canonical Success Winner' },
      { id: 'delayed_webhook', label: 'Delayed Webhook Recovery' },
      { id: 'concurrent_webhook', label: 'Concurrent Webhook Race' },
    ],
  },
  {
    id: 'webhook_resilience',
    label: 'Webhook Resilience',
    items: [
      { id: 'duplicate_webhook', label: 'Duplicate Webhook Handling' },
      { id: 'lost_webhook', label: 'Lost Webhook Recovery' },
    ],
  },
  {
    id: 'compensation_systems',
    label: 'Compensation Systems',
    items: [
      { id: 'auto_refund', label: 'Automatic Refund Processing' },
      { id: 'refund_worker_crash', label: 'Refund Worker Crash Recovery' },
    ],
  },
  {
    id: 'provider_failures',
    label: 'Provider Failures',
    items: [
      { id: 'provider_timeout', label: 'Provider Timeout Retry' },
    ],
  },
]

import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'

export function ScenarioSidebar() {
  const { activeScenarioId, setActiveScenario, resetSimulation } = useSimulationStore()
  const { simulationStatus } = useRuntimeStore()
  const isRunning = simulationStatus === 'Running'
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    request_consistency: true,
    payment_race_conditions: true,
    webhook_resilience: true,
    compensation_systems: true,
    provider_failures: true,
  })

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className="w-64 border-r border-surface/50 bg-background/50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-surface/30">
        <h2 className="text-[10px] font-bold text-neutral uppercase tracking-widest mb-2">Scenarios</h2>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          Local Sandbox v2.4
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {groups.map((group) => (
          <div key={group.id} className="mb-1">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-200 hover:text-white transition-colors"
            >
              {openGroups[group.id] ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral" />
              )}
              {group.label}
            </button>
            
            {openGroups[group.id] && (
              <div className="mt-1 mb-2">
                {group.items.map((item) => {
                  const isActive = activeScenarioId === item.id
                  const scenarioDef = getScenario(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isRunning && setActiveScenario(item.id)}
                      disabled={isRunning}
                      className={cn(
                        "w-full text-left pl-10 pr-4 py-2 flex flex-col gap-0.5 transition-colors group",
                        isActive 
                          ? "bg-secondary/20 text-secondary border-l-2 border-secondary" 
                          : "text-neutral hover:text-neutral-300 hover:bg-surface/30 border-l-2 border-transparent",
                        isRunning && !isActive && "opacity-50 cursor-not-allowed"
                      )}
                      title={scenarioDef.description}
                    >
                      <span className="text-[13px] font-mono leading-tight">{item.label}</span>
                      {scenarioDef.description && (
                        <span className={cn(
                          "text-[10px] leading-tight line-clamp-2",
                          isActive ? "text-secondary/70" : "text-neutral-500 group-hover:text-neutral-400"
                        )}>
                          {scenarioDef.description}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-surface/30 flex flex-col gap-2">
        <button 
          onClick={() => {
            import('@/features/simulation-engine/engine').then(m => m.SimulationRuntimeEngine.start(activeScenarioId))
          }}
          disabled={isRunning}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border rounded transition-colors",
            isRunning 
              ? "border-surface text-neutral/50 bg-surface/20 cursor-not-allowed" 
              : "border-secondary text-secondary hover:bg-secondary/10"
          )}
        >
          <Play className="w-3.5 h-3.5" />
          {isRunning ? 'Simulation Running...' : 'Start Simulation'}
        </button>

        <button 
          onClick={resetSimulation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border border-surface text-neutral hover:text-white hover:bg-surface/50 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Simulation
        </button>
      </div>
    </aside>
  )
}
