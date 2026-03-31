# Quiz Web App

## Current State
New project. Empty Motoko backend scaffold and React frontend scaffold.

## Requested Changes (Diff)

### Add
- User authentication system (signup/login/logout) with session management in Motoko
- Quiz categories with title, description, difficulty level
- Quiz questions with text, 4 answer options, correct answer index, optional image, category reference
- Quiz attempt/result storage per user (score, answers given, timestamp)
- Admin panel for managing categories and questions (CRUD)
- Sample data: 3 categories (General Knowledge, Science, History), 5 questions each
- React pages: Login/Signup, Dashboard, Quiz, Results, Admin
- Global AuthContext and QuizContext with React Context API
- Custom useTimer hook for per-question countdown
- Client-side routing (React Router)
- Protected routes for Dashboard, Quiz, Results, Admin

### Modify
- Backend main.mo: implement all data models and API functions
- Frontend App.tsx: set up routing and context providers

### Remove
- Nothing

## Implementation Plan
1. Generate Motoko backend with: user auth (register/login/logout/whoami), category CRUD, question CRUD, quiz attempt start/submit/get results, admin role check
2. Frontend structure:
   - `AuthContext` – stores logged-in user, login/logout/signup functions
   - `QuizContext` – stores active quiz, current question index, answers, timer state
   - `useTimer` hook – countdown timer with configurable duration, callbacks
   - Pages: LoginPage, DashboardPage, QuizPage, ResultsPage, AdminPage
   - ProtectedRoute component
3. Sample data seeded via backend init or frontend seed call on first load
4. Admin panel accessible to users with admin role
