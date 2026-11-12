import type { PendingApproval } from '../lib/types';

interface Props {
  approval: PendingApproval;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalToast({ approval, onApprove, onReject }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gr-surface border border-gr-accent rounded-lg shadow-2xl p-4 max-w-sm animate-slide-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚡</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Agent Approval Required</h3>
          <p className="text-sm text-gr-muted mt-1">{approval.description}</p>
          {approval.amount != null && (
            <p className="text-lg font-bold text-gr-accent mt-1">${approval.amount.toLocaleString()}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button onClick={onApprove} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-medium">
              Approve
            </button>
            <button onClick={onReject} className="px-4 py-1.5 bg-gr-border text-gr-text text-sm rounded hover:bg-gray-600">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}