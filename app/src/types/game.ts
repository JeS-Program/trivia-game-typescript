type QuestionAPI = string;

interface Question {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: "string";
  incorrect_answers: string[];
}

interface GameState {
  status: GameStatus;
  questions: Question[];
  currentIndex: number;
  score: number;
  lives: number;
}

type GameStatus = "idle" | "playing" | "game_over";
