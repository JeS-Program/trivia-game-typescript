import TriviaGame from "./src/components/TriviaGame";
import { Question, QuestionAPI } from "./src/types/game";

export default async function Home() {
  const API_URL: QuestionAPI =
    "https://opentdb.com/api.php?amount=10&category=31";

  async function loadingDataAPI(): Promise<Question[] | { error: string }> {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      return json.results;
    } catch (error) {
      return {
        error: "Failed to fetch data from the API.",
      };
    }
  }

  const questionsData = await loadingDataAPI();

  return (
    <>
      <TriviaGame data={questionsData} />
    </>
  );
}
