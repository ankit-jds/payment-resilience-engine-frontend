import { useSimulationStore } from '@/stores/simulationStore'

export function BottomStatusStrip() {
  const { engineStatus } = useSimulationStore()

  return (
    <footer className="h-8 border-t border-surface/50 bg-background flex items-center justify-between px-4 text-[11px] font-mono text-neutral z-10">
      <div className="flex items-center gap-4">
        <span>© 2024 Payment Resilience Engine</span>
        <span className="text-surface/50">|</span>
        <span className="flex items-center gap-2">
          Engine Status: <span className="text-neutral-300">{engineStatus}</span>
        </span>
      </div>

      <div className="flex items-center gap-6">
        <a href="#" className="hover:text-white transition-colors">Documentation</a>
        <a href="#" className="hover:text-white transition-colors">API Reference</a>
        <a href="#" className="hover:text-white transition-colors">Support</a>
      </div>
    </footer>
  )
}
