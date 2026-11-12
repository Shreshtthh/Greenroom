import { useState, useRef, useEffect } from 'react';

interface Props { onSubmit: (message: string) => void; }

export function AIBar({ onSubmit }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setLoading(true);
    setInput('');
    try { await onSubmit(msg); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-3 border-b border-gr-border">
      <h2 className="text-xs font-semibold text-gr-muted uppercase tracking-wider mb-2">Greenroom AI</h2>
      <textarea
        ref={inputRef}
        className="w-full bg-gr-bg border border-gr-border rounded px-3 py-2 text-sm text-gr-text placeholder-gr-muted resize-none focus:border-gr-accent focus:outline-none"
        rows={3}
        placeholder={"e.g. Keynote delayed 45 min, send Acme Corp their invoice reminder..."}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="mt-2 w-full py-2 bg-gr-accent text-white text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Thinking...' : 'Send to Agent'}
      </button>
    </div>
  );
}