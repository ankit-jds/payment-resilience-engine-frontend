import { getScenario } from '../../features/scenarios/scenarioRegistry'

let simulationInterval: number | null = null

export function startMockSSE(scenarioId: string, onEvent: (event: any) => void) {
  let eventIndex = 0
  const scenario = getScenario(scenarioId)
  const events = scenario.events || []
  
  simulationInterval = window.setInterval(() => {
    if (eventIndex < events.length) {
      onEvent(events[eventIndex])
      eventIndex++
    } else {
      stopMockSSE()
    }
  }, 800) // Emit slightly faster for better visual pace
}

export function stopMockSSE() {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}
