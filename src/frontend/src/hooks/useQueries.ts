import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AnswerSubmission,
  type CategoryInput,
  type QuestionInput,
  UserRole,
} from "../backend";
import { useActor } from "./useActor";

export function useListCategories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuestionsByCategory(categoryId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["questions", categoryId?.toString()],
    queryFn: async () => {
      if (!actor || categoryId == null) return [];
      return actor.getQuestionsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && categoryId != null,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSeedSampleData() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedSampleData();
    },
  });
}

export function useSubmitQuiz() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submission: AnswerSubmission) => {
      if (!actor) throw new Error("No actor");
      return actor.submitQuiz(submission);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerResults"] });
    },
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      if (!actor) throw new Error("No actor");
      return actor.createCategory(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: CategoryInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCategory(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCategory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      input,
    }: { categoryId: bigint; input: QuestionInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.createQuestion(categoryId, input);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["questions", vars.categoryId.toString()],
      }),
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: QuestionInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateQuestion(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteQuestion(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}
