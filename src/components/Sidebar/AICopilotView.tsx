import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  CornerDownLeft, 
  FileCode,
  Zap
} from 'lucide-react';
import { WorkspaceFile, ThemeConfig } from '../../types';

interface AICopilotViewProps {
  theme: ThemeConfig;
  activeFile: WorkspaceFile | null;
  onInsertCode: (code: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  codeSnippet?: string;
  language?: string;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  theme,
  activeFile,
  onInsertCode,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your Studio Code AI Assistant. Ask me to explain code, generate features, fix errors, or write tests for your workspace files.",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    { label: 'Explain this file', action: 'Can you explain the structure and logic of the current active file?' },
    { label: 'Add explosion effect', action: 'Write a particle explosion physics effect that triggers on canvas click.' },
    { label: 'Write unit tests', action: 'Write unit tests for the utility math functions.' },
    { label: 'Optimize performance', action: 'How can we optimize the 60 FPS requestAnimationFrame loop?' },
  ];

  const handleSend = (textToSend = inputPrompt) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    setTimeout(() => {
      let replyText = '';
      let replyCode = '';
      let language = 'tsx';

      const promptLower = textToSend.toLowerCase();

      if (promptLower.includes('explain')) {
        replyText = `Looking at **${activeFile?.name || 'the project'}**, here is how it works:
1. **State Management**: Controls velocity (${activeFile?.name === 'App.tsx' ? 'speed, particlesCount, themeMode' : 'component state'}).
2. **Animation Loop**: Uses \`requestAnimationFrame\` inside \`useEffect\` with 2D Canvas context rendering.
3. **Physics**: Linear velocity integration with edge boundary collision detection (\`vx *= -1\`, \`vy *= -1\`).`;
      } else if (promptLower.includes('explosion') || promptLower.includes('effect')) {
        replyText = `Here is a particle explosion function you can insert directly into \`ParticleCanvas.tsx\` to emit burst particles on mouse click:`;
        replyCode = `// Add burst explosion particles on pointer interaction
const triggerBurst = (x: number, y: number, color: string) => {
  const burstCount = 20;
  for (let i = 0; i < burstCount; i++) {
    const angle = (Math.PI * 2 * i) / burstCount;
    const velocity = Math.random() * 4 + 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      radius: Math.random() * 3 + 1,
      color,
    });
  }
};`;
      } else if (promptLower.includes('test')) {
        replyText = `Here is a comprehensive unit test suite using Vitest/Jest for \`src/utils/math.ts\`:`;
        replyCode = `import { describe, it, expect } from 'vitest';
import { clamp, randomRange, lerp } from './utils/math';

describe('math utilities', () => {
  it('clamps numbers within min and max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('interpolates linearly with lerp', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });
});`;
        language = 'typescript';
      } else {
        replyText = `I analyzed your active file \`${activeFile?.name || 'workspace'}\`. Here is an enhanced helper you can apply right now:`;
        replyCode = `// Utility helper for responsive pixel ratio scaling
export function getPixelRatio(ctx: CanvasRenderingContext2D): number {
  const dpr = window.devicePixelRatio || 1;
  const bsr = (ctx as any).webkitBackingStorePixelRatio || 1;
  return dpr / bsr;
}`;
        language = 'typescript';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: replyText,
          codeSnippet: replyCode || undefined,
          language,
        },
      ]);
      setIsLoading(false);
    }, 700);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full select-none text-xs">
      <div className="h-8 px-4 flex items-center justify-between text-[11px] font-medium tracking-wide text-neutral-300 uppercase border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1.5 text-amber-400">
          <Sparkles size={14} />
          <span className="text-white font-semibold">AI Studio Copilot</span>
        </div>
        <span className="text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded font-mono">
          Gemini Powered
        </span>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-b border-white/5 flex flex-wrap gap-1.5 bg-black/10">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.action)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded text-[11px] flex items-center gap-1 transition-colors"
          >
            <Zap size={10} className="text-amber-400 shrink-0" />
            <span className="truncate">{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
              {msg.sender === 'assistant' ? (
                <>
                  <Bot size={13} className="text-amber-400" />
                  <span className="text-neutral-300 font-semibold">Studio Copilot</span>
                </>
              ) : (
                <>
                  <User size={13} className="text-[#007acc]" />
                  <span className="text-neutral-300">You</span>
                </>
              )}
            </div>

            <div className="pl-4 text-neutral-200 leading-relaxed whitespace-pre-line text-xs">
              {msg.text}
            </div>

            {msg.codeSnippet && (
              <div className="mt-2 ml-4 rounded-md border border-neutral-700/80 bg-[#161616] overflow-hidden">
                <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono">{msg.language || 'code'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                      className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onInsertCode(msg.codeSnippet!)}
                      title="Insert into active file at cursor"
                      className="bg-[#007acc] hover:bg-[#0062a3] text-white flex items-center gap-1 px-2 py-0.5 rounded font-medium"
                    >
                      <CornerDownLeft size={11} />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
                <pre className="p-3 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-normal">
                  {msg.codeSnippet}
                </pre>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-neutral-400 text-xs pl-4">
            <Sparkles size={14} className="animate-spin text-amber-400" />
            <span>Studio Copilot is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-white/5 bg-[#181818]">
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask Copilot about ${activeFile?.name || 'code'}...`}
            rows={2}
            className="w-full bg-[#202020] border border-neutral-700 focus:border-[#007acc] text-xs text-white p-2 pr-8 outline-none rounded-md resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 text-neutral-400 hover:text-white disabled:opacity-40 p-1"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
