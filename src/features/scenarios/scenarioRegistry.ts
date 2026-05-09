import { ScenarioDefinition } from './types'
import { duplicateRequestScenario } from './duplicateRequestScenario'
import { canonicalSuccessScenario } from './canonicalSuccessScenario'

export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {
  duplicate_request: duplicateRequestScenario,
  canonical_success: canonicalSuccessScenario,
  // Fallbacks for other scenarios to prevent crashing while building out
  double_success: canonicalSuccessScenario,
  duplicate_webhook: duplicateRequestScenario,
  delayed_webhook: duplicateRequestScenario,
  reconciliation: duplicateRequestScenario,
  auto_refund: duplicateRequestScenario,
}

export function getScenario(id: string): ScenarioDefinition {
  return SCENARIO_REGISTRY[id] || duplicateRequestScenario
}
