import { useSimulationStore } from '@/stores/simulationStore'
import { ArrowUpRight } from 'lucide-react'

export function BottomStatusStrip() {
  const { engineStatus } = useSimulationStore()

  const year = new Date().getFullYear()

  return (
    <footer className="h-10 border-t border-surface/50 bg-background flex items-center justify-between px-4 text-[11px] font-mono text-neutral z-10">
      <div className="flex items-center gap-4">
        <span>© {year} Payment Consistency Engine</span>
        <span className="text-surface/50">|</span>
      </div>

      <div className="flex items-center gap-6">

        <a href="https://github.com/ankit-jds/payment-resilience-engine" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors font-bold text-[13px] text-neutral-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
          Star on GitHub
          <ArrowUpRight className="w-3 h-3 text-neutral-500" />
        </a>
        <a href="https://github.com/ankit-jds/payment-resilience-engine-frontend" target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline underline-offset-2">View Frontend Source</a>
      </div>
    </footer>
  )
}
