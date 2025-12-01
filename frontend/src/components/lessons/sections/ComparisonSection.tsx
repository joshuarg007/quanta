import './sections.css';

interface ComparisonContent {
  title: string;
  left: {
    title: string;
    items: string[];
  };
  right: {
    title: string;
    items: string[];
  };
}

export function ComparisonSection({ content }: { content: ComparisonContent }) {
  return (
    <div className="section section-comparison">
      <h2>{content.title}</h2>
      <div className="comparison-grid">
        <div className="comparison-side comparison-left">
          <h4>{content.left.title}</h4>
          <ul>
            {content.left.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="comparison-divider">
          <span>vs</span>
        </div>
        <div className="comparison-side comparison-right">
          <h4>{content.right.title}</h4>
          <ul>
            {content.right.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
