"use client";

import { useEffect, useRef, useState } from "react";
import decodeHTMLEntities from "../lib/decodeHTMLEntities";
import ShuffleArray from "../lib/shuffleArray";

export default function TriviaGame() {
  const initialTime = 50;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(initialTime);
  const [questions, setQuestions] = useState<Question[]>();
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answerOptions, setAnswerOptions] = useState<string[]>();
  const [answered, setAnswered] = useState<boolean>();
  const [rightAnswer, setRightAnswer] = useState<boolean>();
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  const API_URL: QuestionAPI =
    "https://opentdb.com/api.php?amount=10&category=31";

  async function loadingDataAPI(): Promise<Question[]> {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setTotalQuestions(json.results.length);
      return json.results;
    } catch (error) {
      return {
        error: "Failed to fetch data from thhe API.",
      } as unknown as Question[];
    }
  }

  function choosingOption(option: string, rightOption: string) {
    setAnswered(true);
    option == rightOption
      ? (setRightAnswer(true), setPoints((prev) => prev + 1))
      : setRightAnswer(false);

    setQuestionIndex((prev) => prev + 1);
  }

  function prepareOptions() {
    if (questions && questionIndex < totalQuestions) {
      const options: string[] = [
        questions[questionIndex].correct_answer,
        ...questions[questionIndex].incorrect_answers,
      ];

      setAnswerOptions(ShuffleArray(options));
    }
  }

  const startCounter = () => {
    // Si ya hay un intervalo activo, no se crea otro
    if (timerRef.current !== null) return;

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Llegó a cero: limpiamos el intervalo usando el ref
          if (timerRef.current !== null) {
            clearInterval(timerRef.current);
          }
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    async function loadingData() {
      setQuestions(await loadingDataAPI());
    }
    loadingData();
  }, []);

  // Limpieza al desmontar el componente
  useEffect(() => {
    startCounter();

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Detener el temporizador si se han respondido todas las preguntas
  useEffect(() => {
  // Si ya no quedan preguntas por responder, detener el temporizador
  if (totalQuestions > 0 && questionIndex >= totalQuestions) {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
}, [questionIndex, totalQuestions]);

  useEffect(() => {
    prepareOptions();
  }, [questions, questionIndex]);

  if (
    (totalQuestions > 0 && questionIndex >= totalQuestions) ||
    seconds === 0
  ) {
    return (
      <div className="m-auto flex flex-col gap-5">
        <div className="text-white  bg-gray-800 p-10 rounded-2xl text-center font-bold text-xl">
          <p>Game over!</p>
          {seconds === 0 && <p>Time's up!</p>}
          <p>Total points: {points}</p>
        </div>

        <button className="bg-blue-600 text-white py-3 px-5 rounded-xl hover:bg-blue-400 active:bg-blue-900 cursor-pointer">
          <a href="/">Play again</a>
        </button>
      </div>
    );
  }

  return (
    <>
      {questions && (
        <div className="flex flex-col gap-2 m-auto">
          <section className=" flex justify-center">
            <div className="flex justify-center items-center gap-10 text-white font-bold">
              <p>Time remaining: {seconds}</p>
              <p>Current points: {points}</p>
            </div>
          </section>
          {/* Question Info */}
          <section className="relative flex flex-col justify-center items-center bg-linear-to-r from-blue-950 via-blue-900 to-blue-950 text-white rounded-2xl h-60 w-300 m-auto">
            <div className="flex flex-col justify-between my-10 items-center h-full mb-5">
              {/* Question details */}
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-center uppercase">
                  Question {questionIndex + 1}
                </h1>
                <span className="text-lg font-semibold text-center uppercase mb-5">
                  {questions[questionIndex].difficulty}{" "}
                </span>
                <h2>{decodeHTMLEntities(questions[questionIndex].question)}</h2>
              </div>

              {/* Answer Feedback */}
              {answered && (
                <div
                  className={`font-bold text-gray-200 shadow-2xl rounded-2xl text-shadow-2xs py-1 px-3 border-2 border-gray-400 ${
                    rightAnswer ? "bg-green-500" : "bg-red-400"
                  } flex justify-center`}
                >
                  <span>
                    {rightAnswer
                      ? "Right!"
                      : `Incorrect... The answer was "${decodeHTMLEntities(
                          questions[questionIndex - 1].correct_answer
                        )}"`}{" "}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Answer Options */}
          <div className="flex flex-col w-300 m-auto">
            <section className="flex justify-center items-center gap-3 bg-gray-800  rounded-2xl h-25">
              {answerOptions?.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => {
                    choosingOption(
                      answer,
                      questions[questionIndex].correct_answer
                    );
                  }}
                  className="bg-gray-700 w-auto m-6  text-white py-3 px-5 rounded-xl hover:bg-gray-500 active:bg-gray-900 cursor-pointer"
                >
                  {decodeHTMLEntities(answer)}
                </button>
              ))}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
