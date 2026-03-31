import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Question } from "../backend";
import { Header } from "../components/Header";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useQuiz } from "../contexts/QuizContext";
import { useActor } from "../hooks/useActor";
import { useTimer } from "../hooks/useTimer";

const QUESTION_DURATION = 30;
const OPTION_LABELS = ["A", "B", "C", "D"];

function TimerBadge({ timeLeft }: { timeLeft: number }) {
  const isLow = timeLeft <= 10;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${
        isLow
          ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse-timer"
          : "border-white/10 bg-white/5 text-foreground"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft}s</span>
    </div>
  );
}

function QuizContent() {
  const { categoryId } = useParams({ strict: false }) as { categoryId: string };
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    startQuiz,
    currentCategoryId,
    categoryTitle,
    setLastResult,
  } = useQuiz();
  const { actor } = useActor();

  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  // Load questions if not already loaded for this category
  useEffect(() => {
    const catIdBig = BigInt(categoryId);
    if (!actor) return;
    if (currentCategoryId === catIdBig && questions.length > 0) return;
    actor
      .getQuestionsByCategory(catIdBig)
      .then((qs) => {
        startQuiz(catIdBig, "Quiz", qs);
      })
      .catch(() => {});
  }, [actor, categoryId, currentCategoryId, questions.length, startQuiz]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const handleExpire = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection(1);
      nextQuestion();
    }
  }, [currentQuestionIndex, totalQuestions, nextQuestion]);

  const { timeLeft, reset: resetTimer } = useTimer(
    QUESTION_DURATION,
    handleExpire,
  );

  // Reset timer on question change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only depends on question index
  useEffect(() => {
    resetTimer(QUESTION_DURATION);
  }, [currentQuestionIndex]);

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswer(currentQuestionIndex, optionIndex);
  };

  const handleNext = () => {
    setDirection(1);
    nextQuestion();
  };

  const handlePrev = () => {
    setDirection(-1);
    prevQuestion();
  };

  const handleSubmit = async () => {
    if (!actor || submitting) return;
    setSubmitting(true);
    try {
      const answersArr = questions.map((_, i) => BigInt(answers[i] ?? 0));
      const score = await actor.submitQuiz({
        categoryId: BigInt(categoryId),
        answers: answersArr,
      });

      setLastResult({
        score: Number(score),
        totalQuestions,
        questions,
        answers,
        categoryId: BigInt(categoryId),
        categoryTitle,
      });
      navigate({ to: "/results" });
    } catch {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading questions...
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{totalQuestions} answered
              </span>
              <TimerBadge timeLeft={timeLeft} />
            </div>
          </div>
          <Progress
            value={((currentQuestionIndex + 1) / totalQuestions) * 100}
            className="h-1.5 bg-white/10"
            data-ocid="quiz.progress_bar"
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="quiz-card rounded-2xl p-8 mb-6">
              {/* Question image */}
              {currentQuestion.imageUrl && (
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question visual"
                  className="w-full max-h-48 object-cover rounded-xl mb-5"
                />
              )}

              <h2 className="text-xl font-semibold text-foreground leading-relaxed mb-8">
                {currentQuestion.questionText}
              </h2>

              {/* Answer options */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                data-ocid="quiz.answers_list"
              >
                {currentQuestion.options.map((option, i) => {
                  const isSelected = answers[currentQuestionIndex] === i;
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => handleSelectAnswer(i)}
                      className={`answer-card rounded-xl p-4 text-left flex items-start gap-3 ${isSelected ? "selected" : ""}`}
                      data-ocid={`quiz.answer_option.${i + 1}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                          isSelected
                            ? "text-background"
                            : "text-muted-foreground"
                        }`}
                        style={
                          isSelected
                            ? { background: "oklch(0.82 0.110 200)" }
                            : { background: "oklch(0.20 0.05 264)" }
                        }
                      >
                        {OPTION_LABELS[i]}
                      </span>
                      <span
                        className={`text-sm leading-relaxed ${isSelected ? "text-foreground font-medium" : "text-foreground/80"}`}
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="border-white/10 hover:bg-white/5 text-foreground"
                data-ocid="quiz.prev_button"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <button
                    type="button"
                    // biome-ignore lint/suspicious/noArrayIndexKey: question dots use stable index
                    key={i}
                    onClick={() => {
                      setDirection(i > currentQuestionIndex ? 1 : -1);
                      // navigate to that index via repeated calls
                      if (i > currentQuestionIndex) {
                        for (let j = 0; j < i - currentQuestionIndex; j++)
                          nextQuestion();
                      } else {
                        for (let j = 0; j < currentQuestionIndex - i; j++)
                          prevQuestion();
                      }
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentQuestionIndex
                        ? "scale-125"
                        : answers[i] !== undefined
                          ? "opacity-70"
                          : "opacity-30"
                    }`}
                    style={{
                      background:
                        i === currentQuestionIndex
                          ? "oklch(0.82 0.110 200)"
                          : answers[i] !== undefined
                            ? "oklch(0.67 0.15 160)"
                            : "oklch(0.50 0.02 264)",
                    }}
                  />
                ))}
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  onClick={handleNext}
                  className="btn-cyan"
                  data-ocid="quiz.next_button"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="btn-cyan gap-2"
                  data-ocid="quiz.submit_button"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}
