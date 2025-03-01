"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import words from "an-array-of-english-words";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Define color constants with updated colors and gradients
const COLORS = {
  correct:
    "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-700 text-white shadow-lg shadow-emerald-500/30",
  present:
    "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/30",
  absent:
    "bg-gradient-to-br from-zinc-300 to-zinc-500 border-zinc-600 text-white shadow-lg shadow-zinc-500/30",
  empty: "bg-white/80 backdrop-blur border-gray-300 shadow-sm",
  unused:
    "bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 shadow-sm",
};

const MAX_ATTEMPTS = 6;

// Define word length options
const WORD_LENGTH_OPTIONS = [
  { length: 4, name: "Easy Mode (4 Letters)", words: [] as string[] },
  { length: 5, name: "Classic Mode (5 Letters)", words: [] as string[] },
  { length: 6, name: "Challenge Mode (6 Letters)", words: [] as string[] },
  { length: 7, name: "Expert Mode (7 Letters)", words: [] as string[] },
  { length: 8, name: "Master Mode (8 Letters)", words: [] as string[] },
];

// Filter words by length and ensure they only contain letters
WORD_LENGTH_OPTIONS.forEach((option) => {
  option.words = words
    .filter(
      (word) =>
        word.length === option.length &&
        /^[a-zA-Z]+$/.test(word) &&
        !word.includes("'") &&
        !word.includes("-")
    )
    .map((word) => word.toUpperCase());
});

// Ensure each mode has enough words
WORD_LENGTH_OPTIONS.forEach((option) => {
  if (option.words.length < 100) {
    console.warn(`Not enough ${option.length}-letter words found`);
  }
});

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"],
];

