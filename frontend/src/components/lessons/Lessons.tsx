import { Link, useParams } from 'react-router-dom';
import './Lessons.css';

// Placeholder lesson data - will come from API later
const LESSON_TRACKS = [
  {
    id: 'fundamentals',
    title: 'Quantum Fundamentals',
    description: 'Master the building blocks of quantum computing',
    lessons: [
      {
        id: 'qubits',
        title: 'What is a Qubit?',
        description: 'Understanding the quantum bit',
        difficulty: 'beginner',
        duration: 15,
        completed: false,
      },
      {
        id: 'superposition',
        title: 'Superposition',
        description: 'Being in multiple states at once',
        difficulty: 'beginner',
        duration: 20,
        completed: false,
      },
      {
        id: 'measurement',
        title: 'Measurement',
        description: 'Observing quantum states',
        difficulty: 'beginner',
        duration: 15,
        completed: false,
      },
      {
        id: 'entanglement',
        title: 'Entanglement',
        description: 'Spooky action at a distance',
        difficulty: 'intermediate',
        duration: 25,
        completed: false,
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
        description: 'Rotations around the Bloch sphere',
        difficulty: 'beginner',
        duration: 20,
        completed: false,
      },
      {
        id: 'hadamard',
        title: 'The Hadamard Gate',
        description: 'Creating superposition',
        difficulty: 'beginner',
        duration: 15,
        completed: false,
      },
      {
        id: 'cnot',
        title: 'CNOT and Entanglement',
        description: 'Two-qubit operations',
        difficulty: 'intermediate',
        duration: 25,
        completed: false,
      },
      {
        id: 'rotation-gates',
        title: 'Rotation Gates',
        description: 'Precise control with RX, RY, RZ',
        difficulty: 'intermediate',
        duration: 30,
        completed: false,
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
        description: 'Your first quantum speedup',
        difficulty: 'intermediate',
        duration: 30,
        completed: false,
      },
      {
        id: 'bernstein-vazirani',
        title: 'Bernstein-Vazirani',
        description: 'Finding hidden patterns',
        difficulty: 'intermediate',
        duration: 25,
        completed: false,
      },
      {
        id: 'grover',
        title: "Grover's Search",
        description: 'Quadratic speedup for search',
        difficulty: 'advanced',
        duration: 45,
        completed: false,
      },
      {
        id: 'quantum-fourier',
        title: 'Quantum Fourier Transform',
        description: 'Foundation for many algorithms',
        difficulty: 'advanced',
        duration: 40,
        completed: false,
      },
    ],
  },
];

function LessonCard({ lesson, trackId }: { lesson: typeof LESSON_TRACKS[0]['lessons'][0]; trackId: string }) {
  const difficultyColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  return (
    <Link to={`/learn/${trackId}/${lesson.id}`} className="lesson-card">
      <div className="lesson-header">
        <h4>{lesson.title}</h4>
        <span
          className="difficulty-badge"
          style={{ backgroundColor: difficultyColors[lesson.difficulty as keyof typeof difficultyColors] }}
        >
          {lesson.difficulty}
        </span>
      </div>
      <p className="lesson-description">{lesson.description}</p>
      <div className="lesson-meta">
        <span>⏱ {lesson.duration} min</span>
        {lesson.completed && <span className="completed-badge">✓ Completed</span>}
      </div>
    </Link>
  );
}

export function Lessons() {
  const { lessonId } = useParams();

  // If a lesson is selected, show lesson content (placeholder)
  if (lessonId) {
    return (
      <div className="lesson-content">
        <Link to="/learn" className="back-link">← Back to lessons</Link>
        <h1>Lesson: {lessonId}</h1>
        <p>Lesson content will be loaded here...</p>
        <div className="lesson-sandbox-link">
          <p>Ready to practice?</p>
          <Link to="/sandbox" className="btn btn-primary">
            Open in Sandbox →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lessons">
      <div className="lessons-header">
        <h1>Learn Quantum Computing</h1>
        <p>
          Progress through structured lessons from fundamentals to advanced algorithms.
          Each lesson includes interactive exercises in the sandbox.
        </p>
      </div>

      <div className="lesson-tracks">
        {LESSON_TRACKS.map((track) => (
          <section key={track.id} className="lesson-track">
            <div className="track-header">
              <h2>{track.title}</h2>
              <p>{track.description}</p>
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
          <Link to="/sandbox">Jump into the Sandbox →</Link>
        </p>
      </div>
    </div>
  );
}
