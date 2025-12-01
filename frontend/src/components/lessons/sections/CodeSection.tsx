import { useState } from 'react';
import './sections.css';

interface CodeContent {
  title: string;
  description: string;
  language: string;
  code: string;
  output?: string;
  explanation?: string;
}

export function CodeSection({ content }: { content: CodeContent }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="section section-code">
      <h2>{content.title}</h2>
      <p className="code-description">{content.description}</p>

      <div className="code-container">
        <div className="code-header">
          <span className="code-language">{content.language}</span>
          <button className="code-copy" onClick={copyCode}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="code-block">
          <code>{content.code}</code>
        </pre>
      </div>

      {content.output && (
        <div className="code-output">
          <span className="output-label">Output:</span>
          <code>{content.output}</code>
        </div>
      )}

      {content.explanation && (
        <p className="code-explanation">{content.explanation}</p>
      )}
    </div>
  );
}
