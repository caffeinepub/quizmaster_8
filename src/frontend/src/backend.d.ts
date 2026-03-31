import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnswerSubmission {
    categoryId: bigint;
    answers: Array<bigint>;
}
export interface CategoryInput {
    title: string;
    difficulty: Difficulty;
    description: string;
}
export interface QuestionInput {
    questionText: string;
    correctAnswerIndex: bigint;
    imageUrl?: string;
    options: Array<string>;
}
export interface Question {
    id: bigint;
    categoryId: bigint;
    questionText: string;
    correctAnswerIndex: bigint;
    imageUrl?: string;
    options: Array<string>;
}
export interface Attempt {
    categoryId: bigint;
    userId: Principal;
    score: bigint;
    totalQuestions: bigint;
    timestamp: bigint;
    answersGiven: Array<bigint>;
}
export interface UserProfile {
    name: string;
}
export interface Category {
    id: bigint;
    title: string;
    difficulty: Difficulty;
    description: string;
    questionsCount: bigint;
}
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / **************************
     * / **************************
     */
    createCategory(input: CategoryInput): Promise<bigint>;
    createQuestion(categoryId: bigint, input: QuestionInput): Promise<bigint>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteQuestion(questionId: bigint): Promise<void>;
    getCallerResults(): Promise<Array<Attempt>>;
    /**
     * / **************************
     * / **************************
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getQuestionsByCategory(categoryId: bigint): Promise<Array<Question>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / **************************
     * / **************************
     */
    listCategories(): Promise<Array<Category>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedSampleData(): Promise<void>;
    submitQuiz(submission: AnswerSubmission): Promise<bigint>;
    updateCategory(categoryId: bigint, input: CategoryInput): Promise<void>;
    updateQuestion(questionId: bigint, input: QuestionInput): Promise<void>;
}
