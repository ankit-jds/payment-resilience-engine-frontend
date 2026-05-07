import { useUIStore, TabName } from '@/stores/uiStore'
import { clsx } from 'clsx'
import { TimelineView } from '@/components/timeline/TimelineView'
import { StateMachineView } from '@/components/state-machine/StateMachineView'
import { RequestFlowView } from '@/components/request-flow/RequestFlowView'
import { MetadataView } from '@/components/metadata/MetadataView'

const TABS: { id: TabName; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'state-machine', label: 'State Machine' },
  { id: 'request-flow', label: 'Request Flow' },
  { id: 'metadata', label: 'Metadata' },
]

export function WorkspaceTabs() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Tab Navigation */}
      <div className="flex border-b border-surface/50 px-6 pt-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-6 py-3 text-xs font-mono font-medium transition-colors border-b-2",
                isActive
                  ? "text-white border-secondary"
                  : "text-neutral border-transparent hover:text-neutral-300 hover:border-surface"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative p-6">
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'state-machine' && <StateMachineView />}
        {activeTab === 'request-flow' && <RequestFlowView />}
        {activeTab === 'metadata' && <MetadataView />}
      </div>
    </div>
  )
}
