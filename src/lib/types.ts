export interface WorkItem {
  id: string;
  title: string;
  type: 'session' | 'vendor' | 'sponsor' | 'prize' | 'staff';
  resourceId: string;
  startDate: string;          // ISO datetime
  endDate: string;
  duration: number;            // hours
  rateType: 'hourly' | 'fixed';
  rate: number;                // $/hr or fixed $
  totalCost: number;           // computed
  budgetCategory: string;
  payDirection: 'inbound' | 'outbound' | 'none';
  paypalType: 'invoice' | 'order' | 'payout' | null;
  paypalId: string | null;
  paypalStatus: 'draft' | 'sent' | 'paid' | 'pending' | 'completed' | null;
  payeeEmail: string | null;
  payerEmail: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  eventColor?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'stage' | 'crew' | 'speaker' | 'vendor' | 'sponsor';
  hourlyRate?: number;
  color?: string;
}

export interface BryntumDep {
  id: number;
  from: string;
  to: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface PendingApproval {
  id: string;
  action: string;
  description: string;
  amount?: number;
  recipient?: string;
}