import { useRef, useEffect } from 'react';
import type { AgentMessage } from '../lib/types';

interface Props { messages: AgentMessage[]; }

export function AgentTrace({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
      {messages.length === 0 && (
        <p className="text-xs text-gr-muted italic">Agent trace will appear here...</p>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`text-sm rounded p-2 ${
          m.role === 'user'      ? 'bg-gr-bg text-gr-text border border-gr-border' :
          m.role === 'error'     ? 'bg-red-900/30 text-red-300 border border-red-800' :
                                   'bg-blue-900/20 text-blue-200 border border-blue-900'
        }`}>
          <div className="text-[10px] uppercase tracking-wider text-gr-muted mb-1">
            {m.role === 'user' ? 'You' : m.role === 'error' ? 'Error' : 'Greenroom AI'}
          </div>
          <div className="whitespace-pre-wrap">{m.content}</div>
          {m.toolCalls?.map((tc, j) => (
            <div key={j} className="mt-2 p-2 bg-gr-bg rounded text-xs font-mono">
              <span className="text-amber-400">tool:</span> {tc.name}
              <span className="text-gr-muted ml-2">{JSON.stringify(tc.args)}</span>
              {tc.result && <div className="text-green-400 mt-1">→ {tc.result}</div>}
            </div>
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}