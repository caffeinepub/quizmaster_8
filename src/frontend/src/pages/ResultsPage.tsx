import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  LayoutDashboard,
  RefreshCw,
  Trophy,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { Header } from "../components/Header";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useQuiz } from "../contexts/QuizContext";

const OPTION_LABELS = ["A", "B", "C", "D"];

function ResultsContent() {
  const navigate = useNavigate();
  const { lastResult, startQuiz, resetQuiz } = useQuiz();

  if (!lastResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No results to show.</p>
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="btn-cyan"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const {
    score,
    totalQuestions,
    questions,
    answers,
    categoryId,
    categoryTitle,
  } = lastResult;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleRetry = () => {
    startQuiz(categoryId, categoryTitle, questions);
    navigate({
      to: "/quiz/$categoryId",
      params: { categoryId: categoryId.toString() },
    });
  };

  const handleDashboard = () => {
    resetQuiz();
    navigate({ to: "/dashboard" });
  };

  const scoreColor =
    percentage >= 80
      ? "oklch(0.67 0.15 160)"
      : percentage >= 50
        ? "oklch(0.67 0.12 75)"
        : "oklch(0.52 0.15 25)";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Score summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="quiz-card rounded-2xl p-10 text-center mb-8"
          data-ocid="results.score_card"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: `${scoreColor}20`,
              border: `2px solid ${scoreColor}`,
            }}
          >
            <Trophy className="w-9 h-9" style={{ color: scoreColor }} />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-1">
            {score}/{totalQuestions} Correct
          </h1>
          <p className="text-5xl font-bold mb-2" style={{ color: scoreColor }}>
            {percentage}%
          </p>
          <p className="text-muted-foreground">
            {categoryTitle && `${categoryTitle} · `}
            {percentage >= 80
              ? "Excellent work! 🎉"
              : percentage >= 50
                ? "Good effort! Keep practicing."
                : "Keep studying and try again!"}
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "oklch(0.67 0.15 160)" }}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{score} correct</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "oklch(0.52 0.15 25)" }}
            >
              <XCircle className="w-4 h-4" />
              <span>{totalQuestions - score} incorrect</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/5 text-foreground gap-2"
            data-ocid="results.retry_button"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Quiz
          </Button>
          <Button
            onClick={handleDashboard}
            className="flex-1 btn-cyan gap-2"
            data-ocid="results.dashboard_button"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
        </div>

        {/* Question breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Question Breakdown
          </h2>
          <div className="space-y-4" data-ocid="results.breakdown_list">
            {questions.map((question, qi) => {
              const userAnswer = answers[qi];
              const correct = Number(question.correctAnswerIndex);
              const isCorrect = userAnswer === correct;

              return (
                <motion.div
                  key={question.id.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.05 }}
                  className="quiz-card rounded-xl p-5"
                  data-ocid={`results.question.${qi + 1}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{
                        background: isCorrect
                          ? "oklch(0.67 0.15 160 / 0.2)"
                          : "oklch(0.52 0.15 25 / 0.2)",
                      }}
                    >
                      {isCorrect ? (
                        <CheckCircle
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.67 0.15 160)" }}
                        />
                      ) : (
                        <XCircle
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.52 0.15 25)" }}
                        />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Q{qi + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {question.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                    {question.options.map((opt, oi) => {
                      const isUserAnswer = userAnswer === oi;
                      const isCorrectAnswer = correct === oi;
                      let cardClass = "answer-card";
                      if (isCorrectAnswer) cardClass += " correct";
                      else if (isUserAnswer && !isCorrectAnswer)
                        cardClass += " incorrect";

                      return (
                        <div
                          key={opt}
                          className={`${cardClass} rounded-lg p-3 flex items-center gap-2.5 text-xs`}
                        >
                          <span
                            className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
                            style={{
                              background: isCorrectAnswer
                                ? "oklch(0.67 0.15 160 / 0.3)"
                                : isUserAnswer
                                  ? "oklch(0.52 0.15 25 / 0.3)"
                                  : "oklch(0.20 0.05 264)",
                              color: isCorrectAnswer
                                ? "oklch(0.67 0.15 160)"
                                : isUserAnswer
                                  ? "oklch(0.52 0.15 25)"
                                  : "oklch(0.60 0.02 264)",
                            }}
                          >
                            {OPTION_LABELS[oi]}
                          </span>
                          <span
                            className={`leading-relaxed ${
                              isCorrectAnswer
                                ? "text-foreground font-medium"
                                : isUserAnswer
                                  ? "text-foreground/70"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {opt}
                          </span>
                          {isCorrectAnswer && (
                            <CheckCircle
                              className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                              style={{ color: "oklch(0.67 0.15 160)" }}
                            />
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <XCircle
                              className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                              style={{ color: "oklch(0.52 0.15 25)" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-muted-foreground/50 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
