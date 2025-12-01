import './sections.css';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  objectives: string[];
}

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <div className="section section-hero">
      <div className="hero-content">
        <span className="hero-badge">Lesson</span>
        <h1 className="hero-title">{content.title}</h1>
        <p className="hero-subtitle">{content.subtitle}</p>
        <p className="hero-description">{content.description}</p>

        <div className="hero-meta">
          <div className="hero-duration">
            <span className="meta-icon">⏱</span>
            <span>{content.duration} min</span>
          </div>
        </div>

        <div className="hero-objectives">
          <h4>What you'll learn:</h4>
          <ul>
            {content.objectives.map((obj, i) => (
              <li key={i}>
                <span className="objective-check">○</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
