import { useSimulationStore } from '@/stores/simulationStore'
import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { SimulationRuntimeEngine } from '@/features/simulation-engine/engine'
import { RotateCcw } from 'lucide-react'
import { startMockSSE, stopMockSSE } from '@/services/sse/mockSSEService'

export function TopNavbar() {
  const { activeScenarioId, resetSimulation } = useSimulationStore()
  const { simulationStatus } = useRuntimeStore()

  const isRunning = simulationStatus === 'Running'

  return (
    <header className="h-14 border-b border-surface/50 bg-background/80 backdrop-blur flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm tracking-tight text-neutral-100">
          Payment Consistency Engine
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetSimulation}
          disabled={isRunning}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-medium rounded border transition-colors ${
            isRunning
              ? 'border-surface/30 text-neutral/30 cursor-not-allowed'
              : 'border-surface text-neutral hover:bg-surface/50 hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
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
