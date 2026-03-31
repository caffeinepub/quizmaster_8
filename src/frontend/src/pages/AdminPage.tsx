import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Category,
  type CategoryInput,
  Difficulty,
  type Question,
  type QuestionInput,
} from "../backend";
import { Header } from "../components/Header";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  useCreateCategory,
  useCreateQuestion,
  useDeleteCategory,
  useDeleteQuestion,
  useGetQuestionsByCategory,
  useListCategories,
  useUpdateCategory,
  useUpdateQuestion,
} from "../hooks/useQueries";

const DIFFICULTY_OPTIONS = [
  { value: Difficulty.easy, label: "Easy" },
  { value: Difficulty.medium, label: "Medium" },
  { value: Difficulty.hard, label: "Hard" },
];

function CategoryForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: Category;
  onSave: (data: CategoryInput) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? Difficulty.medium,
  );

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      difficulty,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Category title"
          className="bg-accent/50 border-white/10"
          data-ocid="admin.category.title_input"
        />
      </div>
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          rows={3}
          className="bg-accent/50 border-white/10 resize-none"
          data-ocid="admin.category.description_input"
        />
      </div>
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">
          Difficulty
        </Label>
        <Select
          value={difficulty}
          onValueChange={(v) => setDifficulty(v as Difficulty)}
        >
          <SelectTrigger
            className="bg-accent/50 border-white/10"
            data-ocid="admin.category.difficulty_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-white/10"
          data-ocid="admin.category.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-cyan"
          data-ocid="admin.category.save_button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function QuestionForm({
  initial,
  categoryId: _categoryId,
  onSave,
  onClose,
  saving,
}: {
  initial?: Question;
  categoryId: bigint;
  onSave: (data: QuestionInput) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [questionText, setQuestionText] = useState(initial?.questionText ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options ?? ["", "", "", ""],
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(
    initial ? Number(initial.correctAnswerIndex) : 0,
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  const handleSubmit = () => {
    if (!questionText.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (options.some((o) => !o.trim())) {
      toast.error("All 4 options are required");
      return;
    }
    onSave({
      questionText: questionText.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex: BigInt(correctAnswerIndex),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">
          Question Text
        </Label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the question"
          rows={3}
          className="bg-accent/50 border-white/10 resize-none"
          data-ocid="admin.question.text_input"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <div key={opt || i.toString()}>
            <Label className="text-foreground/80 text-xs mb-1 block">
              Option {["A", "B", "C", "D"][i]}
            </Label>
            <Input
              value={opt}
              onChange={(e) =>
                setOptions((prev) =>
                  prev.map((o, idx) => (idx === i ? e.target.value : o)),
                )
              }
              placeholder={`Option ${["A", "B", "C", "D"][i]}`}
              className="bg-accent/50 border-white/10"
              data-ocid={`admin.question.option_input.${i + 1}`}
            />
          </div>
        ))}
      </div>
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">
          Correct Answer
        </Label>
        <Select
          value={correctAnswerIndex.toString()}
          onValueChange={(v) => setCorrectAnswerIndex(Number(v))}
        >
          <SelectTrigger
            className="bg-accent/50 border-white/10"
            data-ocid="admin.question.correct_answer_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3].map((i) => (
              <SelectItem key={i} value={i.toString()}>
                Option {["A", "B", "C", "D"][i]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-foreground/80 text-sm mb-1.5 block">
          Image URL (optional)
        </Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="bg-accent/50 border-white/10"
          data-ocid="admin.question.image_url_input"
        />
      </div>
      <DialogFooter className="pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-white/10"
          data-ocid="admin.question.cancel_button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-cyan"
          data-ocid="admin.question.save_button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories = [], isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showAdd, setShowAdd] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleCreate = async (data: CategoryInput) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success("Category created");
      setShowAdd(false);
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (data: CategoryInput) => {
    if (!editCategory) return;
    try {
      await updateCategory.mutateAsync({ id: editCategory.id, input: data });
      toast.success("Category updated");
      setEditCategory(null);
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Categories ({categories.length})
        </h3>
        <Button
          onClick={() => setShowAdd(true)}
          className="btn-cyan text-xs h-8 gap-1.5"
          data-ocid="admin.categories.add_button"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex items-center gap-2 text-muted-foreground py-8"
          data-ocid="admin.categories.loading_state"
        >
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : categories.length === 0 ? (
        <div
          className="quiz-card rounded-xl p-8 text-center text-muted-foreground"
          data-ocid="admin.categories.empty_state"
        >
          No categories yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.categories.list">
          {categories.map((cat, i) => (
            <div
              key={cat.id.toString()}
              className="quiz-card rounded-xl px-5 py-4 flex items-center justify-between"
              data-ocid={`admin.category.item.${i + 1}`}
            >
              <div>
                <p className="font-medium text-foreground text-sm">
                  {cat.title}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {cat.description}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {Number(cat.questionsCount)} questions · {cat.difficulty}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditCategory(cat)}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  data-ocid={`admin.category.edit_button.${i + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                  data-ocid={`admin.category.delete_button.${i + 1}`}
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent
          className="max-w-md"
          data-ocid="admin.add_category.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSave={handleCreate}
            onClose={() => setShowAdd(false)}
            saving={createCategory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editCategory}
        onOpenChange={(o) => !o && setEditCategory(null)}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="admin.edit_category.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              initial={editCategory}
              onSave={handleUpdate}
              onClose={() => setEditCategory(null)}
              saving={updateCategory.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionsTab() {
  const { data: categories = [] } = useListCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<bigint | null>(
    categories.length > 0 ? categories[0].id : null,
  );
  const { data: questions = [], isLoading } =
    useGetQuestionsByCategory(selectedCategoryId);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [showAdd, setShowAdd] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleCreate = async (data: QuestionInput) => {
    if (!selectedCategoryId) return;
    try {
      await createQuestion.mutateAsync({
        categoryId: selectedCategoryId,
        input: data,
      });
      toast.success("Question created");
      setShowAdd(false);
    } catch {
      toast.error("Failed to create question");
    }
  };

  const handleUpdate = async (data: QuestionInput) => {
    if (!editQuestion) return;
    try {
      await updateQuestion.mutateAsync({ id: editQuestion.id, input: data });
      toast.success("Question updated");
      setEditQuestion(null);
    } catch {
      toast.error("Failed to update question");
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={selectedCategoryId?.toString() ?? ""}
            onValueChange={(v) => setSelectedCategoryId(BigInt(v))}
          >
            <SelectTrigger
              className="bg-accent/50 border-white/10"
              data-ocid="admin.questions.category_select"
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          disabled={!selectedCategoryId}
          className="btn-cyan text-xs h-9 gap-1.5"
          data-ocid="admin.questions.add_button"
        >
          <Plus className="w-3.5 h-3.5" /> Add Question
        </Button>
      </div>

      {!selectedCategoryId ? (
        <div className="quiz-card rounded-xl p-8 text-center text-muted-foreground">
          Select a category to manage questions.
        </div>
      ) : isLoading ? (
        <div
          className="flex items-center gap-2 text-muted-foreground py-4"
          data-ocid="admin.questions.loading_state"
        >
          <Loader2 className="w-4 h-4 animate-spin" /> Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div
          className="quiz-card rounded-xl p-8 text-center text-muted-foreground"
          data-ocid="admin.questions.empty_state"
        >
          No questions for this category yet.
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.questions.list">
          {questions.map((q, i) => (
            <div
              key={q.id.toString()}
              className="quiz-card rounded-xl px-5 py-4 flex items-start justify-between gap-4"
              data-ocid={`admin.question.item.${i + 1}`}
            >
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {q.questionText}
                </p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {q.options.map((opt, oi) => (
                    <span
                      key={opt}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background:
                          oi === Number(q.correctAnswerIndex)
                            ? "oklch(0.67 0.15 160 / 0.2)"
                            : "oklch(0.20 0.05 264)",
                        color:
                          oi === Number(q.correctAnswerIndex)
                            ? "oklch(0.67 0.15 160)"
                            : "oklch(0.60 0.02 264)",
                      }}
                    >
                      {["A", "B", "C", "D"][oi]}: {opt}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditQuestion(q)}
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  data-ocid={`admin.question.edit_button.${i + 1}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                  data-ocid={`admin.question.delete_button.${i + 1}`}
                >
                  {deletingId === q.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent
          className="max-w-lg"
          data-ocid="admin.add_question.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          {selectedCategoryId && (
            <QuestionForm
              categoryId={selectedCategoryId}
              onSave={handleCreate}
              onClose={() => setShowAdd(false)}
              saving={createQuestion.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editQuestion}
        onOpenChange={(o) => !o && setEditQuestion(null)}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin.edit_question.dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editQuestion && selectedCategoryId && (
            <QuestionForm
              initial={editQuestion}
              categoryId={selectedCategoryId}
              onSave={handleUpdate}
              onClose={() => setEditQuestion(null)}
              saving={updateQuestion.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage quiz categories and questions.
          </p>
        </motion.div>

        <div className="quiz-card rounded-2xl p-6">
          <Tabs defaultValue="categories" data-ocid="admin.tabs">
            <TabsList className="bg-accent/50 mb-6">
              <TabsTrigger value="categories" data-ocid="admin.categories_tab">
                Categories
              </TabsTrigger>
              <TabsTrigger value="questions" data-ocid="admin.questions_tab">
                Questions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>
            <TabsContent value="questions">
              <QuestionsTab />
            </TabsContent>
          </Tabs>
        </div>
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

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}
