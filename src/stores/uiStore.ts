import { create } from 'zustand'

export type TabName = 'timeline' | 'state-machine' | 'request-flow' | 'metadata'

interface UIState {
  activeTab: TabName
  chaosMode: boolean
  sidebarCollapsed: boolean
  setActiveTab: (tab: TabName) => void
  toggleChaosMode: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'timeline',
  chaosMode: false,
  sidebarCollapsed: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleChaosMode: () => set((state) => ({ chaosMode: !state.chaosMode })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
