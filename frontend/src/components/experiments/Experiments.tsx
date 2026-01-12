// Experiments list page
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { experimentTemplates } from '../../data/experimentTemplates';
import type { ExperimentDifficulty } from '../../data/experimentTemplates';
import './Experiments.css';

type FilterType = 'all' | ExperimentDifficulty | 'drift';

export default function Experiments() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiments = useMemo(() => {
    return experimentTemplates.filter((exp) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'drift' && exp.driftFocus) ||
        exp.difficulty === filter;

      const matchesSearch =
        searchQuery === '' ||
        exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const getDifficultyColor = (difficulty: ExperimentDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'var(--color-success)';
      case 'intermediate':
        return 'var(--color-warning, #f59e0b)';
      case 'advanced':
        return 'var(--color-error)';
    }
  };

  return (
    <div className="experiments-page">
      <div className="experiments-header">
        <div className="header-content">
          <h1>Experiments</h1>
          <p>Research-grade quantum computing experiments based on academic literature</p>
        </div>
        <div className="drift-badge">
          <span className="drift-icon">&#x2697;</span>
          <span>Project DRIFT</span>
        </div>
      </div>

      <div className="experiments-controls">
        <div className="search-box">
          <span className="search-icon">&#x1F50D;</span>
          <input
            type="text"
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              &#x2715;
            </button>
          )}
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'drift' ? 'active' : ''}`}
            onClick={() => setFilter('drift')}
          >
            DRIFT
          </button>
          <button
            className={`filter-tab ${filter === 'beginner' ? 'active' : ''}`}
            onClick={() => setFilter('beginner')}
          >
            Beginner
          </button>
          <button
            className={`filter-tab ${filter === 'intermediate' ? 'active' : ''}`}
            onClick={() => setFilter('intermediate')}
          >
            Intermediate
          </button>
          <button
            className={`filter-tab ${filter === 'advanced' ? 'active' : ''}`}
            onClick={() => setFilter('advanced')}
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="experiments-grid">
        {filteredExperiments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">&#x1F52C;</span>
            <p>No experiments match your search.</p>
            <button onClick={() => { setSearchQuery(''); setFilter('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredExperiments.map((exp) => (
            <Link
              key={exp.id}
              to={`/experiments/${exp.id}`}
              className="experiment-card"
            >
              <div className="card-header">
                <div className="card-badges">
                  <span
                    className="difficulty-badge"
                    style={{ background: getDifficultyColor(exp.difficulty) }}
                  >
                    {exp.difficulty}
                  </span>
                  {exp.driftFocus && (
                    <span className="drift-tag">DRIFT</span>
                  )}
                </div>
                <span className="duration">~{exp.duration} min</span>
              </div>

              <h3 className="card-title">{exp.name}</h3>
              <p className="card-subtitle">{exp.subtitle}</p>
              <p className="card-description">{exp.description}</p>

              <div className="card-meta">
                <div className="meta-row">
                  <span className="meta-label">Qubits:</span>
                  <span className="meta-value">{exp.config.num_qubits}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">References:</span>
                  <span className="meta-value">{exp.references.length} sources</span>
                </div>
              </div>

              <div className="card-tags">
                {exp.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="card-action">
                <span>Run Experiment</span>
                <span className="arrow">→</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="experiments-footer">
        <div className="footer-content">
          <h3>About Project DRIFT</h3>
          <p>
            <strong>DRIFT</strong> (Degradation Regimes In Iterated Field Transformations)
            is our research program investigating behavioral uncertainty in quantum
            systems. Experiments marked with DRIFT contribute to active research.
          </p>
          <a href="/faq#what-is-drift" className="learn-more">
            Learn more about DRIFT →
          </a>
        </div>
      </div>
    </div>
  );
}
