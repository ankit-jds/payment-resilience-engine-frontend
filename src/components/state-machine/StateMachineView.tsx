import { useEventStore } from '@/stores/eventStore'
import { useSimulationStore } from '@/stores/simulationStore'
import { useRuntimeStore } from '@/features/simulation-engine/runtimeStore'
import { useUIStore } from '@/stores/uiStore'
import { getScenario } from '@/features/scenarios/scenarioRegistry'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Maximize2, Minimize2, GripHorizontal } from 'lucide-react'
import { NodeStatus } from '@/features/scenarios/types'
import { computeEdgePath, DOMRectBounds } from '@/utils/graphUtils'

export function StateMachineView() {
  const { events } = useEventStore()
  const { activeScenarioId } = useSimulationStore()
  const { nodeStates, simulationSessionId, nodeExecutionCounts, activeRequests, activeTransitions } = useRuntimeStore()
  const { viewports, setViewport } = useUIStore()
  
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(() => {
    return localStorage.getItem('sm_overlay_minimized') === 'true'
  })

  const [nodeBounds, setNodeBounds] = useState<Record<string, DOMRectBounds>>({})

  const handleNodeBounds = useCallback((id: string, bounds: DOMRectBounds) => {
    setNodeBounds(prev => {
      // Avoid unnecessary re-renders
      const p = prev[id]
      if (p && p.x === bounds.x && p.y === bounds.y && p.width === bounds.width && p.height === bounds.height) {
        return prev
      }
      return { ...prev, [id]: bounds }
    })
  }, [])

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
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white tracking-wide">State Transition Graph</h2>
          <p className="text-xs font-mono text-neutral mt-1">
            Scenario: {scenario.name}
            {simulationSessionId ? ` | Session: ${simulationSessionId}` : ''}
          </p>
        </div>
        <div className="w-1/2 bg-surface/30 border border-surface/50 rounded p-3 text-[11px] font-mono shadow-sm">
          <div className="mb-1"><span className="text-neutral-400 font-bold">Problem:</span> <span className="text-neutral-200">{scenario.problem}</span></div>
          <div className="mb-1"><span className="text-danger/80 font-bold">Risk:</span> <span className="text-neutral-200">{scenario.risk}</span></div>
          <div><span className="text-green-500/80 font-bold">Protection:</span> <span className="text-neutral-200">{scenario.protection}</span></div>
        </div>
      </div>

      <div className="flex-1 border border-surface/50 rounded-lg bg-background/50 relative overflow-hidden flex items-center justify-center">
        
        <TransformWrapper 
          minScale={0.2} 
          maxScale={2} 
          initialScale={viewport.zoom}
          initialPositionX={viewport.x}
          initialPositionY={viewport.y}
          limitToBounds={false}
          onTransform={(ref: any) => {
            setViewport('state-machine', { x: ref.state.positionX, y: ref.state.positionY, zoom: ref.state.scale })
          }}
        >
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            {/* Graph Container */}
            <div className="relative" style={{ width: 4000, height: 3000 }}>
              {/* Edges using SVG */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: 4000, height: 3000 }}>
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

                  const sourceBounds = nodeBounds[edge.source] || null;
                  const targetBounds = nodeBounds[edge.target] || null;
                  const sourceNodeDef = scenario.stateNodes.find(n => n.id === edge.source);
                  const defaultSource = { x: sourceNodeDef?.x || 0, y: sourceNodeDef?.y || 0 };
                  const defaultTarget = { x: targetNodeDef?.x || 0, y: targetNodeDef?.y || 0 };
                  
                  const computed = computeEdgePath(edge.id, sourceBounds, targetBounds, defaultSource, defaultTarget);

                  const edgeTransitions = activeTransitions.filter(t => t.edgeId === edge.id);

                  return (
                    <g key={edge.id}>
                      <path d={computed.path} stroke="#797676" {...commonProps} markerEnd="url(#arrow)" />
                      {edgeTransitions.map(transition => (
                        <motion.path 
                          key={`${edge.id}-${transition.requestId}`} 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 0.5 }} 
                          d={computed.path} 
                          stroke={strokeColor} 
                          {...commonProps} 
                          markerEnd={marker} 
                        />
                      ))}
                      {edge.label && (
                        <g transform={`translate(${computed.labelX}, ${computed.labelY})`}>
                          <rect x="-30" y="-8" width="60" height="16" fill="#0f1115" rx="3" />
                          <text
                            fill="#797676"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {edge.label}
                          </text>
                        </g>
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
                  onBounds={handleNodeBounds}
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

function StateNode({ id, label, sub, x, y, status, isWarning, isDanger, executionCount, activeReqs, onBounds }: { id: string, label: string, sub: string, x: number, y: number, status: NodeStatus, isWarning?: boolean, isDanger?: boolean, executionCount?: number, activeReqs?: string[], onBounds: (id: string, bounds: DOMRectBounds) => void }) {
  const isInactive = status === 'inactive'
  const isSkipped = status === 'skipped'
  const isActive = status === 'active' || status === 'completed' || status === 'failed' || status === 'recovery'
  
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return;
    
    const updateBounds = () => {
      // We calculate local transform coordinates relative to the graph container if possible,
      // but since x and y are absolute positioning values on the container, we can just use them and the width/height
      // However, getBoundingClientRect() gives screen coords.
      // Since it's absolutely positioned within a container, we can just use the provided x, y and measure width/height.
      if (ref.current) {
        onBounds(id, {
          x,
          y,
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        })
      }
    }

    // Initial
    updateBounds()
    
    // Setup observer for text changes etc
    const observer = new ResizeObserver(() => updateBounds())
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [id, x, y, onBounds, label, sub, activeReqs])

  let borderColor = 'border-surface/80'
  let opacity = 'opacity-100'

  if (isInactive) {
    opacity = 'opacity-80'
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
      ref={ref}
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
