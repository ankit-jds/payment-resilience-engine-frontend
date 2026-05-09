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
import { computeEdgePath, DOMRectBounds } from '@/utils/graphUtils'

export function RequestFlowView() {
  const { events } = useEventStore()
  const { activeScenarioId } = useSimulationStore()
  const { serviceStates, simulationStatus, activeTransitions } = useRuntimeStore()
  const { viewports, setViewport } = useUIStore()

  const [isOverlayMinimized, setIsOverlayMinimized] = useState(() => {
    return localStorage.getItem('rf_overlay_minimized') === 'true'
  })

  const [nodeBounds, setNodeBounds] = useState<Record<string, DOMRectBounds>>({})

  const handleNodeBounds = useCallback((id: string, bounds: DOMRectBounds) => {
    setNodeBounds(prev => {
      const p = prev[id]
      if (p && p.x === bounds.x && p.y === bounds.y && p.width === bounds.width && p.height === bounds.height) {
        return prev
      }
      return { ...prev, [id]: bounds }
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('rf_overlay_minimized', isOverlayMinimized.toString())
  }, [isOverlayMinimized])

  const scenario = getScenario(activeScenarioId)
  const viewport = viewports['request-flow'] || { x: 0, y: 0, zoom: 1 }

  const initialOverlayPos = (() => {
    const saved = localStorage.getItem('rf_overlay_pos')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { }
    }
    return { x: 0, y: 0 }
  })()

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 rounded-lg relative overflow-hidden flex items-center justify-center">

        <TransformWrapper
          minScale={0.8}
          maxScale={1.4}
          initialScale={viewport.zoom}
          initialPositionX={viewport.x}
          initialPositionY={viewport.y}
          onTransform={(ref: any) => {
            setViewport('request-flow', { x: ref.state.positionX, y: ref.state.positionY, zoom: ref.state.scale })
          }}
        >
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            {/* Graph Container */}
            <div className="relative w-[1200px] h-[800px]">

              {/* Service Nodes */}
              {scenario.requestNodes.map(node => {
                const state = serviceStates[node.id] || 'idle'
                return (
                  <ServiceNode
                    key={node.id}
                    id={node.id}
                    label={node.label}
                    metric={state === 'active' || state === 'degraded' ? '12.4k' : '0'}
                    subMetric={state === 'active' ? 'req/s' : ''}
                    subMetricLabel={state === 'degraded' ? 'Queue Full' : ''}
                    latency={state === 'active' ? '24ms' : undefined}
                    x={node.x}
                    y={node.y}
                    active={state === 'active' || state === 'degraded' || state === 'recovery'}
                    state={state}
                    isPrimary={node.isPrimary}
                    isBlue={node.isBlue}
                    onBounds={handleNodeBounds}
                  />
                )
              })}

              {/* Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-[-1]">
                <defs>
                  <marker id="rf-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#797676" />
                  </marker>
                  <marker id="rf-arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                  </marker>
                </defs>
                {scenario.requestEdges.map(edge => {
                  const sourceBounds = nodeBounds[edge.source] || null;
                  const targetBounds = nodeBounds[edge.target] || null;
                  const sourceNodeDef = scenario.requestNodes.find(n => n.id === edge.source);
                  const targetNodeDef = scenario.requestNodes.find(n => n.id === edge.target);
                  const defaultSource = { x: edge.x1 || sourceNodeDef?.x || 0, y: edge.y1 || sourceNodeDef?.y || 0 };
                  const defaultTarget = { x: edge.x2 || targetNodeDef?.x || 0, y: edge.y2 || targetNodeDef?.y || 0 };
                  
                  const computed = computeEdgePath(edge.id, sourceBounds, targetBounds, defaultSource, defaultTarget);
                  const edgeTransitions = activeTransitions.filter(t => t.edgeId === edge.id);

                  return (
                    <g key={edge.id}>
                      <path d={computed.path} stroke="#797676" strokeWidth="1" fill="none" markerEnd="url(#rf-arrow)" />
                      {edgeTransitions.map(transition => (
                        <motion.path 
                          key={`${edge.id}-${transition.requestId}`} 
                          initial={{ pathLength: 0 }} 
                          animate={{ pathLength: 1 }} 
                          transition={{ duration: 0.5 }} 
                          d={computed.path} 
                          stroke="#3B82F6"
                          strokeWidth="2"
                          fill="none"
                          markerEnd="url(#rf-arrow-active)" 
                        />
                      ))}
                    </g>
                  )
                })}
              </svg>
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* Live Trace Log Panel (Draggable) */}
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: -500, right: 0, top: -400, bottom: 0 }}
          initial={initialOverlayPos}
          onDragEnd={(_e, info) => {
            const saved = localStorage.getItem('rf_overlay_pos')
            const pos = saved ? JSON.parse(saved) : { x: 0, y: 0 }
            localStorage.setItem('rf_overlay_pos', JSON.stringify({ x: pos.x + info.offset.x, y: pos.y + info.offset.y }))
          }}
          className="absolute bottom-4 right-4 w-[400px] border border-surface/80 bg-background/90 backdrop-blur rounded overflow-hidden flex flex-col shadow-2xl z-10"
        >
          <div className="px-4 py-2 border-b border-surface/50 text-[10px] uppercase font-bold text-neutral flex justify-between items-center bg-surface/20 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-3 h-3 text-neutral-500" />
              {simulationStatus === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
              Live Trace Log
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
                className="p-4 font-mono text-[10px] space-y-1 text-neutral-400 overflow-y-auto scrollbar-thin bg-background/50"
              >
                {events.length === 0 ? (
                  <div className="text-neutral-500 italic text-center pb-2">Waiting for traces...</div>
                ) : (
                  events.filter(e => e.severity === 'TRACE' || e.severity === 'INFO' || e.severity === 'SUCCESS').map(e => (
                    <div key={e.id}>[{e.timestamp}] {e.traceId} - <span className={e.severity === 'SUCCESS' ? 'text-secondary' : ''}>{e.message}</span></div>
                  ))
                )}
                {simulationStatus === 'Running' && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="w-1 h-3 bg-white animate-pulse"></span>
                    Awaiting next payload...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  )
}

