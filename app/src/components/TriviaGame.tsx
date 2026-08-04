"use client";

import { useEffect, useRef, useState } from "react";
import decodeHTMLEntities from "../lib/decodeHTMLEntities";

export default function TriviaGame() {
  const initialTime = 15;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(initialTime);
  const [questions, setQuestions] = useState<Question[]>();
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answerOptions, setAnswerOptions] = useState<string[]>();
  const [answered, setAnswered] = useState<boolean>();
  const [rightAnswer, setRightAnswer] = useState<boolean>();
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    async function cargandoDatos() {
      setQuestions(await cargarDatosAPI());
    }
    cargandoDatos();
  }, []);

  const API_URL: QuestionAPI =
    "https://opentdb.com/api.php?amount=10&category=31";

  async function cargarDatosAPI(): Promise<Question[]> {
    const response = await fetch(API_URL);
    const json = await response.json();
    setTotalQuestions(json.results.length);
    return json.results;
  }

  function ShuffleArray(datos: string[]) {
    // Copia para evitar mutar el arreglo original (buena práctica)
    const result = [...datos];

    for (let i = result.length - 1; i > 0; i--) {
      // Generar un índice aleatorio entre 0 e i
      const j = Math.floor(Math.random() * (i + 1));

      // Intercambiar los elementos result[i] y result[j]
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
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

  function prepareOptions() {
    if (questions && questionIndex < totalQuestions) {
      const options: string[] = [
        questions[questionIndex].correct_answer,
        ...questions[questionIndex].incorrect_answers,
      ];

      setAnswerOptions(ShuffleArray(options));
    }
  }

  // Limpieza al desmontar el componente
  useEffect(() => {
    startCounter();

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  function choosingOption(option: string, rightOption: string) {
    setAnswered(true);
    option == rightOption
      ? (setRightAnswer(true), setPoints((prev) => prev + 1))
      : setRightAnswer(false);
    setQuestionIndex((prev) => prev + 1);
  }

  useEffect(() => {
    prepareOptions();
  }, [questions, questionIndex]);

  if (totalQuestions > 0 && questionIndex >= totalQuestions) {
    return (
      <div>
        <p>Game over!</p>

        <p>Points: {points}</p>
      </div>
    );
  }

  return (
    <>
      <p>Time remaning: {seconds}</p>
      <p>Current points: {points}</p>

      {questions && (
        <div>
          <h1>Question {questionIndex + 1}</h1>
          <span>Difficulty:{questions[questionIndex].difficulty} </span>
          <h2>{decodeHTMLEntities(questions[questionIndex].question)}</h2>

          <div
            className={`${rightAnswer ? "bg-green-300" : "bg-red-300"} flex justify-center`}
          >
            {answered && (
              <span>
                {rightAnswer
                  ? "Right!"
                  : `Incorrect... The answer was "${decodeHTMLEntities(questions[questionIndex - 1].correct_answer)}"`}{" "}
              </span>
            )}
          </div>
          <div className="flex flex-col w-200 m-auto">
            <div className="flex justify-center items-center gap-3 bg-gray-700 h-100">
              {answerOptions?.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => {
                    choosingOption(
                      answer,
                      questions[questionIndex].correct_answer,
                    );
                  }}
                  className="bg-blue-700 border-2 border-gray-400 w-40  text-white py-2 px-5 rounded-lg hover:bg-blue-500 active:bg-blue-900 cursor-pointer"
                >
                  {decodeHTMLEntities(answer)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
