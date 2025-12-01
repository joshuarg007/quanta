// Lesson progress persistence using localStorage
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LessonProgress {
  currentSection: number;
  completedSections: number[];
  completed: boolean;
  lastAccessedAt: string;
}

interface ProgressState {
  // Progress per lesson
  lessons: Record<string, LessonProgress>;

  // Actions
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  updateSectionProgress: (lessonId: string, sectionIndex: number) => void;
  markSectionComplete: (lessonId: string, sectionIndex: number) => void;
  markLessonComplete: (lessonId: string) => void;
  resetLessonProgress: (lessonId: string) => void;
  getCompletedLessons: () => string[];
}

const createDefaultProgress = (): LessonProgress => ({
  currentSection: 0,
  completedSections: [],
  completed: false,
  lastAccessedAt: new Date().toISOString(),
});

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessons: {},

      getLessonProgress: (lessonId: string) => {
        return get().lessons[lessonId];
      },

      updateSectionProgress: (lessonId: string, sectionIndex: number) => {
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              ...(state.lessons[lessonId] || createDefaultProgress()),
              currentSection: sectionIndex,
              lastAccessedAt: new Date().toISOString(),
            },
          },
        }));
      },

      markSectionComplete: (lessonId: string, sectionIndex: number) => {
        set((state) => {
          const current = state.lessons[lessonId] || createDefaultProgress();
          const completedSections = current.completedSections.includes(sectionIndex)
            ? current.completedSections
            : [...current.completedSections, sectionIndex];

          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                completedSections,
                lastAccessedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      markLessonComplete: (lessonId: string) => {
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              ...(state.lessons[lessonId] || createDefaultProgress()),
              completed: true,
              lastAccessedAt: new Date().toISOString(),
            },
          },
        }));
      },

      resetLessonProgress: (lessonId: string) => {
        set((state) => {
          const { [lessonId]: _, ...rest } = state.lessons;
          return { lessons: rest };
        });
      },

      getCompletedLessons: () => {
        const lessons = get().lessons;
        return Object.entries(lessons)
          .filter(([_, progress]) => progress.completed)
          .map(([id]) => id);
      },
    }),
    {
      name: 'quanta-progress',
    }
  )
);

// Selector hooks
export const useLessonProgress = (lessonId: string) =>
  useProgressStore((state) => state.lessons[lessonId]);

export const useIsLessonComplete = (lessonId: string) =>
  useProgressStore((state) => state.lessons[lessonId]?.completed ?? false);

export const useCompletedLessons = () =>
  useProgressStore((state) =>
    Object.entries(state.lessons)
      .filter(([_, p]) => p.completed)
      .map(([id]) => id)
  );
