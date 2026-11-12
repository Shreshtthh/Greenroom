import { forwardRef, useMemo, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz, colorSchemeDarkBlue, type ColDef } from 'ag-grid-community';
import type { WorkItem, Resource } from '../lib/types';
import { getResourceName } from '../data/resources';

interface Props {
  workItems: WorkItem[];
  resources: Resource[];
  onAIQuery: (query: string) => void;
}

const currencyFmt = (p: any) => (p.value != null ? `$${Number(p.value).toLocaleString()}` : '');
const statusColors: Record<string, string> = {
  paid: '#22c55e', completed: '#22c55e', sent: '#f59e0b', pending: '#3b82f6', draft: '#6b7280',
};
const darkTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export const LedgerGrid = forwardRef<AgGridReact, Props>(({ workItems, resources, onAIQuery }, ref) => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  const rowData = useMemo(() =>
    workItems.map(w => ({ ...w, resourceName: getResourceName(w.resourceId) })),
  [workItems]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'budgetCategory', rowGroup: true, hide: true },
    { field: 'title', headerName: 'Item', flex: 2, minWidth: 160 },
    { field: 'type', headerName: 'Type', width: 90,
      cellRenderer: (p: any) => {
        if (!p.value) return null;
        const colors: Record<string, string> = { session: '#3b82f6', vendor: '#f59e0b', sponsor: '#fbbf24', prize: '#a855f7', staff: '#64748b' };
        return <span style={{ color: colors[p.value] ?? '#fff' }}>{p.value}</span>;
      }
    },
    { field: 'resourceName', headerName: 'Assigned To', width: 160 },
    { field: 'duration', headerName: 'Hours', width: 80, aggFunc: 'sum',
      valueFormatter: (p: any) => p.value ? `${p.value}h` : '' },
    { field: 'rate', headerName: 'Rate', width: 90, valueFormatter: currencyFmt },
    { field: 'totalCost', headerName: 'Cost', width: 110, aggFunc: 'sum', valueFormatter: currencyFmt,
      cellStyle: (p: any) => (p.value > 500 ? { color: '#fbbf24', fontWeight: 600 } : null) },
    { field: 'payDirection', headerName: 'Direction', width: 100,
      cellRenderer: (p: any) => p.value === 'inbound' ? <span>↓ In</span> : p.value === 'outbound' ? <span>↑ Out</span> : <span>—</span> },
    { field: 'paypalStatus', headerName: 'Payment', width: 110,
      cellRenderer: (p: any) => {
        if (!p.value) return <span>—</span>;
        const color = statusColors[p.value] ?? '#fff';
        return <span style={{ background: `${color}20`, color, padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.value}</span>;
      }
    },
    { field: 'status', headerName: 'Status', width: 100 },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true, filter: true, resizable: true, enableRowGroup: true,
  }), []);

  const autoGroupColumnDef = useMemo(() => ({
    headerName: 'Group', minWidth: 200,
    cellRendererParams: { suppressCount: false },
  }), []);

  const handleAISubmit = useCallback(async () => {
    if (!aiQuery.trim() || aiLoading) return;
    const prompt = aiQuery.trim();
    setAiLoading(true);
    setAiStatus('Thinking...');
    setAiQuery('');
    try {
      const api = (ref as any)?.current?.api;
      const schema = api?.getStructuredSchema ? api.getStructuredSchema() : null;
      const currentState = api ? api.getState() : null;
      const res = await fetch('/api/grid-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentState, schema }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.gridState && api) {
        if (data.gridState.filter?.filterModel) {
          api.setFilterModel(data.gridState.filter.filterModel);
        }
        if (data.gridState.sort?.sortModel) {
          api.applyColumnState({
            state: data.gridState.sort.sortModel.map((s: any) => ({ colId: s.colId, sort: s.sort })),
            defaultState: { sort: null },
          });
        }
        if (data.gridState.rowGroup?.groupColIds) {
          api.setRowGroupColumns(data.gridState.rowGroup.groupColIds);
        }
        if (data.gridState.columnVisibility?.hiddenColIds) {
          api.setColumnsVisible(data.gridState.columnVisibility.hiddenColIds, false);
        }
        setAiStatus(`Done: ${data.explanation || prompt}`);
      } else {
        setAiStatus('No changes returned');
      }
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
      setTimeout(() => setAiStatus(''), 4000);
    }
  }, [aiQuery, aiLoading, ref]);

  const handleReset = useCallback(() => {
    const api = (ref as any)?.current?.api;
    if (!api) return;
    api.setFilterModel(null);
    api.setRowGroupColumns(['budgetCategory']);
    api.applyColumnState({ defaultState: { sort: null, hide: false }, state: [{ colId: 'budgetCategory', hide: true }] });
    setAiStatus('Done: Reset view');
    setTimeout(() => setAiStatus(''), 2500);
  }, [ref]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bg-gr-surface border-b border-gr-border">
        <span className="text-xs text-gr-muted font-mono whitespace-nowrap">AG Grid AI</span>
        <input
          className="flex-1 bg-gr-bg border border-gr-border rounded px-3 py-1.5 text-sm text-gr-text placeholder-gr-muted focus:border-gr-accent focus:outline-none"
          placeholder="e.g. Group by type, sort by cost descending, show only outbound..."
          value={aiQuery}
          onChange={e => setAiQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAISubmit()}
          disabled={aiLoading}
        />
        <button onClick={handleAISubmit} disabled={aiLoading || !aiQuery.trim()}
          className="px-3 py-1.5 bg-gr-accent text-white text-sm rounded hover:bg-blue-600 disabled:opacity-40">
          {aiLoading ? '...' : 'Apply'}
        </button>
        <button onClick={handleReset}
          className="px-2.5 py-1.5 bg-gr-bg border border-gr-border text-gr-muted hover:text-white text-xs rounded">
          Reset
        </button>
        {aiStatus && (
          <span className={`text-xs whitespace-nowrap ${aiStatus.startsWith('Done') ? 'text-green-400' : aiStatus.startsWith('Error') ? 'text-red-400' : 'text-gr-muted'}`}>
            {aiStatus}
          </span>
        )}
      </div>
      <div className="flex-1">
        <AgGridReact
          ref={ref}
          theme={darkTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          groupDefaultExpanded={1}
          animateRows={true}
          rowSelection="single"
          suppressAggFuncInHeader={true}
        />
      </div>
    </div>
  );
});

LedgerGrid.displayName = 'LedgerGrid';
