import { ScenarioDefinition } from './types'
import { duplicateRequestScenario } from './duplicateRequestScenario'
import { canonicalSuccessScenario } from './canonicalSuccessScenario'
import { duplicateWebhookScenario } from './duplicateWebhookScenario'
import { delayedWebhookScenario } from './delayedWebhookScenario'
import { lostWebhookScenario } from './lostWebhookScenario'
import { concurrentWebhookScenario } from './concurrentWebhookScenario'
import { autoRefundScenario } from './autoRefundScenario'
import { refundWorkerCrashScenario } from './refundWorkerCrashScenario'
import { providerTimeoutScenario } from './providerTimeoutScenario'

export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {
  duplicate_request: duplicateRequestScenario,
  canonical_success: canonicalSuccessScenario,
  duplicate_webhook: duplicateWebhookScenario,
  delayed_webhook: delayedWebhookScenario,
  lost_webhook: lostWebhookScenario,
  concurrent_webhook: concurrentWebhookScenario,
  auto_refund: autoRefundScenario,
  refund_worker_crash: refundWorkerCrashScenario,
  provider_timeout: providerTimeoutScenario,
}

export function getScenario(id: string): ScenarioDefinition {
  return SCENARIO_REGISTRY[id] || duplicateRequestScenario
}
