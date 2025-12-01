import './sections.css';

interface CalloutContent {
  variant: 'info' | 'warning' | 'tip' | 'danger';
  title: string;
  body: string;
}

const variantIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  tip: '💡',
  danger: '🚨'
};

export function CalloutSection({ content }: { content: CalloutContent }) {
  return (
    <div className={`section section-callout callout-${content.variant}`}>
      <div className="callout-header">
        <span className="callout-icon">{variantIcons[content.variant]}</span>
        <span className="callout-title">{content.title}</span>
      </div>
      <p className="callout-body">{content.body}</p>
    </div>
  );
}
