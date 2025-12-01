import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumApi, type LessonFull, type LessonSection } from '../../api/client';
import { useProgressStore } from '../../stores/progressStore';
import {
  HeroSection,
  TextSection,
  CalloutSection,
  ComparisonSection,
  MathSection,
  CircuitSection,
  ExerciseSection,
  CodeSection,
  BlochSection,
  QuizSection,
  SummarySection,
  SandboxSection
} from './sections';
import './LessonViewer.css';

export function LessonViewer() {
  const { trackId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'paginated' | 'scroll'>('paginated');

  // Progress store
  const {
    getLessonProgress,
    updateSectionProgress,
    markSectionComplete: persistSectionComplete,
    markLessonComplete
  } = useProgressStore();

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  const loadLesson = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getLesson(id);
      setLesson(data);

      // Restore saved progress
      const savedProgress = getLessonProgress(id);
      if (savedProgress) {
        setCurrentSection(savedProgress.currentSection);
        setCompletedSections(new Set(savedProgress.completedSections));
      } else {
        setCurrentSection(0);
        setCompletedSections(new Set());
      }
    } catch (err) {
      setError('Failed to load lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markSectionComplete = (index: number) => {
    setCompletedSections(prev => new Set([...prev, index]));
    if (lessonId) {
      persistSectionComplete(lessonId, index);
    }
  };

  const goToSection = (index: number) => {
    setCurrentSection(index);
    if (lessonId) {
      updateSectionProgress(lessonId, index);
    }
  };

  const goToNextSection = () => {
    if (lesson && currentSection < lesson.sections.length - 1) {
      markSectionComplete(currentSection);
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      if (lessonId) {
        updateSectionProgress(lessonId, nextSection);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 0) {
      const prevSection = currentSection - 1;
      setCurrentSection(prevSection);
      if (lessonId) {
        updateSectionProgress(lessonId, prevSection);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = () => {
    if (lessonId) {
      markSectionComplete(currentSection);
      markLessonComplete(lessonId);
    }
    navigate('/learn');
  };

  if (loading) {
    return (
      <div className="lesson-viewer">
        <div className="lesson-loading">
          <div className="loading-spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="lesson-viewer">
        <div className="lesson-error">
          <p>{error || 'Lesson not found'}</p>
          <Link to="/learn" className="btn btn-secondary">Back to Lessons</Link>
        </div>
      </div>
    );
  }

  const progress = ((currentSection + 1) / lesson.sections.length) * 100;
  const isLastSection = currentSection === lesson.sections.length - 1;

  return (
    <div className="lesson-viewer">
      {/* Header */}
      <header className="lesson-header">
        <div className="header-top">
          <Link to="/learn" className="back-link">← Back to Lessons</Link>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'paginated' ? 'active' : ''}`}
              onClick={() => setViewMode('paginated')}
              title="Paginated view"
            >
              ⬚
            </button>
            <button
              className={`toggle-btn ${viewMode === 'scroll' ? 'active' : ''}`}
              onClick={() => setViewMode('scroll')}
              title="Scroll view"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="lesson-title-area">
          <span className="lesson-track">{trackId}</span>
          <h1>{lesson.title}</h1>
        </div>

        <div className="lesson-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{currentSection + 1} / {lesson.sections.length}</span>
        </div>
      </header>

      {/* Content */}
      <main className="lesson-content">
        {viewMode === 'paginated' ? (
          // Paginated view - one section at a time
          <SectionRenderer
            section={lesson.sections[currentSection]}
            onComplete={() => markSectionComplete(currentSection)}
            isCompleted={completedSections.has(currentSection)}
          />
        ) : (
          // Scroll view - all sections
          <div className="scroll-view">
            {lesson.sections.map((section, index) => (
              <div key={index} className="scroll-section">
                <SectionRenderer
                  section={section}
                  onComplete={() => markSectionComplete(index)}
                  isCompleted={completedSections.has(index)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Navigation - only in paginated mode */}
      {viewMode === 'paginated' && (
        <footer className="lesson-nav">
          <button
            className="btn btn-secondary"
            onClick={goToPrevSection}
            disabled={currentSection === 0}
          >
            ← Previous
          </button>

          <div className="section-dots">
            {lesson.sections.map((section, i) => (
              <button
                key={i}
                className={`section-dot ${i === currentSection ? 'active' : ''} ${completedSections.has(i) ? 'completed' : ''}`}
                onClick={() => goToSection(i)}
                title={getSectionTitle(section)}
              />
            ))}
          </div>

          {isLastSection ? (
            <button className="btn btn-primary" onClick={handleComplete}>
              Complete Lesson ✓
            </button>
          ) : (
            <button className="btn btn-primary" onClick={goToNextSection}>
              Continue →
            </button>
          )}
        </footer>
      )}

      {/* Complete button for scroll view */}
      {viewMode === 'scroll' && (
        <div className="scroll-complete">
          <button className="btn btn-primary btn-large" onClick={handleComplete}>
            Complete Lesson ✓
          </button>
        </div>
      )}
    </div>
  );
}

// Get a title for section tooltip
function getSectionTitle(section: LessonSection): string {
  const content = section.content as Record<string, unknown>;
  return (content.title as string) || section.type.charAt(0).toUpperCase() + section.type.slice(1);
}

// Section renderer component
function SectionRenderer({
  section,
  onComplete,
  isCompleted: _isCompleted
}: {
  section: LessonSection;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const content = section.content as Record<string, unknown>;

  switch (section.type) {
    case 'hero':
      return <HeroSection content={content as any} />;
    case 'text':
      return <TextSection content={content as any} />;
    case 'callout':
      return <CalloutSection content={content as any} />;
    case 'comparison':
      return <ComparisonSection content={content as any} />;
    case 'math':
      return <MathSection content={content as any} />;
    case 'circuit':
      return <CircuitSection content={content as any} />;
    case 'exercise':
      return <ExerciseSection content={content as any} onComplete={onComplete} />;
    case 'code':
      return <CodeSection content={content as any} />;
    case 'bloch':
      return <BlochSection content={content as any} />;
    case 'quiz':
      return <QuizSection content={content as any} onComplete={onComplete} />;
    case 'summary':
      return <SummarySection content={content as any} />;
    case 'sandbox':
      return <SandboxSection content={content as any} />;
    default:
      // Fallback for unknown types
      return (
        <div className="section section-unknown">
          <p>Unknown section type: {section.type}</p>
        </div>
      );
  }
}
