import { ChevronDown } from 'lucide-react'

export function MetadataView() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            Trace Inspection Panel
          </h2>
          <p className="text-xs font-mono text-neutral mt-1">tx_req_01HJX...9A2B | POST /v1/charges</p>
        </div>
        <div className="px-2 py-1 bg-danger/10 border border-danger/20 text-danger rounded text-xs flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-danger"></div>
          Timeout Detected
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[300px_1fr] gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-2">
          <MetadataPanel title="Identity Vectors">
            <div className="space-y-3">
              <Field label="Trace ID" value="trace_5f8a9b2e1c3d4e5f" />
              <Field label="Span ID" value="span_a1b2c3d4e5f6" />
              <Field label="Parent Span" value="span_9z8y7x6w5v4u" />
              <Field label="Correlation ID" value="req_01HJX8Y..." active />
            </div>
          </MetadataPanel>

          <MetadataPanel title="Trace Relationships">
            <div className="relative pl-4 space-y-4 font-mono text-xs text-neutral-300">
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-surface/50"></div>
              <div className="relative">
                <div className="absolute -left-[18px] top-1.5 w-1.5 h-1.5 rounded-full bg-neutral-500"></div>
                API Gateway<br/><span className="text-neutral-500">span_9z8y...</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[18px] top-1.5 w-1.5 h-1.5 rounded-full bg-secondary"></div>
                <span className="text-secondary">Payment Router (Current)</span><br/><span className="text-neutral-500">span_a1b2...</span>
              </div>
              <div className="relative">
                <div className="absolute -left-[18px] top-1.5 w-1.5 h-1.5 rounded-full bg-danger"></div>
                Acquirer Processor<br/><span className="text-neutral-500">span_c3d4...</span>
              </div>
            </div>
          </MetadataPanel>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin">
          <MetadataPanel title="Routing Metrics">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs text-neutral mb-1">Total Latency</div>
                <div className="text-2xl font-mono text-danger">4,250ms</div>
                <div className="h-4 flex items-end gap-0.5 mt-2 opacity-50">
                  <div className="w-full bg-surface h-[20%]"></div>
                  <div className="w-full bg-surface h-[30%]"></div>
                  <div className="w-full bg-surface h-[25%]"></div>
                  <div className="w-full bg-surface h-[40%]"></div>
                  <div className="w-full bg-danger/50 h-[100%]"></div>
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral mb-1">Queue Depth</div>
                <div className="text-2xl font-mono text-white">124 req</div>
                <div className="h-4 flex items-end gap-0.5 mt-2 opacity-50">
                  <div className="w-full bg-surface h-[20%]"></div>
                  <div className="w-full bg-surface h-[20%]"></div>
                  <div className="w-full bg-surface h-[40%]"></div>
                  <div className="w-full bg-neutral-300 h-[80%]"></div>
                  <div className="w-full bg-surface h-[20%]"></div>
                  <div className="w-full bg-surface h-[20%]"></div>
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral mb-1">Node</div>
                <div className="text-2xl font-mono text-white">us-east-1a</div>
                <div className="text-xs font-mono text-neutral-400 mt-2">CPU: 84% | Mem: 62%</div>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1"><span className="text-neutral">Validation</span><span>12ms</span></div>
                <div className="h-1 bg-surface rounded"><div className="h-full bg-neutral-500 rounded" style={{width: '2%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-neutral">Risk Evaluation</span><span>150ms</span></div>
                <div className="h-1 bg-surface rounded"><div className="h-full bg-secondary rounded" style={{width: '15%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-danger">Acquirer Network</span><span className="text-danger">4,088ms</span></div>
                <div className="h-1 bg-danger/20 rounded"><div className="h-full bg-danger rounded" style={{width: '95%'}}></div></div>
              </div>
            </div>
          </MetadataPanel>

          <MetadataPanel title="Normalized Payload" rightAction={<div className="flex gap-2"><button className="px-2 py-0.5 text-[10px] border border-surface rounded text-neutral">RAW</button><button className="px-2 py-0.5 text-[10px] bg-secondary text-white rounded">JSON</button></div>}>
            <pre className="font-mono text-xs text-neutral-300 overflow-x-auto">
{`{
  "id": "ch_3M4X...",
  "object": "charge",
  "amount": 2000,
  "currency": "usd",
  "status": "failed",
  "failure_code": "acquirer_timeout",
  "payment_method_details": {
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "network_transaction_id": null
    }
  },
  "metadata": {
    "internal_route": "rt_primary",
    "retry_count": 0
  }
}`}
            </pre>
          </MetadataPanel>
        </div>
      </div>
    </div>
  )
}

function MetadataPanel({ title, children, rightAction }: { title: string, children: React.ReactNode, rightAction?: React.ReactNode }) {
  return (
    <div className="border border-surface/50 rounded-lg overflow-hidden bg-background/50">
      <div className="px-4 py-2 border-b border-surface/50 flex justify-between items-center bg-surface/10">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
          {title}
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          <ChevronDown className="w-3.5 h-3.5 text-neutral" />
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, active }: { label: string, value: string, active?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-neutral mb-1">{label}</div>
      <div className={`text-xs font-mono border rounded px-3 py-1.5 ${active ? 'border-secondary text-secondary bg-secondary/5' : 'border-surface/50 text-neutral-300'}`}>
        {value}
      </div>
    </div>
  )
}
