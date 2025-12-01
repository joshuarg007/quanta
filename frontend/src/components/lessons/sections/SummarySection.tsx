import { Link } from 'react-router-dom';
import './sections.css';

interface SummaryContent {
  title: string;
  points: Array<{
    title: string;
    description: string;
  }>;
  nextLesson?: {
    id: string;
    title: string;
    description: string;
  };
}

export function SummarySection({ content }: { content: SummaryContent }) {
  return (
    <div className="section section-summary">
      <h2>{content.title}</h2>

      <div className="summary-points">
        {content.points.map((point, i) => (
          <div key={i} className="summary-point">
            <div className="point-number">{i + 1}</div>
            <div className="point-content">
              <h4>{point.title}</h4>
              <p>{point.description}</p>
            </div>
          </div>
        ))}
      </div>

      {content.nextLesson && (
        <div className="next-lesson-preview">
          <h3>Up Next</h3>
          <Link
            to={`/learn/fundamentals/${content.nextLesson.id}`}
            className="next-lesson-card"
          >
            <div className="next-lesson-content">
              <h4>{content.nextLesson.title}</h4>
              <p>{content.nextLesson.description}</p>
            </div>
            <span className="next-arrow">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
