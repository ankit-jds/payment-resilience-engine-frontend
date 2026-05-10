# Payment Consistency Engine — Simulation Frontend

Payment systems fail in ways that are invisible until money is involved.
This frontend makes those failures visible.

It is an interactive simulation layer built to visualize how the backend Payment Consistency Engine handles failures and preserves payment correctness.

**Status: In progress**

---

## Stack

* React + TypeScript
* Zustand
* Framer Motion
* TailwindCSS
* SSE-based simulation runtime

---

## Purpose

The backend implements resilience.

This frontend explains it.

It turns invisible payment failure scenarios into visual state-machine simulations so system behavior can be understood step-by-step.

The goal is not payment UI.

The goal is failure visibility.

---

## Patterns being visualized

* Idempotency
* Race condition handling
* Retry logic
* Webhook resilience
* Eventual consistency
* Automatic compensation (refunds)

---

## Out of scope / simulated

* No real payments
* No Stripe / Razorpay integration
* No authentication / authorization
* No PCI flows
* Backend event stream is simulated locally through Mock SSE

---

## What is built so far

This frontend acts as the visualization layer for the backend resilience engine.

It simulates backend-originated events and renders them as live state transitions.

The goal is operational clarity under failure.

---

## Core Simulation Logic

The frontend is built around an event-driven runtime:

Mock SSE / Backend SSE
↓
Runtime Engine
↓
State Store
↓
Graph Renderer

This ensures the UI behaves like a real distributed payment system.

Not a scripted animation.

---

## Implemented Failure Scenarios

### Duplicate Request Prevention

Simulates double-click checkout requests.

Shows how idempotency guarantees only one order is created.

**2 requests → 1 order**

---

### Canonical Success Winner

Simulates multiple successful payment attempts for one order.

Shows how only the first success becomes canonical.

**Multiple successes → 1 accepted payment**

---

### Duplicate Webhook Handling

Simulates repeated provider webhooks.

Shows how duplicate events are safely ignored.

**Repeated webhook → single state mutation**

---

### Delayed Webhook Recovery

Simulates webhook delivery delays causing user retries.

Shows how late success is safely resolved.

**Delayed success → correct final state**

---

### Lost Webhook Recovery

Simulates permanently dropped provider webhooks.

Shows how reconciliation restores system truth.

**Missing webhook → background recovery**

---

### Concurrent Webhook Race

Simulates simultaneous webhook processing.

Shows how locking prevents race conditions.

**Parallel webhooks → sequential consistency**

---

### Automatic Refund Processing

Simulates duplicate payment compensation.

Shows automatic refund pipelines.

**Duplicate payment → refund initiated**

---

### Refund Worker Crash Recovery

Simulates refund worker crashes.

Shows safe job recovery.

**Worker failure → refund resumes**

---

### Provider Timeout Retry

Simulates provider timeouts during payment execution.

Shows retry-safe payment processing.

**Timeout → safe retry**

---

## UI Components

### Scenario Sidebar

Lists all failure scenarios grouped by category.

---

### State Machine Graph

Visualizes live state transitions.

Shows branching, retries, duplicates, and recovery flows.

---

### Timeline Log

Shows chronological event execution.

Makes async system behavior understandable.

---

### Request Flow Panel

Shows how frontend, backend, gateway, and workers interact.

---

## Why this exists

Backend correctness is difficult to explain through APIs and logs.

This frontend makes payment resilience understandable.

For engineers, product teams, and business stakeholders.

It shows how the system behaves when things go wrong — before real money is involved.

---

## Remaining Work

### Real Backend SSE Integration

Replace Mock SSE with live backend events.

---

### Production Observability

Add metrics for retries, webhook delays, and refund recovery.

---

### Simulation Recording

Persist simulation sessions for debugging and demos.





