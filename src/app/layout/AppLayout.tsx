import { TopNavbar } from '@/components/navbar/TopNavbar'
import { ScenarioSidebar } from '@/components/sidebar/ScenarioSidebar'
import { BottomStatusStrip } from '@/components/common/BottomStatusStrip'
import { WorkspaceTabs } from '@/components/WorkspaceTabs'

export function AppLayout() {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-neutral-100 overflow-hidden relative">
      <TopNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        <ScenarioSidebar />
        
        <main className="flex-1 overflow-hidden flex flex-col bg-background/50 relative">
          <WorkspaceTabs />
        </main>
      </div>

      <BottomStatusStrip />
    </div>
  )
}
