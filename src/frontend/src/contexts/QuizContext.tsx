import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Question } from "../backend";

interface QuizResult {
  score: number;
  totalQuestions: number;
  questions: Question[];
  answers: Record<number, number>;
  categoryId: bigint;
  categoryTitle: string;
}

interface QuizContextType {
  currentCategoryId: bigint | null;
  categoryTitle: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, number>;
  lastResult: QuizResult | null;
  startQuiz: (categoryId: bigint, title: string, questions: Question[]) => void;
  setAnswer: (questionIndex: number, answerIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setLastResult: (result: QuizResult) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [currentCategoryId, setCurrentCategoryId] = useState<bigint | null>(
    null,
  );
  const [categoryTitle, setCategoryTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [lastResult, setLastResultState] = useState<QuizResult | null>(null);

  const startQuiz = useCallback(
    (categoryId: bigint, title: string, qs: Question[]) => {
      setCurrentCategoryId(categoryId);
      setCategoryTitle(title);
      setQuestions(qs);
      setCurrentQuestionIndex(0);
      setAnswers({});
    },
    [],
  );

  const setAnswer = useCallback(
    (questionIndex: number, answerIndex: number) => {
      setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const setLastResult = useCallback((result: QuizResult) => {
    setLastResultState(result);
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentCategoryId(null);
    setCategoryTitle("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
  }, []);

  return (
    <QuizContext.Provider
      value={{
        currentCategoryId,
        categoryTitle,
        questions,
        currentQuestionIndex,
        answers,
        lastResult,
        startQuiz,
        setAnswer,
        nextQuestion,
        prevQuestion,
        setLastResult,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
