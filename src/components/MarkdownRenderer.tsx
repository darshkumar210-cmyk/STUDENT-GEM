import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Check, Terminal, FunctionSquare, BookOpen, Sparkles } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Convert common LaTeX math notation to readable Unicode mathematical formulas
function formatLatexToReadable(formula: string): string {
  let res = formula.trim();

  // Handle \frac{a}{b} -> (a)/(b)
  res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // Handle \sqrt{x} -> √(x)
  res = res.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Handle \text{...} -> ...
  res = res.replace(/\\text\{([^}]+)\}/g, '$1');

  // Handle Greek symbols
  res = res.replace(/\\lambda/g, 'λ');
  res = res.replace(/\\Lambda/g, 'Λ');
  res = res.replace(/\\alpha/g, 'α');
  res = res.replace(/\\beta/g, 'β');
  res = res.replace(/\\gamma/g, 'γ');
  res = res.replace(/\\Gamma/g, 'Γ');
  res = res.replace(/\\delta/g, 'δ');
  res = res.replace(/\\Delta/g, 'Δ');
  res = res.replace(/\\theta/g, 'θ');
  res = res.replace(/\\pi/g, 'π');
  res = res.replace(/\\sigma/g, 'σ');
  res = res.replace(/\\Sigma/g, 'Σ');
  res = res.replace(/\\mu/g, 'μ');
  res = res.replace(/\\omega/g, 'ω');
  res = res.replace(/\\Omega/g, 'Ω');
  res = res.replace(/\\epsilon/g, 'ε');
  res = res.replace(/\\phi/g, 'φ');
  res = res.replace(/\\psi/g, 'ψ');

  // Handle Math operators & logic
  res = res.replace(/\\iff/g, ' ⟺ ');
  res = res.replace(/\\implies/g, ' ⟹ ');
  res = res.replace(/\\to/g, ' → ');
  res = res.replace(/\\det/g, 'det');
  res = res.replace(/\\neq/g, ' ≠ ');
  res = res.replace(/\\approx/g, ' ≈ ');
  res = res.replace(/\\le(q)?/g, ' ≤ ');
  res = res.replace(/\\ge(q)?/g, ' ≥ ');
  res = res.replace(/\\pm/g, ' ± ');
  res = res.replace(/\\times/g, ' × ');
  res = res.replace(/\\cdot/g, ' · ');
  res = res.replace(/\\in/g, ' ∈ ');
  res = res.replace(/\\notin/g, ' ∉ ');
  res = res.replace(/\\subset/g, ' ⊂ ');
  res = res.replace(/\\cup/g, ' ∪ ');
  res = res.replace(/\\cap/g, ' ∩ ');
  res = res.replace(/\\forall/g, ' ∀ ');
  res = res.replace(/\\exists/g, ' ∃ ');
  res = res.replace(/\\nabla/g, ' ∇ ');
  res = res.replace(/\\partial/g, ' ∂ ');
  res = res.replace(/\\infty/g, ' ∞ ');
  res = res.replace(/\\dots/g, '…');
  res = res.replace(/\\sum/g, '∑');
  res = res.replace(/\\prod/g, '∏');
  res = res.replace(/\\int/g, '∫');

  // Clean remaining extra backslashes before plain letters
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');

  return res;
}

// Custom Code Block component with Copy button
const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border-2 border-black bg-[#1e1e2e] text-slate-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-700/60 text-xs font-bold">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Terminal className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-mono text-[11px]">{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
        <code>{value}</code>
      </pre>
    </div>
  );
};

// Math Formula Card component
const MathBlock: React.FC<{ formula: string }> = ({ formula }) => {
  const [copied, setCopied] = useState(false);
  const formatted = formatLatexToReadable(formula);

  const handleCopy = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 p-4 rounded-2xl bg-[#f8f9ff] border-2 border-indigo-600 shadow-[3px_3px_0px_0px_rgba(79,70,229,1)] space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center space-x-1.5 font-black uppercase tracking-wider text-indigo-700 text-[11px]">
          <FunctionSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Core Formula / Equation</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 text-[10px] font-bold transition-colors cursor-pointer"
          title="Copy LaTeX"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'LaTeX'}</span>
        </button>
      </div>
      <div className="text-sm sm:text-base font-mono font-black text-slate-900 bg-white p-3 rounded-xl border border-indigo-200 overflow-x-auto text-center tracking-wide">
        {formatted}
      </div>
    </div>
  );
};

// Pre-process markdown text to convert $$ math blocks into distinct markdown tags
function preprocessMarkdown(raw: string): string {
  if (!raw) return '';

  // Replace $$ formula $$ blocks with a clear custom code/math block
  let text = raw.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    return `\n\`\`\`math\n${formula.trim()}\n\`\`\`\n`;
  });

  // Replace inline $ formula $ with clean math text
  text = text.replace(/\$([^\$\n]+)\$/g, (match, formula) => {
    return `**${formatLatexToReadable(formula)}**`;
  });

  return text;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const processed = preprocessMarkdown(content);

  return (
    <div className={`space-y-4 text-slate-800 ${className}`}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <div className="pt-4 pb-2 border-b-2 border-black flex items-center space-x-2">
              <span className="w-2.5 h-6 rounded-full bg-indigo-600 inline-block"></span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">{children}</h1>
            </div>
          ),
          h2: ({ children }) => (
            <div className="pt-4 pb-1.5 flex items-center space-x-2 border-b border-indigo-100">
              <span className="w-2 h-4 rounded-sm bg-indigo-600 inline-block"></span>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">{children}</h2>
            </div>
          ),
          h3: ({ children }) => (
            <h3 className="pt-2 text-sm sm:text-base font-black uppercase tracking-normal text-indigo-700 flex items-center space-x-1.5">
              <span className="text-indigo-400 font-bold">#</span>
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium my-2">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-2 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-black text-slate-900 bg-indigo-50/70 px-1 py-0.5 rounded text-indigo-950">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
          blockquote: ({ children }) => (
            <div className="my-3 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 shadow-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Key Concept / Takeaway</span>
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed italic">{children}</div>
            </div>
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match && match[1] === 'math') {
              return <MathBlock formula={codeString} />;
            }

            if (match) {
              return <CodeBlock language={match[1]} value={codeString} />;
            }

            // Inline code
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 font-mono text-[11px] font-bold text-indigo-700">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <table className="w-full text-left text-xs border-collapse bg-white">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-black text-white uppercase text-[11px] font-black">{children}</thead>,
          th: ({ children }) => <th className="p-3 border-b-2 border-black">{children}</th>,
          td: ({ children }) => <td className="p-3 border-b border-slate-200 font-medium text-slate-700">{children}</td>,
        }}
      >
        {processed}
      </Markdown>
    </div>
  );
};
