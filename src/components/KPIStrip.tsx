import { useMemo } from 'react';
import { computeKPIs } from '../lib/budget';
import type { WorkItem } from '../lib/types';

interface Props { workItems: WorkItem[]; }

export function KPIStrip({ workItems }: Props) {
  const kpi = useMemo(() => computeKPIs(workItems), [workItems]);

  const cards = [
    { label: 'Total Budget',   value: `$${kpi.totalOutbound.toLocaleString()}`, color: 'text-white' },
    { label: 'Sponsor Income', value: `$${kpi.totalInbound.toLocaleString()}`,  color: 'text-green-400' },
    { label: 'Paid Out',       value: `$${kpi.paidOut.toLocaleString()}`,       color: 'text-blue-400' },
    { label: 'Invoices Paid',  value: `$${kpi.invoicesPaid.toLocaleString()}`,  color: 'text-emerald-400' },
    { label: 'Overdue',        value: String(kpi.overdue),                      color: kpi.overdue > 0 ? 'text-amber-400' : 'text-gray-500' },
    { label: 'Net',            value: `$${kpi.net.toLocaleString()}`,           color: kpi.net >= 0 ? 'text-green-400' : 'text-red-400' },
  ];

  return (
    <div className="flex items-center gap-5">
      {cards.map(c => (
        <div key={c.label} className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-gr-muted">{c.label}</div>
          <div className={`text-sm font-bold ${c.color}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}