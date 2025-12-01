import './sections.css';

interface TextContent {
  title: string;
  body: string;
}

export function TextSection({ content }: { content: TextContent }) {
  // Simple markdown-like rendering
  const renderBody = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, i) => {
      // Check for code blocks
      if (para.startsWith('```')) {
        const code = para.replace(/```\w*\n?/g, '').trim();
        return <pre key={i} className="code-block">{code}</pre>;
      }

      // Check for bullet lists
      if (para.includes('\n- ')) {
        const lines = para.split('\n');
        const title = lines[0].endsWith(':') ? lines[0] : null;
        const items = lines.filter(l => l.startsWith('- ')).map(l => l.slice(2));

        return (
          <div key={i} className="text-list">
            {title && <p className="list-title">{title}</p>}
            <ul>
              {items.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          </div>
        );
      }

      // Regular paragraph with inline formatting
      return (
        <p
          key={i}
          className="lesson-paragraph"
          dangerouslySetInnerHTML={{ __html: formatInline(para) }}
        />
      );
    });
  };

  return (
    <div className="section section-text">
      <h2>{content.title}</h2>
      <div className="text-content">
        {renderBody(content.body)}
      </div>
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />');
}
