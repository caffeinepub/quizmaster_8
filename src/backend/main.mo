import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  /*****************************/
  /*     Access Control        */
  /*****************************/

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /*****************************/
  /*     Data Types            */
  /*****************************/

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Category Difficulty Enum
  type Difficulty = {
    #easy;
    #medium;
    #hard;
  };

  module Difficulty {
    public func compare(d : Difficulty, other : Difficulty) : Order.Order {
      switch (d, other) {
        case (#easy, #easy) { #equal };
        case (#easy, _) { #less };
        case (#medium, #easy) { #greater };
        case (#medium, #medium) { #equal };
        case (#medium, #hard) { #less };
        case (#hard, #hard) { #equal };
        case (#hard, _) { #greater };
      };
    };
  };

  // Category Type
  type Category = {
    id : Nat;
    title : Text;
    description : Text;
    difficulty : Difficulty;
    questionsCount : Nat;
  };

  module Category {
    public func compare(cat1 : Category, cat2 : Category) : Order.Order {
      Int.compare(cat1.id, cat2.id);
    };
  };

  // Question Type
  type Question = {
    id : Nat;
    categoryId : Nat;
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
    imageUrl : ?Text;
  };

  module Question {
    public func compare(question1 : Question, question2 : Question) : Order.Order {
      Int.compare(question1.id, question2.id);
    };
  };

  // Quiz Attempt
  public type Attempt = {
    userId : Principal;
    categoryId : Nat;
    score : Nat;
    totalQuestions : Nat;
    answersGiven : [Nat];
    timestamp : Int;
  };

  // Answer Submission
  public type AnswerSubmission = {
    categoryId : Nat;
    answers : [Nat]; // Selected indices
  };

  // Category Input
  public type CategoryInput = {
    title : Text;
    description : Text;
    difficulty : Difficulty;
  };

  // Question Input
  public type QuestionInput = {
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
    imageUrl : ?Text;
  };

  /*****************************/
  /*     Persistent Storage    */
  /*****************************/

  let userProfiles = Map.empty<Principal, UserProfile>();
  let categories = Map.empty<Nat, Category>();
  let questions = Map.empty<Nat, Question>();
  let attempts = Map.empty<Principal, List.List<Attempt>>();

  /*****************************/
  /*   User Profile Functions  */
  /*****************************/

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /*****************************/
  /*     Admin Functions       */
  /*****************************/

  // Create Category
  public shared ({ caller }) func createCategory(input : CategoryInput) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let id = categories.size();
    let category : Category = {
      id;
      title = input.title;
      description = input.description;
      difficulty = input.difficulty;
      questionsCount = 0;
    };

    categories.add(id, category);
    id;
  };

  // Update Category
  public shared ({ caller }) func updateCategory(categoryId : Nat, input : CategoryInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?existing) {
        let updated : Category = {
          id = existing.id;
          title = input.title;
          description = input.description;
          difficulty = input.difficulty;
          questionsCount = existing.questionsCount;
        };
        categories.add(categoryId, updated);
      };
    };
  };

  // Delete Category
  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(categoryId)) {
      Runtime.trap("Category does not exist");
    };
    categories.remove(categoryId);
  };

  // Create Question
  public shared ({ caller }) func createQuestion(categoryId : Nat, input : QuestionInput) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create questions");
    };

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        let id = questions.size();
        let question : Question = {
          id;
          categoryId;
          questionText = input.questionText;
          options = input.options;
          correctAnswerIndex = input.correctAnswerIndex;
          imageUrl = input.imageUrl;
        };

        questions.add(id, question);
        let updatedCategory : Category = {
          id = category.id;
          title = category.title;
          description = category.description;
          difficulty = category.difficulty;
          questionsCount = category.questionsCount + 1;
        };
        categories.add(categoryId, updatedCategory);
        id;
      };
    };
  };

  // Update Question
  public shared ({ caller }) func updateQuestion(questionId : Nat, input : QuestionInput) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };

    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?existing) {
        let updated : Question = {
          id = existing.id;
          categoryId = existing.categoryId;
          questionText = input.questionText;
          options = input.options;
          correctAnswerIndex = input.correctAnswerIndex;
          imageUrl = input.imageUrl;
        };
        questions.add(questionId, updated);
      };
    };
  };

  // Delete Question
  public shared ({ caller }) func deleteQuestion(questionId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };

    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?question) {
        questions.remove(questionId);
        switch (categories.get(question.categoryId)) {
          case (null) { Runtime.trap("Category not found") };
          case (?category) {
            let updatedCategory : Category = {
              id = category.id;
              title = category.title;
              description = category.description;
              difficulty = category.difficulty;
              questionsCount = if (category.questionsCount > 0) { category.questionsCount - 1 } else { 0 };
            };
            categories.add(category.id, updatedCategory);
          };
        };
      };
    };
  };

  /*****************************/
  /*   Public Functions        */
  /*****************************/

  // List Categories - Public, no authentication required
  public query func listCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  // Get Questions by Category - Public, no authentication required
  public query func getQuestionsByCategory(categoryId : Nat) : async [Question] {
    questions.values().toArray().sort().filter(
      func(q) {
        categoryId == q.categoryId;
      }
    );
  };

  // Submit Quiz Attempt - Requires user authentication
  public shared ({ caller }) func submitQuiz(submission : AnswerSubmission) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Please sign in first");
    };

    switch (categories.get(submission.categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_category) {
        let categoryQuestions = questions.values().toArray().filter(
          func(q) {
            q.categoryId == submission.categoryId;
          }
        );
        if (categoryQuestions.size() == 0) {
          Runtime.trap("No questions found for this category");
        };
        if (submission.answers.size() > categoryQuestions.size()) {
          Runtime.trap("Invalid number of answers");
        };

        // Calculate score
        var score = 0;
        for ((answerIndex, i) in submission.answers.enumerate()) {
          let question = categoryQuestions[i];
          if (answerIndex == question.correctAnswerIndex) {
            score += 1;
          };
        };

        // Create attempt
        let attempt : Attempt = {
          userId = caller;
          categoryId = submission.categoryId;
          score;
          totalQuestions = categoryQuestions.size();
          answersGiven = submission.answers;
          timestamp = Time.now();
        };

        // Store attempt
        let userAttempts = switch (attempts.get(caller)) {
          case (null) { List.empty<Attempt>() };
          case (?existing) { existing };
        };
        userAttempts.add(attempt);
        attempts.add(caller, userAttempts);

        score;
      };
    };
  };

  // Get User Results - Requires user authentication
  public query ({ caller }) func getCallerResults() : async [Attempt] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can get their results");
    };
    switch (attempts.get(caller)) {
      case (null) { [] };
      case (?userAttempts) { userAttempts.toArray() };
    };
  };

  /*****************************/
  /*  Initialization           */
  /*****************************/

  // Internal helper to create category without auth check (for seeding)
  private func createCategoryInternal(input : CategoryInput) : Nat {
    let id = categories.size();
    let category : Category = {
      id;
      title = input.title;
      description = input.description;
      difficulty = input.difficulty;
      questionsCount = 0;
    };
    categories.add(id, category);
    id;
  };

  // Internal helper to create question without auth check (for seeding)
  private func createQuestionInternal(categoryId : Nat, input : QuestionInput) : Nat {
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        let id = questions.size();
        let question : Question = {
          id;
          categoryId;
          questionText = input.questionText;
          options = input.options;
          correctAnswerIndex = input.correctAnswerIndex;
          imageUrl = input.imageUrl;
        };

        questions.add(id, question);
        let updatedCategory : Category = {
          id = category.id;
          title = category.title;
          description = category.description;
          difficulty = category.difficulty;
          questionsCount = category.questionsCount + 1;
        };
        categories.add(categoryId, updatedCategory);
        id;
      };
    };
  };

  // Seed Sample Data - Uses internal helpers to bypass auth
  public shared ({ caller }) func seedSampleData() : async () {
    // Only allow admin or initial deployment to seed data
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can seed sample data");
    };

    let generalCategory : CategoryInput = {
      title = "General Knowledge";
      description = "Test your general knowledge";
      difficulty = #medium;
    };
    let scienceCategory : CategoryInput = {
      title = "Science";
      description = "Science related questions";
      difficulty = #hard;
    };
    let historyCategory : CategoryInput = {
      title = "History";
      description = "Historical events and facts";
      difficulty = #medium;
    };

    let generalCategoryId = createCategoryInternal(generalCategory);
    let scienceCategoryId = createCategoryInternal(scienceCategory);
    let historyCategoryId = createCategoryInternal(historyCategory);

    // Add questions to General Knowledge
    let generalQuestions : [QuestionInput] = [
      {
        questionText = "What is the capital of France?";
        options = ["Paris", "London", "Rome", "Berlin"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "Who wrote 'Romeo and Juliet'?";
        options = ["Shakespeare", "Hemingway", "Twain", "Dickens"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "What is the largest ocean?";
        options = ["Pacific", "Atlantic", "Indian", "Arctic"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "What is the official language of Brazil?";
        options = ["Portuguese", "Spanish", "English", "French"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "What planet is known as the Red Planet?";
        options = ["Mars", "Venus", "Jupiter", "Saturn"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
    ];

    // Science Questions
    let scienceQuestions : [QuestionInput] = [
      {
        questionText = "What is H2O commonly known as?";
        options = ["Water", "Hydrogen", "Oxygen", "Salt"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "Who developed the theory of relativity?";
        options = ["Einstein", "Newton", "Tesla", "Curie"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "What is the chemical symbol for gold?";
        options = ["Au", "Ag", "Go", "Ge"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "Which planet is the largest in our solar system?";
        options = ["Jupiter", "Saturn", "Earth", "Mars"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "How many bones are there in the human body?";
        options = ["206", "106", "306", "406"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
    ];

    // History Questions
    let historyQuestions : [QuestionInput] = [
      {
        questionText = "Who was the first president of the United States?";
        options = ["Washington", "Lincoln", "Jefferson", "Adams"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "In which year did World War II end?";
        options = ["1945", "1939", "1918", "1950"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "Who discovered America?";
        options = ["Columbus", "Magellan", "Vespucci", "Cook"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "What was the name of the ship that famously sank in 1912?";
        options = ["Titanic", "Olympic", "Britannic", "Prince"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
      {
        questionText = "Who painted the Mona Lisa?";
        options = ["Da Vinci", "Michelangelo", "Picasso", "Rembrandt"];
        correctAnswerIndex = 0;
        imageUrl = null;
      },
    ];

    // Add all questions
    for (question in generalQuestions.values()) {
      ignore createQuestionInternal(generalCategoryId, question);
    };
    for (question in scienceQuestions.values()) {
      ignore createQuestionInternal(scienceCategoryId, question);
    };
    for (question in historyQuestions.values()) {
      ignore createQuestionInternal(historyCategoryId, question);
    };
  };
};
