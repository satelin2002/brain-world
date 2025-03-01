"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generatePuzzle } from "@/services/dictionary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Type for selected clue
type SelectedClue = {
  type: "across" | "down";
  number: number;
  clue: string;
  answer: string;
};

// Define puzzle type
type Puzzle = {
  gridSize: number;
  blackCells: number[][];
  clues: {
    across: Array<{
      number: number;
      clue: string;
      answer: string;
      row: number;
      col: number;
      length: number;
    }>;
    down: Array<{
      number: number;
      clue: string;
      answer: string;
      row: number;
      col: number;
      length: number;
    }>;
  };
};

export default function MiniCrosswordPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(""))
  );
  const [hoveredClue, setHoveredClue] = useState<{
    type: "across" | "down";
    number: number;
  } | null>(null);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [checkResults, setCheckResults] = useState<{
    correct: boolean;
    incorrectClues: { type: string; number: number }[];
  }>({ correct: false, incorrectClues: [] });
  const [selectedClue, setSelectedClue] = useState<SelectedClue | null>(null);

  // Load a new puzzle
  const loadNewPuzzle = async () => {
    try {
      const newPuzzle = await generatePuzzle(5);
      console.log("Generated puzzle:", newPuzzle); // Add logging
      setPuzzle(newPuzzle);
      setGrid(
        Array(newPuzzle.gridSize)
          .fill("")
          .map(() => Array(newPuzzle.gridSize).fill(""))
      );
      setSelectedClue(null);
      setHoveredClue(null);
    } catch (error) {
      console.error("Error generating puzzle:", error);
    }
  };

  // Initialize first puzzle
  useEffect(() => {
    loadNewPuzzle();
  }, []);

  // Check if a cell is black
  const isBlackCell = (row: number, col: number) => {
    return puzzle?.blackCells.some(([r, c]) => r === row && c === col) ?? false;
  };

  // Get clue number for a cell (if any)
  const getClueNumber = (row: number, col: number) => {
    if (!puzzle) return null;
    const acrossClue = puzzle.clues.across.find(
      (clue) => clue.row === row && clue.col === col
    );
    const downClue = puzzle.clues.down.find(
      (clue) => clue.row === row && clue.col === col
    );
    return acrossClue?.number || downClue?.number;
  };

  // Handle letter input
  const handleLetterChange = (row: number, col: number, value: string) => {
    if (isBlackCell(row, col)) return;

    const newValue = value.toUpperCase().slice(-1); // Take only the last character
    const newGrid = [...grid.map((row) => [...row])];
    if (newGrid[row] && newGrid[row][col] !== undefined) {
      newGrid[row][col] = newValue;
      setGrid(newGrid);
    }
  };

  // Check if a cell should be highlighted
  const isHighlighted = (row: number, col: number) => {
    if (!hoveredClue || !puzzle) return false;

    const clue = puzzle.clues[hoveredClue.type].find(
      (c) => c.number === hoveredClue.number
    );

    if (!clue) return false;

    if (hoveredClue.type === "across") {
      return (
        row === clue.row && col >= clue.col && col < clue.col + clue.length
      );
    } else {
      return (
        col === clue.col && row >= clue.row && row < clue.row + clue.length
      );
    }
  };

  // Reveal all answers
  const revealAllAnswers = () => {
    if (!puzzle) return;
    const newGrid = Array(puzzle.gridSize)
      .fill(null)
      .map(() => Array(puzzle.gridSize).fill(""));

    // First, fill in across answers
    puzzle.clues.across.forEach((clue) => {
      const answer = clue.answer.split("");
      for (let i = 0; i < clue.length && clue.col + i < puzzle.gridSize; i++) {
        if (!isBlackCell(clue.row, clue.col + i)) {
          newGrid[clue.row][clue.col + i] = answer[i];
        }
      }
    });

    // Then, fill in down answers
    puzzle.clues.down.forEach((clue) => {
      const answer = clue.answer.split("");
      for (let i = 0; i < clue.length && clue.row + i < puzzle.gridSize; i++) {
        if (!isBlackCell(clue.row + i, clue.col)) {
          newGrid[clue.row + i][clue.col] = answer[i];
        }
      }
    });

    setGrid(newGrid);
  };

  // Check answers
  const checkAnswers = () => {
    if (!puzzle) return;
    const incorrectClues: { type: string; number: number }[] = [];

    // Check across answers
    puzzle.clues.across.forEach((clue) => {
      const answer = clue.answer;
      const userAnswer = Array(clue.length)
        .fill("")
        .map((_, i) => grid[clue.row][clue.col + i])
        .join("");

      if (userAnswer !== answer) {
        incorrectClues.push({ type: "across", number: clue.number });
      }
    });

    // Check down answers
    puzzle.clues.down.forEach((clue) => {
      const answer = clue.answer;
      const userAnswer = Array(clue.length)
        .fill("")
        .map((_, i) => grid[clue.row + i]?.[clue.col])
        .join("");

      if (userAnswer !== answer) {
        incorrectClues.push({ type: "down", number: clue.number });
      }
    });

    setCheckResults({
      correct: incorrectClues.length === 0,
      incorrectClues,
    });
    setCheckDialogOpen(true);
  };

  // Function to handle clue selection
  const handleClueSelect = (type: "across" | "down", number: number) => {
    if (!puzzle) return;
    const clue = puzzle.clues[type].find((c) => c.number === number);
    if (clue) {
      setSelectedClue({
        type,
        number,
        clue: clue.clue,
        answer: clue.answer,
      });
      setHoveredClue({ type, number });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Top Ad */}
          <div className="w-full">{/* GoogleAd component removed */}</div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-4 sm:px-8 text-sm sm:text-base"
                >
                  How to Play
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">
                    How to Play Mini Crossword
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4 text-sm text-muted-foreground">
                  <p>
                    Fill in the 5×5 grid with the correct answers based on the
                    clues provided.
                  </p>
                  <div className="space-y-2">
                    <p className="font-bold">Rules:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Each white square must contain one letter</li>
                      <li>Black squares separate different words</li>
                      <li>Numbers in squares correspond to clue numbers</li>
                      <li>Answers can read across or down</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold">Tips:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        Start with the clues you&apos;re most confident about
                      </li>
                      <li>Use crossing letters to help solve other clues</li>
                      <li>
                        All letters must form valid words both across and down
                      </li>
                      <li>Click Reset for a new puzzle with different clues</li>
                      <li>
                        Don&apos;t worry if you get stuck - you can always
                        reveal answers
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-4 sm:px-8 text-sm sm:text-base"
              >
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Main Game Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <Card className="bg-white/80 backdrop-blur border-2 shadow-xl shadow-black/5">
              <CardHeader className="space-y-4">
                <div className="space-y-2 text-center">
                  <CardTitle className="text-2xl sm:text-3xl font-black">
                    Mini Crossword
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg">
                    Daily Word Puzzle Challenge
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Crossword Grid */}
                <div className="flex justify-center">
                  <div className="bg-black p-px overflow-hidden">
                    <div className="grid grid-cols-5 gap-px bg-black">
                      {Array(5)
                        .fill(null)
                        .map((_, row) =>
                          Array(5)
                            .fill(null)
                            .map((_, col) => (
                              <div key={`${row}-${col}`} className="relative">
                                {getClueNumber(row, col) && (
                                  <span className="absolute top-1 left-1 text-[10px] sm:text-xs font-bold z-10">
                                    {getClueNumber(row, col)}
                                  </span>
                                )}
                                {isBlackCell(row, col) ? (
                                  <div className="w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px] bg-black" />
                                ) : (
                                  <Input
                                    type="text"
                                    maxLength={1}
                                    value={(grid[row] && grid[row][col]) || ""}
                                    onChange={(e) =>
                                      handleLetterChange(
                                        row,
                                        col,
                                        e.target.value
                                      )
                                    }
                                    className={`w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px] text-center text-xl sm:text-2xl md:text-3xl font-bold p-0 border-0 focus:ring-0 focus:ring-offset-0 uppercase bg-transparent rounded-none ${
                                      isHighlighted(row, col)
                                        ? "bg-blue-100"
                                        : ""
                                    }`}
                                  />
                                )}
                              </div>
                            ))
                        )}
                    </div>
                  </div>
                </div>

                {/* Clues Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Across Clues */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Across</h3>
                    <div className="space-y-2">
                      {puzzle?.clues.across.map((clue) => (
                        <button
                          key={`across-${clue.number}`}
                          onClick={() =>
                            handleClueSelect("across", clue.number)
                          }
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            selectedClue?.type === "across" &&
                            selectedClue.number === clue.number
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-bold">{clue.number}.</span>{" "}
                          {clue.clue}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Down Clues */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Down</h3>
                    <div className="space-y-2">
                      {puzzle?.clues.down.map((clue) => (
                        <button
                          key={`down-${clue.number}`}
                          onClick={() => handleClueSelect("down", clue.number)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            selectedClue?.type === "down" &&
                            selectedClue.number === clue.number
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-bold">{clue.number}.</span>{" "}
                          {clue.clue}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={checkAnswers}
                    variant="default"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    Check Answers
                  </Button>
                  <Button
                    onClick={revealAllAnswers}
                    variant="outline"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    Reveal All
                  </Button>
                  <Button
                    onClick={loadNewPuzzle}
                    variant="outline"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="hidden lg:block sticky top-20">
                {/* GoogleAd component removed */}
              </div>
            </div>
          </div>

          {/* Bottom Ad */}
          <div className="w-full">{/* GoogleAd component removed */}</div>
        </div>
      </main>
      <Footer />

      {/* Check Answers Dialog */}
      <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Hey, that&apos;s cheating!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {checkResults.correct ? (
              <p className="text-green-600 font-bold text-center">
                All answers are correct!
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Some answers need correction. Check these clues:
                </p>
                <ul className="space-y-2 text-sm">
                  {checkResults.incorrectClues.map((clue) => (
                    <li
                      key={`${clue.type}-${clue.number}`}
                      className="text-red-600"
                    >
                      {clue.number} {clue.type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="default" onClick={() => setCheckDialogOpen(false)}>
              Continue Playing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