function ServiceNode({ id, label, metric, subMetric, subMetricLabel, x, y, active, state, latency, isPrimary, isBlue, onBounds }: any) {
  let borderColor = "border-surface/80"
  let opacity = "opacity-100"

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return;
    
    const updateBounds = () => {
      if (ref.current) {
        onBounds(id, {
          x,
          y,
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        })
      }
    }

    updateBounds()
    
    const observer = new ResizeObserver(() => updateBounds())
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [id, x, y, onBounds, label, metric, subMetric, subMetricLabel])

  if (!active && state !== 'failed' && state !== 'completed') {
    opacity = "opacity-50"
  } else if (state === 'degraded' || state === 'recovery') {
    borderColor = "border-warning/80 text-warning shadow-[0_0_15px_rgba(245,158,11,0.1)]"
  } else if (state === 'failed') {
    borderColor = "border-danger/80 text-danger shadow-[0_0_15px_rgba(239,68,68,0.1)]"
  } else if (isPrimary) {
    borderColor = "border-secondary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
  } else if (isBlue) {
    borderColor = "border-secondary/50 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
  }

  return (
    <div
      ref={ref}
      className={clsx(
        "absolute w-[180px] border bg-surface/10 backdrop-blur p-4 rounded transition-all duration-300",
        borderColor,
        opacity
      )}
      style={{ left: x, top: y }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className={clsx("text-xs font-bold", active ? "text-neutral-200" : "text-neutral-500")}>{label}</div>
        <div className={clsx("w-1.5 h-1.5 rounded-full", active ? (state === 'degraded' || state === 'recovery' ? "bg-warning animate-pulse" : state === 'failed' ? "bg-danger" : "bg-secondary") : "bg-neutral-600")}></div>
      </div>

      <div className="flex justify-between items-end mb-1">
        <div>
          {subMetricLabel && <div className={clsx("text-[9px] mb-0.5", state === 'recovery' ? "text-warning" : "text-neutral")}>{subMetricLabel}</div>}
          <div className={clsx("text-xl font-mono", active ? "text-white" : "text-neutral-400")}>{metric}</div>
        </div>
      </div>
      <div className={clsx("text-xs font-mono", subMetricLabel && state !== 'recovery' ? "text-danger" : "text-neutral-400")}>
        {subMetric}
      </div>

      {isPrimary && (
        <div className="mt-4 flex h-3 items-end gap-0.5 opacity-70">
          <div className="w-full bg-surface h-[30%]"></div>
          <div className="w-full bg-surface h-[40%]"></div>
          <div className="w-full bg-secondary h-[50%]"></div>
          <div className="w-full bg-secondary h-[60%]"></div>
          <div className="w-full bg-blue-300 h-[40%]"></div>
        </div>
      )}

      {latency && active && (
        <div className="absolute top-1/2 -translate-y-1/2 -left-12 border border-surface bg-background px-1.5 py-0.5 text-[10px] text-neutral-300 font-mono rounded">
          {latency}
        </div>
      )}
    </div>
  )
}
