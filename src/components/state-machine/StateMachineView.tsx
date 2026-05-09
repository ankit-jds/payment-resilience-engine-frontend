import { useEventStore } from '@/stores/eventStore'
import { useSimulationStore } from '@/stores/simulationStore'
import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { useUIStore } from '@/stores/uiStore'
import { getScenario } from '@/features/scenarios/scenarioRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useState, useEffect } from 'react'
import { Maximize2, Minimize2, GripHorizontal } from 'lucide-react'
import { NodeStatus } from '@/features/scenarios/types'

export function StateMachineView() {
  const { events } = useEventStore()
  const { activeScenarioId } = useSimulationStore()
  const { nodeStates, simulationSessionId, nodeExecutionCounts, activeRequests, edgeActivations } = useRuntimeStore()
  const { viewports, setViewport } = useUIStore()
  
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(() => {
    return localStorage.getItem('sm_overlay_minimized') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sm_overlay_minimized', isOverlayMinimized.toString())
  }, [isOverlayMinimized])

  const scenario = getScenario(activeScenarioId)
  const viewport = viewports['state-machine'] || { x: 0, y: 0, zoom: 1 }

  const initialOverlayPos = (() => {
    const saved = localStorage.getItem('sm_overlay_pos')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return { x: 0, y: 0 }
  })()

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white tracking-wide">State Transition Graph</h2>
        <p className="text-xs font-mono text-neutral mt-1">Scenario: {scenario.name} | Session: {simulationSessionId || 'None'}</p>
      </div>

      <div className="flex-1 border border-surface/50 rounded-lg bg-background/50 relative overflow-hidden flex items-center justify-center">
        
        <TransformWrapper 
          minScale={0.8} 
          maxScale={1.4} 
          initialScale={viewport.zoom}
          initialPositionX={viewport.x}
          initialPositionY={viewport.y}
          onTransform={(ref: any) => {
            setViewport('state-machine', { x: ref.state.positionX, y: ref.state.positionY, zoom: ref.state.scale })
          }}
        >
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            {/* Graph Container */}
            <div className="relative w-[800px] h-[500px]">
              {/* Edges using SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#797676" />
                  </marker>
                  <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                  </marker>
                  <marker id="arrow-warning" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                  <marker id="arrow-danger" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>
                
                {scenario.stateEdges.map(edge => {
                  const targetState = nodeStates[edge.target] || 'inactive'
                  
                  const isEdgeActive = targetState !== 'inactive' && targetState !== 'skipped'
                  const targetNodeDef = scenario.stateNodes.find(n => n.id === edge.target)
                  
                  let strokeColor = '#3B82F6'
                  let marker = 'url(#arrow-active)'
                  if (targetNodeDef?.isWarning) {
                    strokeColor = '#f59e0b'
                    marker = 'url(#arrow-warning)'
                  } else if (targetNodeDef?.isDanger) {
                    strokeColor = '#ef4444'
                    marker = 'url(#arrow-danger)'
                  }

                  const commonProps = {
                    strokeWidth: "2",
                    fill: "none",
                    strokeDasharray: edge.type === 'dashed' ? '4 4' : 'none'
                  }

                  const edgeKey = edgeActivations[edge.id] ? `${edge.id}-${edgeActivations[edge.id]}` : edge.id;

                  return (
                    <g key={edge.id}>
                      {edge.path ? (
                        <>
                          <path d={edge.path} stroke="#797676" {...commonProps} markerEnd="url(#arrow)" />
                          {isEdgeActive && (
                            <motion.path key={edgeKey} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} d={edge.path} stroke={strokeColor} {...commonProps} markerEnd={marker} />
                          )}
                        </>
                      ) : (
                        <>
                          <line x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke="#797676" {...commonProps} markerEnd="url(#arrow)" />
                          {isEdgeActive && (
                            <motion.line key={edgeKey} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke={strokeColor} {...commonProps} markerEnd={marker} />
                          )}
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Nodes */}
              {scenario.stateNodes.map(node => (
                <StateNode 
                  key={node.id} 
                  {...node} 
                  status={nodeStates[node.id] || 'inactive'} 
                  executionCount={nodeExecutionCounts[node.id] || 0}
                  activeReqs={activeRequests[node.id] || []}
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* Live Stream Overlay (Draggable) */}
        <motion.div 
          drag
          dragMomentum={false}
          dragConstraints={{ left: -500, right: 0, top: -400, bottom: 0 }}
          initial={initialOverlayPos}
          onDragEnd={(_e, info) => {
            const saved = localStorage.getItem('sm_overlay_pos')
            const pos = saved ? JSON.parse(saved) : { x: 0, y: 0 }
            localStorage.setItem('sm_overlay_pos', JSON.stringify({ x: pos.x + info.offset.x, y: pos.y + info.offset.y }))
          }}
          className="absolute bottom-4 right-4 w-96 border border-surface/50 bg-background/80 backdrop-blur rounded-lg overflow-hidden flex flex-col shadow-2xl z-10"
        >
          <div className="px-3 py-2 border-b border-surface/50 text-[10px] uppercase font-bold text-neutral flex justify-between items-center bg-surface/20 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-3 h-3 text-neutral-500" />
              Event Stream
            </div>
            <button onClick={() => setIsOverlayMinimized(!isOverlayMinimized)} className="text-neutral hover:text-white transition-colors">
              {isOverlayMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
          
          <AnimatePresence>
            {!isOverlayMinimized && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 160 }}
                exit={{ height: 0 }}
                className="flex-1 p-3 font-mono text-[11px] overflow-y-auto scrollbar-thin flex flex-col justify-end bg-background/50"
              >
                {events.length === 0 ? (
                  <div className="text-neutral-500 italic text-center pb-2">Waiting for events...</div>
                ) : (
                  events.map(e => (
                    <div key={e.id} className="mb-1">
                      <span className="text-neutral-500">[{e.timestamp}]</span>{' '}
                      <span className={e.severity === 'ERROR' ? 'text-danger' : e.severity === 'WARN' ? 'text-warning' : 'text-neutral-300'}>
                        {e.severity}: {e.message}
                      </span>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function StateNode({ label, sub, x, y, status, isWarning, isDanger, executionCount, activeReqs }: { label: string, sub: string, x: number, y: number, status: NodeStatus, isWarning?: boolean, isDanger?: boolean, executionCount?: number, activeReqs?: string[] }) {
  const isInactive = status === 'inactive'
  const isSkipped = status === 'skipped'
  const isActive = status === 'active' || status === 'completed' || status === 'failed' || status === 'recovery'
  
  let borderColor = 'border-surface/80'
  let opacity = 'opacity-100'

  if (isInactive) {
    opacity = 'opacity-50'
  } else if (isSkipped) {
    borderColor = 'border-surface/40 border-dashed text-neutral-500'
    opacity = 'opacity-60'
  } else if (isActive) {
    if (isDanger || status === 'failed') borderColor = 'border-danger/80 text-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]'
    else if (isWarning || status === 'recovery') borderColor = 'border-warning/80 text-warning shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    else borderColor = 'border-secondary shadow-[0_0_15px_rgba(59,130,246,0.2)]'
  }

  return (
    <div 
      className={clsx(
        "absolute w-[140px] p-3 rounded flex flex-col items-center justify-center text-center transition-all duration-300 backdrop-blur",
        isActive ? "bg-surface/30" : "bg-surface/10",
        borderColor,
        opacity,
        "border"
      )}
      style={{ left: x, top: y }}
    >
      <div className={clsx("text-[10px] font-bold mb-1", isActive && !isSkipped ? 'text-white' : 'text-neutral-400')}>
        {label} {executionCount ? `(${executionCount})` : ''}
      </div>
      <div className="text-[10px] font-mono text-neutral-500">{sub}</div>
      {activeReqs && activeReqs.length > 0 && (
        <div className="absolute -top-3 -left-2 flex flex-col gap-1 z-20">
          {activeReqs.map(req => (
            <div key={req} className="bg-secondary text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg border border-secondary/50">
              {req}
            </div>
          ))}
        </div>
      )}
      {status === 'active' && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary animate-pulse" />
      )}
      {status === 'completed' && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500" />
      )}
    </div>
  )
}
