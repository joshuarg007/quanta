import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { curriculumApi, type Track, type LessonMeta } from '../../api/client';
import { useLessonProgress } from '../../stores/progressStore';
import './Lessons.css';

function LessonCard({ lesson, trackId }: { lesson: LessonMeta; trackId: string }) {
  const progress = useLessonProgress(lesson.id);
  const isCompleted = progress?.completed ?? false;
  const hasProgress = progress && progress.currentSection > 0;

  const difficultyColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <Link
      to={`/learn/${trackId}/${lesson.id}`}
      className={`lesson-card ${isCompleted ? 'completed' : ''} ${hasProgress && !isCompleted ? 'in-progress' : ''}`}
    >
      <div className="lesson-header">
        <h4>
          {isCompleted && <span className="completed-check">✓ </span>}
          {lesson.title}
        </h4>
        <span
          className="difficulty-badge"
          style={{ backgroundColor: difficultyColors[lesson.difficulty] }}
        >
          {lesson.difficulty}
        </span>
      </div>
      <p className="lesson-description">{lesson.description}</p>
      <div className="lesson-meta">
        <span>{lesson.duration} min</span>
        {lesson.prerequisites.length > 0 && (
          <span className="prereq-badge" title={`Prerequisites: ${lesson.prerequisites.join(', ')}`}>
            {lesson.prerequisites.length} prereq{lesson.prerequisites.length > 1 ? 's' : ''}
          </span>
        )}
        {hasProgress && !isCompleted && (
          <span className="progress-badge">In Progress</span>
        )}
      </div>
    </Link>
  );
}

export function Lessons() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await curriculumApi.getTracks();
      setTracks(data);
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Failed to load lessons. Using offline content.');
      // Fall back to hardcoded data
      setTracks(FALLBACK_TRACKS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lessons">
        <div className="lessons-loading">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="lessons">
      <div className="lessons-header">
        <h1>Learn Quantum Computing</h1>
        <p>
          Progress through structured lessons from fundamentals to advanced algorithms.
          Each lesson includes interactive circuit exercises.
        </p>
      </div>

      {error && (
        <div className="lessons-error">
          {error}
        </div>
      )}

      <div className="lesson-tracks">
        {tracks.map((track) => (
          <section key={track.id} className="lesson-track">
            <div className="track-header">
              <div className="track-icon">
                {track.id === 'fundamentals' && ''}
                {track.id === 'gates' && ''}
                {track.id === 'algorithms' && ''}
              </div>
              <div>
                <h2>{track.title}</h2>
                <p>{track.description}</p>
              </div>
            </div>
            <div className="lesson-grid">
              {track.lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} trackId={track.id} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="lessons-footer">
        <p>
          Prefer to explore on your own?{' '}
          <Link to="/sandbox">Jump into the Sandbox</Link>
        </p>
      </div>
    </div>
  );
}

// Fallback data if API fails
const FALLBACK_TRACKS: Track[] = [
  {
    id: 'fundamentals',
    title: 'Quantum Fundamentals',
    description: 'Master the building blocks of quantum computing',
    lessons: [
      {
        id: 'qubits',
        title: 'What is a Qubit?',
        track: 'fundamentals',
        description: 'Understanding the quantum bit',
        difficulty: 'beginner',
        duration: 15,
        prerequisites: [],
      },
      {
        id: 'superposition',
        title: 'Superposition',
        track: 'fundamentals',
        description: 'Being in multiple states at once',
        difficulty: 'beginner',
        duration: 20,
        prerequisites: ['qubits'],
      },
      {
        id: 'measurement',
        title: 'Measurement',
        track: 'fundamentals',
        description: 'Observing quantum states',
        difficulty: 'beginner',
        duration: 15,
        prerequisites: ['superposition'],
      },
      {
        id: 'entanglement',
        title: 'Entanglement',
        track: 'fundamentals',
        description: 'Spooky action at a distance',
        difficulty: 'intermediate',
        duration: 25,
        prerequisites: ['measurement'],
      },
    ],
  },
  {
    id: 'gates',
    title: 'Quantum Gates',
    description: 'Learn the operations that manipulate qubits',
    lessons: [
      {
        id: 'pauli-gates',
        title: 'Pauli Gates (X, Y, Z)',
        track: 'gates',
        description: 'Rotations around the Bloch sphere',
        difficulty: 'beginner',
        duration: 20,
        prerequisites: ['qubits'],
      },
      {
        id: 'hadamard',
        title: 'The Hadamard Gate',
        track: 'gates',
        description: 'Creating superposition',
        difficulty: 'beginner',
        duration: 15,
        prerequisites: ['pauli-gates'],
      },
      {
        id: 'cnot',
        title: 'CNOT and Entanglement',
        track: 'gates',
        description: 'Two-qubit operations',
        difficulty: 'intermediate',
        duration: 25,
        prerequisites: ['hadamard'],
      },
      {
        id: 'rotation-gates',
        title: 'Rotation Gates',
        track: 'gates',
        description: 'Precise control with RX, RY, RZ',
        difficulty: 'intermediate',
        duration: 30,
        prerequisites: ['pauli-gates'],
      },
    ],
  },
  {
    id: 'algorithms',
    title: 'Quantum Algorithms',
    description: 'Solve problems with quantum advantage',
    lessons: [
      {
        id: 'deutsch-jozsa',
        title: "Deutsch-Jozsa Algorithm",
        track: 'algorithms',
        description: 'Your first quantum speedup',
        difficulty: 'intermediate',
        duration: 30,
        prerequisites: ['cnot'],
      },
      {
        id: 'grover',
        title: "Grover's Search",
        track: 'algorithms',
        description: 'Quadratic speedup for search',
        difficulty: 'advanced',
        duration: 45,
        prerequisites: ['deutsch-jozsa'],
      },
    ],
  },
];
