import { useSimulationStore } from '@/stores/simulationStore'
import { useUIStore } from '@/stores/uiStore'
import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { SimulationRuntimeEngine } from '@/features/simulation-engine/engine'
import { Settings, Wifi, Monitor, TriangleAlert } from 'lucide-react'
import { startMockSSE, stopMockSSE } from '@/services/sse/mockSSEService'

export function TopNavbar() {
  const { chaosMode, toggleChaosMode } = useUIStore()
  const { activeScenarioId } = useSimulationStore()
  const { simulationStatus } = useRuntimeStore()

  const isRunning = simulationStatus === 'Running'

  return (
    <header className="h-14 border-b border-surface/50 bg-background/80 backdrop-blur flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm tracking-tight text-neutral-100">
          Payment Resilience Engine
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-neutral mr-4">
          <Settings className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Wifi className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Monitor className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>

        <button
          onClick={toggleChaosMode}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded border transition-colors ${
            chaosMode
              ? 'bg-danger/10 border-danger/50 text-danger'
              : 'border-surface text-neutral hover:bg-surface/50 hover:text-white'
          }`}
        >
          {chaosMode && <TriangleAlert className="w-3 h-3" />}
          Chaos Mode
        </button>

        <button
          onClick={() => {
            if (isRunning) {
              stopMockSSE()
              SimulationRuntimeEngine.cleanup()
            } else {
              SimulationRuntimeEngine.start(activeScenarioId)
              startMockSSE(activeScenarioId, (event) => {
                SimulationRuntimeEngine.processEvent(event)
              })
            }
          }}
          className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
            isRunning
              ? 'bg-danger hover:bg-danger/90 text-white'
              : 'bg-secondary hover:bg-secondary/90 text-white'
          }`}
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>
    </header>
  )
}
