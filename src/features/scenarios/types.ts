export type NodeStatus = 'inactive' | 'active' | 'completed' | 'skipped' | 'failed' | 'recovery'
export type ServiceState = 'idle' | 'active' | 'degraded' | 'failed' | 'recovery' | 'completed'

export interface StateNodeConfig {
  id: string
  label: string
  sub: string
  x: number
  y: number
  isWarning?: boolean
  isDanger?: boolean
  systemActor?: string
}

export interface StateEdgeConfig {
  id: string
  source: string
  target: string
  type: 'solid' | 'dashed'
  label?: string
  path?: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  systemActor?: string
}

export interface SimulationStep {
  delayMs: number
  timelineEvent?: {
    severity: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'RECOVERY' | 'TRACE'
    traceId: string
    message: string
    latency?: number
    metadata?: Record<string, string | number>
  }
  stateUpdates?: Record<string, NodeStatus>
  serviceUpdates?: Record<string, ServiceState>
  metadataUpdates?: Record<string, any>
}

export interface ScenarioDefinition {
  id: string
  name: string
  description?: string
  problem?: string
  risk?: string
  protection?: string
  stateNodes: StateNodeConfig[]
  stateEdges: StateEdgeConfig[]
  events: any[]
}
