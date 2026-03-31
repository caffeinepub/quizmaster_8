import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronRight, Loader2, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { type Category, Difficulty } from "../backend";
import { Header } from "../components/Header";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { useQuiz } from "../contexts/QuizContext";
import { useActor } from "../hooks/useActor";
import {
  useGetQuestionsByCategory,
  useListCategories,
} from "../hooks/useQueries";

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = {
    [Difficulty.easy]: { label: "Easy", color: "oklch(0.67 0.15 160)" },
    [Difficulty.medium]: { label: "Medium", color: "oklch(0.67 0.12 75)" },
    [Difficulty.hard]: { label: "Hard", color: "oklch(0.52 0.15 25)" },
  };
  const { label, color } = config[difficulty] ?? config[Difficulty.medium];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}

function CategoryCard({
  category,
  index,
}: { category: Category; index: number }) {
  const navigate = useNavigate();
  const { startQuiz } = useQuiz();
  const { actor } = useActor();

  const handleStart = async () => {
    if (!actor) return;
    try {
      const questions = await actor.getQuestionsByCategory(category.id);
      startQuiz(category.id, category.title, questions);
      navigate({
        to: "/quiz/$categoryId",
        params: { categoryId: category.id.toString() },
      });
    } catch {
      // ignore
    }
  };

  const icons = [BookOpen, Zap, Trophy];
  const Icon = icons[index % icons.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="quiz-card rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group"
      data-ocid={`dashboard.category.card.${index + 1}`}
    >
      {/* Icon + difficulty */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.82 0.110 200 / 0.12)" }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: "oklch(0.82 0.110 200)" }}
          />
        </div>
        <DifficultyBadge difficulty={category.difficulty} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
          {category.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      {/* Meta + CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-muted-foreground text-xs">
          {Number(category.questionsCount)} questions
        </span>
        <Button
          onClick={handleStart}
          className="btn-cyan text-xs h-8 px-4 rounded-lg gap-1"
          data-ocid={`dashboard.start_quiz_button.${index + 1}`}
        >
          Start Quiz
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const { username } = useAuth();
  const { data: categories = [], isLoading } = useListCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back,{" "}
            <span style={{ color: "oklch(0.82 0.110 200)" }}>
              {username || "Quizzer"}
            </span>
            !
          </h1>
          <p className="text-muted-foreground text-lg">
            Pick a quiz and test your knowledge.
          </p>
        </motion.div>

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Browse Categories
          </h2>

          {isLoading ? (
            <div
              className="flex items-center gap-3 text-muted-foreground"
              data-ocid="dashboard.categories_loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div
              className="quiz-card rounded-2xl p-12 text-center"
              data-ocid="dashboard.categories_empty_state"
            >
              <p className="text-muted-foreground">
                No categories available yet.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-ocid="dashboard.categories_list"
            >
              {categories.map((cat, i) => (
                <CategoryCard
                  key={cat.id.toString()}
                  category={cat}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
