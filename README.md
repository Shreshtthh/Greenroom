# Greenroom — Backstage Financial & Schedule Command Center for Live Events

**Built for the "Build What's Next with PayPal and AI" Hackathon**  
**Sponsor Integrations:** AG Grid Enterprise (v36.3.0) | Bryntum Scheduler Pro (v7.3.8) | APIMatic (`@paypal/paypal-server-sdk` v2.5.0) | Render

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)
[![PayPal Sandbox](https://img.shields.io/badge/PayPal-Sandbox_API_v2-00457C?logo=paypal)](https://developer.paypal.com)
[![AG Grid Enterprise](https://img.shields.io/badge/AG_Grid-Enterprise_v36.3-FF8C00)](https://www.ag-grid.com)
[![Bryntum Scheduler Pro](https://img.shields.io/badge/Bryntum-Scheduler_Pro_v7.3-3B82F6)](https://bryntum.com)
[![Deployed on Render](https://img.shields.io/badge/Render-Blueprint_Ready-46E3B7)](./render.yaml)

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [System Architecture & Data Flow](#2-system-architecture--data-flow)
3. [Unified Domain Model & Cost Mathematics](#3-unified-domain-model--cost-mathematics)
4. [Sponsor Engineering Deep-Dives](#4-sponsor-engineering-deep-dives)
   - [4.1 AG Grid Enterprise v36.3 & AG Grid AI Toolkit Engine](#41-ag-grid-enterprise-v363--ag-grid-ai-toolkit-engine)
   - [4.2 Bryntum Scheduler Pro v7.3 Dependency & Resource Engine](#42-bryntum-scheduler-pro-v73-dependency--resource-engine)
   - [4.3 APIMatic & PayPal Three-Layer Payment Architecture](#43-apimatic--paypal-three-layer-payment-architecture)
   - [4.4 Render Production Blueprint](#44-render-production-blueprint)
5. [Development with Sponsor MCP Servers](#5-development-with-sponsor-mcp-servers)
6. [Backend API Reference](#6-backend-api-reference)
7. [Installation, Configuration & Local Execution](#7-installation-configuration--local-execution)
8. [End-to-End Verification Scenarios](#8-end-to-end-verification-scenarios)
9. [Repository Structure](#9-repository-structure)
10. [License](#10-license)

---

## 1. Executive Summary & Problem Statement

Organizing a multi-track technical conference or hackathon (modeled in this project as **DevConnect 2026**, a 2-day event on November 14–15, 2026) requires synchronizing three tightly coupled operational domains that traditionally live in isolated tools:

1. **Temporal & Resource Scheduling (Run-of-Show):** Allocating physical rooms (`Main Stage`, `Workshop Room A`, `Workshop Room B`), technical crews (`AV Team`, `CloudLens Photography`, `Bay Area Catering`, `MerchOps`), and speakers across a constrained timeline with strict finish-to-start dependencies.
2. **Financial Accounting & Budget Tracking (The Ledger):** Tracking hourly vendor labor rates, fixed catering contracts, speaker honoraria, hackathon prize pools, and inbound sponsorship receivables across budget categories.
3. **Payment Execution (Receivables & Payables):** Issuing itemized B2B invoices to corporate sponsors, tracking overdue receivables, and disbursing outbound payouts to speakers and contractors once deliverables are completed.

**The Operational Failure Mode:**  
When a live event deviates from plan—for example, a morning AV call or photography shift is extended by two hours, or a keynote is delayed—organizers manually update a Gantt chart, copy-paste hour deltas into a spreadsheet, recompute category subtotals, and separately log into a payment portal to invoice sponsors or pay vendors. Because the schedule, the ledger, and the payment rails do not share a single source of truth, budget overruns and missed sponsor collections go undetected until post-event reconciliation.

**The Greenroom Solution:**  
Greenroom unifies **Bryntum Scheduler Pro**, **AG Grid Enterprise**, and **PayPal's Sandbox APIs** around a single reactive `WorkItem[]` state tree, paired with an AI operations agent and a natural-language grid state engine:
- Resizing or dragging an hourly task in **Bryntum Scheduler Pro** immediately recalculates item cost, updates group subtotals in **AG Grid Enterprise**, and recomputes event-wide financial KPIs (**Total Budget**, **Sponsor Income**, **Paid Out**, **Invoices Paid**, **Overdue**, and **Net Position**).
- Typing natural-language view commands into the **AG Grid AI** bar dynamically reconfigures grid grouping, multi-column sorting, filtering, and column visibility.
- Conversing with the **Greenroom AI** operations assistant dispatches real B2B sponsor invoices via **PayPal Invoicing v2** and queues outbound speaker/vendor disbursements via **PayPal Payouts v1** behind a mandatory human-in-the-loop approval gate.

---

## 2. System Architecture & Data Flow

### 2.1 High-Level Component & Integration Topology

```text
+---------------------------------------------------------------------------------------------------+
|                        REACT 18 FRONTEND (Shared WorkItem[] State Tree)                           |
|                                                                                                   |
|  +-------------------------------------------+     +-------------------------------------------+  |
|  | Bryntum Scheduler Pro v7.3                |     | AG Grid Enterprise v36.3                  |  |
|  | - 11 Stages, Crews & Sponsors             |<--->| - Grouped Financial Ledger (sum hours/$)  |  |
|  | - 17 Finish-to-Start Dependency Chains    |     | - AG Grid AI Natural-Language Bar         |  |
|  | - onEventResizeEnd / onEventDrop hooks    |     | - getStructuredSchema() / setState()      |  |
|  +---------------------+---------------------+     +---------------------+---------------------+  |
|                        |                                                 |                        |
|                        +------------------------+------------------------+                        |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | Live KPI Header Strip (Total Budget | Sponsor Income | Paid Out | Invoices Paid | Net)      |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +-------------------------------------------+     +-------------------------------------------+  |
|  | Greenroom AI Operations Sidebar           |     | Human-in-the-Loop ApprovalToast           |  |
|  | - Natural-Language Prompt Bar             |---->| - Gated Approval for Outbound Payouts     |  |
|  | - Live Tool Execution Agent Trace         |     | - Explicit Approve / Reject Controls      |  |
|  +---------------------+---------------------+     +---------------------+---------------------+  |
+------------------------|-------------------------------------------------|------------------------+
                         | POST /api/chat                                  | POST /api/approve
                         | POST /api/grid-ai                               |
                         v                                                 v
+---------------------------------------------------------------------------------------------------+
|                              EXPRESS + TYPESCRIPT BACKEND (Port 3001)                             |
|                                                                                                   |
|  +---------------------------+   +---------------------------+   +-----------------------------+  |
|  | server/agent-handler.ts   |   | server/grid-ai-handler.ts |   | server/paypal-proxy.ts      |  |
|  | - Schedule & Budget AI    |   | - NL to AG Grid State     |   | - APIMatic SDK OAuth2 Auth  |  |
|  | - Autonomous Invoicing    |   | - Filter / Sort / Group   |   | - PayPal Invoicing v2 API   |  |
|  | - Payout Approval Gating  |   |   JSON State Compiler     |   | - PayPal Payouts v1 API     |  |
|  +-------------+-------------+   +-------------+-------------+   +--------------+--------------+  |
+----------------|-------------------------------|--------------------------------|-----------------+
                 |                               |                                |
                 +---------------+---------------+                                |
                                 |                                                |
                                 v                                                v
+-------------------------------------------------+   +---------------------------------------------+
| MULTI-PROVIDER LLM INFERENCE (server/llm.ts)    |   | PAYPAL DEVELOPER SANDBOX PLATFORM           |
| - Groq Cloud / xAI / OpenAI / Google Gemini     |   | - @paypal/paypal-server-sdk v2.5 (APIMatic) |
| - Low-latency structured directive generation   |   | - POST /v1/oauth2/token (Basic Auth)        |
|                                                 |   | - POST /v2/invoicing/invoices (+ /send)     |
|                                                 |   | - POST /v1/payments/payouts (Batch Payout)  |
+-------------------------------------------------+   +---------------------------------------------+
```

### 2.2 End-to-End Execution Flows (Invoicing & Approval-Gated Payouts)

```text
FLOW A: AUTONOMOUS SPONSOR INVOICING (INBOUND RECEIVABLE)
=========================================================
[Organizer]
   |  1. Enters prompt: "Send Neural Labs their sponsor invoice"
   v
[React UI (App.tsx)] ---> POST /api/chat { message, workItems, resources }
   |
   v
[Express (agent-handler.ts)] ---> Calls LLM (server/llm.ts)
   |  2. LLM identifies Bronze Sponsorship Package ($1,000, neural-ops@business.example.com)
   |     and emits INVOICE_JSON directive
   v
[PayPal Proxy (paypal-proxy.ts)]
   |  3. Calls APIMatic SDK: OAuthAuthorizationController.requestToken(Basic Auth)
   |  4. POST /v2/invoicing/invoices (Creates draft invoice in PayPal Sandbox)
   |  5. POST /v2/invoicing/invoices/{invoiceId}/send (Dispatches invoice to sponsor)
   v
[React UI & AG Grid Enterprise]
   |  6. Logs `tool: create_and_send_invoice` in Agent Trace
   |  7. Flips AG Grid Payment status badge from "draft" -> "sent" and increments Overdue KPI


FLOW B: HUMAN-IN-THE-LOOP SPEAKER PAYOUT (OUTBOUND PAYABLE)
===========================================================
[Organizer]
   |  1. Enters prompt: "Pay Sarah Chen for the keynote"
   v
[Express (agent-handler.ts)] ---> Calls LLM (server/llm.ts)
   |  2. LLM identifies Keynote: AI Frontiers ($350, sarah.chen@personal.example.com)
   |     and emits APPROVAL_JSON:{ action: "payout", amount: 350, recipient: "sarah.chen@..." }
   v
[ApprovalToast Component]
   |  3. Renders modal: "Agent Approval Required — Pay Sarah Chen for Keynote ($350)"
   |  4. Organizer clicks [Approve]
   v
[Express (/api/approve)] ---> Calls sendPayout() in server/paypal-proxy.ts
   |  5. Obtains OAuth2 Bearer Token via APIMatic SDK OAuthAuthorizationController
   |  6. POST /v1/payments/payouts (Dispatches batch payout in PayPal Sandbox)
   v
[React UI, AG Grid & Bryntum Scheduler Pro]
   |  7. Logs `tool: paypal_payouts_create` with Batch ID in Agent Trace
   |  8. Flips AG Grid Payment badge to "completed" (green) & increments Paid Out KPI ($0 -> $350)
   |  9. Transitions Keynote event bar in Bryntum Scheduler Pro to emerald green (#22c55e)
```

---

## 3. Unified Domain Model & Cost Mathematics

Both **Bryntum Scheduler Pro** and **AG Grid Enterprise** consume the same canonical `WorkItem` array defined in [`src/lib/types.ts`](./src/lib/types.ts). Neither component maintains a disconnected copy of cost or schedule state.

### 3.1 Core TypeScript Interfaces (`src/lib/types.ts`)

```typescript
export interface WorkItem {
  id: string;
  title: string;
  type: 'session' | 'vendor' | 'sponsor' | 'prize' | 'staff';
  resourceId: string;
  startDate: string;          // ISO-8601 datetime (e.g., "2026-11-14T08:30:00")
  endDate: string;            // ISO-8601 datetime
  duration: number;           // Duration in decimal hours
  rateType: 'hourly' | 'fixed';
  rate: number;               // Hourly rate ($/hr) or fixed contract amount ($)
  totalCost: number;          // Dynamically computed line-item total ($)
  budgetCategory: string;     // "AV & Production" | "Speakers" | "Catering" | "Swag & Merch" | "Prizes" | "Sponsorship" | "Operations"
  payDirection: 'inbound' | 'outbound' | 'none';
  paypalType: 'invoice' | 'order' | 'payout' | null;
  paypalId: string | null;
  paypalStatus: 'draft' | 'sent' | 'paid' | 'pending' | 'completed' | null;
  payeeEmail: string | null;  // Outbound payout recipient (PayPal sandbox personal account)
  payerEmail: string | null;  // Inbound invoice recipient (PayPal sandbox business account)
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  eventColor?: string;
}
```

### 3.2 Real-Time Cost & KPI Derivation (`src/lib/budget.ts`)

When an event is resized or dragged in Bryntum Scheduler Pro, the duration delta is computed from the start and end timestamps:

```text
duration (hours) = (endDate.getTime() - startDate.getTime()) / 3,600,000
```

For items where `rateType === 'hourly'`, `recalculateCost()` updates `totalCost`:

```text
totalCost = Math.round(rate * duration * 100) / 100
```

From the updated `WorkItem[]` state, `computeKPIs()` derives the six live header metrics:

- **Total Budget (`totalOutbound`):** Sum of `totalCost` for all items where `payDirection === 'outbound'`
- **Sponsor Income (`totalInbound`):** Sum of `totalCost` for all items where `payDirection === 'inbound'`
- **Paid Out (`paidOut`):** Sum of `totalCost` for all items where `payDirection === 'outbound'` and `paypalStatus === 'completed'`
- **Invoices Paid (`invoicesPaid`):** Sum of `totalCost` for all items where `payDirection === 'inbound'` and `paypalStatus === 'paid'`
- **Overdue Count (`overdue`):** Count of items where `payDirection === 'inbound'` and `paypalStatus === 'sent'`
- **Net Position (`net`):** `totalInbound - totalOutbound`

---

## 4. Sponsor Engineering Deep-Dives

### 4.1 AG Grid Enterprise v36.3 & AG Grid AI Toolkit Engine

**Implementation Files:**
- [`src/main.tsx`](./src/main.tsx) — Enterprise module registration
- [`src/components/LedgerGrid.tsx`](./src/components/LedgerGrid.tsx) — Primary financial ledger & AI bar
- [`server/grid-ai-handler.ts`](./server/grid-ai-handler.ts) — Natural language to AG Grid state compiler
- [`src/components/TransactionLog.tsx`](./src/components/TransactionLog.tsx) — Secondary PayPal transaction search grid

**Key Technical Implementations:**
1. **v36 Module Registration & Programmatic Dark Theming:**  
   Registers `AllCommunityModule` and `AllEnterpriseModule` via `ModuleRegistry.registerModules()` and composes the v36 Quartz dark-blue theme (`themeQuartz.withPart(colorSchemeDarkBlue)`) to match the surrounding backstage UI without legacy CSS file bloat.
2. **Enterprise Row Grouping & Live Aggregations:**  
   Columns are grouped by `budgetCategory` by default (`rowGroup: true`, `groupDefaultExpanded: 1`), with `enableRowGroup: true` enabled across all columns via `defaultColDef` so the AI engine can dynamically regroup the ledger by `type`, `payDirection`, `paypalStatus`, or `status`. The `duration` (`Hours`) and `totalCost` (`Cost`) columns define `aggFunc: 'sum'`, computing live category subtotals whenever Bryntum updates an item's duration.
3. **Custom React JSX Cell Renderers:**  
   Renders color-coded category badges for `type` (`session`, `vendor`, `sponsor`, `prize`, `staff`), directional flow indicators for `payDirection` (`↓ In`, `↑ Out`), and translucent status pills for `paypalStatus` (`paid`, `completed`, `sent`, `pending`, `draft`), plus conditional cell styling highlighting line items where `totalCost > $500`.
4. **Natural-Language AG Grid AI Toolkit Workflow (`/api/grid-ai`):**  
   When the organizer enters a query in the **AG Grid AI** bar (for example, *"group by type, sort by cost descending, show only outbound"*), `LedgerGrid.tsx` captures the grid's structured schema (`api.getStructuredSchema()`) and current state (`api.getState()`) and posts them to `/api/grid-ai`. The backend translates the intent into a structured AG Grid state object containing `filter.filterModel`, `sort.sortModel`, `rowGroup.groupColIds`, and `columnVisibility.hiddenColIds`, which the frontend applies via `api.setFilterModel()`, `api.applyColumnState()`, `api.setRowGroupColumns()`, and `api.setColumnsVisible()`. A dedicated **Reset** button restores the default grouping and clears active filters in one click.

---

### 4.2 Bryntum Scheduler Pro v7.3 Dependency & Resource Engine

**Implementation Files:**
- [`src/components/SchedulerPanel.tsx`](./src/components/SchedulerPanel.tsx) — Bryntum Scheduler Pro React wrapper & event listeners
- [`src/data/resources.ts`](./src/data/resources.ts) — 11 conference resources across stages, crews, and sponsors
- [`src/data/work-items.ts`](./src/data/work-items.ts) — 25 scheduled work items & 17 dependency links

**Key Technical Implementations:**
1. **Public npm Trial Package Aliasing:**  
   Configured in [`package.json`](./package.json) using npm package aliasing (`"@bryntum/schedulerpro": "npm:@bryntum/schedulerpro-trial@7.3.8"`) paired with `@bryntum/schedulerpro-react@7.3.8` and the `@bryntum/schedulerpro/stockholm-dark.css` theme, enabling zero-credential `npm install` in local and CI/CD environments.
2. **Multi-Domain Resource & Dependency Graph Modeling:**  
   Models 11 distinct resources across physical rooms (`Main Stage`, `Workshop Room A`, `Workshop Room B`), hourly/fixed production crews (`AV Team` at $85/hr, `CloudLens Photography` at $200/hr, `Bay Area Catering`, `MerchOps`), and corporate sponsors (`Acme Corp`, `ByteScale`, `Neural Labs`). The timeline enforces 17 finish-to-start dependencies (`initialDependencies`) across Day 1 and Day 2 (e.g., `Registration` $\rightarrow$ `Keynote` $\rightarrow$ `MCP Workshop` $\rightarrow$ `Lunch Service` $\rightarrow$ `Open Source Panel` $\rightarrow$ `Hackathon Kickoff`).
3. **Bidirectional Cost Sync via `onEventResizeEnd` and `onEventDrop`:**  
   When an organizer drags an event to a different time slot or resizes its duration bar, `SchedulerPanel.tsx` extracts `eventRecord.startDate`, `eventRecord.endDate`, and `eventRecord.resourceId`, computes the exact hour duration (`ms / 3_600_000`), and invokes `onEventChange()`. React state immediately recalculates the item's `totalCost` and updates AG Grid and the KPI Strip on the same frame.
4. **Payment-State Visual Feedback:**  
   Event bars dynamically bind their `eventColor` to operational and payment state—transitioning to emerald green (`#22c55e`) the moment a speaker or vendor payout is approved and completed via PayPal.

---

### 4.3 APIMatic & PayPal Three-Layer Payment Architecture

**Implementation Files:**
- [`server/paypal-proxy.ts`](./server/paypal-proxy.ts) — APIMatic SDK client, OAuth2 controller, Invoicing v2, and Payouts v1
- [`server/agent-handler.ts`](./server/agent-handler.ts) — AI agent orchestration & directive parser
- [`server/index.ts`](./server/index.ts) — `/api/chat` and `/api/approve` execution routes

**Why a Three-Layer Architecture?**  
PayPal's `@paypal/paypal-server-sdk` (v2.5.0, generated by **APIMatic**) provides strongly-typed controllers for `Orders`, `Payments`, `Subscriptions`, `TransactionSearch`, `Vault`, and `OAuthAuthorization`, while B2B `Invoicing` and batch `Payouts` are exposed via `@paypal/agent-toolkit` and PayPal's REST v1/v2 endpoints. Greenroom combines all three layers cleanly:

| Layer | Technology / Package | Endpoints / Controllers Used | Role in Greenroom |
| :--- | :--- | :--- | :--- |
| **Layer 1: Core SDK & Auth** | `@paypal/paypal-server-sdk@2.5.0` (APIMatic) | `Client`, `Environment.Sandbox`, `OAuthAuthorizationController.requestToken`, `OrdersController`, `TransactionSearchController` | Type-safe OAuth 2.0 `client_credentials` token generation (Basic Auth), workshop/booth order management, and sandbox transaction lookups. |
| **Layer 2: Inbound Receivables** | PayPal Invoicing v2 API + `@paypal/agent-toolkit@1.11.0` | `POST /v2/invoicing/invoices`<br/>`POST /v2/invoicing/invoices/{id}/send` | Autonomous creation and dispatch of itemized sponsor invoices (`Gold`, `Silver`, `Bronze` packages) when triggered via Greenroom AI. |
| **Layer 3: Outbound Payables** | PayPal Payouts v1 API (Reusing APIMatic SDK OAuth Token) | `POST /v1/payments/payouts` | Human-approved batch disbursements for speaker honoraria, hourly AV/photography crews, and hackathon prize winners. |

**Human-in-the-Loop Financial Safety Gate:**  
Inbound sponsor invoicing is safe to execute autonomously, so Greenroom AI dispatches invoices immediately and logs the `create_and_send_invoice` call in the Agent Trace. Outbound payouts move actual funds out of the event account, so Greenroom enforces a strict approval gate:
1. When asked to *"Pay Sarah Chen for the keynote"*, the agent identifies Sarah Chen's payee email (`sarah.chen@personal.example.com`) and honorarium (`$350`) from the `WorkItem` state and returns a `pendingApproval` payload.
2. The UI displays `ApprovalToast.tsx` with the exact recipient, description, and dollar amount, giving the organizer explicit **Approve** and **Reject** controls.
3. Only when the organizer clicks **Approve** does the frontend call `POST /api/approve`, which invokes `sendPayout()` against PayPal Sandbox, records the `payout_batch_id` in the Agent Trace, marks the item `completed` in AG Grid and Bryntum, and increments **Paid Out** in the KPI Strip.

---

### 4.4 Render Production Blueprint

**Implementation File:** [`render.yaml`](./render.yaml)

Greenroom is packaged as an Infrastructure-as-Code Render Blueprint (`render.yaml`) that builds the TypeScript/Vite frontend (`npm install && npm run build`) and runs the Express production server (`npm run start` with `NODE_ENV=production`), serving both the compiled SPA bundle from `dist/` and the `/api/*` endpoints on a single service with `/api/health` readiness probes.

---

## 5. Development with Sponsor MCP Servers

During engineering and debugging, three sponsor Model Context Protocol (MCP) servers were used to inspect package exports, component props, and SDK signatures:

1. **AG Grid MCP (`npx ag-mcp`):**  
   Used to verify AG Grid v36 module registration (`AllCommunityModule`, `AllEnterpriseModule`), programmatic theme composition (`themeQuartz.withPart(colorSchemeDarkBlue)`), React JSX `cellRenderer` return conventions in `ag-grid-react` v36, and `setFilterModel` / `applyColumnState` / `setRowGroupColumns` state application methods.
2. **Bryntum MCP (`https://mcp.bryntum.com`):**  
   Used to verify `@bryntum/schedulerpro-trial` v7.3.8 public npm aliasing, CSS theme import paths (`@bryntum/schedulerpro/stockholm-dark.css`), and the exact event payload shapes for `onEventResizeEnd={({ eventRecord }) => ...}` and `onEventDrop={({ eventRecords }) => ...}`.
3. **APIMatic ContextMatic MCP (`https://chatbotapi.apimatic.io/mcp/plugins`):**  
   Used to inspect the APIMatic-generated `@paypal/paypal-server-sdk` v2.5.0 controller hierarchy and verify how `OAuthAuthorizationController.requestToken({ authorization: basicAuth })` issues reusable OAuth 2.0 bearer tokens for downstream PayPal REST endpoints.

---

## 6. Backend API Reference

| Method & Route | Request Body | Response Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST /api/chat` | `{ message: string, workItems: WorkItem[], resources: Resource[] }` | `{ response: string, toolCalls: ToolCall[], pendingApproval?: PendingApproval, updatedItems?: Partial<WorkItem>[] }` | Primary Greenroom AI agent endpoint. Handles budget Q&A, autonomous PayPal invoicing, payout approval proposals, and schedule modifications. |
| `POST /api/grid-ai` | `{ prompt: string, currentState?: object, schema?: object }` | `{ gridState: { filter?, sort?, rowGroup?, columnVisibility? }, explanation: string }` | AG Grid AI Toolkit endpoint. Converts natural-language view queries into structured AG Grid state objects. |
| `POST /api/approve` | `{ action: "payout", recipientEmail: string, amount: number, currency?: string, note?: string }` | `{ response: string, result: { status: "payout_sent", batchId: string }, toolCalls: ToolCall[] }` | Executes human-approved outbound PayPal Sandbox Payouts and returns the batch ID and trace entry. |
| `GET /api/health` | *None* | `{ status: "ok", timestamp: string }` | Health check endpoint for Render zero-downtime deployments. |

---

## 7. Installation, Configuration & Local Execution

### Prerequisites
- **Node.js:** v20.x or later
- **PayPal Developer Account:** Free Sandbox Client ID & Secret from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
- **LLM API Key:** Groq (`GROQ_API_KEY`), xAI (`XAI_API_KEY`), OpenAI (`OPENAI_API_KEY`), or Google Gemini (`GOOGLE_GENERATIVE_AI_API_KEY`)

### Step 1: Clone and Install Dependencies
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd greenroom
npm install
```

### Step 2: Configure `.env`
Copy `.env.example` to `.env` and populate your credentials:
```bash
cp .env.example .env
```

```ini
# PayPal Developer Sandbox Credentials
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox

# LLM Configuration (supports: groq | xai | openai | google)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

# Server Port
PORT=3001
```

### Step 3: Start the Development Environment
```bash
npm run dev
```
This launches both servers concurrently:
- **Vite React Frontend:** `http://localhost:5173` (proxies `/api/*` to port 3001)
- **Express TypeScript API Server:** `http://localhost:3001`

---

## 8. End-to-End Verification Scenarios

### Scenario 1: Bryntum Schedule Resize to AG Grid Cost Cascade
1. Locate **`AV Support: Morning`** on the `AV Team` row in **Bryntum Scheduler Pro** (scheduled 8:00 AM – 12:00 PM, 4 hours at $85/hr = **$340**).
2. Drag the right edge of the event bar from `12:00 PM` to `2:00 PM` (extending duration to 6 hours).
3. Observe **AG Grid Enterprise** immediately update `AV Support: Morning` from `4h` / `$340` to `6h` / **`$510`** (highlighted in amber as `> $500`), recalculate the `AV & Production` group subtotal (`$4,672.5` $\rightarrow$ `$4,842.5`), and update **Total Budget** (`$13,822.5` $\rightarrow$ `$13,992.5`) and **Net** (`-$5,322.5` $\rightarrow$ `-$5,492.5`) in the header KPI strip.

### Scenario 2: AG Grid AI Natural-Language State Control
1. In the **AG Grid AI** bar between the scheduler and ledger, enter:
   ```text
   group by type, sort by cost descending
   ```
2. Click **Apply**. Observe the grid dynamically regroup all 25 rows by `type` (`session`, `vendor`, `sponsor`, `prize`, `staff`) and sort items within each group from highest to lowest cost.
3. Click **Reset** to restore the default `Budget Category` grouping.

### Scenario 3: Autonomous PayPal Sponsor Invoicing
1. Expand the **`Sponsorship`** group in AG Grid and note **`Bronze Sponsorship Package`** ($1,000 for Neural Labs, `neural-ops@business.example.com`) has Payment status `draft`.
2. In the **Greenroom AI** sidebar, enter:
   ```text
   Send Neural Labs their sponsor invoice
   ```
3. Click **Send to Agent**. Observe the **Agent Trace** log `tool: create_and_send_invoice` with the PayPal Sandbox invoice dispatch confirmation, the AG Grid row status badge update from `draft` to `sent`, and the header **Overdue** counter increment from `1` to `2`.

### Scenario 4: Human-in-the-Loop PayPal Speaker Payout
1. Expand the **`Speakers`** group in AG Grid and note **`Keynote: AI Frontiers`** ($350 for Sarah Chen, `sarah.chen@personal.example.com`).
2. In the **Greenroom AI** sidebar, enter:
   ```text
   Pay Sarah Chen for the keynote
   ```
3. Click **Send to Agent**. Observe the **Agent Approval Required ($350)** toast appear in the bottom-right corner.
4. Click **Approve**. Observe the Agent Trace log `tool: paypal_payouts_create` with the PayPal Sandbox batch ID, the AG Grid row Payment badge turn green (`completed`), the `Keynote` bar in Bryntum Scheduler Pro turn green, and the **Paid Out** KPI in the header increase from `$0` to `$350`.

---

## 9. Repository Structure

```text
greenroom/
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI pipeline (typecheck + production build)
├── scripts/
│   └── seed-sandbox.ts         # PayPal Sandbox seeding utility
├── server/
│   ├── index.ts                # Express server & API routes (/api/chat, /api/grid-ai, /api/approve, /api/health)
│   ├── agent-handler.ts        # Greenroom AI agent orchestration & directive execution
│   ├── grid-ai-handler.ts      # Natural-language to AG Grid state compiler
│   ├── paypal-proxy.ts         # APIMatic PayPal Server SDK client, OAuth2, Invoicing v2, Payouts v1
│   └── llm.ts                  # Multi-provider LLM configuration (Groq, xAI, OpenAI, Gemini)
├── src/
│   ├── App.tsx                 # Root layout, unified WorkItem[] state, and approval workflow
│   ├── main.tsx                # Entry point, AG Grid Enterprise registration, Bryntum theme import
│   ├── index.css               # Global dark theme styles & animations
│   ├── components/
│   │   ├── SchedulerPanel.tsx  # Bryntum Scheduler Pro wrapper with dependency & resize/drop handlers
│   │   ├── LedgerGrid.tsx      # AG Grid Enterprise ledger + AG Grid AI bar & Reset control
│   │   ├── KPIStrip.tsx        # Real-time financial KPI header cards
│   │   ├── AIBar.tsx           # Greenroom AI natural-language input component
│   │   ├── AgentTrace.tsx      # Tool invocation & execution trace log
│   │   ├── ApprovalToast.tsx   # Human-in-the-loop PayPal payout approval modal
│   │   └── TransactionLog.tsx  # AG Grid view for PayPal Sandbox transaction search records
│   ├── data/
│   │   ├── resources.ts        # 11 conference resources (stages, crews, sponsors)
│   │   └── work-items.ts       # 25 conference work items & 17 finish-to-start dependencies
│   └── lib/
│       ├── budget.ts           # Hourly cost recalculation & KPI aggregation functions
│       └── types.ts            # Shared TypeScript interfaces
├── .env.example                # Environment variable template
├── index.html                  # HTML entry shell
├── LICENSE                     # MIT License
├── package.json                # Dependencies & build scripts
├── render.yaml                 # Render Blueprint deployment configuration
├── tailwind.config.js          # Tailwind CSS dark palette configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite bundler & local API proxy configuration
```

---

## 10. License

This project is licensed under the **MIT License** — see the [`LICENSE`](./LICENSE) file for details.
