import { useState } from 'react';
import './sections.css';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizContent {
  title?: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  questions?: Question[];
}

export function QuizSection({ content, onComplete }: { content: QuizContent; onComplete?: () => void }) {
  // Support both single question and multiple questions format
  const questions: Question[] = content.questions || (content.question ? [{
    question: content.question,
    options: content.options || [],
    correctIndex: content.correctIndex || 0,
    explanation: content.explanation || ''
  }] : []);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );
  const [quizComplete, setQuizComplete] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];
  const showResult = showResults[currentQuestion];
  const isCorrect = selectedAnswer === question?.correctIndex;

  const handleSelect = (index: number) => {
    if (!showResult) {
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestion] = index;
      setSelectedAnswers(newAnswers);
    }
  };

  const handleCheck = () => {
    const newResults = [...showResults];
    newResults[currentQuestion] = true;
    setShowResults(newResults);

    // Check if all questions answered
    if (currentQuestion === questions.length - 1) {
      setQuizComplete(true);
      if (onComplete) onComplete();
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const correctCount = selectedAnswers.reduce((acc: number, answer, i) => {
    return acc + (answer === questions[i]?.correctIndex ? 1 : 0);
  }, 0);

  if (!question) return null;

  return (
    <div className="section section-quiz">
      <div className="quiz-header">
        <h2>{content.title || 'Quiz'}</h2>
        {questions.length > 1 && (
          <span className="quiz-progress">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        )}
      </div>

      {quizComplete && questions.length > 1 && (
        <div className={`quiz-score ${correctCount === questions.length ? 'perfect' : ''}`}>
          Score: {correctCount}/{questions.length}
          {correctCount === questions.length && ' 🎉 Perfect!'}
        </div>
      )}

      <p className="quiz-question">{question.question}</p>

      <div className="quiz-options">
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`quiz-option ${selectedAnswer === i ? 'selected' : ''} ${
              showResult && i === question.correctIndex ? 'correct' : ''
            } ${showResult && selectedAnswer === i && !isCorrect ? 'incorrect' : ''}`}
            onClick={() => handleSelect(i)}
            disabled={showResult}
          >
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            <span className="option-text">{option}</span>
            {showResult && i === question.correctIndex && (
              <span className="option-indicator">✓</span>
            )}
            {showResult && selectedAnswer === i && !isCorrect && (
              <span className="option-indicator">✗</span>
            )}
          </button>
        ))}
      </div>

      {!showResult && selectedAnswer !== null && (
        <button className="btn btn-primary" onClick={handleCheck}>
          Check Answer
        </button>
      )}

      {showResult && (
        <div className={`quiz-result ${isCorrect ? 'correct' : 'incorrect'}`}>
          <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite...'}</strong>
          <p>{question.explanation}</p>
        </div>
      )}

      {questions.length > 1 && (
        <div className="quiz-nav">
          <button
            className="btn btn-secondary btn-small"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          <div className="quiz-dots">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`quiz-dot ${i === currentQuestion ? 'active' : ''} ${
                  showResults[i] ? (selectedAnswers[i] === questions[i].correctIndex ? 'correct' : 'incorrect') : ''
                }`}
                onClick={() => setCurrentQuestion(i)}
              />
            ))}
          </div>
          <button
            className="btn btn-secondary btn-small"
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