export default function WordlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [wordLengthOption, setWordLengthOption] = useState(() => {
    const mode = parseInt(modeParam || "5", 10);
    return (
      WORD_LENGTH_OPTIONS.find((option) => option.length === mode) ||
      WORD_LENGTH_OPTIONS[1] // Default to 5 letters if invalid mode
    );
  });
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});

  // Initialize game
  useEffect(() => {
    startNewGame(wordLengthOption);
  }, [wordLengthOption]);

  const startNewGame = (option: (typeof WORD_LENGTH_OPTIONS)[0]) => {
    const randomWord =
      option.words[Math.floor(Math.random() * option.words.length)];
    setTargetWord(randomWord);
    setCurrentGuess("");
    setGuesses([]);
    setGameOver(false);
    setMessage("");
    setUsedLetters({});
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (gameOver) return;
      handleInput(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [currentGuess, gameOver]);

  const handleInput = (key: string) => {
    if (gameOver) return;

    if (key === "ENTER" && currentGuess.length === wordLengthOption.length) {
      submitGuess();
    } else if (key === "←" || key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (
      currentGuess.length < wordLengthOption.length &&
      /^[A-Z]$/.test(key)
    ) {
      setCurrentGuess((prev) => (prev + key).toUpperCase());
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== wordLengthOption.length) return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    // Update used letters
    const newUsedLetters = { ...usedLetters };
    currentGuess.split("").forEach((letter, index) => {
      if (letter === targetWord[index]) {
        newUsedLetters[letter] = COLORS.correct;
      } else if (
        targetWord.includes(letter) &&
        !newUsedLetters[letter]?.includes("emerald")
      ) {
        newUsedLetters[letter] = COLORS.present;
      } else if (!targetWord.includes(letter)) {
        newUsedLetters[letter] = COLORS.absent;
      }
    });
    setUsedLetters(newUsedLetters);

    setCurrentGuess("");

    if (currentGuess === targetWord) {
      setGameOver(true);
      setMessage("Congratulations! You won! 🎉");
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
      setMessage(`Game Over! The word was ${targetWord}`);
    }
  };

  const getLetterColor = (letter: string, index: number, guess: string) => {
    if (!guess) return COLORS.empty;

    if (letter === targetWord[index]) {
      return COLORS.correct;
    }
    if (targetWord.includes(letter)) {
      return COLORS.present;
    }
    return COLORS.absent;
  };

  const getKeyboardKeyColor = (key: string) => {
    if (key === "ENTER" || key === "←") return "bg-gray-300 hover:bg-gray-400";
    return usedLetters[key] || COLORS.unused;
  };

  // Create grid data
  const grid = Array(MAX_ATTEMPTS)
    .fill(null)
    .map((_, rowIndex) => {
      if (rowIndex < guesses.length) {
        // For completed guesses
        return guesses[rowIndex].split("");
      } else if (rowIndex === guesses.length) {
        // For current row
        const currentGuessArray = Array(wordLengthOption.length).fill("");
        currentGuess.split("").forEach((letter, i) => {
          currentGuessArray[i] = letter;
        });
        return currentGuessArray;
      } else {
        // For future rows
        return Array(wordLengthOption.length).fill("");
      }
    });

  // Update mode selection to use URL
  const handleModeChange = (option: (typeof WORD_LENGTH_OPTIONS)[0]) => {
    router.push(`/wordle?mode=${option.length}`);
    setWordLengthOption(option);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Game Header */}
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Wordle
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-[600px]">
              Guess the hidden word
            </p>
          </div>

          {/* Word Length Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {WORD_LENGTH_OPTIONS.map((option) => (
              <Button
                key={option.length}
                onClick={() => handleModeChange(option)}
                variant={wordLengthOption === option ? "default" : "outline"}
                size="lg"
                className={`rounded-full px-4 sm:px-6 ${
                  wordLengthOption === option
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg"
                    : ""
                }`}
              >
                {option.name}
              </Button>
            ))}
          </div>

          {/* Game Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Main Game Area */}
            <div className="space-y-6">
              {/* Game Grid */}
              <div className="grid gap-2 mx-auto" style={{ maxWidth: "400px" }}>
                {grid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-2">
                    {row.map((letter, colIndex) => (
                      <div
                        key={colIndex}
                        className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-black rounded-xl transition-all duration-500 transform hover:scale-105 ${
                          rowIndex === guesses.length
                            ? "border-gray-400 bg-white/50 backdrop-blur"
                            : getLetterColor(
                                letter,
                                colIndex,
                                guesses[rowIndex] || ""
                              )
                        }`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Virtual Keyboard */}
              <div className="space-y-2">
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-1">
                    {row.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleInput(key)}
                        className={`px-0.5 sm:px-1 py-3 sm:py-4 text-sm sm:text-base md:text-lg rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${getKeyboardKeyColor(
                          key
                        )} ${
                          key === "ENTER" || key === "←"
                            ? "px-1.5 sm:px-2 md:px-4 min-w-[3rem] sm:min-w-[4rem] md:min-w-[4.5rem]"
                            : "w-7 sm:w-8 md:w-10"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Game Over Message */}
              {gameOver && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => startNewGame(wordLengthOption)}
                    variant="default"
                    size="lg"
                    className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Play Again
                  </Button>
                </div>
              )}

              {/* Game Instructions */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-4 sm:px-8 text-sm sm:text-base bg-white/80 backdrop-blur border-2 hover:bg-white/90 transition-all duration-300"
                  >
                    How to Play
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4 bg-white/95 backdrop-blur">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                      How to Play Wordle
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 text-sm text-muted-foreground">
                    <p>
                      Guess the word in 6 tries or less. Each guess must be a
                      valid {wordLengthOption.length}-letter word.
                    </p>
                    <div className="space-y-2">
                      <p className="font-bold">
                        After each guess, the color of the tiles will change:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 ${COLORS.correct} flex items-center justify-center rounded font-bold`}
                          >
                            A
                          </div>
                          <span>Green: Letter is in the correct spot</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 ${COLORS.present} flex items-center justify-center rounded font-bold`}
                          >
                            B
                          </div>
                          <span>
                            Yellow: Letter is in the word but wrong spot
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 ${COLORS.absent} flex items-center justify-center rounded font-bold`}
                          >
                            C
                          </div>
                          <span>Gray: Letter is not in the word</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold">Controls:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Type letters or use the on-screen keyboard</li>
                        <li>Press Enter or click ENTER to submit your guess</li>
                        <li>Press Backspace or ← to delete a letter</li>
                      </ul>
                    </div>
                    <p>
                      A new word is generated each time you play. Try to guess
                      it in as few attempts as possible!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Back to Home Button */}
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-4 sm:px-8 text-sm sm:text-base bg-white/80 backdrop-blur border-2 hover:bg-white/90 transition-all duration-300"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
