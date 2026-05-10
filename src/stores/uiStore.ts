import { create } from 'zustand'

export type TabName = 'timeline' | 'state-machine'

interface ViewportState {
  x: number
  y: number
  zoom: number
}

interface UIState {
  activeTab: TabName
  sidebarCollapsed: boolean
  viewports: Record<string, ViewportState>
  setActiveTab: (tab: TabName) => void
  toggleSidebar: () => void
  setViewport: (key: string, viewport: ViewportState) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'state-machine',
  sidebarCollapsed: false,
  viewports: {},
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setViewport: (key, viewport) => set((state) => ({
    viewports: { ...state.viewports, [key]: viewport }
  }))
}))
