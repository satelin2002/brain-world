"use client";

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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trophy, Brain, Timer } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAd from "@/components/GoogleAd";

type GameState = "preview" | "recall" | "feedback" | "complete";

export default function PatternRecallPage() {
  const [gridSize, setGridSize] = useState(4);
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<boolean[][]>([]);
  const [userPattern, setUserPattern] = useState<boolean[][]>([]);
  const [gameState, setGameState] = useState<GameState>("preview");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Initialize or reset the game
  const initializeGame = () => {
    // Create empty grid
    const emptyGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    // Calculate number of cells to fill based on level
    const cellsToFill = Math.min(
      3 + Math.floor(level / 2),
      Math.floor(gridSize * gridSize * 0.4)
    );

    // Create pattern
    const newPattern = [...emptyGrid.map((row) => [...row])];
    let filledCells = 0;
    while (filledCells < cellsToFill) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!newPattern[row][col]) {
        newPattern[row][col] = true;
        filledCells++;
      }
    }

    setPattern(newPattern);
    setUserPattern(emptyGrid);
    setGameState("preview");
    setTimer(Math.max(5, 10 - Math.floor(level / 3))); // Decrease time as level increases
  };

  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "preview" && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (gameState === "preview" && timer === 0) {
      setGameState("recall");
    }
    return () => clearInterval(interval);
  }, [timer, gameState]);

  // Handle cell click during recall phase
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "recall") return;
    const newUserPattern = [...userPattern.map((row) => [...row])];
    newUserPattern[row][col] = !newUserPattern[row][col];
    setUserPattern(newUserPattern);
  };

  // Check pattern match
  const checkPattern = () => {
    let correct = true;
    let matches = 0;
    let total = 0;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i][j]) {
          total++;
          if (pattern[i][j] === userPattern[i][j]) {
            matches++;
          } else {
            correct = false;
          }
        } else if (userPattern[i][j]) {
          correct = false;
        }
      }
    }

    const accuracy = Math.round((matches / total) * 100);
    setScore((prev) => prev + accuracy);

    if (correct) {
      setLevel((l) => l + 1);
      if (gridSize < 10 && level % 5 === 0) {
        setGridSize((g) => g + 1);
      }
    }

    setGameState("feedback");
    setHighScore((prev) => Math.max(prev, score + accuracy));
  };

  // Start new game
  useEffect(() => {
    initializeGame();
  }, [level, gridSize]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Top Ad */}
          <div className="w-full">
            <GoogleAd
              adSlot="YOUR-AD-SLOT-1"
              adFormat="horizontal"
              className="w-full min-h-[90px] md:min-h-[90px] bg-white rounded-lg shadow-sm"
            />
          </div>

          {/* Game Header */}
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-black tracking-tight">
              Pattern Recall
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-[600px]">
              Test your memory by remembering and recreating patterns
            </p>
          </div>

          {/* Game Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-4 sm:px-6"
                >
                  How to Play
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">
                    How to Play Pattern Recall
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-muted-foreground">
                    Test your memory by remembering and recreating patterns of
                    highlighted cells.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Game Rules</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Observe the pattern during the preview phase</li>
                        <li>Recreate the pattern by clicking cells</li>
                        <li>Match the pattern exactly to advance</li>
                        <li>Grid size increases every 5 levels</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Scoring</h3>
                      <p className="text-muted-foreground">
                        Points are awarded based on accuracy. Perfect matches
                        earn bonus points and advance you to the next level.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Game Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader className="space-y-4">
                <div className="space-y-2 text-center">
                  <CardTitle className="text-2xl font-black">
                    Level {level}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {gridSize}x{gridSize} Grid
                  </CardDescription>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div className="text-sm font-medium">Score</div>
                    <div className="text-xl sm:text-2xl font-bold">{score}</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <div className="text-sm font-medium">Level</div>
                    <div className="text-xl sm:text-2xl font-bold">{level}</div>
                  </div>
                  {gameState === "preview" && (
                    <div className="flex flex-col items-center gap-2 col-span-2 sm:col-span-1">
                      <Timer className="h-5 w-5 text-green-500" />
                      <div className="text-sm font-medium">Time</div>
                      <div className="text-xl sm:text-2xl font-bold">
                        {timer}s
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Game Grid */}
                <div className="flex justify-center">
                  <div
                    className="grid gap-1.5 bg-muted/50 p-3 rounded-lg"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      width: `min(calc(100vw - 2rem), ${gridSize * 60}px)`,
                      maxWidth: "400px",
                    }}
                  >
                    {Array(gridSize)
                      .fill(null)
                      .map((_, row) =>
                        Array(gridSize)
                          .fill(null)
                          .map((_, col) => (
                            <div
                              key={`${row}-${col}`}
                              className={`
                                aspect-square rounded-md cursor-pointer transition-all
                                transform hover:scale-105
                                ${
                                  gameState === "preview" ||
                                  gameState === "feedback"
                                    ? pattern[row]?.[col]
                                      ? "bg-blue-500 shadow-lg"
                                      : "bg-white shadow"
                                    : userPattern[row]?.[col]
                                    ? "bg-blue-500 shadow-lg"
                                    : "bg-white shadow"
                                }
                                ${
                                  gameState === "feedback" &&
                                  pattern[row]?.[col] !==
                                    userPattern[row]?.[col]
                                    ? "ring-2 ring-red-500"
                                    : ""
                                }
                                hover:shadow-md
                              `}
                              onClick={() => handleCellClick(row, col)}
                            />
                          ))
                      )}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex flex-wrap justify-center gap-3">
                  {gameState === "recall" && (
                    <Button
                      onClick={checkPattern}
                      variant="default"
                      size="lg"
                      className="w-full sm:w-auto rounded-full px-8"
                    >
                      Check Pattern
                    </Button>
                  )}
                  {gameState === "feedback" && (
                    <Button
                      onClick={() => initializeGame()}
                      variant="default"
                      size="lg"
                      className="w-full sm:w-auto rounded-full px-8"
                    >
                      {pattern.every((row, i) =>
                        row.every((cell, j) => cell === userPattern[i][j])
                      )
                        ? "Next Level"
                        : "Try Again"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    High Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Current Score
                      </span>
                      <span className="font-bold">{score}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">High Score</span>
                      <span className="font-bold">{highScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Ad */}
              <div className="hidden lg:block sticky top-20">
                <GoogleAd
                  adSlot="YOUR-AD-SLOT-2"
                  adFormat="vertical"
                  className="bg-white rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Bottom Ad */}
          <div className="w-full">
            <GoogleAd
              adSlot="YOUR-AD-SLOT-4"
              adFormat="horizontal"
              className="w-full min-h-[90px] md:min-h-[90px] bg-white rounded-lg shadow-sm"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
