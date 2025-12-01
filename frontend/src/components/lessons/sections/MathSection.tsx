import './sections.css';

interface Equation {
  label: string;
  latex: string;
}

interface MathContent {
  title: string;
  description: string;
  equations: Equation[];
}

export function MathSection({ content }: { content: MathContent }) {
  // Simple LaTeX-like rendering (basic support)
  const renderLatex = (latex: string) => {
    // Convert basic LaTeX to displayable format
    return latex
      .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{(.+?)\}/g, '√($1)')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\psi/g, 'ψ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sum/g, 'Σ')
      .replace(/\^2/g, '²')
      .replace(/\^n/g, 'ⁿ')
      .replace(/\|/g, '|')
      .replace(/\\rangle/g, '⟩')
      .replace(/\\langle/g, '⟨');
  };

  return (
    <div className="section section-math">
      <h2>{content.title}</h2>
      <p className="math-description">{content.description}</p>
      <div className="equations-list">
        {content.equations.map((eq, i) => (
          <div key={i} className="equation-row">
            <span className="equation-label">{eq.label}:</span>
            <code className="equation-latex">{renderLatex(eq.latex)}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
