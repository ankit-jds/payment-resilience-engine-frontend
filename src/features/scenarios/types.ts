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
}

export interface StateEdgeConfig {
  id: string
  source: string
  target: string
  type: 'solid' | 'dashed'
  path?: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

export interface RequestNodeConfig {
  id: string
  label: string
  x: number
  y: number
  isPrimary?: boolean
  isBlue?: boolean
}

export interface RequestEdgeConfig {
  id: string
  source: string
  target: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface SimulationStep {
  delayMs: number
  timelineEvent?: {
    severity: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'RECOVERY' | 'TRACE'
    traceId: string
    message: string
    latency?: number
  }
  stateUpdates?: Record<string, NodeStatus>
  serviceUpdates?: Record<string, ServiceState>
  metadataUpdates?: Record<string, any>
}

export interface ScenarioDefinition {
  id: string
  name: string
  stateNodes: StateNodeConfig[]
  stateEdges: StateEdgeConfig[]
  requestNodes: RequestNodeConfig[]
  requestEdges: RequestEdgeConfig[]
  steps: SimulationStep[]
}
