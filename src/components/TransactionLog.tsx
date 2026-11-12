import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz, type ColDef } from 'ag-grid-community';

interface Transaction {
  id: string;
  date: string;
  type: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
  counterparty: string;
}

interface Props {
  transactions: Transaction[];
}

export function TransactionLog({ transactions }: Props) {
  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'date', headerName: 'Date', width: 140, sort: 'desc' },
    { field: 'type', headerName: 'Type', width: 100, enableRowGroup: true },
    { field: 'name', headerName: 'Description', flex: 2 },
    { field: 'counterparty', headerName: 'Counterparty', width: 160 },
    { field: 'amount', headerName: 'Amount', width: 110, aggFunc: 'sum',
      valueFormatter: (p: any) => p.value != null ? `$${Number(p.value).toLocaleString()}` : '' },
    { field: 'currency', headerName: 'Currency', width: 80 },
    { field: 'status', headerName: 'Status', width: 100 },
  ], []);

  return (
    <div className="h-full">
      <AgGridReact
        theme={themeQuartz}
        rowData={transactions}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
        animateRows={true}
        pagination={true}
        paginationPageSize={50}
      />
    </div>
  );
}