import { create } from 'zustand'

export type TabName = 'timeline' | 'state-machine' | 'request-flow' | 'metadata'

interface ViewportState {
  x: number
  y: number
  zoom: number
}

interface UIState {
  activeTab: TabName
  chaosMode: boolean
  sidebarCollapsed: boolean
  viewports: Record<string, ViewportState>
  setActiveTab: (tab: TabName) => void
  toggleChaosMode: () => void
  toggleSidebar: () => void
  setViewport: (key: string, viewport: ViewportState) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'timeline',
  chaosMode: false,
  sidebarCollapsed: false,
  viewports: {},
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleChaosMode: () => set((state) => ({ chaosMode: !state.chaosMode })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setViewport: (key, viewport) => set((state) => ({
    viewports: { ...state.viewports, [key]: viewport }
  }))
}))
