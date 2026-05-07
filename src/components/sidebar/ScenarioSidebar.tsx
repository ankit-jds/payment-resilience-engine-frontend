import { useState } from 'react'
import { useSimulationStore } from '@/stores/simulationStore'
import { ChevronDown, ChevronRight, RefreshCw, FileText, BarChart2 } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
    id: 'payment_consistency',
    label: 'Payment Consistency',
    items: [
      { id: 'duplicate_request', label: 'Duplicate Request Prevention' },
      { id: 'canonical_success', label: 'Canonical Success Winner' },
      { id: 'double_success', label: 'Double Success Recovery' },
    ],
  },
  {
    id: 'webhook_resilience',
    label: 'Webhook Resilience',
    items: [
      { id: 'duplicate_webhook', label: 'Duplicate Webhook Handling' },
      { id: 'delayed_webhook', label: 'Delayed Webhook Recovery' },
    ],
  },
  {
    id: 'recovery_systems',
    label: 'Recovery Systems',
    items: [
      { id: 'reconciliation', label: 'Reconciliation Recovery' },
      { id: 'auto_refund', label: 'Automatic Refund Processing' },
    ],
  },
]

export function ScenarioSidebar() {
  const { activeScenarioId, setActiveScenario, resetSimulation } = useSimulationStore()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    payment_consistency: true,
    webhook_resilience: true,
    recovery_systems: true,
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
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveScenario(item.id)}
                      className={cn(
                        "w-full text-left pl-10 pr-4 py-1.5 text-[13px] font-mono transition-colors",
                        isActive 
                          ? "bg-secondary/20 text-secondary border-l-2 border-secondary" 
                          : "text-neutral hover:text-neutral-300 hover:bg-surface/30 border-l-2 border-transparent"
                      )}
                    >
                      {item.label}
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
          onClick={resetSimulation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border border-surface text-neutral hover:text-white hover:bg-surface/50 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Simulation
        </button>

        <div className="mt-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral hover:text-white hover:bg-surface/30 rounded transition-colors">
            <FileText className="w-4 h-4" /> Logs
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral hover:text-white hover:bg-surface/30 rounded transition-colors">
            <BarChart2 className="w-4 h-4" /> Metrics
          </button>
        </div>
      </div>
    </aside>
  )
}
