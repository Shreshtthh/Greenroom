import { useState, useRef, useCallback } from 'react';
import { SchedulerPanel } from './components/SchedulerPanel';
import { LedgerGrid } from './components/LedgerGrid';
import { AIBar } from './components/AIBar';
import { KPIStrip } from './components/KPIStrip';
import { AgentTrace } from './components/AgentTrace';
import { ApprovalToast } from './components/ApprovalToast';
import { initialWorkItems, initialDependencies } from './data/work-items';
import { resources } from './data/resources';
import { recalculateCost } from './lib/budget';
import type { WorkItem, AgentMessage, PendingApproval } from './lib/types';
import type { AgGridReact } from 'ag-grid-react';

export default function App() {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialWorkItems);
  const [messages, setMessages]   = useState<AgentMessage[]>([]);
  const [approval, setApproval]   = useState<PendingApproval | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  const handleSchedulerChange = useCallback((update: Partial<WorkItem> & { id: string }) => {
    setWorkItems(prev => prev.map(item => {
      if (item.id !== update.id) return item;
      return recalculateCost({ ...item, ...update });
    }));
  }, []);

  const handleAISubmit = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, workItems, resources }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response ?? 'Done.',
        toolCalls: data.toolCalls,
      }]);

      if (data.updatedItems && Array.isArray(data.updatedItems)) {
        setWorkItems(prev => {
          let updated = [...prev];
          for (const change of data.updatedItems) {
            updated = updated.map(item => {
              if (item.id !== change.id) return item;
              return recalculateCost({ ...item, ...change });
            });
          }
          return updated;
        });
      }

      if (data.pendingApproval) setApproval(data.pendingApproval);
      if (data.gridState && gridRef.current?.api) gridRef.current.api.setState(data.gridState);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'error', content: err.message }]);
    }
  }, [workItems]);

  const handleApprove = useCallback(async () => {
    if (!approval) return;
    const currentApproval = approval;
    setApproval(null);
    setMessages(prev => [...prev, { role: 'assistant', content: `Executing: ${currentApproval.description}...` }]);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: currentApproval.action,
          recipientEmail: currentApproval.recipient,
          amount: currentApproval.amount,
          note: currentApproval.description,
        }),
      });
      const data = await res.json();
      if (data.result?.status === 'payout_sent' && currentApproval.recipient) {
        setWorkItems(prev => prev.map(item => {
          if (item.payeeEmail === currentApproval.recipient && item.paypalStatus !== 'completed') {
            return { ...item, paypalStatus: 'completed', status: 'completed' };
          }
          return item;
        }));
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, toolCalls: data.toolCalls }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'error', content: `Failed: ${err.message}` }]);
    }
  }, [approval]);

  return (
    <div className="h-screen flex flex-col bg-gr-bg">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gr-border bg-gr-surface shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{'\uD83C\uDFAC'}</span>
          <h1 className="text-xl font-bold text-white tracking-tight">Greenroom</h1>
          <span className="text-sm text-gr-muted">DevConnect 2026</span>
        </div>
        <KPIStrip workItems={workItems} />
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-1/2 min-h-0 border-b border-gr-border">
            <SchedulerPanel resources={resources} workItems={workItems}
              dependencies={initialDependencies} onEventChange={handleSchedulerChange} />
          </div>
          <div className="h-1/2 min-h-0">
            <LedgerGrid ref={gridRef} workItems={workItems} resources={resources} onAIQuery={handleAISubmit} />
          </div>
        </div>

        <div className="w-80 shrink-0 border-l border-gr-border flex flex-col bg-gr-surface">
          <AIBar onSubmit={handleAISubmit} />
          <AgentTrace messages={messages} />
        </div>
      </div>

      {approval && (
        <ApprovalToast
          approval={approval}
          onApprove={handleApprove}
          onReject={() => {
            setApproval(null);
            setMessages(prev => [...prev, { role: 'assistant', content: `Rejected: ${approval.description}` }]);
          }}
        />
      )}
    </div>
  );
}
